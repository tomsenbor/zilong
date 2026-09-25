import {existsSync,readFileSync} from 'node:fs';
import {expect,test} from 'vitest';
import {entries} from '../src/db/seeds.js';
import {makeEntrySlug} from '../src/utils/entry-slug.js';
test('independent crops, villagers, festivals and skill sources map to preserved pages',()=>{
 const path=new URL('../docs/wiki-legacy-primary-inventory.json',import.meta.url);
 expect(existsSync(path)).toBe(true);
 const {records}=JSON.parse(readFileSync(path));
 for(const [collection,count]of [['Crops',47],['Villagers',34],['Festivals',12],['Skills',6]])expect(records.filter(r=>r.collection===collection)).toHaveLength(count);
 const manifest=JSON.parse(readFileSync(new URL('../docs/wiki-full-manifest.json',import.meta.url)));
 for(const r of records){
  expect(entries.filter(e=>e.dataset===r.dataset&&makeEntrySlug(e)===r.slug&&e.name===r.name)).toHaveLength(1);
  expect(manifest.records.filter(m=>m.disposition==='include'&&m.dataset===r.dataset&&m.slug===r.slug)).toHaveLength(1);
 }
 expect(records.find(r=>r.title==='Vincent').slug).toBe('vincent');
 expect(records.find(r=>r.title==='Qi Fruit').slug).toBe('qi-fruit');
});
