import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
const ids = ['16','18','20','22','92','257','281','283','399','404','408','412','416','829','851','88','296','396','406','410','414','259','402','418','392','393','394','397'];
const get = id => entries.find(e => e.slug === 'forage-' + id);
test('reviewed forage materials have distinct native identities and original images', () => {
  for (const id of ids) {
    expect(get(id), id).toBeDefined();
    expect(get(id).attributes.原版物品编号).toBe('(O)' + id);
    expect(get(id).image).toBe('/assets/game/Forage_' + id + '.png');
  }
  expect(new Set(ids.map(id => get(id).name)).size).toBe(28);
});
test('forage acquisition distinguishes seasonal ground sources and year-round alternatives', () => {
  expect(get('296')?.attributes.获取方式).toContain('春15—18');
  expect(get('410')?.attributes.获取方式).toContain('秋8—11');
  expect(get('399')?.attributes.注意事项).toContain('每天');
  expect(get('412')?.attributes.注意事项).toContain('锄头');
  expect(get('416')?.attributes.注意事项).toContain('沙漠');
  expect(get('829')?.attributes.注意事项).toContain('1.6.12');
  expect(get('88')?.attributes.注意事项).toContain('不能种');
  expect(get('392')?.attributes.注意事项).toContain('鹦鹉螺化石');
  expect(get('394')?.attributes.获取方式).toContain('四季');
  expect(get('393')?.attributes.注意事项).toContain('不再');
  expect(get('283')?.attributes.注意事项).toContain('损失');
});
