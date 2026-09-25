import { afterAll, beforeAll, expect, test } from 'vitest';
import request from 'supertest';
import { createTestContext } from './helpers/context.js';
import { initialize } from '../src/db/initialize.js';
import { seedDatabase } from '../src/db/seed.js';
import { createApp } from '../src/app.js';

// Independent native IDs from the frozen 34-gap audit; 876 belongs to Wizard2.
const bigIds = [32,33,34,35,36,40,41,42,43,44,45,46,47,48,52,53,54,95,96,98,107,141,159,184,188,192,196,200,204];
const objects = ['373','797','858','CalicoEgg'];
let context, app;
beforeAll(async () => { context = createTestContext(); await initialize(context); app = createApp(context); }, 30000);
afterAll(() => context?.close());
const item = async slug => {
  const response = await request(app).get(`/api/datasets/items/entries/${slug}`);
  expect(response.status, slug).toBe(200);
  return response.body.item;
};

test('33 distinct normal-play identities have API, SSR and real images without merging same-name variants', async () => {
  const urls = [...bigIds.map(id => `practical-bc-${id}`), ...objects.map(id => `practical-object-${id.toLowerCase()}`)];
  for (const slug of urls) {
    const entry = await item(slug);
    expect(entry.attributes['获取方式']).toBeTruthy();
    expect(entry.attributes['主要用途']).toBeTruthy();
    expect(entry.attributes['使用限制']).toBeTruthy();
    expect((await request(app).get(entry.image)).status, entry.image).toBe(200);
    const html = await request(app).get(`/wiki/items/${slug}`);
    expect(html.status).toBe(200);
    expect(html.text).toContain(entry.attributes['获取方式']);
    for (const link of entry.attributes.links || []) expect((await request(app).get(link)).status, link).toBe(200);
  }
}, 30000);

test('decor purchase prices are not the native base Price, and shop-specific prices stay distinct', async () => {
  for (const [id, facts] of [[35,['250金']], [46,['350金','200金','冬17']], [196,['100金','500金']], [200,['400金','500金']], [47,['200金','350金']]]) {
    const e = await item(`practical-bc-${id}`);
    for (const fact of facts) expect(e.attributes['获取方式']).toContain(fact);
    expect(e.attributes.sellPrice).toBe('不可出售');
  }
});

test('same-name seasonal plants and owl identities keep distinct names and placement restrictions', async () => {
  const names = [];
  for (const id of [184,188,192,196,200,204]) {
    const e = await item(`practical-bc-${id}`); names.push(e.name);
    expect(e.attributes['原版大件编号']).toBe(`(BC)${id}`);
    expect(e.attributes['主要用途']).toContain('不需要浇水');
  }
  expect(new Set(names).size).toBe(6);
  expect((await item('practical-bc-54')).attributes['获取方式']).toContain('冬17');
  expect((await item('practical-bc-95')).attributes['获取方式']).toContain('随机');
  expect((await item('practical-bc-95')).attributes['使用限制']).toContain('仅限室外');
  expect((await item('practical-bc-107')).attributes['使用限制']).toContain('仅限室内');
});

test('arcade rewards distinguish progress mode and replacement from freely buying another copy', async () => {
  expect((await item('practical-bc-159')).attributes['获取方式']).toContain('进度模式');
  for (const id of [141,159]) {
    const e = await item(`practical-bc-${id}`);
    expect(e.attributes['获取方式']).toContain('次日');
    expect(e.attributes['使用限制']).toContain('10000金');
    expect(e.attributes['使用限制']).toContain('丢失');
  }
});

test('temporary and special currencies explain expiry, recipe exclusions and exact trade direction', async () => {
  const egg = await item('practical-object-calicoegg');
  for (const fact of ['消失','不能孵化','任意蛋','次年']) expect(egg.attributes['使用限制']).toContain(fact);
  const qi = await item('practical-object-858');
  expect(qi.attributes['获取方式']).toContain('1个金色核桃兑换2齐钻');
  expect(qi.attributes['获取方式']).toContain('升级');
  expect(qi.attributes.sellPrice).toBe('不可出售');
  expect((await item('practical-object-373')).attributes['获取方式']).toContain('隔年');
  expect((await item('practical-object-797')).attributes['获取方式']).toContain('1→5→4→2→3');
});

test('Qi gems include repeatable dangerous-monster drops, not only orders and finite walnuts', async () => {
  const text = (await item('practical-object-858')).attributes['获取方式'];
  for (const fact of ['危险矿井', '危险骷髅洞穴', '竹节虫', '必掉1', '50%']) expect(text).toContain(fact);
});

test('Pearls retain deterministic alternatives after the one-time mermaid reward', async () => {
  const text = (await item('practical-object-797')).attributes['获取方式'];
  for (const fact of ['冬12', '黄金档', '日记残页第6', '10只螃蟹', '14天', '威利']) expect(text).toContain(fact);
});

test('existing Wizard2 publishes jelly expiry and special-slime exception without another same-name quest', async () => {
  const response = await request(app).get('/api/datasets/quests/entries/special-order-wizard2');
  expect(response.status).toBe(200);
  const text = response.body.item.attributes['注意事项'];
  for (const fact of ['完成或过期','消失','特殊史莱姆']) expect(text).toContain(fact);
  const page = await request(app).get('/wiki/quests/special-order-wizard2');
  expect(page.text).toContain(text);
});

test('reimport does not duplicate the batch or change existing IDs', () => {
  const snapshot = () => context.db.prepare('SELECT id,dataset_id,slug,name,image,attributes_json FROM dataset_entries ORDER BY id').all();
  const before = snapshot(); seedDatabase(context.db); expect(snapshot()).toEqual(before);
}, 30000);
