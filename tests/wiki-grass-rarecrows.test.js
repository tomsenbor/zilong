import {expect,test} from 'vitest';
import {entries} from '../src/db/seeds.js';
const get=slug=>entries.find(e=>e.dataset==='items'&&e.slug===slug);
test('all eight independently numbered rarecrows preserve reward and currency conditions',()=>{
 for(let n=1;n<=8;n++){expect(get('rarecrow-'+n)).toBeDefined();expect(get('rarecrow-'+n).attributes.覆盖范围).toContain('248');}
 expect(get('rarecrow-1').attributes.获取方式).toContain('800星星币');
 expect(get('rarecrow-3').attributes.获取方式).toContain('10000齐币');
 expect(get('rarecrow-3').attributes.注意事项).toContain('帽子');
 expect(get('rarecrow-7').attributes.获取方式).toContain('20种古物');
 expect(get('rarecrow-7').attributes.注意事项).toContain('不包括矿物');
 expect(get('rarecrow-8').attributes.获取方式).toContain('40件');
});
test('grass recipes distinguish finished items, Qi gems and winter dormancy',()=>{
 expect(get('grass-starter')).toBeDefined();expect(get('blue-grass-starter')).toBeDefined();
 expect(get('grass-starter').attributes.获取方式).toContain('1000金');
 expect(get('grass-starter').attributes.配方).toContain('纤维10');
 expect(get('blue-grass-starter').attributes.获取方式).toContain('40颗齐钻');
 expect(get('blue-grass-starter').attributes.配方).toContain('神秘糖浆1');
 for(const slug of ['grass-starter','blue-grass-starter'])expect(get(slug).attributes.注意事项).toContain('冬季');
});
