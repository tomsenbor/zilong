import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const get = id => entries.find(e=>e.slug===`story-quest-${id}`);
test('missing fixed story tasks are distinct from pre-existing chains and letter deliveries',()=>{
  const ids=[1,7,11,12,13,18,20,21,22,26,29,30,31,133,134];
  for(const id of ids) expect(get(id),String(id)).toBeTruthy();
  expect(entries.filter(e=>e.slug?.startsWith('story-quest-'))).toHaveLength(15);
});
test('story milestones distinguish coop, silo, mine floor120 and skull floor25',()=>{
  expect(get(7)?.attributes.完成步骤).toContain('鸡舍');
  expect(get(133)?.attributes.完成步骤).toContain('筒仓');
  expect(get(18)?.attributes.完成步骤).toContain('120层');
  expect(get(20)?.attributes.完成步骤).toContain('25层');
  expect(get(20)?.attributes.reward).toContain('10000金');
  expect(get(20)?.attributes.reward).toContain('邮件');
});
test('event quests preserve entry conditions rather than general gift delivery',()=>{
  expect(get(21)?.attributes.trigger).toContain('3心');
  expect(get(21)?.attributes.reward).toContain('100点');
  expect(get(22)?.attributes.trigger).toContain('星期一');
  expect(get(22)?.attributes.完成步骤).toContain('19:00');
  expect(get(26)?.attributes.trigger).toContain('08:00—13:00');
});
test('secret note rewards and the tree stump are not confused with monetary or later chain rewards',()=>{
  expect(get(29)?.attributes.完成步骤).toContain('枫糖浆');
  expect(get(30)?.attributes.reward).toContain('永久+25');
  expect(get(31)?.attributes.reward).toContain('放大镜');
  expect(get(134)?.attributes.完成步骤).toContain('100块硬木');
  expect(get(134)?.attributes.注意事项).toContain('不等于');
});
