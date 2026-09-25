import {fish} from "./data/fish.js";
import {crops} from "./data/crops.js";
import {giftData} from './data/gifts.js';
import {makeEntrySlug} from "../../utils/entry-slug.js";

export function readEntryIndex(db) {
  return db.prepare(`SELECT e.id,e.name,e.slug,e.image,d.slug datasetSlug
    FROM dataset_entries e JOIN datasets d ON d.id=e.dataset_id WHERE e.published=1`)
    .all().map(row=>({...row,slug:makeEntrySlug(row)}));
}

export function wikiHref(name, index, datasetSlug) {
  const matches=index.filter(e=>e.name===name && (!datasetSlug || e.datasetSlug===datasetSlug));
  return matches.length===1
    ? `/wiki/${encodeURIComponent(matches[0].datasetSlug)}/${encodeURIComponent(matches[0].slug)}`
    : `/search?${new URLSearchParams({q:name})}`;
}

export function resolveEntryLinks(entry) {
  const dataset=entry.datasetSlug || entry.dataset_slug;
  if(dataset==='fish' && fish.some(f=>f.name===entry.name))
    return [{label:'查询捕获条件',href:`/tools/fish?${new URLSearchParams({q:entry.name})}`}];
  if(dataset==='crops') {
    const matches=crops.filter(c=>c.name===entry.name);
    if(matches.length===1) return [{label:'计算作物收益',href:`/tools/crops?${new URLSearchParams({crop:matches[0].id,season:matches[0].seasons[0]})}`}];
  }
  if(dataset==='villagers' && giftData.villagers.some(v=>v.entrySlug===makeEntrySlug(entry)))
    return [{label:'查生日与礼物',href:`/tools/gifts?${new URLSearchParams({villager:makeEntrySlug(entry)})}`}];
  return [];
}

export function linkCommunityRooms(rooms,index) {
  return rooms.map(room=>({...room,bundles:room.bundles.map(bundle=>({...bundle,
    items:bundle.items.map(item=>({...item,wikiHref:wikiHref(item.name,index,item.fishId?'fish':item.cropId?'crops':undefined)}))
  }))}));
}
