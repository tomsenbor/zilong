import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const all = () => entries.filter(e => e.attributes?.type === '成就');
const get = id => entries.find(e => e.slug === `achievement-${id}`)?.attributes;

test('achievement inventory separates 39 native menu and ten platform achievements', () => {
  expect(all()).toHaveLength(49);
  expect(all().filter(e => e.attributes.成就范围 === '游戏内成就')).toHaveLength(39);
  expect(all().filter(e => e.attributes.成就范围 === '平台额外成就')).toHaveLength(10);
  expect(new Set(all().map(e => e.slug)).size).toBe(49);
  expect(new Set(all().filter(e => e.attributes.原版成就编号 !== '平台额外成就，无Data/Achievements记录').map(e => e.attributes.原版成就编号)).size).toBe(39);
});

test('achievement caveats preserve restricted collections instead of requiring every game object', () => {
  expect(get('living-large')?.注意事项).toContain('不含地窖');
  expect(get('polyculture')?.注意事项).toContain('28');
  expect(get('monoculture')?.注意事项).toContain('33');
  expect(get('well-read')?.注意事项).toContain('能力书');
  expect(get('master-angler')?.注意事项).toContain('扩大家庭');
  expect(get('craft-master')?.注意事项).toContain('结婚戒指');
  expect(get('full-shipment')?.注意事项).toContain('出货收集');
  expect(get('infinite-power')?.注意事项).toContain('无限匕首');
});
