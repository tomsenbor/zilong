import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const get = id => entries.find(e => e.slug === `monster-${id}`);
test('six bat identities keep their respective region, combat stats and shared guild goal', () => {
  for (const [id, hp] of [['bat',24],['frost-bat',36],['lava-bat',80],['iridium-bat',300],['bat-dangerous',268],['frost-bat-dangerous',277]]) {
    const e = get(id);
    expect(e, id).toBeTruthy();
    expect(e.attributes.基础生命).toBe(hp);
    expect(e.attributes.公会目标).toContain('200');
  }
  expect(get('frost-bat-dangerous').attributes.出现地点).toContain('危险矿井');
  expect(get('iridium-bat').attributes.出现地点).toContain('51');
  expect(get('iridium-bat').attributes.变体说明).toContain('880');
});
test('bat loot does not repeat incorrect twenty-percent bomb probabilities from translated tables', () => {
  expect(get('bat')?.attributes.掉落说明).toContain('炸弹2%');
  expect(get('lava-bat')?.attributes.掉落说明).toContain('炸弹2%');
  expect(get('iridium-bat')?.attributes.掉落说明).toContain('电池组');
  expect(get('iridium-bat')?.attributes.掉落说明).not.toContain('蝙蝠翅膀');
});
