import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';

const ids = ['Cauliflower','Melon','Pumpkin','Powdermelon','QiFruit'];
test('five native giant crops are distinct from inventory produce', () => {
  const rows=entries.filter(e=>e.attributes?.type==='巨型作物');
  expect(rows).toHaveLength(5);
  expect(rows.map(e=>e.attributes.原版编号).sort()).toEqual([...ids].sort());
  for(const row of rows){
    expect(row.attributes.sellPrice).toBe('不可直接出售');
    expect(row.attributes.占地).toBe('3×3');
    expect(row.attributes.形成概率).toBe('每个满足条件的3×3区域每天1%');
    expect(row.attributes.获取方式).toContain('左上角');
    expect(row.attributes.场所限制).toContain('温室');
    expect(row.attributes.场所限制).toContain('姜岛');
    expect(row.attributes.基础收获量).toBe(row.attributes.原版编号==='QiFruit'?'20—26个齐瓜':'15—21个对应作物');
  }
});
test('giant crop identity and artwork are traceable to original 1.6.15 data', () => {
  const inventory=JSON.parse(readFileSync(new URL('../docs/wiki-giant-crops-inventory.json',import.meta.url)));
  expect(inventory.nativeSource.sha256).toBe('BB84916D88BA438AC7917E28BA0C2930441540EDC5BAC1A934DD1CC9C1996D72');
  expect(inventory.records.map(r=>r.id).sort()).toEqual([...ids].sort());
  expect(inventory.sourceConflict).toContain('20');
});
