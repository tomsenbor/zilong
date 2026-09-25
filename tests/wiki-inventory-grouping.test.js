import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
const manifest = JSON.parse(readFileSync(new URL('../docs/wiki-full-manifest.json',import.meta.url)));
test('source inventory groups do not classify food and quest items as mining resources', () => {
 for (const [key, group] of [['forage:16','food'],['forage:92','resources'],['material:245','food'],['material:SeaJelly','fishing'],['special:875','special'],['questitem:191','special'],['questitem:341','decoration'],['questitem:GoldenBobber','fishing']]) {
  expect(manifest.records.find(r=>r.key===key)?.group,key).toBe(group);
 }
});
