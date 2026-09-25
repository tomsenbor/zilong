import { beforeAll, afterAll, expect, test } from 'vitest';
import request from 'supertest';
import { entries } from '../src/db/seeds.js';
import { makeEntrySlug } from '../src/utils/entry-slug.js';
import { createApp } from '../src/app.js';
import { initialize } from '../src/db/initialize.js';
import { createTestContext } from './helpers/context.js';

const harvests = [
  ['seed-495', ['野山葵', '黄水仙', '韭葱', '蒲公英']],
  ['seed-496', ['葡萄', '香味浆果', '甜豌豆']],
  ['seed-497', ['黑莓', '普通蘑菇', '榛子', '野梅']],
  ['seed-498', ['番红花', '水晶果', '雪山药', '冬根']],
];
const get = slug => entries.find(e => e.dataset === 'items' && e.slug === slug);

test.each(harvests)('%s explicitly lists every random harvest and links to its existing page', (slug, names) => {
  const a = get(slug).attributes;
  expect(a['随机收获']).toEqual(names);
  expect(a['收获限制']).toContain('等概率');
  expect(a['收获限制']).toContain('重新播种');
  for (const name of names) {
    const matches = entries.filter(e => e.name === name);
    expect(matches).toHaveLength(1);
    expect(a.links).toContain(`/wiki/${matches[0].dataset}/${makeEntrySlug(matches[0])}`);
  }
});

test('wild-seed exceptions distinguish summer forage grapes and exclude winter holly', () => {
  expect(get('seed-496').attributes['收获限制']).toContain('不是秋季葡萄棚架');
  expect(get('seed-498').attributes['收获限制']).toContain('不包含冬青');
});

test('existing grass pages explain mature grass, storage limits and blue-grass benefits', () => {
  for (const slug of ['grass-starter', 'blue-grass-starter']) {
    const a = get(slug).attributes;
    expect(a['收割与储存']).toContain('50%');
    expect(a['收割与储存']).toContain('75%');
    expect(a['收割与储存']).toContain('100%');
    expect(a['收割与储存']).toContain('筒仓已满');
    expect(a['收割与储存']).toContain('剑或匕首');
    expect(a['扩散限制']).toContain('可耕土');
    expect(a['资料来源']).toContain('https://stardewvalleywiki.com/Grass');
  }
  expect(get('blue-grass-starter').attributes['蓝草区别']).toContain('16点');
  expect(get('blue-grass-starter').attributes['蓝草区别']).toContain('8点');
  expect(get('blue-grass-starter').attributes['蓝草区别']).toContain('2份干草');
});

let context, app;
beforeAll(async () => {
  context = createTestContext();
  await initialize(context);
  app = createApp(context);
}, 30000);
afterAll(() => context?.close());

test('practical additions are visible in API and server HTML without creating duplicate identities', async () => {
  for (const [slug, field] of [...harvests.map(([slug]) => [slug, '随机收获']), ['grass-starter', '收割与储存'], ['blue-grass-starter', '蓝草区别']]) {
    expect(entries.filter(e => e.dataset === 'items' && e.slug === slug)).toHaveLength(1);
    const api = await request(app).get(`/api/datasets/items/entries/${slug}`);
    expect(api.status).toBe(200);
    expect(api.body.item.attributes[field]).toEqual(get(slug).attributes[field]);
    const page = await request(app).get(`/wiki/items/${slug}`);
    expect(page.status).toBe(200);
    expect(page.text).toContain(field);
    const value = get(slug).attributes[field];
    for (const text of Array.isArray(value) ? value : [value]) expect(page.text).toContain(text);
  }
}, 30000);
