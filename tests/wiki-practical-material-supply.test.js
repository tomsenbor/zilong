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

// Independent 1.6.15-compatible source facts. Catch lost acquisition restrictions
// at the public API/SSR boundary, not the seed file's formatting or private layout.
test.each([
  ['battery-pack', ['不保证每根', '次日', '7个晴天', '不是7个日历日']],
  ['cloth', ['羊毛1份', '240游戏分钟', '星期三', '海蓝宝石3份', '布料1份']],
  ['maple-syrup', ['成熟枫树', '无需投入原料', '冬季仍可产出', '普通采集器等待9夜，重型采集器等待4夜']],
  ['oak-resin', ['成熟橡树', '无需投入原料', '冬季仍可产出', '普通采集器等待7夜，重型采集器等待3夜']],
  ['pine-tar', ['成熟松树', '无需投入原料', '冬季仍可产出', '普通采集器等待5夜，重型采集器等待2夜']],
  ['mystic-syrup', ['成熟神秘树', '无需投入原料', '冬季仍可产出', '普通采集器等待7夜，重型采集器等待3夜']],
  ['honey', ['姜岛全年', '先收蜜再采花', '花盆', '星期五', '200金']],
  ['oil', ['皮埃尔', '200金', '玉米1份、向日葵种子1份或向日葵1份，分别等待1000、3200、60游戏分钟']],
])('%s exposes verified supply conditions instead of generic processing instructions', async (slug, facts) => {
  const api = await request(app).get(`/api/datasets/items/entries/${slug}`);
  expect(api.status).toBe(200);
  const acquisition = api.body.item.attributes['获取方式'];
  for (const fact of facts) expect(acquisition, slug).toContain(fact);
  const page = await request(app).get(`/wiki/items/${slug}`);
  expect(page.status).toBe(200);
  expect(page.text).toContain(acquisition);
  expect((await request(app).get(api.body.item.image)).status).toBe(200);
  for (const link of api.body.item.attributes.links) expect((await request(app).get(link)).status, link).toBe(200);
});
