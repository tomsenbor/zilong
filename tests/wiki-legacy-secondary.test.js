import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { entries } from '../src/db/seeds.js';
import { makeEntrySlug } from '../src/utils/entry-slug.js';
test('legacy resource, artisan and world entries reuse stable curated identities with source records', () => {
 const file=new URL('../docs/wiki-legacy-secondary-inventory.json',import.meta.url);
 expect(existsSync(file)).toBe(true);
 const inventory=JSON.parse(readFileSync(file));
 const manifest=JSON.parse(readFileSync(new URL('../docs/wiki-full-manifest.json',import.meta.url)));
 for(const datasetSlug of ['items/iridium-bar','items/fruit-wine','items/pickles','items/jelly','items/fish-smoker','locations/farmhouse','locations/skull-cavern','quests/junimo']) {
  const r=inventory.records.find(r=>r.dataset+'/'+r.slug===datasetSlug);
  expect(r,datasetSlug).toBeDefined();
  expect(r.sourceRevision).toBeTruthy();
  expect(entries.filter(e=>e.dataset===r.dataset&&makeEntrySlug(e)===r.slug)).toHaveLength(1);
  expect(manifest.records.some(v=>v.dataset===r.dataset&&v.slug===r.slug)).toBe(true);
 }
 expect(manifest.records.filter(r=>r.originalName==='Wine'&&r.disposition==='include')).toHaveLength(1);
});
