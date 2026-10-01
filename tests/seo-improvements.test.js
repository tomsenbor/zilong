import { beforeAll, afterAll, test, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { initialize } from '../src/db/initialize.js';
import { createTestContext } from './helpers/context.js';
import { canonicalPathForRoute, parseAppRoute } from '../public/js/routes.js';
import { datasetMetadata } from '../public/js/dataset-metadata.js';

let context, app;
const main = html => html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] || '';
const description = html => html.match(/<meta name="description" content="([^"]*)"/)?.[1];
beforeAll(async () => {
  context = createTestContext();
  context.config.siteUrl = 'https://pixelharvestwiki.com';
  await initialize(context);
  app = createApp(context);
});
afterAll(() => context?.close());

test('initial HTML pages match API ordering and expose crawlable next and previous links', async () => {
  const first = await request(app).get('/wiki/items');
  const second = await request(app).get('/wiki/items?page=2');
  const api = await request(app).get('/api/datasets/items/entries?page=2&pageSize=20');
  const links = [...main(second.text).matchAll(/href="\/wiki\/items\/([^"?]+)"/g)].map(m => m[1]);
  expect(first.status).toBe(200);
  expect(second.status).toBe(200);
  expect(links).toEqual(api.body.items.map(item => item.slug));
  expect(main(first.text)).toContain('href="/wiki/items?page=2"');
  expect(main(second.text)).toContain('href="/wiki/items"');
  expect(second.text).toContain('rel="canonical" href="https://pixelharvestwiki.com/wiki/items?page=2"');
  expect(second.text.match(/<title>(.*?)<\/title>/)[1]).toContain('第2页');
  const metadata = datasetMetadata(api.body.dataset, 2, api.body.pagination.total);
  expect(second.text.match(/<title>(.*?)<\/title>/)[1]).toBe(metadata.title);
  expect(description(second.text)).toBe(metadata.description);
});

test('out of range pages are not indexable duplicate first pages', async () => {
  for (const page of ['0', '-1', '1.5', 'abc', '999999']) {
    const result = await request(app).get(`/wiki/items?page=${page}`);
    expect(result.status, page).toBe(404);
    expect(result.headers['x-robots-tag'], page).toContain('noindex');
  }
});

test('browser canonical retains real pagination but not filter combinations', () => {
  const canonical = search => canonicalPathForRoute(parseAppRoute({ pathname: '/wiki/items', search }));
  expect(canonical('?page=2')).toBe('/wiki/items?page=2');
  expect(canonical('?page=1')).toBe('/wiki/items');
  expect(canonical('?page=2&q=石头')).toBe('/wiki/items');
});

test('filtered initial HTML matches filtered API, without canonizing duplicate filter pages', async () => {
  const result = await request(app).get('/wiki/items?q=石头');
  const api = await request(app).get('/api/datasets/items/entries?q=石头&pageSize=20');
  const links = [...main(result.text).matchAll(/href="\/wiki\/items\/([^"?]+)"/g)].map(m => m[1]);
  expect(links).toEqual(api.body.items.map(item => item.slug));
  expect(result.text).toContain('rel="canonical" href="https://pixelharvestwiki.com/wiki/items"');
});

test('gift initial HTML includes verified birthdays and loves, and respects selected villager', async () => {
  const response = await request(app).get('/tools/gifts?villager=abigail-icon');
  const html = main(response.text);
  expect(html).toContain('阿比盖尔');
  expect(html).toContain('秋季13日');
  expect(html).toContain('紫水晶');
  expect(html).toContain('href="/wiki/villagers/abigail-icon"');
  expect(html).not.toContain('href="/wiki/villagers/caroline-icon"');
  expect(html).toContain('不是完整喜恶表');
  const all = await request(app).get('/tools/gifts');
  expect(main(all.text)).toContain('文森特');
  expect(main(all.text)).toContain('春季10日');
});

test('entry metadata adds actual facts rather than leaving a one-line summary', async () => {
  const response = await request(app).get('/wiki/cooking/crab-cakes');
  expect(description(response.text)).toContain('蟹黄糕');
  expect(description(response.text)).toMatch(/材料|原料|来源/);
  expect(description(response.text).length).toBeGreaterThan(40);
  expect(response.text.match(/<title>(.*?)<\/title>/)[1]).toContain('配方');
  const tools = await request(app).get('/tools');
  expect(description(tools.text)).toContain('礼物');
});
