import {expect,test} from 'vitest';
import {readFileSync,existsSync} from 'node:fs';
import {entries} from '../src/db/seeds.js';
const entry=slug=>entries.find(e=>e.dataset==='locations'&&e.slug===slug);
const farms=[['standard',3427],['riverland',1578],['forest',1413],['hilltop',1648],['wilderness',2131],['four-corners',2952],['beach',2700],['meadowlands',2066]];
test('all eight original farm layouts have independent verified identities and tillable areas',()=>{
 for(const [id,count] of farms){
  const e=entry('farm-'+id);expect(e,id).toBeTruthy();expect(e.attributes.可耕格数).toBe(String(count));
  expect(e.attributes.获取方式).toContain('不能');expect(e.attributes.原版地点编号).toMatch(/^Farm_/);
 }
});
test('farm variants preserve actionable 1.6 differences rather than generic duplicate descriptions',()=>{
 expect(entry('farm-riverland')?.attributes.开局设施).toContain('熏鱼机');
 expect(entry('farm-meadowlands')?.attributes.开局设施).toContain('2只鸡');
 expect(entry('farm-meadowlands')?.attributes.开局补给).toContain('替代');
 expect(entry('farm-beach')?.attributes.洒水器适用土区).toContain('202');
 expect(entry('farm-beach')?.attributes.注意事项).toContain('不能');
 expect(entry('farm-wilderness')?.attributes.注意事项).toContain('三分之一');
 expect(entry('farm-forest')?.attributes.每日大树桩).toContain('8');
 expect(entry('farm-four-corners')?.attributes.注意事项).toContain('只有一个');
});
test('forest fish regions and community-center unlocking steps are not conflated',()=>{
 expect(entry('cindersap-forest')?.attributes.注意事项).toContain('河流、池塘、瀑布');
 expect(entry('community-center-building')?.attributes.获取方式).toContain('08:00—13:00');
 expect(entry('community-center-building')?.attributes.获取方式).toContain('巴士站');
 expect(entry('community-center-building')?.attributes.注意事项).toContain('永久');
});
test('farm and regional images have exact source mappings, not the generic farm-selection screen',()=>{
 const url=new URL('../docs/wiki-farm-region-assets-sources.json',import.meta.url);
 const assets=existsSync(url)?JSON.parse(readFileSync(url)):[];expect(assets).toHaveLength(10);
 expect(new Set(assets.map(a=>a.url)).size).toBe(10);
 for(const a of assets){expect(existsSync(a.file)).toBe(true);expect(a.url).not.toContain('Selection');expect(entry(a.slug).image).toBe('/'+a.file.replace(/^public\//,''));}
});
