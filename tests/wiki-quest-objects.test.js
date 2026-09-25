import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const ids = ['191','788','789','790','FarAwayStone','GoldenBobber','TroutDerbyTag','326','341'];
const item = id => entries.find(e => e.slug === 'questitem-' + id.toLowerCase());
test('quest and reward objects have distinct native identities and real uses', () => {
 for (const id of ids) {
  expect(item(id), id).toBeDefined();
  expect(item(id).attributes.原版物品编号).toBe('(O)' + id);
 }
});
test('quest objects distinguish automatic gifting, festival timing and permanent knowledge', () => {
 expect(item('191')?.attributes.注意事项).toContain('自动');
 expect(item('191')?.attributes.主要用途).toContain('100');
 expect(item('788')?.attributes.注意事项).toContain('不能');
 expect(item('GoldenBobber')?.attributes.获取方式).toContain('春17');
 expect(item('TroutDerbyTag')?.attributes.注意事项).toContain('跨年');
 expect(item('326')?.attributes.获取方式).toContain('四');
 expect(item('341')?.attributes.获取方式).toContain('25');
 expect(item('FarAwayStone')?.attributes.注意事项).toContain('丢弃');
});
