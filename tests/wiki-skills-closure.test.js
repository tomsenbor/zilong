import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
const manifest = JSON.parse(readFileSync(new URL('../docs/wiki-full-manifest.json', import.meta.url)));
test('skills group closes only with six overviews, thirty professions, five masteries and forty-nine achievements', () => {
  const records = manifest.records.filter(r => r.group === 'skills');
  expect(records.filter(r => r.key.startsWith('legacy-primary:Skills:'))).toHaveLength(6);
  expect(records.filter(r => r.key.startsWith('profession:'))).toHaveLength(30);
  expect(records.filter(r => r.key.startsWith('mastery:'))).toHaveLength(5);
  expect(records.filter(r => r.key.startsWith('achievement:'))).toHaveLength(49);
  expect(records).toHaveLength(90);
  expect(manifest.groups.find(g => g.id === 'skills')).toMatchObject({status:'complete',expectedCount:90});
});
