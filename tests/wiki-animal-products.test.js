import{expect,test}from'vitest';
import{entries}from'../src/db/seeds.js';
const ids=['174','176','180','182','184','186','289','305','436','438','440','442','444','928'];
const get=id=>entries.find(e=>e.slug==='animal-product-'+id);
test('fourteen independently named egg milk wool and feather identities remain distinct',()=>{
 for(const id of ids){expect(get(id),id).toBeDefined();expect(get(id).attributes.原版物品编号).toBe('(O)'+id);}
 expect(new Set(ids.map(id=>get(id).name)).size).toBe(14);
 expect(get('176').image).not.toBe(get('180').image);
 expect(get('174').image).not.toBe(get('182').image);
});
test('processing uses egg size and ostrich quality rather than a universal quality rule',()=>{
 expect(get('176')?.attributes.加工规则).toContain('普通品质');
 expect(get('174')?.attributes.加工规则).toContain('金星');
 expect(get('289')?.attributes.加工规则).toContain('10份');
 expect(get('289')?.attributes.注意事项).toContain('畜棚');
 expect(get('928')?.attributes.获取方式).toContain('完美');
 expect(get('928')?.attributes.加工规则).toContain('3份');
 expect(get('305')?.attributes.加工规则).toContain('虚空蛋黄酱');
 expect(get('186')?.attributes.加工规则).toContain('200');
 expect(get('438')?.attributes.加工规则).toContain('羊奶酪');
 expect(get('440')?.attributes.加工规则).toContain('100%');
 expect(get('444')?.attributes.注意事项).toContain('料理');
});
