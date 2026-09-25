import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const find=id=>entries.find(e=>e.attributes?.原版宠物编号===id);
test('twelve original pet appearances have stable individual identities',()=>{
 for(const type of ['Cat','Dog'])for(let i=0;i<5;i++)expect(find(type+':'+i),type+':'+i).toBeTruthy();
 for(let i=0;i<2;i++)expect(find('Turtle:'+i)).toBeTruthy();
 expect(entries.filter(e=>e.attributes?.原版宠物编号)).toHaveLength(12);
});
test('additional adoption fees and pet limits do not masquerade as livestock production',()=>{
 expect(find('Cat:0')?.attributes.额外领养费用).toBe('40000金');
 expect(find('Turtle:0')?.attributes.额外领养费用).toBe('60000金');
 expect(find('Turtle:1')?.attributes.额外领养费用).toBe('500000金');
 expect(find('Turtle:0')?.attributes.获取方式).toContain('不能在开局');
 expect(find('Cat:0')?.attributes.获取方式).toContain('满友好度');
 expect(find('Turtle:1')?.attributes.饲养限制).toContain('不能戴帽子');
 expect(find('Dog:4')?.attributes.主要用途).toContain('不保证');
});
