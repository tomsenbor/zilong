import {readFileSync,existsSync} from 'node:fs';
import {expect,test} from 'vitest';
import {entries} from '../src/db/seeds.js';
import {makeEntrySlug} from '../src/utils/entry-slug.js';
const file=new URL('../docs/wiki-quest-identity-inventory.json',import.meta.url);
const inventory=existsSync(file)?JSON.parse(readFileSync(file)): {records:[]};
test('every native 1.6.15 quest record has a reviewed playable or unused disposition',()=>{
  expect(inventory.records.map(r=>Number(r.id)).sort((a,b)=>a-b)).toEqual([
    1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
    100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134]);
  expect(inventory.records.filter(r=>r.disposition==='exclude').map(r=>Number(r.id))).toEqual([10,131]);
  for(const r of inventory.records){
    if(r.disposition==='include') expect(entries.filter(e=>e.dataset===r.dataset&&makeEntrySlug(e)===r.slug),r.id).toHaveLength(1);
    else expect(r.reason).toMatch(/unused/i);
  }
});
test('unused native fishing template is not conflated with the playable festival event',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../docs/wiki-full-manifest.json',import.meta.url)));
  expect(manifest.records.find(r=>r.key==='quest:131')?.disposition).toBe('exclude');
  expect(manifest.records.find(r=>r.key==='event:desert-fishing')?.slug).toBe('event-desert-fishing');
});
