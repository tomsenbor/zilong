import { GAME_VERSION } from "../constants.js";

const seasonsAll = ["春季", "夏季", "秋季", "冬季"];

function stages(total) {
  const count = Math.min(4, total);
  const base = Math.floor(total / count);
  const remainder = total % count;
  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0));
}

function defaultProcessing(kind) {
  if (kind === "fruit") {
    return {
      keg: { product: "果酒", formula: "fruit-wine" },
      jar: { product: "果酱", formula: "jelly" }
    };
  }
  if (kind === "vegetable") {
    return {
      keg: { product: "蔬菜汁", formula: "vegetable-juice" },
      jar: { product: "腌菜", formula: "pickles" }
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
  growth,
  regrowDays = null,
  harvestYield = 1,
  extraYieldChance = 0,
  baseSellPrice,
  kind,
  processing,
  restrictions = [],
  calculationSupported = true
}) {
  return {
    id,
    name,
    image: `/assets/game/36px-${image}.png`,
    seasons,
    seedPrice,
    seedSource,
    growthStages: stages(growth),
    regrowDays,
    harvestYield,
    extraYieldChance,
    baseSellPrice,
    kind,
    processing: processing === undefined ? defaultProcessing(kind) : processing,
    restrictions,
    calculationSupported,
    gameVersion: GAME_VERSION
  };
}

export const crops = [
  crop({ id: "blue-jazz", name: "蓝爵", image: "Blue_Jazz", seasons: ["春季"], seedPrice: 30, seedSource: "皮埃尔杂货店", growth: 7, baseSellPrice: 50, kind: "flower", processing: {} }),
  crop({ id: "cauliflower", name: "花椰菜", image: "Cauliflower", seasons: ["春季"], seedPrice: 80, seedSource: "皮埃尔杂货店", growth: 12, baseSellPrice: 175, kind: "vegetable" }),
  crop({ id: "coffee-bean", name: "咖啡豆", image: "Coffee_Bean", seasons: ["春季", "夏季"], seedPrice: 2500, seedSource: "旅行货车", growth: 10, regrowDays: 2, harvestYield: 4, baseSellPrice: 15, kind: "special", processing: { keg: { product: "咖啡", unitPrice: 30, note: "5 个咖啡豆制成 1 杯咖啡" } }, restrictions: ["旅行货车价格可能变化"] }),
  crop({ id: "garlic", name: "大蒜", image: "Garlic", seasons: ["春季"], seedPrice: 40, seedSource: "皮埃尔杂货店", growth: 4, baseSellPrice: 60, kind: "vegetable" }),
  crop({ id: "green-bean", name: "青豆", image: "Green_Bean", seasons: ["春季"], seedPrice: 60, seedSource: "皮埃尔杂货店", growth: 10, regrowDays: 3, baseSellPrice: 40, kind: "vegetable", restrictions: ["藤架作物"] }),
  crop({ id: "kale", name: "甘蓝菜", image: "Kale", seasons: ["春季"], seedPrice: 70, seedSource: "皮埃尔杂货店", growth: 6, baseSellPrice: 110, kind: "vegetable" }),
  crop({ id: "parsnip", name: "防风草", image: "Parsnip", seasons: ["春季"], seedPrice: 20, seedSource: "皮埃尔杂货店", growth: 4, baseSellPrice: 35, kind: "vegetable" }),
  crop({ id: "potato", name: "土豆", image: "Potato", seasons: ["春季"], seedPrice: 50, seedSource: "皮埃尔杂货店", growth: 6, extraYieldChance: 0.2, baseSellPrice: 80, kind: "vegetable" }),
  crop({ id: "rhubarb", name: "大黄", image: "Rhubarb", seasons: ["春季"], seedPrice: 100, seedSource: "绿洲", growth: 13, baseSellPrice: 220, kind: "fruit" }),
  crop({ id: "strawberry", name: "草莓", image: "Strawberry", seasons: ["春季"], seedPrice: 100, seedSource: "复活节", growth: 8, regrowDays: 4, extraYieldChance: 0.02, baseSellPrice: 120, kind: "fruit", restrictions: ["通常从春季13日复活节购入"] }),
  crop({ id: "tulip", name: "郁金香", image: "Tulip", seasons: ["春季"], seedPrice: 20, seedSource: "皮埃尔杂货店", growth: 6, baseSellPrice: 30, kind: "flower", processing: {} }),
  crop({ id: "unmilled-rice", name: "未碾米", image: "Unmilled_Rice", seasons: ["春季"], seedPrice: 40, seedSource: "皮埃尔杂货店", growth: 8, baseSellPrice: 30, kind: "special", processing: {}, restrictions: ["靠近水源时生长更快"] }),
  crop({ id: "carrot", name: "胡萝卜", image: "Carrot", seasons: ["春季"], seedPrice: 0, seedSource: "种子点与奖励", growth: 3, baseSellPrice: 35, kind: "vegetable", restrictions: ["种子无固定商店价格"] }),

  crop({ id: "blueberry", name: "蓝莓", image: "Blueberry", seasons: ["夏季"], seedPrice: 80, seedSource: "皮埃尔杂货店", growth: 13, regrowDays: 4, harvestYield: 3, extraYieldChance: 0.02, baseSellPrice: 50, kind: "fruit" }),
  crop({ id: "corn", name: "玉米", image: "Corn", seasons: ["夏季", "秋季"], seedPrice: 150, seedSource: "皮埃尔杂货店", growth: 14, regrowDays: 4, baseSellPrice: 50, kind: "vegetable" }),
  crop({ id: "hops", name: "啤酒花", image: "Hops", seasons: ["夏季"], seedPrice: 60, seedSource: "皮埃尔杂货店", growth: 11, regrowDays: 1, baseSellPrice: 25, kind: "special", processing: { keg: { product: "淡啤酒", unitPrice: 300 } }, restrictions: ["藤架作物"] }),
  crop({ id: "hot-pepper", name: "辣椒", image: "Hot_Pepper", seasons: ["夏季"], seedPrice: 40, seedSource: "皮埃尔杂货店", growth: 5, regrowDays: 3, extraYieldChance: 0.03, baseSellPrice: 40, kind: "fruit" }),
  crop({ id: "melon", name: "甜瓜", image: "Melon", seasons: ["夏季"], seedPrice: 80, seedSource: "皮埃尔杂货店", growth: 12, baseSellPrice: 250, kind: "fruit" }),
  crop({ id: "poppy", name: "虞美人", image: "Poppy", seasons: ["夏季"], seedPrice: 100, seedSource: "皮埃尔杂货店", growth: 7, baseSellPrice: 140, kind: "flower", processing: {} }),
  crop({ id: "radish", name: "萝卜", image: "Radish", seasons: ["夏季"], seedPrice: 40, seedSource: "皮埃尔杂货店", growth: 6, baseSellPrice: 90, kind: "vegetable" }),
  crop({ id: "red-cabbage", name: "红叶卷心菜", image: "Red_Cabbage", seasons: ["夏季"], seedPrice: 100, seedSource: "皮埃尔杂货店", growth: 9, baseSellPrice: 260, kind: "vegetable" }),
  crop({ id: "starfruit", name: "杨桃", image: "Starfruit", seasons: ["夏季"], seedPrice: 400, seedSource: "绿洲", growth: 13, baseSellPrice: 750, kind: "fruit" }),
  crop({ id: "summer-spangle", name: "夏季亮片", image: "Summer_Spangle", seasons: ["夏季"], seedPrice: 50, seedSource: "皮埃尔杂货店", growth: 8, baseSellPrice: 90, kind: "flower", processing: {} }),
  crop({ id: "sunflower", name: "向日葵", image: "Sunflower", seasons: ["夏季", "秋季"], seedPrice: 200, seedSource: "皮埃尔杂货店", growth: 8, baseSellPrice: 80, kind: "flower", processing: {}, restrictions: ["收获时可能返还种子"] }),
  crop({ id: "tomato", name: "西红柿", image: "Tomato", seasons: ["夏季"], seedPrice: 50, seedSource: "皮埃尔杂货店", growth: 11, regrowDays: 4, extraYieldChance: 0.05, baseSellPrice: 60, kind: "vegetable" }),
  crop({ id: "wheat", name: "小麦", image: "Wheat", seasons: ["夏季", "秋季"], seedPrice: 10, seedSource: "皮埃尔杂货店", growth: 4, baseSellPrice: 25, kind: "special", processing: { keg: { product: "啤酒", unitPrice: 200 } } }),
  crop({ id: "summer-squash", name: "夏南瓜", image: "Summer_Squash", seasons: ["夏季"], seedPrice: 0, seedSource: "种子点与奖励", growth: 6, regrowDays: 3, baseSellPrice: 45, kind: "vegetable", restrictions: ["种子无固定商店价格"] }),

  crop({ id: "amaranth", name: "苋菜", image: "Amaranth", seasons: ["秋季"], seedPrice: 70, seedSource: "皮埃尔杂货店", growth: 7, baseSellPrice: 150, kind: "vegetable" }),
  crop({ id: "artichoke", name: "洋蓟", image: "Artichoke", seasons: ["秋季"], seedPrice: 30, seedSource: "皮埃尔杂货店", growth: 8, baseSellPrice: 160, kind: "vegetable" }),
  crop({ id: "beet", name: "甜菜", image: "Beet", seasons: ["秋季"], seedPrice: 20, seedSource: "绿洲", growth: 6, baseSellPrice: 100, kind: "vegetable" }),
  crop({ id: "bok-choy", name: "小白菜", image: "Bok_Choy", seasons: ["秋季"], seedPrice: 50, seedSource: "皮埃尔杂货店", growth: 4, baseSellPrice: 80, kind: "vegetable" }),
  crop({ id: "broccoli", name: "西兰花", image: "Broccoli", seasons: ["秋季"], seedPrice: 0, seedSource: "种子点与奖励", growth: 8, regrowDays: 4, baseSellPrice: 70, kind: "vegetable", restrictions: ["种子无固定商店价格"] }),
  crop({ id: "cranberries", name: "蔓越莓", image: "Cranberries", seasons: ["秋季"], seedPrice: 240, seedSource: "皮埃尔杂货店", growth: 7, regrowDays: 5, harvestYield: 2, extraYieldChance: 0.1, baseSellPrice: 75, kind: "fruit" }),
  crop({ id: "eggplant", name: "茄子", image: "Eggplant", seasons: ["秋季"], seedPrice: 20, seedSource: "皮埃尔杂货店", growth: 5, regrowDays: 5, extraYieldChance: 0.002, baseSellPrice: 60, kind: "vegetable" }),
  crop({ id: "fairy-rose", name: "玫瑰仙子", image: "Fairy_Rose", seasons: ["秋季"], seedPrice: 200, seedSource: "皮埃尔杂货店", growth: 12, baseSellPrice: 290, kind: "flower", processing: {} }),
  crop({ id: "grape", name: "葡萄", image: "Grape", seasons: ["秋季"], seedPrice: 60, seedSource: "皮埃尔杂货店", growth: 10, regrowDays: 3, baseSellPrice: 80, kind: "fruit", restrictions: ["藤架作物"] }),
  crop({ id: "pumpkin", name: "南瓜", image: "Pumpkin", seasons: ["秋季"], seedPrice: 100, seedSource: "皮埃尔杂货店", growth: 13, baseSellPrice: 320, kind: "vegetable" }),
  crop({ id: "yam", name: "山药", image: "Yam", seasons: ["秋季"], seedPrice: 60, seedSource: "皮埃尔杂货店", growth: 10, baseSellPrice: 160, kind: "vegetable" }),

  crop({ id: "ancient-fruit", name: "远古水果", image: "Ancient_Fruit", seasons: ["春季", "夏季", "秋季"], seedPrice: 0, seedSource: "种子生产器与远古种子", growth: 28, regrowDays: 7, baseSellPrice: 550, kind: "fruit", restrictions: ["种子无固定商店价格"] }),
  crop({ id: "cactus-fruit", name: "仙人掌果子", image: "Cactus_Fruit", seasons: seasonsAll, seedPrice: 150, seedSource: "绿洲", growth: 12, regrowDays: 3, baseSellPrice: 75, kind: "fruit", restrictions: ["只能在室内、温室或姜岛种植"] }),
  crop({ id: "fiber", name: "纤维", image: "Fiber", seasons: seasonsAll, seedPrice: 0, seedSource: "纤维种子配方", growth: 7, harvestYield: 4, baseSellPrice: 1, kind: "special", processing: {}, restrictions: ["产量按每格平均4个纤维估算"] }),
  crop({ id: "pineapple", name: "菠萝", image: "Pineapple", seasons: ["夏季"], seedPrice: 0, seedSource: "姜岛与种子生产器", growth: 14, regrowDays: 7, baseSellPrice: 300, kind: "fruit", restrictions: ["种子无固定商店价格"] }),
  crop({ id: "taro-root", name: "芋头", image: "Taro_Root", seasons: ["夏季"], seedPrice: 0, seedSource: "姜岛与芋头块茎", growth: 10, baseSellPrice: 100, kind: "vegetable", restrictions: ["靠近水源时生长更快", "种子无固定商店价格"] }),
  crop({ id: "tea-leaves", name: "茶叶", image: "Tea_Leaves", seasons: seasonsAll, seedPrice: 500, seedSource: "茶苗制作或旅行货车", growth: 20, regrowDays: 1, baseSellPrice: 50, kind: "special", processing: { keg: { product: "绿茶", unitPrice: 100 } }, restrictions: ["只在每季最后一周产叶"], calculationSupported: false }),
  crop({ id: "sweet-gem-berry", name: "甜宝石浆果", image: "Sweet_Gem_Berry", seasons: ["秋季"], seedPrice: 1000, seedSource: "旅行货车", growth: 24, baseSellPrice: 3000, kind: "special", processing: {}, restrictions: ["不能放入小桶或罐头瓶"] }),
  crop({ id: "qi-fruit", name: "齐瓜", image: "Qi_Fruit", seasons: seasonsAll, seedPrice: 0, seedSource: "齐先生特别订单", growth: 4, baseSellPrice: 1, kind: "fruit", restrictions: ["仅在齐先生任务期间存在"] }),
  crop({ id: "powdermelon", name: "霜瓜", image: "Powdermelon", seasons: ["冬季"], seedPrice: 0, seedSource: "种子点与奖励", growth: 7, baseSellPrice: 60, kind: "fruit", restrictions: ["种子无固定商店价格"] })
];
