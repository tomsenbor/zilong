import { Router } from "express";
import { AppError } from "../../middleware/errors.js";
import { DATA_VERSION, GAME_VERSION } from "./constants.js";
import { fish } from "./data/fish.js";
import { crops } from "./data/crops.js";
import { communityCenter } from "./data/community-center.js";
import { rankCropProfits } from "./crops.js";
import { getCommunitySlotIds, getCommunityTotalsByScope } from "./community-center.js";
import { filterFish, getFishFilterOptions } from "./fish.js";
import { cropCalculationSchema, fishQuerySchema, giftQuerySchema } from "./schemas.js";
import { readEntryIndex, resolveEntryLinks, linkCommunityRooms, wikiHref } from "./entry-links.js";
import {giftData} from './data/gifts.js';
import {queryGifts} from './gifts.js';

const envelope = (payload) => ({
  gameVersion: GAME_VERSION,
  dataVersion: DATA_VERSION,
  ...payload
});

function parseOrThrow(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new AppError(
      400,
      "INVALID_TOOL_INPUT",
      "输入条件不正确",
      result.error.issues
    );
  }
  return result.data;
}

export function createToolsRouter({db}) {
  const router = Router();

  router.get('/gifts', (req,res)=>{
    const filters=parseOrThrow(giftQuerySchema,req.query);
    const index=readEntryIndex(db).filter(e=>e.datasetSlug!=='catalog');
    const publishedVillagers=giftData.villagers.filter(v=>index.some(e=>e.datasetSlug==='villagers'&&e.slug===v.entrySlug));
    const data=queryGifts({...giftData,villagers:publishedVillagers},filters);
    res.json(envelope({...data,coverage:'verified-loves-only',
      options:publishedVillagers.map(({id,name})=>({id,name})),
      gifts:data.gifts.map(g=>({...g,wikiHref:wikiHref(g.name,index),
        toolLinks:['fish','crops'].flatMap(datasetSlug=>{
          const matches=index.filter(e=>e.name===g.name&&e.datasetSlug===datasetSlug);
          return matches.length===1?resolveEntryLinks(matches[0]):[];
        })}))
    }));
  });

  router.get('/links', (req,res,next)=>{
    const {dataset,entry}=req.query;
    if(typeof dataset!=='string'||! /^[a-z-]+$/.test(dataset)||typeof entry!=='string'||entry.length>150)
      return next(new AppError(400,'INVALID_TOOL_INPUT','资料参数不正确'));
    const item=readEntryIndex(db).find(x=>x.datasetSlug===dataset&&x.slug===entry);
    if(!item) return next(new AppError(404,'ENTRY_NOT_FOUND','资料条目不存在'));
    res.json({links:resolveEntryLinks(item)});
  });

  router.get("/fish", (req, res) => {
    const filters = parseOrThrow(fishQuerySchema, req.query);
    const items = filterFish(fish, {
      ...filters,
      bundleOnly: filters.bundleOnly === "true",
      magicBait: filters.magicBait === "true"
    });
    const index=readEntryIndex(db);
    res.json(envelope({
      items:items.map(item=>({...item,wikiHref:wikiHref(item.name,index,'fish')})),
      total: items.length,
      filters: getFishFilterOptions(fish)
    }));
  });

  router.get("/crops", (req, res) => {
    res.json(envelope({
      items: crops,
      filters: {
        seasons: ["春季", "夏季", "秋季", "冬季"],
        methods: ["sell", "jar", "keg"]
      }
    }));
  });

  router.post("/crops/calculate", (req, res) => {
    const input = parseOrThrow(cropCalculationSchema, req.body);
    const calculationInput = {
      ...input,
      planningDays: input.locationMode === "seasonal" ? 28 : input.startDay + input.planningDays - 1
    };
    const result = rankCropProfits(crops, calculationInput);
    res.json(envelope({ input, ...result }));
  });

  router.get("/community-center", (req, res) => {
    const scopedTotals = getCommunityTotalsByScope(communityCenter);
    res.json(envelope({
      rooms: linkCommunityRooms(communityCenter, readEntryIndex(db)),
      knownSlotIds: getCommunitySlotIds(communityCenter),
      totals: {
        ...scopedTotals.all,
        ...scopedTotals
      }
    }));
  });

  return router;
}
