import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';

const quests = () => entries.filter(e => e.dataset === 'quests' && e.slug?.startsWith('story-letter-'));

test('native fixed deliveries award 255 friendship while lost objects award 250', () => {
  for (let id = 100; id <= 125; id++) {
    const points = [100, 102, 107].includes(id) ? 250 : 255;
    const entry = quests().find(e => e.slug === `story-letter-${id}`);
    expect(entry?.attributes.好感奖励, String(id)).toContain(`+${points}点`);
    expect(entry?.attributes.reward, String(id)).toContain(`+${points}点`);
    expect(entry?.attributes.主要用途, String(id)).toContain(`+${points}点`);
  }
});
test('all 26 fixed first and second year letter quests have distinct public records', () => {
  expect(quests()).toHaveLength(26);
  expect(new Set(quests().map(e => e.name)).size).toBe(26);
  expect(quests().map(e => Number(e.attributes.原版任务编号)).sort((a,b)=>a-b)).toEqual([
    100,101,102,103,104,105,106,107,108,109,110,111,112,
    113,114,115,116,117,118,119,120,121,122,123,124,125
  ]);
});
test('letter quests use native 1.6.15 reward values rather than item sell prices or erroneous wiki rewards', () => {
  const rewards = [250,350,750,350,550,200,500,0,500,800,0,1000,500,500,400,600,500,1000,1000,500,750,800,400,5000,550,600];
  for (const [index, reward] of rewards.entries()) {
    expect(quests().find(e => e.attributes.原版任务编号 === String(index+100))?.attributes.金币奖励).toBe(reward);
  }
});
test('year two quests are not presented as first year letters and fixed story quests are not two-day requests', () => {
  expect(quests().find(e=>e.slug==='story-letter-121')?.attributes.trigger).toBe('第2年秋季6日来信');
  expect(quests().find(e=>e.slug==='story-letter-100')?.attributes.trigger).toBe('第1年春季11日来信');
  expect(quests()).toHaveLength(26);
  for (const e of quests()) expect(e.attributes.时限).toContain('无截止日期');
});
test('delivery targets and quantities do not confuse requester, recipient, finished dish or raw ingredient', () => {
  const get = id => quests().find(e=>e.slug===`story-letter-${id}`)?.attributes;
  expect(get(110)?.交付对象).toBe('艾米丽');
  expect(get(110)?.所需物品).toBe('紫水晶 × 1');
  expect(get(113)?.所需物品).toBe('硬木 × 10');
  expect(get(114)?.所需物品).toBe('青花鱼 × 1');
  expect(get(103)?.所需物品).toBe('淡啤酒 × 1');
});
