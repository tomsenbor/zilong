import {expect,test} from 'vitest';
import {entries} from '../src/db/seeds.js';
test('horse acquisition is through the stable and not a separately priced ranch animal',()=>{
 const horse=entries.find(e=>e.slug==='animal-horse');
 expect(horse).toBeTruthy();
 expect(horse.attributes.获取方式).toContain('10000金');
 expect(horse.attributes.获取方式).toContain('硬木100');
 expect(horse.attributes.获取方式).toContain('不用另买');
 expect(horse.attributes.召回方式).toContain('室外');
 expect(horse.attributes.次日返回).toContain('马厩');
});
test('horse speed facts separate temporary carrots and permanent book bonuses',()=>{
 const horse=entries.find(e=>e.slug==='animal-horse');
 expect(horse?.attributes.胡萝卜加成).toContain('+0.4');
 expect(horse?.attributes.胡萝卜加成).toContain('当天');
 expect(horse?.attributes.书籍加成).toContain('+0.5');
 expect(horse?.attributes.书籍加成).toContain('永久');
});
