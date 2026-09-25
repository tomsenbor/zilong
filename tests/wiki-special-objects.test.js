import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const ids = ['79','102','842','458','277','460','808','809','896','897','911','913','915','917','349','351','434','413','437','439','680','857','865','866','867','868','869','870','875','MysteryBox','GoldenMysteryBox','StardropTea','PrizeTicket','GoldenAnimalCracker','ButterflyPowder'];
const get = id => entries.find(e => e.slug === 'special-' + id.toLowerCase());
test('verified special items preserve native identities rather than generic quest pages', () => {
 for (const id of ids) { expect(get(id), id).toBeDefined(); expect(get(id).attributes.原版物品编号).toBe('(O)' + id); }
 expect(new Set(ids.map(id => get(id).name)).size).toBe(35);
});
test('special items document version sensitive restrictions and irreversible effects', () => {
 expect(get('349')?.attributes.主要用途).toContain('不恢复生命');
 expect(get('434')?.attributes.主要用途).toContain('34');
 expect(get('434')?.attributes.注意事项).toContain('不能');
 expect(get('897')?.attributes.注意事项).toContain('第二年');
 expect(get('897')?.attributes.注意事项).toContain('草莓');
 expect(get('913')?.attributes.注意事项).toContain('加压喷头');
 expect(get('917')?.attributes.注意事项).toContain('速度');
 expect(get('857')?.attributes.注意事项).toContain('不能');
 expect(get('875')?.attributes.注意事项).toContain('消失');
 expect(get('ButterflyPowder')?.attributes.注意事项).toContain('不可逆');
 expect(get('GoldenAnimalCracker')?.attributes.注意事项).toContain('猪');
 expect(get('StardropTea')?.attributes.注意事项).toContain('750');
});
