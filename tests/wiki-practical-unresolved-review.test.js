import { readFileSync, existsSync } from 'node:fs';
import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
import { makeEntrySlug } from '../src/utils/entry-slug.js';

const read = name => JSON.parse(readFileSync(new URL(`../docs/${name}`, import.meta.url), 'utf8'));
const baseline = read('wiki-practical-eight-review.json');
const report = () => {
  expect(existsSync(new URL('../docs/wiki-practical-unresolved-review.json', import.meta.url)), '226-row follow-up evidence must exist').toBe(true);
  return read('wiki-practical-unresolved-review.json');
};
const row = id => report().records.find(r => r.identity === id);

test('follow-up preserves exactly all 226 unresolved identities, with source facts and explicit remaining work', () => {
  const r = report();
  const expected = baseline.groups.flatMap(g => g.records.filter(r => r.status === 'unresolved').map(r => r.identity));
  expect(r.records).toHaveLength(226);
  expect(r.records.map(r => r.identity).sort()).toEqual(expected.sort());
  expect(new Set(r.records.map(r => r.identity)).size).toBe(226);
  for (const item of r.records) {
    expect(['identity-mapped', 'data-template', 'confirmed-gap', 'mechanism-review', 'research-needed']).toContain(item.verdict);
    expect(item.reason.length, item.identity).toBeGreaterThan(12);
    expect(item.nextAction.length, item.identity).toBeGreaterThan(8);
    expect(item.nativeSource.sha256).toMatch(/^[A-F0-9]{64}$/);
    const g = baseline.groups.find(g => g.id === item.group);
    expect(g.sourceHashes).toContainEqual(item.nativeSource);
    expect(item.evidenceIds.length, item.identity).toBeGreaterThan(0);
    for (const id of item.evidenceIds) expect(r.evidence[id], id).toBeDefined();
  }
});

test('only exact verified identities can map and every mapped page really exists', () => {
  const manifest = read('wiki-full-manifest.json').records;
  for (const r of report().records) {
    if (r.verdict !== 'identity-mapped') { expect(r.manifestKeys).toEqual([]); continue; }
    expect(r.manifestKeys.length).toBeGreaterThan(0);
    for (const key of r.manifestKeys) {
      const m = manifest.find(m => m.key === key);
      expect(m, key).toBeDefined();
      expect(m.disposition).toBe('include');
      expect(entries.filter(e => e.dataset === m.dataset && makeEntrySlug(e) === m.slug)).toHaveLength(1);
    }
  }
  expect(row('Data/BigCraftables:146').manifestKeys).toEqual(['craft:Campfire']);
  expect(row('Data/BigCraftables:83').manifestKeys).toEqual(['craft:Wicked Statue']);
  expect(row('Data/BigCraftables:278').manifestKeys).toEqual(['craft:Cookout Kit']);
  expect(row('Data/BigCraftables:84').verdict).not.toBe('identity-mapped');
  expect(row('Data/Objects:927').verdict).not.toBe('identity-mapped');
});

test('all 25 shop gaps retain exact stock evidence and are not treated as free or unused', () => {
  for (const gap of baseline.shopStockGaps) {
    const r = row(gap.identity);
    expect(r.verdict).toBe('confirmed-gap');
    expect(r.shopReferences).toEqual(gap.shops);
    expect(r.evidenceIds).toContain('shops');
  }
  expect(report().limitations.join(' ')).toContain('Price=-1');
});

test('Stone nodes remain separate from ordinary stone and PotOfGold is not inferred to be a coal node', () => {
  const stones = baseline.groups.find(g => g.id === 'special').records.filter(r => r.status === 'unresolved' && r.nativeName === 'Stone');
  expect(stones).toHaveLength(55);
  for (const s of stones) {
    expect(row(s.identity).verdict).toBe('mechanism-review');
    expect(row(s.identity).manifestKeys).toEqual([]);
  }
  expect(row('Data/Objects:PotOfGold').verdict).toBe('research-needed');
  expect(row('Data/Objects:PotOfGold').reason).toContain('不能');
  expect(row('Data/Objects:876').verdict).toBe('confirmed-gap');
  expect(row('Data/Objects:876').nextAction).toContain('消失');
});

test('data templates and unproven internal records never become invented normal-play pages', () => {
  expect(row('Data/Locations:Default').verdict).toBe('data-template');
  for (const id of ['Data/Characters:???', 'Data/Monsters:Cat', 'Data/Monsters:Spiker', 'Data/BigCraftables:31', 'Data/Objects:930']) {
    expect(row(id).verdict).toBe('research-needed');
    expect(row(id).manifestKeys).toEqual([]);
  }
  expect(row('Data/Locations:IslandNorthCave1').manifestKeys).not.toContain('location:Island Field Office');
});

test('summary is derived from all records and does not grant practical or full release completion', () => {
  const r = report();
  const counts = Object.fromEntries(['identity-mapped', 'data-template', 'confirmed-gap', 'mechanism-review', 'research-needed'].map(v => [v, r.records.filter(x => x.verdict === v).length]));
  expect(r.counts).toEqual(counts);
  expect(r.releaseReady).toBe(false);
  expect(r.contentComplete).toBe(false);
  const checklist = read('wiki-practical-checklist.json');
  for (const id of new Set(r.records.map(x => x.group))) expect(checklist.groups.find(g => g.id === id).membership).toBe('pending');
});
