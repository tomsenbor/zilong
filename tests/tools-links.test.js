import {beforeAll, afterAll, expect, test} from "vitest";
import request from "supertest";
import {createTestContext} from "./helpers/context.js";
import {initialize} from "../src/db/initialize.js";
import {createApp} from "../src/app.js";
import {wikiHref,resolveEntryLinks} from '../src/features/tools/entry-links.js';
let context, app;
beforeAll(async()=>{context=createTestContext();await initialize(context);app=createApp(context);});
afterAll(()=>context.close());
test('ambiguous names use search while explicit category selects a stable published URL',()=>{
  const index=[{name:'同名&物品',datasetSlug:'fish',slug:'a'},{name:'同名&物品',datasetSlug:'items',slug:'b'}];
  expect(wikiHref('同名&物品',index)).toBe('/search?q=%E5%90%8C%E5%90%8D%26%E7%89%A9%E5%93%81');
  expect(wikiHref('同名&物品',index,'fish')).toBe('/wiki/fish/a');
  expect(resolveEntryLinks({datasetSlug:'villagers',slug:'non-giftable',name:'非送礼角色'})).toEqual([]);
});
test("fish detail includes accurate tool entry without a second browser request", async()=>{
  const rows=(await request(app).get('/api/datasets/fish/entries?q=鬼鱼')).body.items;
  const entry=rows.find(x=>x.name==='鬼鱼');
  const r=await request(app).get(`/api/datasets/fish/entries/${entry.slug}`);
  expect(r.body.item.toolLinks).toContainEqual({label:'查询捕获条件',href:'/tools/fish?q=%E9%AC%BC%E9%B1%BC'});
});
test("community data includes safe detail/search links in one response",async()=>{
  const r=await request(app).get('/api/tools/community-center');
  const items=r.body.rooms.flatMap(x=>x.bundles.flatMap(b=>b.items));
  expect(items.length).toBeGreaterThan(100);
  for(const item of items) expect(item.wikiHref).toMatch(/^\/(wiki\/|search\?q=)/);
});
test('fish and gift query results provide accurate published data and tool links',async()=>{
  const f=await request(app).get('/api/tools/fish?q=鬼鱼');
  expect(f.body.items.find(x=>x.name==='鬼鱼').wikiHref).toMatch(/^\/wiki\/fish\//);
  const g=await request(app).get('/api/tools/gifts?item=398');
  expect(g.body.gifts.find(x=>x.id==='398').toolLinks).toContainEqual(expect.objectContaining({label:'计算作物收益'}));
});
test("links endpoint rejects unsafe input and does not fabricate missing detail URLs", async()=>{
  expect((await request(app).get('/api/tools/links?dataset=fish&entry=missing')).status).toBe(404);
  expect((await request(app).get('/api/tools/links?dataset=https://evil.test&entry=x')).status).toBe(400);
});
