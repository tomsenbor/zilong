import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const get = type => entries.find(e => e.slug === `help-wanted-${type}`);

test('five real help-wanted types have distinct records without enumerating random combinations', () => {
  for (const type of ['gathering','monsters','fishing','socializing','delivery']) expect(get(type),type).toBeTruthy();
  expect(entries.filter(e => e.slug?.startsWith('help-wanted-'))).toHaveLength(5);
});
test('two-day requests distinguish new collection counters from delivery of stored goods', () => {
  expect(get('gathering')?.attributes.完成步骤).toContain('接取后');
  expect(get('gathering')?.attributes.完成步骤).toContain('无需交出');
  expect(get('fishing')?.attributes.完成步骤).toContain('无需交出');
  expect(get('delivery')?.attributes.完成步骤).toContain('已有库存');
  for (const type of ['gathering','monsters','fishing','socializing','delivery']) expect(get(type)?.attributes.时限).toContain('接取当天和次日');
});
test('delivery rewards use normal-quality base price and 150 friendship rather than fixed story rewards', () => {
  expect(get('delivery')?.attributes.reward).toContain('3倍');
  expect(get('delivery')?.attributes.reward).toContain('150');
  expect(get('delivery')?.attributes.注意事项).toContain('普通品质');
  expect(get('delivery')?.attributes.注意事项).toContain('礼物');
});
test('socializing excludes late-game residents and does not double count greetings across days', () => {
  const item = get('socializing');
  for (const name of ['法师','科罗布斯','矮人','桑迪','肯特','雷欧']) expect(item?.attributes.不计入对象).toContain(name);
  expect(item?.attributes.trigger).toContain('介绍');
  expect(item?.attributes.完成步骤).toContain('不重复计数');
  expect(item?.attributes.reward).toContain('100');
});
