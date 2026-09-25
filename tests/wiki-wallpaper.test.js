import {expect,test} from 'vitest';
import {entries} from '../src/db/seeds.js';
const walls=()=>entries.filter(e=>e.dataset==='items'&&e.attributes?.游戏物品编号?.startsWith('(WP)'));
const find=id=>walls().find(e=>e.attributes.游戏物品编号===`(WP)${id}`);
test('wallpaper covers obtainable and normally visible environmental styles',()=>{
 expect(walls()).toHaveLength(136);
 for(let i=0;i<112;i++)expect(find(String(i)),String(i)).toBeDefined();
 for(let i=0;i<26;i++){
  if([7,8].includes(i))expect(find(`MoreWalls:${i}`)).toBeUndefined();
  else expect(find(`MoreWalls:${i}`)).toBeDefined();
 }
});
test('environment-only wallpaper never claims to be a purchasable consumable',()=>{
 for(const id of ['MoreWalls:15','MoreWalls:21']){
  expect(find(id)?.attributes.获取方式).toContain('不能收入背包');
  expect(find(id)?.attributes.主要用途).toContain('环境样式');
  expect(find(id)?.attributes.主要用途).not.toContain('一次性');
 }
});
test('wallpaper distinguishes special sources, currencies, and the catalogue-only greenhouse style',()=>{
 expect(find('0')?.attributes.获取方式).toContain('皮埃尔杂货店：200金');
 expect(find('21')?.attributes.获取方式).toContain('Joja超市：20金');
 expect(find('12')?.attributes.获取方式).toContain('法师目录');
 expect(find('MoreWalls:0')?.attributes.获取方式).toContain('贾斯');
 expect(find('MoreWalls:0')?.attributes.获取方式).toContain('三花蛋×20');
 expect(find('MoreWalls:11')?.attributes.获取方式).toContain('谜之盒');
 expect(find('MoreWalls:19')?.attributes.获取方式).toContain('500金');
 expect(find('MoreWalls:20')?.attributes.获取方式).toContain('壁纸地板目录');
 expect(find('MoreWalls:20')?.attributes.获取方式).not.toContain('当天随机');
 expect(find('MoreWalls:24')?.attributes.获取方式).toContain('齐币×10,000');
 expect(find('MoreWalls:25')?.attributes.获取方式).toContain('齐币×100,000');
});
