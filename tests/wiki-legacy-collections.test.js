import{expect,test}from'vitest';
import{existsSync,readFileSync}from'node:fs';
import{entries}from'../src/db/seeds.js';
import{makeEntrySlug}from'../src/utils/entry-slug.js';
test('existing mineral artifact fish and cooking identities are fully mapped without duplicate pages',()=>{
 const file=new URL('../docs/wiki-legacy-collection-inventory.json',import.meta.url);expect(existsSync(file)).toBe(true);
 const records=JSON.parse(readFileSync(file)).records;
 for(const [collection,count]of [['Minerals',53],['Artifacts',42],['Fish',71],['Cooking',81]])expect(records.filter(r=>r.collection===collection)).toHaveLength(count);
 expect(new Set(records.map(r=>r.dataset+'/'+r.slug)).size).toBe(247);
 const manifest=JSON.parse(readFileSync(new URL('../docs/wiki-full-manifest.json',import.meta.url)));
 for(const r of records){expect(entries.filter(e=>e.dataset===r.dataset&&makeEntrySlug(e)===r.slug&&e.name===r.name)).toHaveLength(1);expect(manifest.records.filter(m=>m.disposition==='include'&&m.dataset===r.dataset&&m.slug===r.slug)).toHaveLength(1);}
 expect(records.find(r=>r.title==='Ghostfish').name).toBe('鬼鱼');expect(records.find(r=>r.title==='Spook Fish').name).toBe('幽灵鱼');
 const dolls=records.filter(r=>r.title.startsWith('Strange Doll'));expect(dolls).toHaveLength(2);expect(dolls[0].slug).not.toBe(dolls[1].slug);
});
