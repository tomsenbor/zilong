import { afterAll, beforeAll, expect, test } from 'vitest';
import request from 'supertest';
import { createTestContext } from './helpers/context.js';
import { initialize } from '../src/db/initialize.js';
import { createApp } from '../src/app.js';

let context, app;
beforeAll(async () => {
  context = createTestContext();
  await initialize(context);
  app = createApp(context);
}, 30000);
afterAll(() => context?.close());

test.each(['geode', 'frozen-geode', 'magma-geode', 'omni-geode'])('%s explains opening cost and does not imply luck changes contents', async slug => {
  const api = await request(app).get(`/api/datasets/items/entries/${slug}`);
  expect(api.status).toBe(200);
  const opening = api.body.item.attributes['打开方式'];
  for (const fact of ['25金', '60游戏分钟', '不消耗煤炭', '每日运气', '幸运增益', '不会改变']) expect(opening).toContain(fact);
  expect(api.body.item.attributes.links).toContain('/wiki/items/geode-crusher');
  expect((await request(app).get('/wiki/items/geode-crusher')).status).toBe(200);
  const page = await request(app).get(`/wiki/items/${slug}`);
  expect(page.status).toBe(200);
  expect(page.text).toContain(opening);
});

// Independent fixtures: original 1.6.15 Machines and corresponding resource pages.
// Detect omitted quantities, tool requirements, or ore/bar source confusion at public boundaries.
test.each([
  ['copper-bar', ['铜矿石×5', '煤炭×1', '30分钟', '铜锭×1']],
  ['iridium-bar', ['铱矿石×5', '煤炭×1', '480分钟', '完美雕像产出铱矿石', '不是铱锭']],
  ['coal', ['木材×10', '煤炭×1', '30分钟', '第一年150金', '第二年起250金', '41至79层']],
  ['hardwood', ['大树桩需铜斧', '大圆木需钢斧', '成熟桃花心木可用任意斧头', '6个大树桩', '12份硬木']],
])('%s publishes actionable acquisition quantities and restrictions in API and SSR', async (slug, facts) => {
  const api = await request(app).get(`/api/datasets/items/entries/${slug}`);
  expect(api.status).toBe(200);
  const acquisition = api.body.item.attributes['获取方式'];
  for (const fact of facts) expect(acquisition, slug).toContain(fact);
  if (slug === 'iridium-bar') expect(api.body.item.attributes.source).not.toContain('完美雕像');
  if (slug === 'coal') expect(api.body.item.summary).toContain('普通熔炉');
  const page = await request(app).get(`/wiki/items/${slug}`);
  expect(page.status).toBe(200);
  expect(page.text).toContain(acquisition);
  expect((await request(app).get(api.body.item.image)).status).toBe(200);
  for (const link of api.body.item.attributes.links) expect((await request(app).get(link)).status, link).toBe(200);
});
