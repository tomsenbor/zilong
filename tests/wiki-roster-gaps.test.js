import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';

test('starting inventory is recorded as twelve slots rather than a paid backpack upgrade', () => {
  const rows = entries.filter(e => e.dataset === 'items' && e.slug === 'starter-backpack');
  expect(rows).toHaveLength(1);
  expect(rows[0].attributes.主要用途).toContain('12格');
  expect(rows[0].attributes.获取方式).toContain('初始');
  expect(rows[0].attributes.注意事项).toContain('2000g');
  expect(rows[0].attributes.图片说明).toContain('物品栏标签');
});

test('tea bush has its own mature plant identity separate from sapling and harvested leaves', () => {
  const rows = entries.filter(e => e.dataset === 'items' && e.slug === 'tea-bush');
  expect(rows).toHaveLength(1);
  expect(rows[0].attributes.获取方式).toContain('20天');
  expect(rows[0].attributes.主要用途).toContain('22—28日');
  expect(rows[0].attributes.主要用途).toContain('室内');
  expect(rows[0].attributes.注意事项).toContain('树肥');
});

test('starter trash can is included without pretending it is a purchasable or placeable container', () => {
  const rows = entries.filter(e => e.dataset === 'items' && e.slug === 'basic-trash-can');
  expect(rows).toHaveLength(1);
  expect(rows[0].attributes.获取方式).toContain('初始');
  expect(rows[0].attributes.主要用途).toContain('不返还');
  expect(rows[0].attributes.注意事项).toContain('不是可放置');
});
