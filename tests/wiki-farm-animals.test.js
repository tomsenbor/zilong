import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const find = id => entries.find(e => e.attributes?.原版动物编号 === id);
test('all fourteen native livestock identities retain distinct entries', () => {
  for (const id of ['White Chicken','Brown Chicken','Blue Chicken','Void Chicken','Golden Chicken','Duck','Rabbit','Dinosaur','White Cow','Brown Cow','Goat','Sheep','Pig','Ostrich']) {
    expect(entries.filter(e=>e.attributes?.原版动物编号===id),id).toHaveLength(1);
    expect(find(id).attributes.资料来源).toMatch(/^https:\/\/stardewvalleywiki.com\//);
  }
});
test('livestock facts distinguish incubation, maturity and conditional produce', () => {
  expect(find('Blue Chicken')?.attributes.获取方式).toContain('谢恩8心');
  expect(find('Blue Chicken')?.attributes.饲养限制).toContain('不能通过孵化');
  expect(find('Dinosaur')?.attributes.成熟天数).toBe(0);
  expect(find('Ostrich')?.attributes.主要用途).toContain('每7天');
  expect(find('Ostrich')?.attributes.获取方式).toContain('鸵鸟孵化器');
  expect(find('Rabbit')?.attributes.饲养限制).toContain('不会繁殖');
  expect(find('Pig')?.attributes.饲养限制).toContain('冬季');
  expect(find('Pig')?.attributes.饲养限制).toContain('雨天');
  expect(find('Sheep')?.attributes.饲养限制).toContain('900');
});
