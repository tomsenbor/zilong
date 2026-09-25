import {expect,test}from'vitest';
import{entries}from'../src/db/seeds.js';
const find=id=>entries.find(e=>e.attributes?.原版建筑编号===id);
test('all twenty-five native building identities are represented distinctly',()=>{
 for(const id of ['Junimo Hut','Earth Obelisk','Water Obelisk','Desert Obelisk','Island Obelisk','Gold Clock','Coop','Barn','Well','Silo','Mill','Shed','Fish Pond','Cabin','Pet Bowl','Stable','Slime Hutch','Big Coop','Deluxe Coop','Big Barn','Deluxe Barn','Big Shed','Shipping Bin','Farmhouse','Greenhouse'])expect(find(id),id).toBeTruthy();
});
test('building costs distinguish upgrades and restoration from free native fields',()=>{
 expect(find('Coop')?.attributes.本级建造费用).toBe('4000金');
 expect(find('Deluxe Coop')?.attributes.前置建筑).toBe('大鸡舍');
 expect(find('Deluxe Coop')?.attributes.本级建造费用).toBe('20000金');
 expect(find('Silo')?.attributes.主要用途).toContain('240');
 expect(find('Pet Bowl')?.attributes.建造材料).toBe('硬木×25');
 expect(find('Cabin')?.attributes.建造材料).toBe('无额外材料');
 expect(find('Greenhouse')?.attributes.获取方式).toContain('35000');
 expect(find('Greenhouse')?.attributes.本级建造费用).not.toBe('0金');
 expect(find('Farmhouse')?.attributes.使用限制).toContain('65000');
 expect(find('Junimo Hut')?.name).not.toBe(entries.find(e=>e.slug==='furniture-junimohut')?.name);
});
