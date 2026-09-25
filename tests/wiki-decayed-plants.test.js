import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';

test('both normally generated rotten-plant identities retain distinct pages and actual recycling restrictions', () => {
  for (const id of ['747', '748']) {
    const matches = entries.filter(e => e.dataset === 'items' && e.attributes?.原版物品编号 === '(O)' + id);
    expect(matches, id).toHaveLength(1);
    expect(matches[0].slug).toBe('decay-' + id);
    expect(matches[0].name).toContain(id);
    expect(matches[0].attributes.获取方式).toContain('冬1日');
    expect(matches[0].attributes.获取方式).toContain('纯金刘易斯');
    expect(matches[0].attributes.主要用途).toContain('不能放入回收机');
    expect(matches[0].attributes.sellPrice).toBe('0金');
    expect(matches[0].attributes.注意事项).toContain('两种');
  }
});
