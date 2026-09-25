import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';

test('all five masteries have separate verified reward and unlock records', () => {
  for (const id of ['farming', 'mining', 'foraging', 'fishing', 'combat']) {
    const entry = entries.find(e => e.slug === `mastery-${id}`);
    expect(entry, id).toBeTruthy();
    expect(entry.attributes.解锁条件).toContain('五项技能');
    expect(entry.attributes.经验换算).toContain('50%');
    expect(entry.attributes.经验换算).toContain('100%');
    expect(entry.attributes.累计经验门槛).toBe('10000 / 25000 / 45000 / 70000 / 100000');
    expect(entry.attributes.领取规则).toContain('任意顺序');
  }
});

test('mastery rewards distinguish recipes, items and passive unlocks', () => {
  const get = id => entries.find(e => e.slug === `mastery-${id}`)?.attributes;
  expect(get('farming')?.解锁效果).toContain('猪无效');
  expect(get('mining')?.配方奖励).toContain('重型熔炉');
  expect(get('foraging')?.解锁效果).toContain('金色谜之盒');
  expect(get('fishing')?.实物奖励).toContain('高级铱金鱼竿');
  expect(get('combat')?.解锁效果).toContain('饰品装备栏');
});
