import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { entries } from '../src/db/seeds.js';

const names = ['森林魔法','生锈的钥匙','会员卡','特殊的魅力','头骨钥匙','放大镜','黑暗护身符','魔法墨水','熊的知识','青葱技术','小镇钥匙'];
const item = name => entries.find(e => e.dataset === 'items' && e.name === name);
test('special powers have distinct dedicated entries and cannot be sold', () => {
  for (const name of names) {
    expect(item(name), name).toBeDefined();
    expect(item(name).attributes.sellPrice).toBe('不可出售');
    expect(item(name).attributes.注意事项).toContain('特殊物品与能力');
  }
});
test('wallet powers preserve exact unlock conditions and effect limitations', () => {
  expect(item('生锈的钥匙')?.attributes.获取方式).toContain('60');
  expect(item('特殊的魅力')?.attributes.主要用途).toContain('0.025');
  expect(item('熊的知识')?.attributes.主要用途).toContain('不');
  expect(item('熊的知识')?.attributes.主要用途).toContain('加工');
  expect(item('青葱技术')?.attributes.获取方式).toContain('两人');
  expect(item('青葱技术')?.attributes.获取方式).toContain('8心');
  expect(item('小镇钥匙')?.attributes.注意事项).toContain('节日');
});
test('wallet collection includes reused translation guide without duplicate entry', () => {
  const inventory = JSON.parse(readFileSync(new URL('../docs/wiki-wallet-inventory.json', import.meta.url)));
  expect(inventory.records).toHaveLength(12);
  expect(new Set(inventory.records.map(r => r.originalName)).size).toBe(12);
  expect(entries.filter(e => e.dataset === 'items' && e.attributes.原版物品编号 === '(O)326')).toHaveLength(1);
});
