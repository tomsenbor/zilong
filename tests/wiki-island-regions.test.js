import {expect,test} from 'vitest';
import {entries} from '../src/db/seeds.js';
import {existsSync,readFileSync} from 'node:fs';
const slugs=['island-south','island-east','island-north','island-west','island-southeast','island-beach-resort','pirate-cove','island-dig-site','island-gem-shrine','island-crystal-cave','volcano-caldera'];
const entry=slug=>entries.find(e=>e.dataset==='locations'&&e.slug===slug);
test('independently reviewed island regions have dedicated access and limitation guidance',()=>{
 for(const slug of slugs){const matches=entries.filter(e=>e.dataset==='locations'&&e.slug===slug);expect(matches,slug).toHaveLength(1);const a=matches[0].attributes;expect(a.获取方式.length).toBeGreaterThan(30);expect(a.注意事项.length).toBeGreaterThan(30);expect(a.资料来源).toContain('#');}
});
test('island access, weather, crop maturity and one-time rewards keep their separate conditions',()=>{
 expect(entry('island-west')?.attributes.获取方式).toContain('10');
 expect(entry('island-west')?.attributes.饕餮青蛙).toContain('未收获');
 expect(entry('island-west')?.attributes.饕餮青蛙).toContain('甜瓜、小麦、大蒜');
 expect(entry('island-west')?.attributes.注意事项).toContain('879');
 expect(entry('island-beach-resort')?.attributes.获取方式).toContain('先修复');
 expect(entry('island-beach-resort')?.attributes.注意事项).toContain('次日');
 expect(entry('pirate-cove')?.attributes.主要用途).toContain('无雨偶数日20:00');
 expect(entry('island-dig-site')?.attributes.主要用途).toContain('炸弹');
 expect(entry('island-gem-shrine')?.attributes.注意事项).toContain('随机');
 expect(entry('island-gem-shrine')?.attributes.注意事项).toContain('不会重复');
 expect(entry('island-crystal-cave')?.attributes.费用).toContain('只取一次');
 expect(entry('volcano-caldera')?.attributes.注意事项).toContain('不会每天重生');
});
test('island scene images have source provenance and overview captions are explicit',()=>{
 const url=new URL('../docs/wiki-island-region-assets-sources.json',import.meta.url);const assets=existsSync(url)?JSON.parse(readFileSync(url)):[];
 expect(assets).toHaveLength(slugs.length);for(const a of assets){expect(existsSync(a.file)).toBe(true);expect(a.sha256).toMatch(/^[a-f0-9]{64}$/);expect(entry(a.slug).image).toBe('/'+a.file.replace(/^public\//,''));}
 expect(entry('island-dig-site')?.attributes.图标说明).toContain('区域图');
 expect(entry('island-beach-resort')?.attributes.图标说明).toContain('区域图');
});
