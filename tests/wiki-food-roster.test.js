import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';

test('Joja Cola is recorded separately from the Joja development form with correct non-recycling rules', () => {
  const rows = entries.filter(e => e.dataset === 'items' && e.attributes?.原版物品编号 === '(O)167');
  expect(rows).toHaveLength(1);
  expect(rows[0].attributes.sellPrice).toBe('25金');
  expect(rows[0].attributes.获取方式).toContain('75金');
  expect(rows[0].attributes.主要用途).toContain('21秒');
  expect(rows[0].attributes.注意事项).toContain('不能回收');
  expect(rows[0].attributes.注意事项).toContain('蟹笼');
});

test('food roster independently maps native food categories and distinct ingredients without extra generic-product variants', () => {
  const path = new URL('../docs/wiki-food-native-roster.json', import.meta.url);
  const roster = existsSync(path) ? JSON.parse(readFileSync(path)) : null;
  expect(roster, 'Native food and ingredient enumeration is required').not.toBeNull();
  expect(roster.nativeCategories).toEqual([-7,-79,-80,-81,-75,-26,-5,-6,-18]);
  expect(roster.categoryRecords).toHaveLength(202);
  expect(new Set(roster.categoryRecords.map(r => r.nativeId)).size).toBe(202);
  const manifest = JSON.parse(readFileSync(new URL('../docs/wiki-full-manifest.json', import.meta.url)));
  const keys = new Set();
  for (const row of [...roster.categoryRecords, ...roster.supplementary]) {
    const matches = manifest.records.filter(r => r.key === row.manifestKey);
    expect(matches, row.nativeId).toHaveLength(1);
    expect(matches[0].disposition).toBe('include');
    if (matches[0].group === 'food') keys.add(row.manifestKey);
  }
  expect([...keys].sort()).toEqual(manifest.records.filter(r => r.group === 'food').map(r => r.key).sort());
  expect(roster.categoryRecords.find(r => r.nativeId === '180').originalName).toBe('Brown Egg');
  expect(roster.categoryRecords.find(r => r.nativeId === 'DriedFruit').originalName).toBe('Dried Fruit');
});
