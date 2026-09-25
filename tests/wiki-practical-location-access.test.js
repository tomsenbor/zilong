import { beforeAll, afterAll, expect, test } from 'vitest';
import request from 'supertest';
import { createTestContext } from './helpers/context.js';
import { initialize } from '../src/db/initialize.js';
import { seedDatabase } from '../src/db/seed.js';
import { createApp } from '../src/app.js';

let context, app;
beforeAll(async () => {
  context = createTestContext();
  await initialize(context);
  app = createApp(context);
}, 30000);
afterAll(() => context?.close());

// Independently checked access/cost facts must survive import and public SSR.
const cases = [
  ['hardwood', '36px-Hardwood.png', '获取方式', ['钢斧', '大原木', '6个树桩', '12份硬木', '下方隐藏区域']],
  ['krobus-icon', '36px-Krobus_Icon.png', '主要用途', ['10000金', '当晚睡觉', '立即失效', '当天出货', '黑暗护符']],
  ['desert', '36px-Desert.png', '获取方式', ['42500金', '40000金', '500金', '含返程', '传送图腾']],
  ['mining-skill-icon', '48px-Mining_Skill_Icon.png', '主要用途', ['120层', '头骨钥匙', '20层和60层', '100层', '15000金']],
  ['spa', '36px-Health.png', '主要用途', ['每现实秒', '10点', '保持静止', '移动时不恢复']],
  ['quarry', 'Location_quarry.png', '注意事项', ['15000金', '已有石块', '刷新', '不保证']],
  ['quarry-mine', 'Location_quarry-mine.png', '主要用途', ['背包空位', '金镰刀', '返回洞穴入口', '不是铱镰刀']],
];

test.each(cases)('%s keeps actionable access guidance in API, SSR and existing imagery', async (slug, image, field, facts) => {
  const response = await request(app).get(`/api/datasets/locations/entries/${slug}`);
  expect(response.status).toBe(200);
  const item = response.body.item;
  for (const fact of facts) expect(item.attributes[field], slug).toContain(fact);
  expect(item.image).toBe(`/assets/game/${image}`);
  expect((await request(app).get(item.image)).status).toBe(200);
  const page = await request(app).get(`/wiki/locations/${slug}`);
  expect(page.status).toBe(200);
  expect(page.text).toContain(item.attributes[field]);
  for (const link of item.attributes.links) expect((await request(app).get(link)).status, link).toBe(200);
  if (slug === 'hardwood') expect(item.attributes.获取方式).not.toContain('砍开煤矿森林西北侧的大木桩');
  if (slug === 'desert') expect(item.attributes.open).toContain('区域全天');
});

test('location guidance reimport preserves IDs, URLs and payloads', () => {
  const rows = () => context.db.prepare('SELECT id,dataset_id,slug,name,attributes_json FROM dataset_entries ORDER BY id').all();
  const before = rows();
  seedDatabase(context.db);
  expect(rows()).toEqual(before);
});
