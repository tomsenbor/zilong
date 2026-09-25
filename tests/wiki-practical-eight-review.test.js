import { readFileSync, existsSync } from 'node:fs';
import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
import { makeEntrySlug } from '../src/utils/entry-slug.js';

const read = file => JSON.parse(readFileSync(new URL(`../docs/${file}`, import.meta.url), 'utf8'));
const review = () => {
  expect(existsSync(new URL('../docs/wiki-practical-eight-review.json', import.meta.url)), 'Eight-category review must retain every candidate and unresolved identity').toBe(true);
  return read('wiki-practical-eight-review.json');
};
const groups = ['characters', 'creatures', 'resources', 'machines', 'decoration', 'special', 'quests-events', 'locations'];

test.each(groups)('%s review accounts for every independent native record without dropping unresolved rows', group => {
  const rows = review().groups.find(g => g.id === group).records;
  const sources = read(`wiki-native-candidates-${group}.json`).nativeSources;
  expect(review().groups.find(g => g.id === group).sourceHashes).toEqual(sources.map(({ asset, sha256 }) => ({ asset, sha256 })));
  const expected = sources.flatMap(s => s.records.map(r => `${s.asset}:${r.nativeId}`));
  expect(rows.map(r => r.identity).sort()).toEqual(expected.sort());
  expect(new Set(rows.map(r => r.identity)).size).toBe(rows.length);
  const manifest = read('wiki-full-manifest.json').records;
  for (const row of rows) {
    expect(row.reason.length, row.identity).toBeGreaterThan(0);
    expect(['mapped', 'unresolved', 'prior-exclusion']).toContain(row.status);
    if (row.status === 'unresolved') {
      expect(row.manifestKeys).toEqual([]);
      continue;
    }
    expect(row.manifestKeys.length, row.identity).toBeGreaterThan(0);
    for (const key of row.manifestKeys) {
      const r = manifest.find(r => r.key === key);
      expect(r, key).toBeDefined();
      if (row.status === 'prior-exclusion') expect(r.disposition).toBe('exclude');
      else {
        expect(r.disposition).toBe('include');
        const pages = entries.filter(e => e.dataset === r.dataset && makeEntrySlug(e) === r.slug);
        expect(pages, row.identity).toHaveLength(1);
        expect(pages[0].name).toBe(r.displayName);
      }
    }
  }
});

test('homonyms map to their source identity, not similarly named orders, furniture or crops', () => {
  const row = (g, identity) => review().groups.find(x => x.id === g).records.find(x => x.identity === identity);
  expect(row('characters', 'Data/Characters:Caroline').manifestKeys).toEqual(['legacy-primary:Villagers:Caroline']);
  expect(row('characters', 'Data/Characters:Birdie').manifestKeys).toEqual(['character:Birdie']);
  expect(row('creatures', 'Data/FarmAnimals:Rabbit').manifestKeys).toEqual(['farm-animal:Rabbit']);
  expect(row('resources', 'Data/Objects:113').manifestKeys).toEqual(['legacy:Artifacts:Chicken Statue']);
  expect(row('resources', 'Data/Objects:771').manifestKeys).toEqual(['legacy-secondary:items:fiber']);
  expect(row('quests-events', 'Data/Quests:10').status).toBe('prior-exclusion');
  expect(row('quests-events', 'Data/Quests:10').manifestKeys).toEqual(['quest:10']);
  expect(row('machines', 'Data/BigCraftables:31').status).toBe('unresolved');
  expect(row('machines', 'Data/BigCraftables:31').manifestKeys).toEqual([]);
});

test('same-name resource nodes and unverified map or craft variants remain unresolved', () => {
  const r = review();
  const special = r.groups.find(g => g.id === 'special').records;
  const nodes = special.filter(row => row.nativeName === 'Stone' && row.identity !== 'Data/Objects:390');
  expect(nodes).toHaveLength(55);
  const disputed = [
    ...nodes,
    r.groups.find(g => g.id === 'locations').records.find(row => row.identity === 'Data/Locations:IslandNorthCave1'),
    ...r.groups.find(g => g.id === 'machines').records.filter(row => ['Data/BigCraftables:83', 'Data/BigCraftables:84', 'Data/BigCraftables:146', 'Data/BigCraftables:278'].includes(row.identity))
  ];
  expect(disputed).toHaveLength(60);
  for (const row of disputed) {
    expect(row.status, row.identity).toBe('unresolved');
    expect(row.manifestKeys, row.identity).toEqual([]);
  }
});

test('variant sources remain distinct and unresolved identities cannot grant category completion', () => {
  const r = review();
  const checklist = read('wiki-practical-checklist.json');
  for (const group of r.groups) {
    if (group.records.some(row => row.status === 'unresolved')) {
      expect(checklist.groups.find(g => g.id === group.id).membership).toBe('pending');
    }
  }
  const resources = r.groups.find(g => g.id === 'resources').records;
  expect(resources.find(r => r.identity === 'Data/Objects:126').manifestKeys).toEqual(['legacy:Artifacts:Strange Doll (green)']);
  expect(resources.find(r => r.identity === 'Data/Objects:127').manifestKeys).toEqual(['legacy:Artifacts:Strange Doll (yellow)']);
  expect(resources.find(r => r.identity === 'Data/Objects:747').manifestKeys).toEqual(['decay:747']);
  expect(resources.find(r => r.identity === 'Data/Objects:748').manifestKeys).toEqual(['decay:748']);
});

test('all 39 native machine rules resolve to exact facilities including the fixed cave mushroom boxes', () => {
  const coverage = review().groups.find(g => g.id === 'machines').machineRuleCoverage;
  const source = read('wiki-practical-processing-evidence.json').nativeMachineRoster;
  expect(coverage.map(r => r.nativeId).sort()).toEqual(source.map(r => r.id).sort());
  expect(coverage).toHaveLength(39);
  expect(coverage.find(r => r.nativeId === '(BC)128').manifestKeys).toEqual(['location:The Cave']);
  const manifest = read('wiki-full-manifest.json').records;
  for (const r of coverage) {
    expect(r.manifestKeys).toHaveLength(1);
    const target = manifest.find(m => m.key === r.manifestKeys[0]);
    expect(target, r.nativeId).toBeDefined();
    expect(target.disposition).toBe('include');
    const origin = source.find(s => s.id === r.nativeId);
    expect(target.dataset).toBe(origin.dataset);
    expect(target.slug).toBe(r.nativeId === '(BC)128' ? 'farm-cave' : origin.slug);
    expect(entries.filter(e => e.dataset === target.dataset && makeEntrySlug(e) === target.slug)).toHaveLength(1);
  }
});

test('normal shop stock missing from the manifest remains an explicit gap rather than an unused exclusion', () => {
  const r = review();
  expect(r.shopStockGaps, 'Original shop evidence must distinguish obtainable gaps from internal-only candidates').toHaveLength(25);
  const owl = r.shopStockGaps.find(r => r.identity === 'Data/BigCraftables:54');
  expect(owl.shops).toContainEqual(expect.objectContaining({ shop: 'Festival_NightMarket_MagicBoat_Day3', itemId: '(BC)54', price: 500 }));
  expect(r.shopStockGaps.filter(g => g.group === 'machines')).toHaveLength(24);
  for (const gap of r.shopStockGaps) {
    const row = r.groups.find(g => g.id === gap.group).records.find(row => row.identity === gap.identity);
    expect(row.status).toBe('unresolved');
    expect(gap.shops.every(s => s.isRecipe === false)).toBe(true);
  }
});
