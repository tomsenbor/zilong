import { afterAll, beforeAll, expect, test } from 'vitest';
import request from 'supertest';
import { createTestContext } from './helpers/context.js';
import { initialize } from '../src/db/initialize.js';
import { createApp } from '../src/app.js';
import { readFileSync } from 'node:fs';

// Hand-checked against original 1.6.15 Data/Machines (BC)12 and (BC)15.
// The rice rule has MinStack=MaxStack=2: one rice makes TWO vinegar.
const processing = [
  ['keg', '小麦×1→啤酒×1：1750分钟'],
  ['keg', '啤酒花×1→淡啤酒×1：2250分钟'],
  ['keg', '茶叶×1→绿茶×1：180分钟'],
  ['keg', '咖啡豆×5→咖啡×1：120分钟'],
  ['keg', '蜂蜜×1→蜂蜜酒×1：600分钟'],
  ['keg', '大米×1→醋×2：600分钟'],
  ['keg', '水果×1→果酒×1：10000分钟'],
  ['keg', '普通蔬菜×1→果汁×1：6000分钟'],
  ['preserves-jar', '可食采集物（包括可食蘑菇）'],
];
let context, app;
test.each([
  ['iron-bar', '采矿4级', '铜锭×3→铁锭×1', '铁矿石×5和煤炭×1', '120分钟'],
  ['gold-bar', '采矿7级', '铁锭×2→金锭×1', '金矿石×5和煤炭×1', '300分钟'],
])('%s documents transmutation separately from furnace processing', async (slug, level, recipe, materials, time) => {
  const { body, status } = await request(app).get(`/api/datasets/items/entries/${slug}`);
  expect(status).toBe(200);
  const text = body.item.attributes['获取方式'];
  for (const fact of [level, recipe, materials, time, '不消耗煤炭']) expect(text).toContain(fact);
  const page = await request(app).get(`/wiki/items/${slug}`);
  expect(page.status).toBe(200);
  expect(page.text).toContain(text);
});
beforeAll(async () => {
  context = createTestContext();
  await initialize(context);
  app = createApp(context);
}, 30000);
afterAll(() => context?.close());

test.each(processing)('%s publishes the verified processing rule: %s', async (slug, expected) => {
  const api = await request(app).get(`/api/datasets/items/entries/${slug}`);
  expect(api.status).toBe(200);
  expect(api.body.item.attributes['加工方式']).toContain(expected);
  const page = await request(app).get(`/wiki/items/${slug}`);
  expect(page.status).toBe(200);
  expect(page.text).toContain(expected);
});

test('keg distinguishes recipe exceptions and processed rice from unmilled rice', async () => {
  const { body } = await request(app).get('/api/datasets/items/entries/keg');
  const restrictions = body.item.attributes['使用限制'];
  expect(restrictions).toContain('小麦、啤酒花和茶叶优先使用专属配方');
  expect(restrictions).toContain('不是未碾米');
  expect(restrictions).toContain('蘑菇不能制果汁');
});

test('every original machine identity has a precise public mapping, including the fixed cave boxes', async () => {
  const evidence = JSON.parse(readFileSync(new URL('../docs/wiki-practical-processing-evidence.json', import.meta.url)));
  expect(evidence.nativeMachineRoster).toHaveLength(39);
  expect(new Set(evidence.nativeMachineRoster.map(r => r.id)).size).toBe(39);
  for (const r of evidence.nativeMachineRoster) {
    const api = await request(app).get(`/api/datasets/${r.dataset}/entries/${r.slug}`);
    expect(api.status, r.id).toBe(200);
    if (r.id === '(BC)128') {
      const text = api.body.item.attributes['农场山洞'];
      for (const fact of ['累计收入25000金', '不能更改', '6个蘑菇箱', '每隔一天', '脱水机']) expect(text).toContain(fact);
      expect((await request(app).get(`/wiki/${r.dataset}/${r.slug}`)).text).toContain(text);
    } else {
      expect(api.body.item.attributes['获取方式'], r.id).toBeTruthy();
      expect(api.body.item.attributes['主要用途'], r.id).toBeTruthy();
    }
  }
}, 30000);

test.each([
  ['soda-machine', '(BC)117', '汽水机', 'Joja社区发展', '每天产出1罐Joja可乐'],
  ['statue-of-perfection', '(BC)160', '完美雕像', '四根蜡烛', '每天产出2至8个铱矿石'],
  ['statue-of-true-perfection', '(BC)280', '真正完美的雕像', '100%', '每天产出1个五彩碎片'],
])('%s has a real reward-machine page, image and precise unlock/output', async (slug, id, name, unlock, output) => {
  const api = await request(app).get(`/api/datasets/items/entries/${slug}`);
  expect(api.status).toBe(200);
  expect(api.body.item.name).toBe(name);
  expect(api.body.item.attributes['原版大件编号']).toBe(id);
  expect(api.body.item.attributes['获取方式']).toContain(unlock);
  expect(api.body.item.attributes['主要用途']).toContain(output);
  expect(api.body.item.image).toBe(`/assets/game/${slug}.png`);
  expect((await request(app).get(api.body.item.image)).status).toBe(200);
  const page = await request(app).get(`/wiki/items/${slug}`);
  expect(page.status).toBe(200);
  expect(page.text).toContain(output);
  for (const link of api.body.item.attributes.links) {
    expect((await request(app).get(link)).status, link).toBe(200);
  }
});
