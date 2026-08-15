import { GAME_VERSION } from "../constants.js";

const seasonsAll = ["春季", "夏季", "秋季", "冬季"];

const CROPS_SOURCE = "https://wiki.stardewvalley.net/Crops";
const PROCESSING_SOURCES = [
  "https://stardewvalleywiki.com/Keg",
  "https://stardewvalleywiki.com/Jellies_and_Pickles"
];

function cropSource(image) {
  return `https://wiki.stardewvalley.net/${image}`;
}

function recipe({ product, formula = null, inputQuantity = 1, processingMinutes, unitPrice = null }) {
  return {
    product,
    formula,
    inputQuantity,
    outputQuantity: 1,
    durationMinutes: processingMinutes,
    processingMinutes,
    unitPrice
  };
}

function defaultProcessing(kind) {
  if (kind === "fruit") {
    return {
      keg: recipe({ product: "果酒", formula: "fruit-wine", processingMinutes: 10000 }),
      jar: recipe({ product: "果酱", formula: "jelly", processingMinutes: 4000 })
    };
  }
  if (kind === "vegetable") {
    return {
      keg: recipe({ product: "蔬菜汁", formula: "vegetable-juice", processingMinutes: 6000 }),
      jar: recipe({ product: "腌菜", formula: "pickles", processingMinutes: 4000 })
    };
  }
  return {};
}

function crop({
  id,
  name,
  image = id,
  seasons,
  seedPrice,
  seedSource,
  growthStages,
  regrowDays = null,
  harvestYield = 1,
  extraYieldChance = 0,
  baseSellPrice,
  kind,
  processing,
  restrictions = [],
  calculationSupported = true,
  unsupportedReason = null,
  minimumYear = 1,
  requiredUnlocks = [],
  inventoryOnly = false,
  seedOffers = null,
  trellis = false,
  paddy = false,
  carriesAcrossSeason = false,
  allowedLocations = ["seasonal", "greenhouse", "island"],
  minStack = harvestYield,
  maxStack = harvestYield,
  maxIncreasePerFarmingLevel = 0,
  sourceRefs = null
}) {
  const offerConditions = {
    seasons,
    startDay: 1,
    endDay: 28,
    minimumYear,
    requiredUnlocks
  };
  const offers = seedOffers ?? (inventoryOnly ? [{
    source: seedSource,
    sourceType: "conditional",
    currency: seedPrice > 0 ? "gold" : "conditional",
    unitPrice: seedPrice > 0 ? seedPrice : null,
    unlimited: false,
    conditions: offerConditions
  }] : [{
    source: seedSource,
    sourceType: "shop",
    currency: "gold",
    unitPrice: seedPrice,
    unlimited: true,
    conditions: offerConditions
  }]);
  const normalizedProcessing = processing === undefined ? defaultProcessing(kind) : processing;

  return {
    id,
    name,
    image: `/assets/game/36px-${image}.png`,
    seasons,
    seedPrice,
    seedSource,
    growthStages,
    regrowDays,
    harvestYield,
    extraYieldChance,
    baseSellPrice,
    kind,
    processing: normalizedProcessing,
    restrictions,
    calculationSupported,
    unsupportedReason,
    growth: {
      seasons,
      stages: growthStages,
      regrowDays,
      carriesAcrossSeason,
      allowedLocations,
      trellis,
      paddy
    },
    yield: {
      minStack,
      maxStack,
      maxIncreasePerFarmingLevel,
      repeatedExtraChance: extraYieldChance
    },
    seedOffers: offers,
    inventoryFallback: true,
    requiresOwnedSeeds: !offers.some((offer) => offer.currency === "gold" && offer.unlimited),
    sourceRefs: sourceRefs ?? [CROPS_SOURCE, cropSource(image), ...PROCESSING_SOURCES],
    gameVersion: GAME_VERSION
  };
}

export const crops = [
  crop({ id: "blue-jazz", name: "蓝爵", image: "Blue_Jazz", seasons: ["春季"], seedPrice: 30, seedSource: "皮埃尔杂货店", growthStages: [1, 2, 2, 2], baseSellPrice: 50, kind: "flower", processing: {} }),
  crop({ id: "cauliflower", name: "花椰菜", image: "Cauliflower", seasons: ["春季"], seedPrice: 80, seedSource: "皮埃尔杂货店", growthStages: [1, 2, 4, 4, 1], baseSellPrice: 175, kind: "vegetable" }),
  crop({ id: "coffee-bean", name: "咖啡豆", image: "Coffee_Bean", seasons: ["春季", "夏季"], seedPrice: 2500, seedSource: "旅行货车", growthStages: [1, 2, 2, 3, 2], regrowDays: 2, harvestYield: 4, minStack: 4, maxStack: 4, baseSellPrice: 15, kind: "special", processing: { keg: recipe({ product: "咖啡", inputQuantity: 5, processingMinutes: 120, unitPrice: 150 }) }, restrictions: ["旅行货车价格和库存不固定"], inventoryOnly: true, carriesAcrossSeason: true }),
  crop({ id: "garlic", name: "大蒜", image: "Garlic", seasons: ["春季"], seedPrice: 40, seedSource: "皮埃尔杂货店", growthStages: [1, 1, 1, 1], baseSellPrice: 60, kind: "vegetable", minimumYear: 2 }),
  crop({ id: "green-bean", name: "青豆", image: "Green_Bean", seasons: ["春季"], seedPrice: 60, seedSource: "皮埃尔杂货店", growthStages: [1, 1, 1, 3, 4], regrowDays: 3, baseSellPrice: 40, kind: "vegetable", restrictions: ["藤架作物"], trellis: true }),
  crop({ id: "kale", name: "甘蓝菜", image: "Kale", seasons: ["春季"], seedPrice: 70, seedSource: "皮埃尔杂货店", growthStages: [1, 2, 2, 1], baseSellPrice: 110, kind: "vegetable" }),
  crop({ id: "parsnip", name: "防风草", image: "Parsnip", seasons: ["春季"], seedPrice: 20, seedSource: "皮埃尔杂货店", growthStages: [1, 1, 1, 1], baseSellPrice: 35, kind: "vegetable" }),
  crop({ id: "potato", name: "土豆", image: "Potato", seasons: ["春季"], seedPrice: 50, seedSource: "皮埃尔杂货店", growthStages: [1, 1, 1, 2, 1], extraYieldChance: 0.2, baseSellPrice: 80, kind: "vegetable" }),
  crop({ id: "rhubarb", name: "大黄", image: "Rhubarb", seasons: ["春季"], seedPrice: 100, seedSource: "绿洲", growthStages: [2, 2, 2, 3, 4], baseSellPrice: 220, kind: "fruit", requiredUnlocks: ["desertUnlocked"] }),
  crop({ id: "strawberry", name: "草莓", image: "Strawberry", seasons: ["春季"], seedPrice: 100, seedSource: "复活节", growthStages: [1, 1, 2, 2, 2], regrowDays: 4, extraYieldChance: 0.02, baseSellPrice: 120, kind: "fruit", restrictions: ["第一年最早在春季13日复活节购买"], seedOffers: [{ source: "复活节", sourceType: "festival", currency: "gold", unitPrice: 100, unlimited: true, conditions: { seasons: ["春季"], startDay: 13, endDay: 13, minimumYear: 1, requiredUnlocks: [] } }] }),
  crop({ id: "tulip", name: "郁金香", image: "Tulip", seasons: ["春季"], seedPrice: 20, seedSource: "皮埃尔杂货店", growthStages: [1, 1, 2, 2], baseSellPrice: 30, kind: "flower", processing: {} }),
  crop({ id: "unmilled-rice", name: "未碾米", image: "Unmilled_Rice", seasons: ["春季"], seedPrice: 40, seedSource: "皮埃尔杂货店", growthStages: [1, 2, 2, 3], baseSellPrice: 30, kind: "special", processing: {}, restrictions: ["当前按非邻水的8天生长周期计算"], paddy: true, minimumYear: 2 }),
  crop({ id: "carrot", name: "胡萝卜", image: "Carrot", seasons: ["春季"], seedPrice: 0, seedSource: "种子点与奖励", growthStages: [1, 1, 1], baseSellPrice: 35, kind: "vegetable", restrictions: ["种子无固定商店价格"], inventoryOnly: true }),

  crop({ id: "blueberry", name: "蓝莓", image: "Blueberry", seasons: ["夏季"], seedPrice: 80, seedSource: "皮埃尔杂货店", growthStages: [1, 3, 3, 4, 2], regrowDays: 4, harvestYield: 3, minStack: 3, maxStack: 3, extraYieldChance: 0.02, baseSellPrice: 50, kind: "fruit" }),
  crop({ id: "corn", name: "玉米", image: "Corn", seasons: ["夏季", "秋季"], seedPrice: 150, seedSource: "皮埃尔杂货店", growthStages: [2, 3, 3, 3, 3], regrowDays: 4, baseSellPrice: 50, kind: "vegetable", carriesAcrossSeason: true }),
  crop({ id: "hops", name: "啤酒花", image: "Hops", seasons: ["夏季"], seedPrice: 60, seedSource: "皮埃尔杂货店", growthStages: [1, 1, 2, 3, 4], regrowDays: 1, baseSellPrice: 25, kind: "special", processing: { keg: recipe({ product: "淡啤酒", processingMinutes: 2250, unitPrice: 300 }) }, restrictions: ["藤架作物"], trellis: true }),
  crop({ id: "hot-pepper", name: "辣椒", image: "Hot_Pepper", seasons: ["夏季"], seedPrice: 40, seedSource: "皮埃尔杂货店", growthStages: [1, 1, 1, 1, 1], regrowDays: 3, extraYieldChance: 0.03, baseSellPrice: 40, kind: "fruit" }),
  crop({ id: "melon", name: "甜瓜", image: "Melon", seasons: ["夏季"], seedPrice: 80, seedSource: "皮埃尔杂货店", growthStages: [1, 2, 3, 3, 3], baseSellPrice: 250, kind: "fruit" }),
  crop({ id: "poppy", name: "虞美人", image: "Poppy", seasons: ["夏季"], seedPrice: 100, seedSource: "皮埃尔杂货店", growthStages: [1, 2, 2, 2], baseSellPrice: 140, kind: "flower", processing: {} }),
  crop({ id: "radish", name: "萝卜", image: "Radish", seasons: ["夏季"], seedPrice: 40, seedSource: "皮埃尔杂货店", growthStages: [2, 1, 2, 1], baseSellPrice: 90, kind: "vegetable" }),
  crop({ id: "red-cabbage", name: "红叶卷心菜", image: "Red_Cabbage", seasons: ["夏季"], seedPrice: 100, seedSource: "皮埃尔杂货店", growthStages: [2, 1, 2, 2, 2], baseSellPrice: 260, kind: "vegetable", minimumYear: 2 }),
  crop({ id: "starfruit", name: "杨桃", image: "Starfruit", seasons: ["夏季"], seedPrice: 400, seedSource: "绿洲", growthStages: [2, 3, 2, 3, 3], baseSellPrice: 750, kind: "fruit", requiredUnlocks: ["desertUnlocked"] }),
  crop({ id: "summer-spangle", name: "夏季亮片", image: "Summer_Spangle", seasons: ["夏季"], seedPrice: 50, seedSource: "皮埃尔杂货店", growthStages: [1, 2, 3, 2], baseSellPrice: 90, kind: "flower", processing: {} }),
  crop({ id: "sunflower", name: "向日葵", image: "Sunflower", seasons: ["夏季", "秋季"], seedPrice: 200, seedSource: "皮埃尔杂货店", growthStages: [1, 2, 3, 2], baseSellPrice: 80, kind: "flower", processing: {}, restrictions: ["收获时的种子返还会影响复种成本，当前不进入排名"], calculationSupported: false, unsupportedReason: "尚未建模收获时随机返还种子", carriesAcrossSeason: true }),
  crop({ id: "tomato", name: "西红柿", image: "Tomato", seasons: ["夏季"], seedPrice: 50, seedSource: "皮埃尔杂货店", growthStages: [2, 2, 2, 2, 3], regrowDays: 4, extraYieldChance: 0.05, baseSellPrice: 60, kind: "vegetable" }),
  crop({ id: "wheat", name: "小麦", image: "Wheat", seasons: ["夏季", "秋季"], seedPrice: 10, seedSource: "皮埃尔杂货店", growthStages: [1, 1, 1, 1], baseSellPrice: 25, kind: "special", processing: { keg: recipe({ product: "啤酒", processingMinutes: 1750, unitPrice: 200 }) }, carriesAcrossSeason: true }),
  crop({ id: "summer-squash", name: "夏南瓜", image: "Summer_Squash", seasons: ["夏季"], seedPrice: 0, seedSource: "种子点与奖励", growthStages: [1, 1, 1, 1, 2], regrowDays: 3, baseSellPrice: 45, kind: "vegetable", restrictions: ["种子无固定商店价格"], inventoryOnly: true }),

  crop({ id: "amaranth", name: "苋菜", image: "Amaranth", seasons: ["秋季"], seedPrice: 70, seedSource: "皮埃尔杂货店", growthStages: [1, 2, 2, 2], baseSellPrice: 150, kind: "vegetable" }),
  crop({ id: "artichoke", name: "洋蓟", image: "Artichoke", seasons: ["秋季"], seedPrice: 30, seedSource: "皮埃尔杂货店", growthStages: [2, 2, 1, 2, 1], baseSellPrice: 160, kind: "vegetable", minimumYear: 2 }),
  crop({ id: "beet", name: "甜菜", image: "Beet", seasons: ["秋季"], seedPrice: 20, seedSource: "绿洲", growthStages: [1, 1, 2, 2], baseSellPrice: 100, kind: "vegetable", requiredUnlocks: ["desertUnlocked"] }),
  crop({ id: "bok-choy", name: "小白菜", image: "Bok_Choy", seasons: ["秋季"], seedPrice: 50, seedSource: "皮埃尔杂货店", growthStages: [1, 1, 1, 1], baseSellPrice: 80, kind: "vegetable" }),
  crop({ id: "broccoli", name: "西兰花", image: "Broccoli", seasons: ["秋季"], seedPrice: 0, seedSource: "种子点与奖励", growthStages: [2, 2, 2, 2], regrowDays: 4, baseSellPrice: 70, kind: "vegetable", restrictions: ["种子无固定商店价格"], inventoryOnly: true }),
  crop({ id: "cranberries", name: "蔓越莓", image: "Cranberries", seasons: ["秋季"], seedPrice: 240, seedSource: "皮埃尔杂货店", growthStages: [1, 2, 1, 1, 2], regrowDays: 5, harvestYield: 2, minStack: 2, maxStack: 2, extraYieldChance: 0.1, baseSellPrice: 75, kind: "fruit" }),
  crop({ id: "eggplant", name: "茄子", image: "Eggplant", seasons: ["秋季"], seedPrice: 20, seedSource: "皮埃尔杂货店", growthStages: [1, 1, 1, 1, 1], regrowDays: 5, extraYieldChance: 0.002, baseSellPrice: 60, kind: "vegetable" }),
  crop({ id: "fairy-rose", name: "玫瑰仙子", image: "Fairy_Rose", seasons: ["秋季"], seedPrice: 200, seedSource: "皮埃尔杂货店", growthStages: [1, 4, 4, 3], baseSellPrice: 290, kind: "flower", processing: {} }),
  crop({ id: "grape", name: "葡萄", image: "Grape", seasons: ["秋季"], seedPrice: 60, seedSource: "皮埃尔杂货店", growthStages: [1, 1, 2, 3, 3], regrowDays: 3, baseSellPrice: 80, kind: "fruit", restrictions: ["藤架作物"], trellis: true }),
  crop({ id: "pumpkin", name: "南瓜", image: "Pumpkin", seasons: ["秋季"], seedPrice: 100, seedSource: "皮埃尔杂货店", growthStages: [1, 2, 3, 4, 3], baseSellPrice: 320, kind: "vegetable" }),
  crop({ id: "yam", name: "山药", image: "Yam", seasons: ["秋季"], seedPrice: 60, seedSource: "皮埃尔杂货店", growthStages: [1, 3, 3, 3], baseSellPrice: 160, kind: "vegetable" }),

  crop({ id: "ancient-fruit", name: "远古水果", image: "Ancient_Fruit", seasons: ["春季", "夏季", "秋季"], seedPrice: 0, seedSource: "种子生产器与远古种子", growthStages: [2, 7, 7, 7, 5], regrowDays: 7, baseSellPrice: 550, kind: "fruit", restrictions: ["种子无固定商店价格"], inventoryOnly: true, carriesAcrossSeason: true }),
  crop({ id: "cactus-fruit", name: "仙人掌果子", image: "Cactus_Fruit", seasons: seasonsAll, seedPrice: 150, seedSource: "绿洲", growthStages: [2, 2, 2, 3, 3], regrowDays: 3, baseSellPrice: 75, kind: "fruit", restrictions: ["只能在室内、温室或姜岛种植"], requiredUnlocks: ["desertUnlocked"], allowedLocations: ["greenhouse", "island"] }),
  crop({ id: "fiber", name: "纤维", image: "Fiber", seasons: seasonsAll, seedPrice: 0, seedSource: "纤维种子配方", growthStages: [1, 2, 2, 2], harvestYield: 4, minStack: 4, maxStack: 7, baseSellPrice: 1, kind: "special", processing: {}, restrictions: ["4至7个纤维的随机产量尚未进入收益排名"], inventoryOnly: true, calculationSupported: false, unsupportedReason: "随机堆叠产量需要独立概率模型", carriesAcrossSeason: true }),
  crop({ id: "pineapple", name: "菠萝", image: "Pineapple", seasons: ["夏季"], seedPrice: 0, seedSource: "姜岛与种子生产器", growthStages: [1, 3, 3, 4, 3], regrowDays: 7, baseSellPrice: 300, kind: "fruit", restrictions: ["种子无固定商店价格"], inventoryOnly: true }),
  crop({ id: "taro-root", name: "芋头", image: "Taro_Root", seasons: ["夏季"], seedPrice: 0, seedSource: "姜岛与芋头块茎", growthStages: [1, 2, 3, 4], baseSellPrice: 100, kind: "vegetable", restrictions: ["邻水加速尚未作为输入，当前不进入排名", "种子无固定商店价格"], inventoryOnly: true, paddy: true, calculationSupported: false, unsupportedReason: "缺少邻水种植条件" }),
  crop({ id: "tea-leaves", name: "茶叶", image: "Tea_Leaves", seasons: seasonsAll, seedPrice: 500, seedSource: "茶苗制作或旅行货车", growthStages: [10, 10], regrowDays: 1, baseSellPrice: 50, kind: "special", processing: { keg: recipe({ product: "绿茶", processingMinutes: 180, unitPrice: 100 }) }, restrictions: ["只在每季最后一周产叶"], calculationSupported: false, unsupportedReason: "季末一周产叶窗口尚未进入通用收获模拟", inventoryOnly: true }),
  crop({ id: "sweet-gem-berry", name: "甜宝石浆果", image: "Sweet_Gem_Berry", seasons: ["秋季"], seedPrice: 1000, seedSource: "旅行货车", growthStages: [2, 4, 6, 6, 6], baseSellPrice: 3000, kind: "special", processing: {}, restrictions: ["不能放入小桶或罐头瓶", "旅行货车库存不固定"], inventoryOnly: true }),
  crop({ id: "qi-fruit", name: "齐瓜", image: "Qi_Fruit", seasons: seasonsAll, seedPrice: 0, seedSource: "齐先生特别订单", growthStages: [1, 1, 1, 1], baseSellPrice: 1, kind: "fruit", restrictions: ["仅在齐先生任务期间存在"], inventoryOnly: true, calculationSupported: false, unsupportedReason: "任务有效期未作为输入" }),
  crop({ id: "powdermelon", name: "霜瓜", image: "Powdermelon", seasons: ["冬季"], seedPrice: 0, seedSource: "种子点与奖励", growthStages: [1, 1, 1, 2, 2], baseSellPrice: 60, kind: "fruit", restrictions: ["种子无固定商店价格"], inventoryOnly: true })
];
