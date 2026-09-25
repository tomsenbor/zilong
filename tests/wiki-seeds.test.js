import {expect,test} from 'vitest';
import {entries} from '../src/db/seeds.js';
import {readFileSync,existsSync} from 'node:fs';
import {makeEntrySlug} from '../src/utils/entry-slug.js';
const ids='69 251 273 292 299 301 302 309 310 311 347 425 427 429 431 433 453 455 472 473 474 475 476 477 478 479 480 481 482 483 484 485 486 487 488 489 490 491 492 493 494 495 496 497 498 499 628 629 630 631 632 633 745 770 802 831 833 835 885 890 891 MixedFlowerSeeds MossySeed MysticTreeSeed CarrotSeeds SummerSquashSeeds BroccoliSeeds PowdermelonSeeds'.split(' ');
const get=id=>entries.find(e=>e.dataset==='items'&&e.slug==='seed-'+id.toLowerCase());
test('all 68 independently enumerated native seed identities exist without duplicating coffee',()=>{
 for(const id of ids.filter(id=>id!=='433')){expect(get(id),id).toBeDefined();expect(get(id).attributes.获取方式.length,id).toBeGreaterThan(15);expect(get(id).attributes.注意事项.length,id).toBeGreaterThan(20);}
 expect(entries.filter(e=>e.name==='咖啡豆')).toHaveLength(1);
 const p=new URL('../docs/wiki-seed-inventory.json',import.meta.url);expect(existsSync(p)).toBe(true);
 const inventory=JSON.parse(readFileSync(p));expect(inventory.records.map(r=>r.nativeId).sort()).toEqual([...ids].sort());
 for(const r of inventory.records)expect(entries.filter(e=>e.dataset===r.dataset&&makeEntrySlug(e)===r.slug)).toHaveLength(1);
});
test('seed buying, selling and special acquisition are not conflated',()=>{
 expect(get('493')?.attributes.sellPrice).toBe('60金');
 expect(get('431')?.attributes.sellPrice).toContain('100');
 expect(get('745')?.attributes.获取方式).toContain('春13');
 expect(get('476')?.attributes.获取方式).toContain('第二年');
 expect(get('CarrotSeeds')?.attributes.获取方式).toContain('冬21');
 expect(get('CarrotSeeds')?.attributes.注意事项).toContain('无限');
 expect(get('499')?.attributes.注意事项).toContain('1.6.3');
 expect(get('499')?.attributes.注意事项).toContain('古物');
 expect(get('890')?.attributes.注意事项).toContain('消失');
});
test('paddy, trellis, wild seeds, trees and indoor restrictions remain distinct',()=>{
 expect(get('273')?.attributes.生长规则).toContain('6天');
 expect(get('831')?.attributes.生长规则).toContain('7天');
 expect(get('302')?.attributes.生长规则).toContain('藤架');
 expect(get('802')?.attributes.注意事项).toContain('姜岛');
 expect(get('495')?.attributes.生长规则).toContain('采集');
 expect(get('885')?.attributes.生长规则).toContain('不需要浇水');
 expect(get('251')?.attributes.生长规则).toContain('22');
 expect(get('MysticTreeSeed')?.attributes.生长规则).toContain('30%');
 expect(get('69')?.attributes.生长规则).toContain('28');
});
test('all seed icons have source provenance and reference an existing asset',()=>{
 const p=new URL('../docs/wiki-seed-assets-sources.json',import.meta.url);expect(existsSync(p)).toBe(true);
 const assets=JSON.parse(readFileSync(p));expect(assets).toHaveLength(67);
 for(const a of assets){expect(existsSync(a.file),a.file).toBe(true);expect(a.sha256).toMatch(/^[a-f0-9]{64}$/);expect(get(a.nativeId).image).toBe('/'+a.file.replace(/^public\//,''));}
});
