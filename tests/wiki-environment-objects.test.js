import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const get = id => entries.find(e => e.slug === 'environment-' + id.toLowerCase());
test('three obtainable 1.6 fireworks keep their original identities and currencies', () => {
 for (const id of ['893','894','895']) {
  expect(get(id),id).toBeDefined();
  expect(get(id).attributes.原版物品编号).toBe('(O)' + id);
  expect(get(id).attributes.type).toBe('庆祝消耗品');
  expect(get(id).attributes.获取方式).toContain('1齐钻');
  expect(get(id).attributes.获取方式).toContain('200齐币');
  expect(get(id).attributes.sellPrice).toBe('50金');
 }
});
test('artifact and seed spots are ground mechanics, not inventory items', () => {
 for(const id of ['590','SeedSpot']) {
  expect(get(id),id).toBeDefined();
  expect(get(id).attributes.sellPrice).toContain('不适用');
  expect(get(id).attributes.type).toBe('地面资源点');
  expect(get(id).attributes.注意事项).toContain('锄头');
 }
 expect(get('SeedSpot')?.name).toBe('绿色斑点');
 expect(get('SeedSpot')?.attributes.主要用途).toContain('2—3');
 expect(get('SeedSpot')?.attributes.主要用途).toContain('冬21—春23');
 expect(get('SeedSpot')?.attributes.主要用途).toContain('春24—夏20');
 expect(get('SeedSpot')?.attributes.主要用途).toContain('夏21—秋20');
 expect(get('SeedSpot')?.attributes.主要用途).toContain('秋21—冬20');
});
