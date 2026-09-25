import{expect,test}from'vitest';
import{entries}from'../src/db/seeds.js';
const get=id=>entries.find(e=>e.slug==='profession-'+id);
test('five skill trees contain six professions each with explicit prerequisites',()=>{
 const ids=['rancher','tiller','coopmaster','shepherd','artisan','agriculturist','miner','geologist','blacksmith','prospector','excavator','gemologist','forester','gatherer','lumberjack','tapper','botanist','tracker','fisher','trapper','angler','pirate','mariner','luremaster','fighter','scout','brute','defender','acrobat','desperado'];
 for(const id of ids){expect(get(id),id).toBeTruthy();expect(get(id).attributes.前置职业).toBeTruthy();}
 expect(entries.filter(e=>e.attributes?.type==='技能职业')).toHaveLength(30);
});
test('profession percentage and branch caveats retain their real meanings',()=>{
 expect(get('artisan')?.attributes.前置职业).toBe('农耕人');
 expect(get('shepherd')?.attributes.前置职业).toBe('畜牧人');
 expect(get('scout')?.attributes.主要用途).toContain('乘以1.5');
 expect(get('scout')?.attributes.注意事项).toContain('50个百分点');
 expect(get('brute')?.attributes.主要用途).toContain('乘法');
 expect(get('gatherer')?.attributes.主要用途).toContain('20%');
 expect(get('luremaster')?.attributes.主要用途).toContain('不需要鱼饵');
 expect(get('artisan')?.attributes.注意事项).toContain('普通油');
});
