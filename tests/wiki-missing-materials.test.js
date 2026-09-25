import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const ids = ['152','153','157','178','245','246','423','684','812','814','834','168','169','170','171','172','SeaJelly','CaveJelly','RiverJelly','279','873'];
const get = id => entries.find(e => e.slug === 'material-' + id.toLowerCase());
test('reviewed ingredients, algae, recycling and special foods have separate identities', () => {
 for (const id of ids) {
  expect(get(id), id).toBeDefined();
  expect(get(id).attributes.原版物品编号).toBe('(O)' + id);
 }
 expect(new Set(ids.map(id => get(id).name)).size).toBe(21);
});
test('ingredient conversion and roe pricing do not use raw native default prices', () => {
 expect(get('812')?.attributes.sellPrice).toContain('鱼种');
 expect(get('812')?.attributes.主要用途).toContain('鲟鱼');
 expect(get('245')?.attributes.主要用途).toContain('3份');
 expect(get('423')?.attributes.主要用途).toContain('2份');
 expect(get('SeaJelly')?.attributes.注意事项).toContain('每日运气');
 expect(get('152')?.attributes.注意事项).toContain('任意鱼');
 expect(get('172')?.attributes.主要用途).toContain('10%');
 expect(get('873')?.attributes.注意事项).toContain('不能');
 expect(get('178')?.attributes.注意事项).toContain('筒仓');
});
