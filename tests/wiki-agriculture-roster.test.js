import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
test('native agriculture roster covers seeds, harvest identities and mature tree identities independently', () => {
  const path = new URL('../docs/wiki-agriculture-native-roster.json', import.meta.url);
  const roster = existsSync(path) ? JSON.parse(readFileSync(path)) : null;
  expect(roster, 'Native agriculture crosswalk is required').not.toBeNull();
  for (const [key,count] of Object.entries({seeds:68,crops:50,wildTrees:11,fruitTrees:8,giantCrops:5,fertilizers:10})) {
    expect(roster.collections[key].records, key).toHaveLength(count);
    expect(new Set(roster.collections[key].records.map(r => r.nativeId)).size, key).toBe(count);
  }
  const manifest = JSON.parse(readFileSync(new URL('../docs/wiki-full-manifest.json', import.meta.url)));
  const keys = new Set();
  for (const row of [...Object.values(roster.collections).flatMap(c=>c.records), ...roster.supplementary]) {
    for (const key of row.manifestKeys) {
      const matches = manifest.records.filter(r=>r.key===key);
      expect(matches, key).toHaveLength(1);
      if (matches[0].group === 'agriculture') keys.add(key);
    }
  }
  expect([...keys].sort()).toEqual(manifest.records.filter(r=>r.group==='agriculture').map(r=>r.key).sort());
  expect(roster.collections.crops.records.find(r=>r.nativeId==='433').manifestKeys).toEqual(['seed:433']);
  expect(roster.collections.crops.records.filter(r=>r.wildSeedHarvestNotExhaustive).map(r=>r.nativeId)).toEqual(['495','496','497','498']);
  expect(roster.status).toBe('pending');
});
