import { beforeAll, afterAll, expect, test } from 'vitest';
import request from 'supertest';
import { entries } from '../src/db/seeds.js';
import { makeEntrySlug } from '../src/utils/entry-slug.js';
import { createApp } from '../src/app.js';
import { initialize } from '../src/db/initialize.js';
import { createTestContext } from './helpers/context.js';

const get = slug => entries.find(e => e.dataset === 'quests' && makeEntrySlug(e) === slug);
const chains = [
  ['mr-qi-icon', ['电池组1', '彩虹贝壳1', '甜菜10', '太阳精华1', '木材堆']],
  ['skull-key', ['第120层', '宝箱', '骷髅洞穴']],
  ['void-mayonnaise', ['虚空蛋黄酱1', '魔法墨水', '法师']],
  ['dark-talisman', ['铁路', '科罗布斯', '突变虫穴', '洞口']],
  ['war-memento', ['肯特', '格斯', '桑迪', '乔治', '法师', '威利', '鸟蒂']],
];
test.each(chains)('%s includes the ordered actions instead of only a generic quest summary', (slug, steps) => {
  const a = get(slug).attributes;
  const text = a['完成步骤'];
  expect(text).toBeTruthy();
  let previous = -1;
  for (const step of steps) {
    const position = text.indexOf(step, previous + 1);
    expect(position, step).toBeGreaterThan(previous);
    previous = position;
  }
  expect(a['时限']).toContain('无时限');
  expect(a['资料来源']).toMatch(/^https:\/\/stardewvalleywiki.com\//);
});

test('pirate chain includes its walnut reward and does not require the island farmhouse', () => {
  const a = get('war-memento').attributes;
  expect(a.reward).toContain('5个金色核桃');
  expect(a['注意事项']).toContain('农舍不是接取前置');
});
test('resource rush counts fresh collection, not donation, and preserves the legacy URL', () => {
  const e = get('robin-icon');
  expect(e.summary).not.toContain('提交');
  expect(e.attributes['完成步骤']).toContain('1000');
  expect(e.attributes['完成步骤']).toContain('新收集');
  expect(e.attributes['完成步骤']).toContain('不需要交付');
  expect(e.attributes['注意事项']).toContain('已有库存');
  expect(e.attributes['最长天数']).toBe('7');
  expect(e.attributes.reward).toContain('2500金');
  expect(e.attributes.reward).toContain('石箱配方');
});

test('Qi orders explain exact goal, deadline and inventory restrictions', () => {
  const danger = get('danger-in-the-deep').attributes;
  expect(danger['完成步骤']).toContain('山区矿井第120层');
  expect(danger['注意事项']).toContain('电梯');
  expect(danger['最长天数']).toBe('7');
  const colors = get('qi-gem').attributes;
  expect(colors['完成步骤']).toContain('红、橙、黄、绿、蓝、紫');
  expect(colors['完成步骤']).toContain('各100件');
  expect(colors['完成步骤']).toContain('收集箱');
  expect(colors['注意事项']).toContain('已有库存');
  expect(colors['注意事项']).toContain('不退还');
  expect(colors['最长天数']).toBe('14');
  for (const a of [danger, colors]) expect(a['期限说明']).toContain('剩余');
});

let context, app;
beforeAll(async () => {
  context = createTestContext();
  await initialize(context);
  app = createApp(context);
}, 30000);
afterAll(() => context?.close());

test('all corrected orders and chains retain their public API and SSR content', async () => {
  for (const slug of ['robin-icon', 'danger-in-the-deep', 'qi-gem', ...chains.map(([slug]) => slug)]) {
    const api = await request(app).get(`/api/datasets/quests/entries/${slug}`);
    expect(api.status).toBe(200);
    expect(api.body.item.attributes['完成步骤']).toBe(get(slug).attributes['完成步骤']);
    const page = await request(app).get(`/wiki/quests/${slug}`);
    expect(page.status).toBe(200);
    expect(page.text).toContain('完成步骤');
    expect(page.text).toContain(get(slug).attributes['完成步骤']);
    expect(page.text).toContain(get(slug).attributes['期限说明'] ? '期限说明' : '无时限');
    expect(entries.filter(e => e.dataset === 'quests' && makeEntrySlug(e) === slug)).toHaveLength(1);
  }
}, 30000);
