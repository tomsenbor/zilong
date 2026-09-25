import {beforeAll,afterAll,expect,test} from 'vitest';
import request from 'supertest';
import {createTestContext} from './helpers/context.js';
import {initialize} from '../src/db/initialize.js';
import {createApp} from '../src/app.js';
import {giftData} from '../src/features/tools/data/gifts.js';
import {queryGifts} from '../src/features/tools/gifts.js';
let ctx, app;
beforeAll(async()=>{ctx=createTestContext();await initialize(ctx);app=createApp(ctx);});
afterAll(()=>ctx.close());
test('unknown birthdays sort last and filters combine without inventing relationships',()=>{
  const data={villagers:[{id:'unknown',name:'未知',giftIds:[]},{id:'v',name:'测试',birthday:{season:'冬季',day:28},giftIds:['g']}],gifts:[{id:'g',name:'测试'}]};
  expect(queryGifts(data).villagers.map(v=>v.id)).toEqual(['v','unknown']);
  expect(queryGifts(data,{item:'g',season:'冬季'}).total).toBe(1);
  expect(queryGifts(data,{item:'g',season:'春季'}).total).toBe(0);
  expect(queryGifts(data,{villager:'missing'}).total).toBe(0);
});
test('every relation is unique, concrete and sourced; birthdays and references are valid',()=>{
  expect(new Set(giftData.gifts.map(g=>g.id)).size).toBe(giftData.gifts.length);
  expect(new Set(giftData.villagers.map(v=>v.id)).size).toBe(34);
  for(const v of giftData.villagers){
    expect(['春季','夏季','秋季','冬季']).toContain(v.birthday.season);
    expect(v.birthday.day).toBeGreaterThanOrEqual(1);expect(v.birthday.day).toBeLessThanOrEqual(28);
    for(const id of v.giftIds){
      expect(giftData.gifts.some(g=>g.id===id)).toBe(true);
      const sources=giftData.evidence.filter(e=>e.villagerId===v.id&&e.giftId===id);
      expect(sources).toHaveLength(1);expect(sources[0].source).toContain('NPCGiftTastes');
    }
  }
});
test('gift page and search expose the new tool with its own metadata',async()=>{
  const r=await request(app).get('/tools/gifts');
  expect(r.text).toContain('<title>生日与最爱礼物查询');
  expect((await request(app).get('/sitemap.xml')).text).toContain('/tools/gifts');
  const search=await request(app).get('/api/search?q=送礼');
  expect(search.body.items.some(x=>x.href==='/tools/gifts')).toBe(true);
});
test('gift API covers giftable villagers, birthdays and explicit love evidence',async()=>{
  const r=await request(app).get('/api/tools/gifts');
  expect(r.status).toBe(200);
  expect(r.body.coverage).toBe('verified-loves-only');
  expect(r.body.total).toBe(34);
  const v=r.body.villagers.find(x=>x.name==='文森特');
  expect(v.birthday).toEqual({season:'春季',day:10});
  expect(v.giftIds).toContain('398'); // 原版数据明确：葡萄。
  expect(r.body.villagers.some(x=>x.name==='仆从')).toBe(false);
});
test('item and season filters combine, unknown items are not treated as dislikes',async()=>{
  const r=await request(app).get('/api/tools/gifts?item=66&season=春季');
  expect(r.status).toBe(200);
  expect(r.body.villagers.map(x=>x.name)).toEqual(['艾米丽']);
  const empty=await request(app).get('/api/tools/gifts?item=unknown');
  expect(empty.body.total).toBe(0);
  expect(empty.body.coverage).toBe('verified-loves-only');
});
test('invalid query is 400, and categories are not expanded into concrete gifts',async()=>{
  expect((await request(app).get('/api/tools/gifts?season=十三月')).status).toBe(400);
  const r=await request(app).get('/api/tools/gifts');
  expect(r.body.gifts.some(x=>x.id==='book_item')).toBe(false);
  expect(r.body.gifts.every(x=>x.name && x.id && x.wikiHref?.startsWith('/'))).toBe(true);
});
