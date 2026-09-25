import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const slugs=['secret-woods-bear','trash-bear','raccoon','raccoon-wife','marcello','welwick'];
test('additional named and independently interactive characters have stable pages without invented gift mechanics',()=>{
 for(const slug of slugs){
  const list=entries.filter(e=>e.dataset==='villagers'&&e.slug===slug);
  expect(list,slug).toHaveLength(1);
  expect(list[0].attributes.birthday).toContain('无生日');
  expect(list[0].attributes.loves).toContain('不适用');
  expect(list[0].attributes.资料来源).toMatch(/^https:\/\/stardewvalleywiki.com\//);
 }
});
test('bear requests, bookseller visits and television fortune remain different interactions',()=>{
 const a=slug=>entries.find(e=>e.slug===slug)?.attributes;
 expect(a('secret-woods-bear')?.获取方式).toContain('枫糖浆');
 expect(a('secret-woods-bear')?.主要用途).toContain('3倍');
 expect(a('trash-bear')?.获取方式).toContain('第三年');
 expect(a('trash-bear')?.主要用途).toContain('四次');
 expect(a('raccoon-wife')?.主要用途).toContain('交易');
 expect(a('marcello')?.获取方式).toContain('每季两次');
 expect(entries.find(e=>e.slug==='marcello')?.name).toBe('马尔赛罗（书摊老板）');
 expect(a('welwick')?.主要用途).toContain('每日幸运');
 expect(a('welwick')?.注意事项).toContain('不会改变');
});
