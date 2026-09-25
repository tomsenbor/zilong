import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
test('all three native beach supply crates are environmental variants with the same drop rules', () => {
 for(const id of ['922','923','924']) {
  const e=entries.find(e=>e.slug==='supply-'+id);
  expect(e,id).toBeDefined();
  expect(e.attributes.原版物品编号).toBe('(O)'+id);
  expect(e.attributes.sellPrice).toBe('不可出售');
  expect(e.attributes.type).toBe('环境补给箱');
  expect(e.attributes.获取方式).toContain('沙滩农场');
  expect(e.attributes.主要用途).toContain('农舍');
  expect(e.attributes.注意事项).toContain('不影响');
 }
});
