import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const get = id => entries.find(e => e.slug === `monster-${id}`);
test('monster names cannot merge unrelated entries during name-based seed migration', () => {
  const names = entries.map(e => `${e.dataset}:${e.name}`);
  expect(new Set(names).size).toBe(names.length);
  expect(get('skeleton')?.name).toBe('骷髅（怪物）');
  expect(entries.find(e => e.slug === 'furniture-1304')?.name).toBe('骷髅');
});
test('independent monster pages have separate normal and dangerous records', () => {
  expect(entries.filter(e => e.attributes?.type === '怪物')).toHaveLength(89);
  for (const id of ['bug', 'bug-dangerous', 'ghost', 'carbon-ghost', 'putrid-ghost', 'mummy', 'mummy-dangerous', 'truffle-crab', 'royal-serpent']) {
    expect(get(id), id).toBeTruthy();
    expect(get(id).attributes.出现地点).toBeTruthy();
    expect(get(id).attributes.应对方法.length).toBeGreaterThan(20);
  }
  expect(get('bug-dangerous').attributes.形态).toBe('危险变体');
  expect(get('bug').attributes.形态).not.toBe('危险变体');
});
test('special monster mechanics are not lost in generic combat advice', () => {
  expect(get('armored-bug')?.attributes.应对方法).toContain('除虫');
  expect(get('mummy')?.attributes.应对方法).toContain('十字军');
  expect(get('ghost')?.attributes.条件说明).toContain('灵外质');
  expect(get('putrid-ghost')?.attributes.应对方法).toContain('恶心');
  expect(get('truffle-crab')?.attributes.条件说明).toContain('松露');
  expect(get('royal-serpent')?.attributes.应对方法).toContain('尾节');
  expect(get('hot-head')?.attributes.数值复核).toContain('215');
  expect(get('hot-head')?.attributes.数值复核).toContain('250');
  expect(get('hot-head')?.attributes.基础生命).toBe('250');
});
