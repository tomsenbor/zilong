import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';

test('Haley bracelet is a distinct six-heart event prop, not ordinary equipment or an excluded debug item', () => {
  const matches = entries.filter(e => e.dataset === 'items' && e.attributes?.原版物品编号 === '(O)742');
  expect(matches).toHaveLength(1);
  const entry = matches[0];
  expect(entry.slug).toBe('eventprop-742');
  expect(entry.attributes.获取方式).toContain('六心');
  expect(entry.attributes.获取方式).toContain('10:00—16:00');
  expect(entry.attributes.获取方式).toContain('非冬季');
  expect(entry.attributes.主要用途).toContain('交还海莉');
  expect(entry.attributes.注意事项).toContain('不是可装备');
  expect(entry.attributes.sellPrice).toBe('剧情道具，不按普通商品定价');
});
