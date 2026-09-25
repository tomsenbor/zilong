import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const get=slug=>entries.find(e=>e.dataset==='quests'&&e.slug===slug)?.attributes;
test('Emily spouse quest requires200 fiber and separates delivery from the later outfit scene',()=>{
 const a=get('event-emily-errand');
 expect(a?.完成步骤).toContain('200份纤维');
 expect(a?.完成步骤).toContain('3天');
 expect(a?.trigger).toContain('14心');
});
test('Haley charity event has three stages and requires chocolate cake in inventory',()=>{
 const a=get('event-haley-cakewalk');
 expect(a?.完成步骤).toContain('至少一天');
 expect(a?.完成步骤).toContain('巧克力蛋糕');
 expect(a?.完成步骤).toContain('06:00—15:00');
});
test('ornate necklace is one exclusive choice, not two stackable friendship rewards',()=>{
 const a=get('event-ornate-necklace');
 expect(a?.reward).toContain('阿比盖尔+100');
 expect(a?.reward).toContain('卡洛琳+50');
 expect(a?.注意事项).toContain('二选一');
 expect(a?.完成步骤).toContain('冬季');
});
test('desert fishing tasks are daily festival requests rather than unlimited story tasks',()=>{
 const a=get('event-desert-fishing');
 expect(a?.春季15日).toContain('3条沙鱼');
 expect(a?.春季15日).toContain('25');
 expect(a?.春季16日).toContain('50');
 expect(a?.春季17日).toContain('30');
 expect(a?.时限).toContain('当天');
});
