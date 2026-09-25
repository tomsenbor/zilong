import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
const manifest=JSON.parse(readFileSync(new URL('../docs/wiki-full-manifest.json',import.meta.url)));
const evidence=JSON.parse(readFileSync(new URL('../docs/wiki-full-source-evidence.json',import.meta.url)));
test('fishing identities cover independent fish, bait and tackle collections and original five rods',()=>{
 const rows=manifest.records.filter(r=>r.group==='fishing');
 for(const [title,count,prefix]of [['Fish',71,'legacy:Fish:'],['Bait',7,'fishing-item:'],['Tackle',10,'fishing-item:']]){
  const source=evidence.collections.find(c=>c.title===title);
  expect(source.candidates).toHaveLength(count);
  for(const name of source.candidates.map(c=>c.sourceName)){
   expect(rows.filter(r=>r.key.startsWith(prefix)&&r.originalName===name),name).toHaveLength(1);
  }
 }
 expect(rows.filter(r=>r.key.startsWith('rod:')).map(r=>r.originalName).sort()).toEqual(['Training Rod','Bamboo Pole','Fiberglass Rod','Iridium Rod','Advanced Iridium Rod'].sort());
 for(const name of ['Crab Pot','Sea Jelly','River Jelly','Cave Jelly','Golden Bobber','Golden Tag'])expect(rows.filter(r=>r.originalName===name)).toHaveLength(1);
 expect(rows).toHaveLength(99);
 expect(manifest.groups.find(g=>g.id==='fishing')).toMatchObject({status:'complete',expectedCount:99});
});
test('fishing cross-category catches and facilities are mapped without duplicate identities',()=>{
 const crosswalk=JSON.parse(readFileSync(new URL('../docs/wiki-fishing-closure.json',import.meta.url)));
 for(const name of ['Seaweed','Green Algae','White Algae','Trash','Driftwood','Broken Glasses','Broken CD','Soggy Newspaper','Fish Pond','Bait Maker','Worm Bin','Deluxe Worm Bin','Fish Smoker','Recycling Machine']){
  const record=crosswalk.crossReferences.find(r=>r.originalName===name);
  expect(record,name).toBeDefined();
  expect(manifest.records.filter(r=>r.key===record.key)).toHaveLength(1);
 }
});
