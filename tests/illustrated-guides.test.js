import { beforeAll, afterAll, test, expect } from 'vitest';
import request from 'supertest';
import sharp from 'sharp';
import { createApp } from '../src/app.js';
import { initialize } from '../src/db/initialize.js';
import { createTestContext } from './helpers/context.js';
import { calculateCropProfit } from '../src/features/tools/crops.js';
import { crops } from '../src/features/tools/data/crops.js';
import { articles } from '../src/db/seeds.js';

let context, app;
beforeAll(async () => {
  context = createTestContext();
  await initialize(context);
  app = createApp(context);
});
afterAll(() => context?.close());

test.each(articles.map(article => article.slug))('tutorial illustrations survive both rendering paths and are served: %s', async slug => {
  const api = await request(app).get(`/api/articles/${slug}`).expect(200);
  const page = await request(app).get(`/guides/${slug}`).expect(200);
  const images = [...api.body.item.html.matchAll(/<img\b[^>]*src="(\/assets\/guides\/[^\"]+)"[^>]*>/g)];
  expect(images.length).toBeGreaterThan(0);
  for (const [tag, src] of images) {
    expect(tag).toMatch(/alt="[^"]+"/);
    expect(tag).toContain('loading="lazy"');
    expect(tag).toMatch(/width="\d+"/);
    expect(tag).toMatch(/height="\d+"/);
    expect(page.text).toContain(tag);
    const asset = await request(app).get(src).expect(200);
    expect(asset.headers['content-type']).toMatch(/image\//);
    const bytes = Buffer.isBuffer(asset.body) ? asset.body : Buffer.from(asset.text);
    const dimensions = await sharp(bytes).metadata();
    expect(Number(tag.match(/width="(\d+)"/)[1]), src).toBe(dimensions.width);
    expect(Number(tag.match(/height="(\d+)"/)[1]), src).toBe(dimensions.height);
    expect(api.body.item.html).toContain(`href="${src}"`);
  }
});

test('all guide links resolve to real local pages and assets', async () => {
  const links = new Set();
  for (const article of articles) {
    const api = await request(app).get(`/api/articles/${article.slug}`).expect(200);
    for (const [, href] of api.body.item.html.matchAll(/href="(\/(?!\/)[^"#]*)[^"]*"/g)) {
      if (href) links.add(href.replace(/&amp;/g, '&'));
    }
  }
  for (const href of links) {
    const response = await request(app).get(href).redirects(3);
    expect(response.status, href).toBe(200);
  }
}, 30000);

test('ten-plot illustrated starfruit example matches real calculator settlement', () => {
  const result = calculateCropProfit(crops.find(c => c.id === 'starfruit'), {
    season: '夏季', startDay: 1, planningDays: 28, plots: 10, budget: null,
    locationMode: 'greenhouse', greenhouseUnlocked: true, desertUnlocked: true,
    islandUnlocked: false, yearStage: 'later', farmingLevel: 0,
    fertilizer: 'none', agriculturist: false, tiller: false, method: 'sell',
    includeSeedCost: true, includeFertilizerCost: false, ownedFertilizerCount: 0,
    ownedSeeds: {}, jarCount: 1, kegCount: 1
  });
  expect(result.totalYield).toBe(20);
  expect(result.scenarios.sell).toMatchObject({ revenue: 15000, profit: 7000 });
  expect(result.scenarios.jar).toMatchObject({ processedInputQuantity: 6, remainingRawQuantity: 14, profit: 11800 });
  expect(result.scenarios.keg).toMatchObject({ processedInputQuantity: 2, remainingRawQuantity: 18, profit: 10000 });
});
