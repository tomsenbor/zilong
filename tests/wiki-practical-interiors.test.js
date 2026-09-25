import { beforeAll, afterAll, expect, test } from 'vitest';
import request from 'supertest';
import { createTestContext } from './helpers/context.js';
import { initialize } from '../src/db/initialize.js';
import { seedDatabase } from '../src/db/seed.js';
import { createApp } from '../src/app.js';
import { readFileSync } from 'node:fs';

let context, app;
beforeAll(async () => {
  context = createTestContext();
  await initialize(context);
  app = createApp(context);
}, 30000);
afterAll(() => context?.close());

// Independent source facts: access to a building is not access to its rooms.
const cases = [
  ['locations', 'harveys-clinic', '使用限制', ['哈维达到2心', '楼上房间']],
  ['locations', 'carpenters-shop', '使用限制', ['塞巴斯蒂安达到2心', '地下室', '罗宾']],
  ['locations', 'pierre-icon', '使用限制', ['卡罗琳2心', '09:00—17:00', '非雨天', '22日至28日', '次日']],
  ['locations', 'fish-shop', '使用限制', ['200硬木', '5铱锭', '5电池组', '1000金', '08:00', '修船过场']],
  ['items', 'building-farmhouse', '主要用途', ['第3次升级', '100000金', '33个木桶', '地窖']],
  ['locations', 'mayors-manor', '使用限制', ['刘易斯2心', '楼梯', '幸运紫色短裤', '免疫', '重复']],
  ['locations', 'island-west', '贝啼与沉船', ['西侧', '1个金色核桃', '一次']],
  ['locations', 'island-east', '主要用途', ['斧头', '小屋内', '1个金色核桃']],
  ['festivals', 'pearl', '获取方式', ['17:00', '23:00', '1000金', '30分钟']],
  ['festivals', 'pearl', '主要用途', ['次日00:30', '1-5-4-2-3', '每位玩家', '一次']],
  ['festivals', 'pearl', '新手建议', ['冬18日', '每日', '不同']],
  ['locations', 'movie-theater', '获取方式', ['首个雨天或雷雨天的前一晚', '进入废弃Joja超市', '完成遗失收集包后的夜晚', '500000金']],
  ['locations', 'island-dig-site', '蘑菇洞', ['羊肚菌', '熔岩菇', '首次查看', '次日', '500000金', '1%', '不是背包物品']],
  ['locations', 'island-west', '饕餮青蛙', ['甜瓜', '小麦', '大蒜', '未收获', '5核桃', '15']],
];

test.each(cases)('%s/%s exposes verified interior conditions in API and SSR (%s)', async (dataset, slug, field, facts) => {
  const response = await request(app).get(`/api/datasets/${dataset}/entries/${slug}`);
  expect(response.status).toBe(200);
  for (const fact of facts) expect(response.body.item.attributes[field], `${slug}/${fact}`).toContain(fact);
  const page = await request(app).get(`/wiki/${dataset}/${slug}`);
  expect(page.status).toBe(200);
  expect(page.text).toContain(response.body.item.attributes[field]);
  expect((await request(app).get(response.body.item.image)).status).toBe(200);
});

test('interior additions keep existing identifiers and progress-independent imports stable', () => {
  const rows = () => context.db.prepare('SELECT id,dataset_id,slug,name,attributes_json FROM dataset_entries ORDER BY id').all();
  const before = rows();
  seedDatabase(context.db);
  expect(rows()).toEqual(before);
});

test('interior closure retains the historical audit and accounts for every remaining identity', () => {
  const read = name => JSON.parse(readFileSync(new URL(`../docs/${name}`, import.meta.url), 'utf8'));
  const original = read('wiki-practical-unresolved-review.json');
  const closure = read('wiki-practical-interior-closure.json');
  expect(closure.records.map(record => record.identity).sort()).toEqual([
    'HarveyRoom', 'BeachNightMarket', 'SebastianRoom', 'Cellar', 'MermaidHouse',
    'Submarine', 'Sunroom', 'BoatTunnel', 'IslandHut', 'CaptainRoom', 'LewisBasement'
  ].map(id => `Data/Locations:${id}`).sort());
  expect(closure.releaseReady).toBe(false);
  const resolved = new Set(closure.records.map(record => record.identity));
  for (const record of closure.records) {
    const prior = original.records.find(row => row.identity === record.identity);
    expect(prior.verdict).toBe('mechanism-review');
    expect(record.nativeSource).toEqual(prior.nativeSource);
    expect(record.sources.length).toBeGreaterThan(0);
    for (const url of record.sources) expect(url).toMatch(/^https:\/\/stardewvalleywiki\.com\//);
    expect(cases.some(([dataset, slug]) => dataset === record.dataset && slug === record.slug)).toBe(true);
  }
  expect(original.records).toHaveLength(226);
  const remaining = original.records.filter(row => ['mechanism-review', 'research-needed'].includes(row.verdict) && !resolved.has(row.identity));
  expect(remaining.filter(row => row.verdict === 'mechanism-review')).toHaveLength(101);
  expect(remaining.filter(row => row.verdict === 'research-needed')).toHaveLength(76);
  expect(closure.remaining).toEqual({ mechanismReview: 101, researchNeeded: 76, total: 177 });
});
