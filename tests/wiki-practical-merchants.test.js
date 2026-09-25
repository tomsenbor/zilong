import { afterAll, beforeAll, expect, test } from 'vitest';
import request from 'supertest';
import { entries } from '../src/db/seeds.js';
import { createApp } from '../src/app.js';
import { initialize } from '../src/db/initialize.js';
import { createTestContext } from './helpers/context.js';

let context, app;
beforeAll(async () => {
  context = createTestContext();
  await initialize(context);
  app = createApp(context);
}, 30000);
afterAll(() => context?.close());

test('volcano shop explains the language prerequisite and distinct currencies on the existing page', async () => {
  const response = await request(app).get('/api/datasets/locations/entries/volcano-dungeon');
  expect(response.status).toBe(200);
  const a = response.body.item.attributes;
  expect(a['商店交易条件']).toContain('第5层');
  expect(a['商店交易条件']).toContain('4份矮人卷轴');
  expect(a['商店交易条件']).toContain('I、II、III、IV各一份');
  expect(a['商店交易条件']).toContain('矮人语教程');
  expect(a['商店交易条件']).toContain('不是矿井入口');
  expect(a['商店交易条件']).toContain('100个火山晶石');
  expect(a['商店交易条件']).toContain('1000金');
  const page = await request(app).get('/wiki/locations/volcano-dungeon');
  expect(page.status).toBe(200);
  expect(page.text).toContain('4份矮人卷轴');
  expect(page.text).toContain('100个火山晶石');
});

test('practical merchant information stays reachable through existing shop URLs without duplicate character pages', async () => {
  for (const [slug, name, condition] of [['desert-trader', '沙漠商人', '冬15—17'], ['island-trader', '姜岛商人', '先修复姜岛农舍']]) {
    const response = await request(app).get(`/api/datasets/locations/entries/${slug}`);
    expect(response.status).toBe(200);
    expect(response.body.item.name).toBe(name);
    expect(response.body.item.attributes['获取方式']).toBeTruthy();
    expect(response.body.item.attributes['主要用途']).toBeTruthy();
    expect(entries.filter(e => e.name === name)).toHaveLength(1);
    const page = await request(app).get(`/wiki/locations/${slug}`);
    expect(page.status).toBe(200);
    expect(page.text).toContain(name);
    expect(page.text).toContain(condition);
  }
});
