import { afterAll, beforeAll, expect, test } from 'vitest';
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

// These fixtures describe independently verified player-facing rules. They catch
// lost maturity/collection restrictions and conflation of milk/egg size or quality.
const cases = [
  ['animal-product-176', '获取方式', ['3夜', '每天', '白鸡和蓝鸡', '孵化不能得到蓝鸡']],
  ['animal-product-180', '获取方式', ['3夜', '每天', '棕鸡', '孵化出棕鸡']],
  ['animal-product-174', '获取方式', ['3夜', '每天', '替代普通蛋', '不是额外再产一枚']],
  ['animal-product-182', '获取方式', ['3夜', '每天', '替代普通蛋', '不是额外再产一枚']],
  ['animal-product-184', '获取方式', ['5夜', '每天', '挤奶桶或自动采集器', '不是捡地面掉落物']],
  ['animal-product-186', '获取方式', ['5夜', '每天', '替代普通牛奶', '不是同日两瓶']],
  ['animal-product-436', '获取方式', ['5夜', '每2天', '挤奶桶或自动采集器']],
  ['animal-product-438', '获取方式', ['5夜', '每2天', '替代普通羊奶', '不是同日两瓶']],
  ['animal-product-289', '获取方式', ['7夜', '每7天', '畜棚', '自动采集器']],
  ['animal-product-305', '获取方式', ['3夜', '每天', '5000金', '鸡舍']],
  ['animal-product-928', '获取方式', ['3夜', '每天', '完美进度', '100000金']],
  ['animal-product-440', '获取方式', ['绵羊喂养4夜', '基础每3天', '剪刀或自动采集器', '兔子喂养6夜', '每4天', '不需剪毛']],
  ['animal-product-442', '获取方式', ['5夜', '每2天', '鸭毛会替代鸭蛋', '不是同时产两样']],
  ['animal-product-444', '获取方式', ['每2天', '替代鸭蛋', '不是每天固定掉毛']],
  ['dinosaur-egg', '获取方式', ['山区或采石场', '钓鱼2级', '至少一件古物', '每7天']],
  ['rabbit-s-foot', '获取方式', ['高级鸡舍', '6夜', '每4天', '替代动物毛', '0.8%']],
  ['truffle', '获取方式', ['10夜', '冬季、雨天和雷雨天不产出', '28日', '自动采集器不能收松露']],
  ['cheese', '关联规划', ['地窖', '普通到银星3天', '累计7天到金星', '累计14天到铱星', '金星起步只需7天']],
  ['goat-cheese', '关联规划', ['地窖', '普通到银星3天', '累计7天到金星', '累计14天到铱星', '金星起步只需7天']],
  ['beer', '关联规划', ['地窖', '累计7天到银星', '累计14天到金星', '累计28天到铱星']],
  ['mead', '关联规划', ['地窖', '累计7天到银星', '累计14天到金星', '累计28天到铱星']],
  ['pale-ale', '关联规划', ['地窖', '累计9天到银星', '累计17天到金星', '累计34天到铱星']],
  ['fruit-wine', '关联规划', ['地窖', '累计14天到银星', '累计28天到金星', '累计56天到铱星']],
];

test.each(cases)('%s exposes usable production or aging guidance through API and SSR', async (slug, field, facts) => {
  const response = await request(app).get(`/api/datasets/items/entries/${slug}`);
  expect(response.status).toBe(200);
  const item = response.body.item;
  const text = item.attributes[field];
  for (const fact of facts) expect(text, `${slug}: ${fact}`).toContain(fact);
  if (slug === 'truffle') {
    expect(item.attributes['主要用途']).toContain('没有料理配方');
    expect(item.attributes['新手建议']).toContain('植物学家');
    expect(item.attributes['新手建议']).toContain('不享受牧场主');
  }
  if (slug === 'rabbit-s-foot') {
    expect(text).not.toContain('畜棚');
    expect(item.attributes['新手建议']).toContain('携带本身不会增加幸运');
    expect(item.attributes['主要用途']).toContain('潘妮讨厌');
  }
  const page = await request(app).get(`/wiki/items/${slug}`);
  expect(page.status).toBe(200);
  expect(page.text).toContain(text);
  expect((await request(app).get(item.image)).status).toBe(200);
  for (const link of item.attributes.links) expect((await request(app).get(link)).status, link).toBe(200);
});

test('practical husbandry reimport keeps existing IDs, URLs and payloads stable', () => {
  const snapshot = () => context.db.prepare('SELECT id,dataset_id,slug,name,attributes_json FROM dataset_entries ORDER BY id').all();
  const before = snapshot();
  seedDatabase(context.db);
  expect(snapshot()).toEqual(before);
});
