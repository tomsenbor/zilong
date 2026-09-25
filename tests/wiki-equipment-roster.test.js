import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
const path = new URL('../docs/wiki-equipment-closure.json', import.meta.url);
const load = () => existsSync(path) ? JSON.parse(readFileSync(path)) : null;
const manifest = JSON.parse(readFileSync(new URL('../docs/wiki-full-manifest.json', import.meta.url)));

test('equipment roster is independently enumerated from original native tables including non-table starter tools', () => {
  const roster = load();
  expect(roster, 'Native crosswalk and documented supplementary tools are required').not.toBeNull();
  for (const [table, count] of Object.entries({ tools: 37, weapons: 67, rings: 31, boots: 18, trinkets: 8 })) {
    expect(roster.nativeCollections[table].records, table).toHaveLength(count);
    expect(new Set(roster.nativeCollections[table].records.map(r => r.nativeId)).size, table).toBe(count);
    expect(roster.nativeCollections[table].sha256).toMatch(/^[a-f0-9]{64}$/i);
  }
  expect(roster.supplementary.map(r => r.originalName).sort()).toEqual([
    'Backpack (12 slots)', 'Deluxe Pack (36 slots)', 'Large Pack (24 slots)', 'Raft', 'Trash Can'
  ].sort());
});

test('equipment crosswalk covers the category exactly and keeps fishing and husbandry tools in their original groups', () => {
  const roster = load();
  expect(roster).not.toBeNull();
  const records = [...Object.values(roster.nativeCollections).flatMap(c => c.records), ...roster.supplementary];
  const equipmentKeys = new Set();
  for (const row of records) {
    const matches = manifest.records.filter(r => r.key === row.manifestKey);
    expect(matches, row.nativeId || row.originalName).toHaveLength(1);
    expect(matches[0].disposition).toBe(row.disposition);
    expect(matches[0].group).toBe(row.group);
    if (row.group === 'equipment') equipmentKeys.add(row.manifestKey);
  }
  expect([...equipmentKeys].sort()).toEqual(manifest.records.filter(r => r.group === 'equipment').map(r => r.key).sort());
  expect(roster.expectedCount).toBe(159);
  expect(roster.excludedCount).toBe(6);
  expect(roster.includedCount).toBe(153);
  expect(roster.nativeCollections.tools.records.find(r => r.nativeId === 'BambooPole').group).toBe('fishing');
  expect(roster.nativeCollections.tools.records.find(r => r.nativeId === 'MilkPail').group).not.toBe('equipment');
});
