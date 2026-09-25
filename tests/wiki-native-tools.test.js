import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
const manifest = JSON.parse(readFileSync(new URL('../docs/wiki-full-manifest.json', import.meta.url)));

test('cut Lantern and Raft tools have explicit source-backed exclusions, not fabricated acquisition routes', () => {
  for (const name of ['Lantern', 'Raft']) {
    const rows = manifest.records.filter(r => r.key === 'native-tool:' + name);
    expect(rows, name).toHaveLength(1);
    expect(rows[0].disposition).toBe('exclude');
    expect(rows[0].sourceUrl).toContain('Modding');
    expect(rows[0].reason).toContain('cut');
  }
});

test('native tool inventory maps all 37 original identities across groups without duplicating fishing or husbandry tools', () => {
  const inventory = JSON.parse(readFileSync(new URL('../docs/wiki-native-tools-inventory.json', import.meta.url)));
  expect(inventory.records).toHaveLength(37);
  expect(new Set(inventory.records.map(r => r.nativeId)).size).toBe(37);
  for (const record of inventory.records) {
    const matches = manifest.records.filter(r => r.key === record.manifestKey);
    expect(matches, record.nativeId).toHaveLength(1);
    expect(matches[0].disposition).toBe(record.disposition);
  }
  expect(inventory.records.find(r => r.nativeId === 'Lantern').disposition).toBe('exclude');
  expect(inventory.records.filter(r => r.disposition === 'include')).toHaveLength(36);
});
