import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
import { makeEntrySlug } from '../src/utils/entry-slug.js';

const read = name => JSON.parse(readFileSync(new URL(`../docs/${name}`, import.meta.url), 'utf8'));
const checklist = () => {
  const path = new URL('../docs/wiki-practical-checklist.json', import.meta.url);
  expect(existsSync(path), 'Practical scope requires its own category checklist, not old pending flags').toBe(true);
  return JSON.parse(readFileSync(path, 'utf8'));
};

const assertSeedIdentity = row => expect(row.manifestKeys).toEqual([`seed:${row.nativeId}`]);
const assertFoodIdentity = (row, manifest) => {
  const r = manifest.records.find(r => r.key === row.manifestKey);
  expect(r?.originalName, `Food ${row.nativeId}`).toBe(row.originalName);
  expect(r?.group, `Food ${row.nativeId}`).toBe(row.group);
};

test('practical checklist distinguishes membership, content review and release gates for all fifteen categories', () => {
  const c = checklist();
  expect(c.version).toBe('1.6.15');
  expect(c.groups.map(g => g.id).sort()).toEqual([
    'agriculture', 'fishing', 'characters', 'creatures', 'food', 'resources', 'machines',
    'equipment', 'clothing', 'furniture', 'decoration', 'special', 'skills', 'quests-events', 'locations',
  ].sort());
  for (const g of c.groups) {
    expect(g.requiredCoverage.length, g.id).toBeGreaterThan(0);
    expect(g.sourceFiles.length, g.id).toBeGreaterThan(0);
    for (const file of [...g.sourceFiles, ...g.testFiles]) {
      expect(existsSync(new URL(`../${file}`, import.meta.url)), `${g.id}: ${file}`).toBe(true);
    }
    expect(['reviewed', 'pending']).toContain(g.membership);
    expect(['reviewed', 'pending']).toContain(g.content);
    if (g.membership !== 'reviewed' || g.content !== 'reviewed') {
      expect(g.remaining.length, `Unfinished ${g.id} must name actionable remaining work`).toBeGreaterThan(0);
    }
  }
  expect(c.researchOnly.map(r => r.identity).sort()).toEqual([
    'Data/Furniture:FoodPetBowl', 'Data/Furniture:WaterPetBowl', 'Data/Objects:30', 'Data/Pants:14',
  ].sort());
  for (const r of c.researchOnly) {
    expect(r.disposition).toBe('unverified-normal-acquisition');
    expect(r.reopenWhen.length).toBeGreaterThan(0);
  }
});

test('agriculture practical closure maps the independent native roster and all seasonal forage outcomes', () => {
  const c = checklist();
  const g = c.groups.find(g => g.id === 'agriculture');
  expect(g.membership).toBe('reviewed');
  const closure = read('wiki-practical-agriculture-closure.json');
  const roster = read('wiki-agriculture-native-roster.json');
  const manifest = read('wiki-full-manifest.json');
  for (const row of roster.collections.seeds.records) assertSeedIdentity(row);
  for (const [collection, prefix] of [['wildTrees', 'wild-tree'], ['fruitTrees', 'fruit-tree'], ['giantCrops', 'giant-crop']]) {
    for (const row of roster.collections[collection].records) expect(row.manifestKeys).toEqual([`${prefix}:${row.nativeId}`]);
  }
  expect(closure.nativeHarvestSource?.records, 'Original crop harvest proof must be retained, not inferred from the target page').toHaveLength(50);
  for (const row of roster.collections.crops.records) {
    expect(row.manifestKeys).toContain(`seed:${row.nativeId}`);
    const source = closure.nativeHarvestSource.records.find(r => r.seedId === row.nativeId);
    expect(source, row.nativeId).toBeDefined();
    expect(row.manifestKeys.map(key => manifest.records.find(r => r.key === key)?.originalName), row.nativeId).toContain(source.harvestName);
  }
  const keys = new Set([
    ...Object.values(roster.collections).flatMap(c => c.records.flatMap(r => r.manifestKeys)),
    ...roster.supplementary.flatMap(r => r.manifestKeys),
    ...closure.wildHarvests.flatMap(r => [r.seedKey, ...r.harvestKeys]),
    ...closure.mergedTerrain.map(r => r.manifestKey),
  ]);
  const agriculture = new Set();
  for (const key of keys) {
    const matches = manifest.records.filter(r => r.key === key);
    expect(matches, key).toHaveLength(1);
    const r = matches[0];
    expect(r.disposition, key).toBe('include');
    expect(r.sourceUrl, key).toMatch(/^https:\/\/(zh\.)?stardewvalleywiki\.com\//);
    expect(r.sourceRevision, key).toBeTruthy();
    expect(r.versionEvidence, key).toBeTruthy();
    const pages = entries.filter(e => e.dataset === r.dataset && makeEntrySlug(e) === r.slug);
    expect(pages, key).toHaveLength(1);
    for (const field of ['获取方式', '主要用途']) expect(pages[0].attributes[field]?.length, `${key}/${field}`).toBeGreaterThan(0);
    if (r.group === 'agriculture') agriculture.add(key);
  }
  // Native roster plus source-reviewed supplements, not entries.length as the denominator.
  expect(agriculture.size).toBe(164);
  expect(closure.wildHarvests.map(r => [r.seedKey, r.harvestKeys])).toEqual([
    ['seed:495', ['forage:16', 'forage:18', 'forage:20', 'forage:22']],
    ['seed:496', ['legacy-primary:Crops:Grape', 'forage:396', 'forage:402']],
    ['seed:497', ['forage:410', 'forage:404', 'forage:408', 'forage:406']],
    ['seed:498', ['forage:418', 'forage:414', 'forage:416', 'forage:412']],
  ]);
  expect(closure.mergedTerrain.map(r => r.manifestKey)).toEqual(['agriculture:grass-starter', 'agriculture:blue-grass-starter']);
  for (const terrain of closure.mergedTerrain) {
    const r = manifest.records.find(r => r.key === terrain.manifestKey);
    const page = entries.find(e => e.dataset === r.dataset && makeEntrySlug(e) === r.slug);
    for (const field of terrain.requiredFields) expect(page.attributes[field]?.length, field).toBeGreaterThan(0);
  }
});

test.each([
  ['clothing', [['wiki-hat-inventory.json', 122], ['wiki-clothing-inventory.json', 320]], 442],
  ['furniture', [['wiki-furniture-inventory.json', 643]], 643],
])('%s normal-play source roster maps every reviewed style without using seed totals', (group, sources, total) => {
  expect(checklist().groups.find(g => g.id === group).membership).toBe('reviewed');
  const manifest = read('wiki-full-manifest.json');
  const seen = new Set();
  for (const [file, count] of sources) {
    const rows = read(file).records;
    expect(rows).toHaveLength(count);
    for (const row of rows) {
      const records = manifest.records.filter(r => r.group === group && r.slug === row.slug);
      expect(records, `${file}/${row.slug}`).toHaveLength(1);
      const r = records[0];
      expect(r.disposition).toBe('include');
      expect(r.displayName).toBe(row.displayName || row.name);
      const pages = entries.filter(e => e.dataset === r.dataset && makeEntrySlug(e) === r.slug);
      expect(pages, r.key).toHaveLength(1);
      expect(pages[0].name).toBe(r.displayName);
      expect(pages[0].attributes.获取方式?.length, r.key).toBeGreaterThan(0);
      expect(pages[0].attributes.主要用途?.length, r.key).toBeGreaterThan(0);
      expect(seen.has(r.key), r.key).toBe(false);
      seen.add(r.key);
    }
  }
  expect(seen.size).toBe(total);
});

test('food normal-play roster retains all source records and cross-category ingredients without inventing edible Lumber', () => {
  expect(checklist().groups.find(g => g.id === 'food').membership).toBe('reviewed');
  const food = read('wiki-food-native-roster.json');
  expect(food.categoryRecords).toHaveLength(202);
  expect(food.supplementary).toHaveLength(25);
  const manifest = read('wiki-full-manifest.json');
  const foodKeys = new Set();
  for (const row of [...food.categoryRecords, ...food.supplementary]) {
    assertFoodIdentity(row, manifest);
    const matches = manifest.records.filter(r => r.key === row.manifestKey);
    expect(matches, row.nativeId).toHaveLength(1);
    const r = matches[0];
    expect(r.disposition).toBe('include');
    expect(entries.filter(e => e.dataset === r.dataset && makeEntrySlug(e) === r.slug), r.key).toHaveLength(1);
    if (r.group === 'food') foodKeys.add(r.key);
  }
  expect(foodKeys.size).toBe(172);
  expect(food.unknown.map(r => r.nativeId)).toEqual(['30']);
  expect(checklist().researchOnly.find(r => r.identity === 'Data/Objects:30').disposition).toBe('unverified-normal-acquisition');
});

test('swapped seed and food mappings are rejected even when membership totals are unchanged', () => {
  const a = structuredClone(read('wiki-agriculture-native-roster.json'));
  const [banana, tea] = ['69', '251'].map(id => a.collections.seeds.records.find(r => r.nativeId === id));
  [banana.manifestKeys, tea.manifestKeys] = [tea.manifestKeys, banana.manifestKeys];
  expect(() => assertSeedIdentity(banana)).toThrow();
  expect(() => assertSeedIdentity(tea)).toThrow();
  const f = structuredClone(read('wiki-food-native-roster.json'));
  const [horseradish, daffodil] = ['16', '18'].map(id => f.categoryRecords.find(r => r.nativeId === id));
  [horseradish.manifestKey, daffodil.manifestKey] = [daffodil.manifestKey, horseradish.manifestKey];
  const manifest = read('wiki-full-manifest.json');
  expect(() => assertFoodIdentity(horseradish, manifest)).toThrow();
  expect(() => assertFoodIdentity(daffodil, manifest)).toThrow();
});
