import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const ids = ['820','821','822','823','824','825','826','827','828','852','791','275','166'];
const get = id => entries.find(e => e.slug === 'collectible-' + id);
test('island fossil parts and crackable containers keep independent identities', () => {
 for (const id of ids) { expect(get(id), id).toBeDefined(); expect(get(id).attributes.原版物品编号).toBe('(O)' + id); }
 expect(new Set(ids.map(id => get(id).name)).size).toBe(13);
});
test('fossil acquisition and donation counts are item specific', () => {
 expect(get('821')?.attributes.获取方式).toContain('钓');
 expect(get('822')?.attributes.获取方式).toContain('淘金');
 expect(get('823')?.attributes.主要用途).toContain('2份');
 expect(get('826')?.attributes.主要用途).toContain('2份');
 expect(get('826')?.attributes.获取方式).toContain('1.6');
 expect(get('820')?.attributes.注意事项).toContain('金核桃');
 expect(get('791')?.attributes.sellPrice).toBe('不可出售');
 expect(get('791')?.attributes.注意事项).toContain('不能');
 expect(get('275')?.attributes.注意事项).toContain('晶球破开器');
 expect(get('166')?.attributes.注意事项).toContain('储物箱');
});
