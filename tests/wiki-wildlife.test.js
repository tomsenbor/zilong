import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';

const ids = ['rabbit', 'squirrel', 'frog', 'crow', 'woodpecker', 'sparrow', 'butterfly', 'opossum', 'crab', 'caldera-monkey', 'parrot', 'owl', 'seagull', 'firefly'];

test('ambient wildlife has distinct curated identities, not livestock or sellable catches', () => {
  for (const id of ids) {
    const matches = entries.filter(e => e.dataset === 'items' && e.slug === 'wildlife-' + id);
    expect(matches, id).toHaveLength(1);
    expect(matches[0].attributes.type).toBe('野生环境生物');
    expect(matches[0].attributes.sellPrice).toBe('不可出售');
    expect(matches[0].attributes.注意事项.length).toBeGreaterThan(25);
    expect(matches[0].image).not.toContain('Prismatic_Shard');
  }
});

test('wildlife guidance separates crop damage and companion-only mechanics', () => {
  const get = id => entries.find(e => e.slug === 'wildlife-' + id)?.attributes;
  expect(get('crow')?.注意事项).toContain('姜岛');
  expect(get('frog')?.注意事项).toContain('青蛙蛋');
  expect(get('crab')?.注意事项).toContain('蟹笼');
  expect(get('rabbit')?.注意事项).toContain('兔子的脚');
  expect(get('owl')?.出现条件).toContain('冬季18:00');
  expect(get('firefly')?.图片说明).toContain('栖息地');
});

test('caldera monkey keeps its perfection reward exception instead of being described as entirely cosmetic', () => {
  const monkey = entries.find(e => e.slug === 'wildlife-caldera-monkey');
  expect(monkey?.attributes.主要用途).toContain('100%');
  expect(monkey?.attributes.主要用途).toContain('帽子');
});
