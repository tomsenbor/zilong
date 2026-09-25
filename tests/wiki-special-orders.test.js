import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const get=id=>entries.find(e=>e.slug===`special-order-${id.toLowerCase()}`)?.attributes;
test('adds28 missing playable special orders without duplicating the3 existing orders',()=>{
  expect(entries.filter(e=>e.slug?.startsWith('special-order-'))).toHaveLength(28);
  for(const id of ['Willy','Pam','Pierre','Robin','Emily','Demetrius','Demetrius2','Gus','Lewis','Wizard','Clint','Linus','Evelyn','Wizard2','Gunther','Caroline','Willy2','QiChallenge2','QiChallenge3','QiChallenge4','QiChallenge5','QiChallenge6','QiChallenge7','QiChallenge8','QiChallenge10','DesertFestivalMarlon1','DesertFestivalMarlon2','DesertFestivalMarlon3']) expect(get(id),id).toBeTruthy();
  expect(get('QiChallenge')).toBeUndefined();
  expect(get('QiChallenge11')).toBeUndefined();
});
test('collect and deliver requirements do not accept old inventory as freshly obtained',()=>{
 expect(get('Pam')?.完成步骤).toContain('任务期间');
 expect(get('Pam')?.完成步骤).toContain('12');
 expect(get('Pierre')?.注意事项).toContain('铱星');
 expect(get('Robin')?.完成步骤).toContain('交');
 expect(get('Emily')?.注意事项).toContain('已有');
 expect(get('QiChallenge4')?.完成步骤).toContain('新收集');
});
test('Qi objectives use correct currency, fresh shipment and loved gifts only',()=>{
 expect(get('QiChallenge3')?.reward).toContain('20齐钻');
 expect(get('QiChallenge2')?.完成步骤).toContain('出货箱');
 expect(get('QiChallenge6')?.完成步骤).toContain('100000');
 expect(get('QiChallenge7')?.完成步骤).toContain('最爱');
 expect(get('QiChallenge7')?.注意事项).toContain('星之果茶');
 expect(get('QiChallenge8')?.最长天数).toBe(3);
});
test('festival orders last only one day and pay Calico eggs not gold',()=>{
 for(const [id,amount] of [['DesertFestivalMarlon1',35],['DesertFestivalMarlon2',50],['DesertFestivalMarlon3',40]]) {
  expect(get(id)?.最长天数).toBe(1);
  expect(get(id)?.reward).toBe(`${amount}个卡利科三花蛋`);
 }
});
