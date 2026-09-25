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

test('Haley API and SSR explain the camera event conditions without inventing an inventory reward', async () => {
  const response = await request(app).get('/api/datasets/villagers/entries/haley-icon');
  expect(response.status).toBe(200);
  const field = response.body.item.attributes['摄影事件'];
  for (const fact of ['8心', '非冬季', '晴天', '10:00—16:00', '煤矿森林', '相机', '不是背包奖励']) {
    expect(field).toContain(fact);
  }
  const page = await request(app).get('/wiki/villagers/haley-icon');
  expect(page.status).toBe(200);
  expect(page.text).toContain(field);
  expect((await request(app).get(response.body.item.image)).status).toBe(200);
});

test('camera explanation keeps the existing Haley identifier through repeated import', () => {
  const row = () => context.db.prepare("SELECT id,slug,name,attributes_json FROM dataset_entries WHERE name='海莉'").get();
  const before = row();
  expect(before).toBeTruthy();
  seedDatabase(context.db, { force: true });
  expect(row()).toEqual(before);
});
