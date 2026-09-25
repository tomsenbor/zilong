import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const get=id=>entries.find(e=>e.slug===`monster-${id}`);
test('source-enumerated slime forms are separate from the existing slime material',()=>{
  const rows=entries.filter(e=>e.attributes?.怪物类别==='史莱姆');
  expect(rows).toHaveLength(27);
  expect(new Set(rows.map(e=>e.slug)).size).toBe(27);
  expect(get('green-slime')?.attributes.基础生命).toBe('24');
  expect(get('tiger-slime')?.attributes.基础生命).toBe('415');
  expect(get('special-purple-slime')?.attributes.基础生命).toBe('1230');
  expect(get('big-green-slime')?.attributes.基础伤害).toBe('5');
});
test('slime guild totals exclude big and bred slimes, not their hostile split offspring',()=>{
  expect(get('big-purple-slime')?.attributes.公会目标).toContain('不计入');
  expect(get('big-purple-slime')?.attributes.公会目标).toContain('分裂出的小史莱姆计入');
  expect(get('green-slime')?.attributes.公会目标).toContain('饲养');
});
test('special-order and ring exceptions are explicit',()=>{
  expect(get('prismatic-slime')?.attributes.条件说明).toContain('五彩胶冻');
  expect(get('prismatic-slime')?.attributes.基础生命).toBe('1000');
  expect(get('stacked-slime')?.attributes.应对方法).toContain('不能免疫');
  expect(get('dangerous-green-slime')?.attributes.条件说明).toContain('危险');
});
test('yellow mutation and black recoloring do not invent fixed health or imply gold-coin drops',()=>{
  expect(get('yellow-slime')?.attributes.基础生命).toBe('原个体生命×3');
  expect(get('yellow-slime')?.attributes.条件说明).toContain('金币');
  expect(get('black-slime')?.attributes.基础生命).toBe('保留原个体数值');
});
