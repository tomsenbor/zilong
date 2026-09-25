import {readFileSync,existsSync} from 'node:fs';
import {expect,test} from 'vitest';
import {entries} from '../src/db/seeds.js';
const slugs=['stardrop-saloon','casino','desert-trader','island-trader','bookseller-shop','movie-theater','giant-stump'];
const entry=slug=>entries.find(e=>e.dataset==='locations'&&e.slug===slug);

test('remaining reviewed merchants have distinct useful place records, not item placeholders',()=>{
 for(const slug of slugs){
  expect(entries.filter(e=>e.dataset==='locations'&&e.slug===slug),slug).toHaveLength(1);
  const e=entry(slug);expect(e.attributes.获取方式.length).toBeGreaterThan(30);
  expect(e.attributes.主要用途.length).toBeGreaterThan(30);
  expect(e.attributes.注意事项.length).toBeGreaterThan(30);
  expect(e.attributes.资料来源).toMatch(/^https:\/\/stardewvalleywiki.com\//);
 }
});

test('merchant currencies, dates, prerequisites and 1.6 limits remain distinct',()=>{
 expect(entry('casino')?.attributes.费用).toContain('1000金换100齐币');
 expect(entry('casino')?.attributes.注意事项).toContain('不是姜岛齐钻');
 expect(entry('casino')?.attributes.注意事项).toContain('20');
 expect(entry('desert-trader')?.attributes.open).toContain('冬15—17');
 expect(entry('desert-trader')?.attributes.主要用途).toContain('星期日1个翡翠');
 expect(entry('island-trader')?.attributes.获取方式).toContain('先修复姜岛农舍');
 expect(entry('island-trader')?.attributes.注意事项).toContain('50');
 expect(entry('bookseller-shop')?.attributes.注意事项).toContain('随机');
 expect(entry('movie-theater')?.attributes.注意事项).toContain('当天');
 expect(entry('movie-theater')?.attributes.主要用途).toContain('星期一');
 expect(entry('giant-stump')?.attributes.主要用途).toContain('9次');
 expect(entry('giant-stump')?.attributes.注意事项).toContain('1.6.9');
});

test('farmhouse and greenhouse reuse reviewed building identities instead of duplicate place pages',()=>{
 const url=new URL('../docs/wiki-shop-location-inventory.json',import.meta.url);
 const inventory=existsSync(url)?JSON.parse(readFileSync(url)): {records:[]};
 expect(inventory.records).toHaveLength(9);
 for(const [title,slug] of [['Farmhouse','building-farmhouse'],['Greenhouse','building-greenhouse']]){
  const r=inventory.records.find(r=>r.title===title);expect(r,title).toMatchObject({dataset:'items',slug,reused:true});
  expect(entries.filter(e=>e.attributes?.资料来源==='https://stardewvalleywiki.com/'+title),title).toHaveLength(1);
 }
});

test('each new merchant uses its source location image with explicit provenance',()=>{
 const url=new URL('../docs/wiki-shop-location-assets-sources.json',import.meta.url);
 const assets=existsSync(url)?JSON.parse(readFileSync(url)):[];
 expect(assets).toHaveLength(slugs.length);
 for(const slug of slugs){const a=assets.find(a=>a.slug===slug);expect(a,slug).toBeTruthy();expect(a.sha256).toMatch(/^[a-f0-9]{64}$/);expect(existsSync(a.file)).toBe(true);expect(entry(slug).image).toBe('/'+a.file.replace(/^public\//,''));}
});
