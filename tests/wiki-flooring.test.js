import {expect,test} from 'vitest';
import {entries} from '../src/db/seeds.js';
const floors=()=>entries.filter(e=>e.dataset==='items'&&e.attributes?.游戏物品编号?.startsWith('(FL)'));
const find=id=>floors().find(e=>e.attributes.游戏物品编号===`(FL)${id}`);
test('original flooring enumerates 88 base and nine additional identities',()=>{
 expect(floors()).toHaveLength(97);
 for(let i=0;i<88;i++)expect(find(String(i)),String(i)).toBeDefined();
 for(let i=0;i<9;i++)expect(find(`MoreFloors:${i}`),String(i)).toBeDefined();
 expect(new Set(floors().map(e=>e.slug)).size).toBe(97);
});
test('flooring distinguishes catalogue selection and currency from a generic price',()=>{
 expect(find('0')?.attributes.获取方式).toContain('皮埃尔杂货店：200金');
 expect(find('0')?.attributes.获取方式).toContain('Joja超市：250金');
 expect(find('40')?.attributes.获取方式).not.toContain('Joja超市');
 expect(find('56')?.attributes.获取方式).not.toContain('皮埃尔杂货店：200金');
 expect(find('1')?.attributes.获取方式).toContain('祝尼魔目录');
 expect(find('51')?.attributes.获取方式).toContain('法师目录');
 expect(find('MoreFloors:0')?.attributes.获取方式).toContain('壁纸地板目录');
 expect(find('MoreFloors:8')?.attributes.获取方式).toContain('齐币×100,000');
 expect(find('MoreFloors:8')?.attributes.获取方式).not.toContain('100,000金');
});
test('flooring describes single-use room decoration without invented outdoor crafting effects',()=>{
 for(const e of floors()){
  expect(e.attributes.主要用途).toContain('一次性');
  expect(e.attributes.主要用途).toContain('整个房间');
  expect(e.attributes.使用限制).toContain('不是室外打造');
  expect(e.attributes.资料来源).toBe('https://stardewvalleywiki.com/Flooring');
 }
});
