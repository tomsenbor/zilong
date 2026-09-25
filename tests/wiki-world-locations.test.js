import {readFileSync,existsSync} from 'node:fs';
import {expect,test} from 'vitest';
import {entries} from '../src/db/seeds.js';
import request from 'supertest';
import {createTestContext} from './helpers/context.js';
import {initialize} from '../src/db/initialize.js';
import {createApp} from '../src/app.js';
import {seedDatabase} from '../src/db/seed.js';
const slugs=['backwoods','bus-stop','farm-cave','tunnel','mutant-bug-lair','witch-swamp','witch-hut','river-road-1','willow-lane-1','willow-lane-2','harveys-clinic','jojamart','joja-warehouse','mayors-manor','trailer','dog-pen','graveyard','ice-cream-stand','abandoned-house','shrine-illusions','quarry','quarry-mine','linus-tent','leos-treehouse','leahs-cottage','elliotts-cabin','summit','island-farmhouse','island-field-office','dark-shrine-memory','dark-shrine-night-terrors','dark-shrine-selfishness'];
const entry=slug=>entries.find(e=>e.dataset==='locations'&&e.slug===slug);
test('reviewed world locations have unique dedicated public records with practical access guidance',()=>{
 for(const slug of slugs){
  expect(entries.filter(e=>e.dataset==='locations'&&e.slug===slug),slug).toHaveLength(1);
  const e=entry(slug);expect(e.attributes.获取方式.length).toBeGreaterThan(20);
  expect(e.attributes.主要用途.length).toBeGreaterThan(20);
  expect(e.attributes.注意事项.length).toBeGreaterThan(20);
  expect(e.attributes.资料来源).toMatch(/^https:\/\/stardewvalleywiki.com\//);
 }
});
test('access, business hours and irreversible choices are not conflated',()=>{
 expect(entry('bus-stop')?.attributes.费用).toContain('500');
 expect(entry('farm-cave')?.attributes.注意事项).toContain('不可更改');
 expect(entry('farm-cave')?.attributes.主要用途).toContain('隔天');
 expect(entry('harveys-clinic')?.attributes.注意事项).toContain('柜台');
 expect(entry('ice-cream-stand')?.attributes.获取方式).toContain('星期三');
 expect(entry('ice-cream-stand')?.attributes.获取方式).toContain('雨天');
 expect(entry('shrine-illusions')?.attributes.注意事项).toContain('不能改变宠物');
 expect(entry('dark-shrine-selfishness')?.attributes.注意事项).toContain('永久');
 expect(entry('island-field-office')?.attributes.主要用途).toContain('22');
 expect(entry('island-field-office')?.attributes.主要用途).toContain('18');
 expect(entry('island-farmhouse')?.attributes.费用).toContain('20');
});
test('location imagery is sourced and identified rather than using unrelated item defaults',()=>{
 const url=new URL('../docs/wiki-world-location-assets-sources.json',import.meta.url);
 const assets=existsSync(url)?JSON.parse(readFileSync(url)):[];
 expect(assets).toHaveLength(slugs.length);
 for(const slug of slugs){const a=assets.find(a=>a.slug===slug);expect(a,slug).toBeTruthy();expect(a.sha256).toMatch(/^[a-f0-9]{64}$/);expect(existsSync(a.file)).toBe(true);expect(entry(slug).image).toBe('/'+a.file.replace(/^public\//,''));}
});
test('new place pages, images and recommendations work and repeat import preserves IDs',async()=>{
 const context=createTestContext();
 try{
  await initialize(context);const app=createApp(context);
  const rows=()=>context.db.prepare('SELECT id, dataset_id, slug, attributes_json FROM dataset_entries ORDER BY id').all();
  const before=rows();
  const links=new Set();
  for(const slug of slugs){
   const e=entry(slug);const api=await request(app).get('/api/datasets/locations/entries/'+slug);
   expect(api.status,slug).toBe(200);expect(api.body.item.attributes.获取方式).toBe(e.attributes.获取方式);
   const page=await request(app).get('/wiki/locations/'+slug);expect(page.status,slug).toBe(200);
   expect(page.text).toContain(e.attributes.主要用途);expect((await request(app).get(e.image)).status,e.image).toBe(200);
   for(const link of e.attributes.links)links.add(link);
  }
  for(const link of links)expect((await request(app).get(link)).status,link).toBe(200);
  seedDatabase(context.db);expect(rows()).toEqual(before);
 }finally{context.close();}
});
