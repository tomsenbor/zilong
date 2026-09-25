import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const find = slug => entries.find(e => e.slug === slug);
test('all original wild and fruit tree identities have dedicated entries', () => {
 const wild = ['1','2','3','6','7','8','9','10','11','12','13'];
 const fruit = ['69','628','629','630','631','632','633','835'];
 for (const id of wild) expect(find('wild-tree-' + id),id).toBeDefined();
 for (const id of fruit) expect(find('fruit-tree-' + id),id).toBeDefined();
});
test('tree types retain distinct tapping and growth restrictions', () => {
 expect(find('wild-tree-1')?.attributes.采集周期).toBe('橡树树脂：普通7天，重型3天');
 expect(find('wild-tree-2')?.attributes.采集周期).toBe('枫糖浆：普通9天，重型4天');
 expect(find('wild-tree-3')?.attributes.采集周期).toBe('松焦油：普通5天，重型2天');
 expect(find('wild-tree-6')?.attributes.注意事项).toContain('不能种植');
 expect(find('wild-tree-10')?.attributes.采集周期).toBe('不能安装树液采集器');
 expect(find('wild-tree-12')?.attributes.采集周期).toBe('蕨菜：普通2天，重型1天');
 expect(find('fruit-tree-69')?.attributes.season).toBe('夏季；温室与姜岛全年');
 expect(find('fruit-tree-633')?.attributes.注意事项).toContain('1.6.9');
 expect(find('fruit-tree-633')?.attributes.生长).toContain('28');
});
