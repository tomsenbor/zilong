import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';

test('story health reward is not a free ordinary dairy product', () => {
 const a=entries.find(e=>e.slug==='interaction-803')?.attributes;
 expect(a).toBeDefined();
 expect(a.sellPrice).toBe('不可出售');
 expect(a.获取方式).toContain('秘密纸条10');
 expect(a.主要用途).toContain('25');
 expect(a.注意事项).toContain('不是');
});
test('pet adoption and collected coins do not expose dummy object prices', () => {
 const pet=entries.find(e=>e.slug==='interaction-petlicense')?.attributes;
 const coin=entries.find(e=>e.slug==='interaction-goldcoin')?.attributes;
 expect(pet).toBeDefined(); expect(coin).toBeDefined();
 expect(pet.sellPrice).toBe('不可出售');
 expect(pet.获取方式).toContain('40000');
 expect(coin.sellPrice).toBe('拾取直接入账，不通过出货箱出售');
 expect(coin.主要用途).toContain('250');
});
test('combined ring explains the two-ring boundary without enumerating arbitrary combinations', () => {
 const matches=entries.filter(e=>e.slug==='interaction-880');
 expect(matches).toHaveLength(1);
 expect(matches[0].attributes.获取方式).toContain('20');
 expect(matches[0].attributes.注意事项).toContain('不能再次组合');
 expect(matches[0].attributes.type).toBe('组合戒指');
});
