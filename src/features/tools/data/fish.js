import { GAME_VERSION } from "../constants.js";

const allSeasons = ["春季", "夏季", "秋季", "冬季"];
const allDay = [{ start: 600, end: 2600 }];

function rod({
  id,
  name,
  image = id,
  seasons = allSeasons,
  locations,
  weather = ["任意"],
  timeRanges = allDay,
  difficulty = 0,
  behavior = "混合型",
  basePrice = 0,
  bundleIds = [],
  category = "普通",
  notes = "",
  aliases = []
}) {
  return {
    id,
    name,
    aliases,
    image: `/assets/game/36px-${image}.png`,
    seasons,
    locations,
    weather,
    timeRanges,
    sourceType: "钓竿",
    category,
    difficulty,
    behavior,
    basePrice,
    bundleIds,
    notes,
    gameVersion: GAME_VERSION
  };
}

function special(options) {
  return {
    ...rod(options),
    sourceType: "特殊活动",
    category: "特殊"
  };
}

function crab({
  id,
  name,
  image = id,
  locations,
  basePrice,
  bundleIds = ["crab-pot-bundle"],
  notes = "",
  aliases = []
}) {
  return {
    id,
    name,
    aliases,
    image: `/assets/game/36px-${image}.png`,
    seasons: allSeasons,
    locations,
    weather: ["任意"],
    timeRanges: allDay,
    sourceType: "蟹笼",
    category: "特殊",
    difficulty: 0,
    behavior: "蟹笼",
    basePrice,
    bundleIds,
    notes,
    gameVersion: GAME_VERSION
  };
}

export const fish = [
  rod({ id: "albacore", name: "青花鱼", image: "Albacore", aliases: ["Albacore"], seasons: ["秋季", "冬季"], locations: ["海洋"], timeRanges: [{ start: 600, end: 1100 }, { start: 1800, end: 2600 }], difficulty: 60, basePrice: 75 }),
  rod({ id: "anchovy", name: "凤尾鱼", image: "Anchovy", aliases: ["Anchovy"], seasons: ["春季", "秋季"], locations: ["海洋"], difficulty: 30, behavior: "急冲型", basePrice: 30 }),
  rod({ id: "blue-discus", name: "蓝铁饼鱼", image: "Blue_Discus", aliases: ["Blue Discus"], locations: ["姜岛河流", "姜岛池塘"], difficulty: 60, behavior: "急冲型", basePrice: 120 }),
  rod({ id: "bream", name: "鲷鱼", image: "Bream", aliases: ["Bream"], locations: ["小镇河流", "森林河流"], timeRanges: [{ start: 1800, end: 2600 }], difficulty: 35, behavior: "平滑型", basePrice: 45, bundleIds: ["night-fishing-bundle"] }),
  rod({ id: "bullhead", name: "大头鱼", image: "Bullhead", aliases: ["Bullhead"], locations: ["山区湖泊"], difficulty: 46, behavior: "平滑型", basePrice: 75, bundleIds: ["lake-fish-bundle"] }),
  rod({ id: "carp", name: "鲤鱼", image: "Carp", aliases: ["Carp"], locations: ["山区湖泊", "秘密森林池塘", "下水道", "突变虫穴"], difficulty: 15, basePrice: 30, bundleIds: ["lake-fish-bundle"] }),
  rod({ id: "catfish", name: "鲶鱼", image: "Catfish", aliases: ["Catfish"], seasons: ["春季", "秋季"], locations: ["小镇河流", "森林河流", "秘密森林池塘"], weather: ["雨天"], timeRanges: [{ start: 600, end: 2400 }], difficulty: 75, basePrice: 200, bundleIds: ["river-fish-bundle"], notes: "秘密森林池塘在夏季雨天也可捕获。" }),
  rod({ id: "chub", name: "鲢鱼", image: "Chub", aliases: ["Chub"], locations: ["森林河流", "山区湖泊"], difficulty: 35, behavior: "急冲型", basePrice: 50, bundleIds: ["field-research-bundle"] }),
  rod({ id: "dace", name: "鲮鱼", image: "Fish", aliases: ["Dace"], seasons: ["夏季", "秋季", "冬季"], locations: ["森林河流"], timeRanges: [{ start: 600, end: 1900 }], difficulty: 35, behavior: "急冲型", basePrice: 30 }),
  rod({ id: "dorado", name: "麻哈脂鲤", image: "Dorado", aliases: ["Dorado"], seasons: ["夏季"], locations: ["森林河流"], timeRanges: [{ start: 600, end: 1900 }], difficulty: 78, basePrice: 100 }),
  rod({ id: "eel", name: "鳗鱼", image: "Eel", aliases: ["Eel"], seasons: ["春季", "秋季"], locations: ["海洋"], weather: ["雨天"], timeRanges: [{ start: 1600, end: 2600 }], difficulty: 70, behavior: "平滑型", basePrice: 85, bundleIds: ["night-fishing-bundle"] }),
  rod({ id: "flounder", name: "比目鱼", image: "Flounder", aliases: ["Flounder"], seasons: ["春季", "夏季"], locations: ["海洋"], timeRanges: [{ start: 600, end: 2000 }], difficulty: 50, behavior: "下沉型", basePrice: 100 }),
  rod({ id: "ghostfish", name: "幽灵鱼", image: "Ghostfish", aliases: ["Ghostfish"], locations: ["矿井20层", "矿井60层"], difficulty: 50, basePrice: 45, bundleIds: ["specialty-fish-bundle"] }),
  rod({ id: "goby", name: "虾虎鱼", image: "Goby", aliases: ["Goby"], locations: ["煤矿森林瀑布"], difficulty: 55, behavior: "急冲型", basePrice: 150, notes: "1.6 新增鱼类，需要在瀑布水域抛竿。" }),
  rod({ id: "halibut", name: "大比目鱼", image: "Halibut", aliases: ["Halibut"], seasons: ["春季", "夏季", "冬季"], locations: ["海洋"], timeRanges: [{ start: 600, end: 1100 }, { start: 1900, end: 2600 }], difficulty: 50, behavior: "下沉型", basePrice: 80 }),
  rod({ id: "herring", name: "鲱鱼", image: "Herring", aliases: ["Herring"], seasons: ["春季", "冬季"], locations: ["海洋"], difficulty: 25, behavior: "急冲型", basePrice: 30 }),
  rod({ id: "ice-pip", name: "冰柱鱼", image: "Ice_Pip", aliases: ["Ice Pip"], locations: ["矿井60层"], difficulty: 85, behavior: "急冲型", basePrice: 500 }),
  rod({ id: "largemouth-bass", name: "大嘴鲈鱼", image: "Largemouth_Bass", aliases: ["Largemouth Bass"], locations: ["山区湖泊"], timeRanges: [{ start: 600, end: 1900 }], difficulty: 50, basePrice: 100, bundleIds: ["lake-fish-bundle"] }),
  rod({ id: "lava-eel", name: "岩浆鳗鱼", image: "Lava_Eel", aliases: ["Lava Eel"], locations: ["矿井100层", "火山口"], difficulty: 90, basePrice: 700 }),
  rod({ id: "lingcod", name: "蛇齿单线鱼", image: "Lingcod", aliases: ["Lingcod"], seasons: ["冬季"], locations: ["小镇河流", "森林河流", "山区湖泊"], difficulty: 85, basePrice: 120 }),
  rod({ id: "lionfish", name: "狮子鱼", image: "Lionfish", aliases: ["Lionfish"], locations: ["姜岛海洋"], difficulty: 50, behavior: "平滑型", basePrice: 100 }),
  rod({ id: "midnight-carp", name: "午夜鲤鱼", image: "Midnight_Carp", aliases: ["Midnight Carp"], seasons: ["秋季", "冬季"], locations: ["山区湖泊", "煤矿森林池塘", "姜岛河流"], timeRanges: [{ start: 2200, end: 2600 }], difficulty: 55, basePrice: 150 }),
  rod({ id: "octopus", name: "章鱼", image: "Octopus", aliases: ["Octopus"], seasons: ["夏季"], locations: ["海洋"], timeRanges: [{ start: 600, end: 1300 }], difficulty: 95, behavior: "下沉型", basePrice: 150 }),
  rod({ id: "perch", name: "河鲈", image: "Perch", aliases: ["Perch"], seasons: ["冬季"], locations: ["小镇河流", "森林河流", "山区湖泊", "煤矿森林池塘"], difficulty: 35, basePrice: 55 }),
  rod({ id: "pike", name: "狗鱼", image: "Pike", aliases: ["Pike"], seasons: ["夏季", "冬季"], locations: ["小镇河流", "森林河流", "煤矿森林池塘"], difficulty: 60, behavior: "急冲型", basePrice: 100 }),
  rod({ id: "pufferfish", name: "河豚", image: "Pufferfish", aliases: ["Pufferfish"], seasons: ["夏季"], locations: ["海洋", "姜岛海洋"], weather: ["晴天"], timeRanges: [{ start: 1200, end: 1600 }], difficulty: 80, behavior: "上浮型", basePrice: 200, bundleIds: ["specialty-fish-bundle"] }),
  rod({ id: "rainbow-trout", name: "虹鳟鱼", image: "Rainbow_Trout", aliases: ["Rainbow Trout"], seasons: ["夏季"], locations: ["小镇河流", "森林河流", "山区湖泊"], weather: ["晴天"], timeRanges: [{ start: 600, end: 1900 }], difficulty: 45, basePrice: 65 }),
  rod({ id: "red-mullet", name: "红鲻鱼", image: "Red_Mullet", aliases: ["Red Mullet"], seasons: ["夏季", "冬季"], locations: ["海洋"], timeRanges: [{ start: 600, end: 1900 }], difficulty: 55, behavior: "平滑型", basePrice: 75 }),
  rod({ id: "red-snapper", name: "红鲷鱼", image: "Red_Snapper", aliases: ["Red Snapper"], seasons: ["夏季", "秋季"], locations: ["海洋"], weather: ["雨天"], timeRanges: [{ start: 600, end: 1900 }], difficulty: 40, basePrice: 50, bundleIds: ["ocean-fish-bundle"] }),
  rod({ id: "salmon", name: "鲑鱼", image: "Salmon", aliases: ["Salmon"], seasons: ["秋季"], locations: ["小镇河流", "森林河流"], timeRanges: [{ start: 600, end: 1900 }], difficulty: 50, basePrice: 75 }),
  rod({ id: "sandfish", name: "沙鱼", image: "Sandfish", aliases: ["Sandfish"], locations: ["沙漠池塘"], timeRanges: [{ start: 600, end: 2000 }], difficulty: 65, basePrice: 75, bundleIds: ["specialty-fish-bundle"] }),
  rod({ id: "sardine", name: "沙丁鱼", image: "Sardine", aliases: ["Sardine"], seasons: ["春季", "秋季", "冬季"], locations: ["海洋"], timeRanges: [{ start: 600, end: 1900 }], difficulty: 30, behavior: "急冲型", basePrice: 40, bundleIds: ["ocean-fish-bundle"] }),
  rod({ id: "scorpion-carp", name: "蝎鲤鱼", image: "Scorpion_Carp", aliases: ["Scorpion Carp"], locations: ["沙漠池塘"], timeRanges: [{ start: 600, end: 2000 }], difficulty: 90, behavior: "急冲型", basePrice: 150 }),
  rod({ id: "sea-cucumber", name: "海参", image: "Sea_Cucumber", aliases: ["Sea Cucumber"], seasons: ["秋季", "冬季"], locations: ["海洋"], timeRanges: [{ start: 600, end: 1900 }], difficulty: 40, behavior: "下沉型", basePrice: 75 }),
  rod({ id: "shad", name: "西鲱", image: "Shad", aliases: ["Shad"], seasons: ["春季", "夏季", "秋季"], locations: ["小镇河流", "森林河流"], weather: ["雨天"], timeRanges: [{ start: 900, end: 2600 }], difficulty: 45, behavior: "平滑型", basePrice: 60, bundleIds: ["river-fish-bundle"] }),
  rod({ id: "slimejack", name: "史莱姆鱼", image: "Slimejack", aliases: ["Slimejack"], locations: ["突变虫穴"], difficulty: 55, behavior: "急冲型", basePrice: 100 }),
  rod({ id: "smallmouth-bass", name: "小嘴鲈鱼", image: "Smallmouth_Bass", aliases: ["Smallmouth Bass"], seasons: ["春季", "秋季"], locations: ["小镇河流", "森林池塘"], difficulty: 28, basePrice: 50 }),
  rod({ id: "squid", name: "鱿鱼", image: "Squid", aliases: ["Squid"], seasons: ["冬季"], locations: ["海洋"], timeRanges: [{ start: 1800, end: 2600 }], difficulty: 75, behavior: "下沉型", basePrice: 80 }),
  rod({ id: "stingray", name: "黄貂鱼", image: "Stingray", aliases: ["Stingray"], locations: ["海盗湾"], difficulty: 80, behavior: "下沉型", basePrice: 180 }),
  rod({ id: "stonefish", name: "石鱼", image: "Stonefish", aliases: ["Stonefish"], locations: ["矿井20层"], difficulty: 65, behavior: "下沉型", basePrice: 300 }),
  rod({ id: "sturgeon", name: "鲟鱼", image: "Sturgeon", aliases: ["Sturgeon"], seasons: ["夏季", "冬季"], locations: ["山区湖泊"], timeRanges: [{ start: 600, end: 1900 }], difficulty: 78, basePrice: 200, bundleIds: ["lake-fish-bundle"] }),
  rod({ id: "sunfish", name: "太阳鱼", image: "Sunfish", aliases: ["Sunfish"], seasons: ["春季", "夏季"], locations: ["小镇河流", "森林河流"], weather: ["晴天"], timeRanges: [{ start: 600, end: 1900 }], difficulty: 30, basePrice: 30, bundleIds: ["river-fish-bundle"] }),
  rod({ id: "super-cucumber", name: "大海参", image: "Super_Cucumber", aliases: ["Super Cucumber"], seasons: ["夏季", "秋季"], locations: ["海洋", "姜岛海洋"], timeRanges: [{ start: 1800, end: 2600 }], difficulty: 80, behavior: "下沉型", basePrice: 250 }),
  rod({ id: "tiger-trout", name: "虎纹鳟鱼", image: "Tiger_Trout", aliases: ["Tiger Trout"], seasons: ["秋季", "冬季"], locations: ["小镇河流", "森林河流"], timeRanges: [{ start: 600, end: 1900 }], difficulty: 60, behavior: "急冲型", basePrice: 150, bundleIds: ["river-fish-bundle"] }),
  rod({ id: "tilapia", name: "罗非鱼", image: "Tilapia", aliases: ["Tilapia"], seasons: ["夏季", "秋季"], locations: ["海洋", "姜岛河流"], timeRanges: [{ start: 600, end: 1400 }], difficulty: 52, basePrice: 75, bundleIds: ["ocean-fish-bundle"] }),
  rod({ id: "tuna", name: "金枪鱼", image: "Tuna", aliases: ["Tuna"], seasons: ["夏季", "冬季"], locations: ["海洋", "姜岛海洋"], timeRanges: [{ start: 600, end: 1900 }], difficulty: 70, behavior: "平滑型", basePrice: 100, bundleIds: ["ocean-fish-bundle"] }),
  rod({ id: "void-salmon", name: "虚空鲑鱼", image: "Void_Salmon", aliases: ["Void Salmon"], locations: ["女巫沼泽"], difficulty: 80, basePrice: 150 }),
  rod({ id: "walleye", name: "大眼鱼", image: "Walleye", aliases: ["Walleye"], seasons: ["秋季"], locations: ["小镇河流", "森林河流", "山区湖泊", "煤矿森林池塘"], weather: ["雨天"], timeRanges: [{ start: 1200, end: 2600 }], difficulty: 45, behavior: "平滑型", basePrice: 105, bundleIds: ["night-fishing-bundle"] }),
  rod({ id: "woodskip", name: "木跃鱼", image: "Woodskip", aliases: ["Woodskip"], locations: ["秘密森林池塘", "森林农场池塘"], difficulty: 50, basePrice: 75, bundleIds: ["specialty-fish-bundle"] }),

  rod({ id: "angler", name: "鮟鱇鱼", image: "Angler", aliases: ["Angler"], seasons: ["秋季"], locations: ["小镇河流木板桥"], difficulty: 85, behavior: "平滑型", basePrice: 900, category: "传奇" }),
  rod({ id: "crimsonfish", name: "绯红鱼", image: "Crimsonfish", aliases: ["Crimsonfish"], seasons: ["夏季"], locations: ["东码头"], difficulty: 95, basePrice: 1500, category: "传奇" }),
  rod({ id: "glacierfish", name: "冰川鱼", image: "Glacierfish", aliases: ["Glacierfish"], seasons: ["冬季"], locations: ["箭头岛"], difficulty: 100, basePrice: 1000, category: "传奇" }),
  rod({ id: "legend", name: "传说之鱼", image: "Legend", aliases: ["Legend"], seasons: ["春季"], locations: ["山区湖泊原木旁"], weather: ["雨天"], difficulty: 110, basePrice: 5000, category: "传奇" }),
  rod({ id: "mutant-carp", name: "变种鲤鱼", image: "Mutant_Carp", aliases: ["Mutant Carp"], locations: ["下水道"], difficulty: 80, behavior: "急冲型", basePrice: 1000, category: "传奇" }),
  rod({ id: "ms-angler", name: "雌鮟鱇鱼", image: "Ms._Angler", aliases: ["Ms. Angler"], locations: ["小镇河流木板桥"], difficulty: 85, behavior: "平滑型", basePrice: 900, category: "传奇", notes: "仅在齐先生“大家族”任务期间出现。" }),
  rod({ id: "son-of-crimsonfish", name: "绯红鱼之子", image: "Son_of_Crimsonfish", aliases: ["Son of Crimsonfish"], locations: ["东码头"], difficulty: 95, basePrice: 1500, category: "传奇", notes: "仅在齐先生“大家族”任务期间出现。" }),
  rod({ id: "glacierfish-jr", name: "小冰川鱼", image: "Glacierfish_Jr.", aliases: ["Glacierfish Jr."], locations: ["箭头岛"], difficulty: 100, basePrice: 1000, category: "传奇", notes: "仅在齐先生“大家族”任务期间出现。" }),
  rod({ id: "legend-ii", name: "传说之鱼二代", image: "Legend_II", aliases: ["Legend II"], locations: ["山区湖泊原木旁"], difficulty: 110, basePrice: 5000, category: "传奇", notes: "仅在齐先生“大家族”任务期间出现。" }),
  rod({ id: "radioactive-carp", name: "放射性鲤鱼", image: "Radioactive_Carp", aliases: ["Radioactive Carp"], locations: ["下水道"], difficulty: 80, behavior: "急冲型", basePrice: 1000, category: "传奇", notes: "仅在齐先生“大家族”任务期间出现。" }),

  special({ id: "blobfish", name: "水滴鱼", image: "Blobfish", aliases: ["Blobfish"], seasons: ["冬季"], locations: ["夜市潜水艇"], timeRanges: [{ start: 1700, end: 2600 }], difficulty: 75, behavior: "上浮型", basePrice: 500 }),
  special({ id: "midnight-squid", name: "午夜鱿鱼", image: "Midnight_Squid", aliases: ["Midnight Squid"], seasons: ["冬季"], locations: ["夜市潜水艇"], timeRanges: [{ start: 1700, end: 2600 }], difficulty: 55, behavior: "下沉型", basePrice: 100 }),
  special({ id: "spook-fish", name: "幽灵鱼", image: "Spook_Fish", aliases: ["Spook Fish"], seasons: ["冬季"], locations: ["夜市潜水艇"], timeRanges: [{ start: 1700, end: 2600 }], difficulty: 60, behavior: "急冲型", basePrice: 220 }),

  crab({ id: "lobster", name: "龙虾", image: "Lobster", aliases: ["Lobster"], locations: ["海水"], basePrice: 120 }),
  crab({ id: "crab", name: "螃蟹", image: "Crab", aliases: ["Crab"], locations: ["海水", "矿井岩石蟹"], basePrice: 100 }),
  crab({ id: "cockle", name: "鸟蛤", image: "Cockle", aliases: ["Cockle"], locations: ["海水"], basePrice: 50 }),
  crab({ id: "mussel", name: "蚌", image: "Mussel", aliases: ["Mussel"], locations: ["海水"], basePrice: 30 }),
  crab({ id: "shrimp", name: "虾", image: "Shrimp", aliases: ["Shrimp"], locations: ["海水"], basePrice: 60 }),
  crab({ id: "snail", name: "蜗牛", image: "Snail", aliases: ["Snail"], locations: ["淡水"], basePrice: 65 }),
  crab({ id: "periwinkle", name: "玉黍螺", image: "Periwinkle", aliases: ["Periwinkle"], locations: ["淡水"], basePrice: 20 }),
  crab({ id: "crayfish", name: "小龙虾", image: "Crayfish", aliases: ["Crayfish"], locations: ["淡水"], basePrice: 75 }),
  crab({ id: "oyster", name: "牡蛎", image: "Oyster", aliases: ["Oyster"], locations: ["海水"], basePrice: 40 }),
  crab({ id: "clam", name: "蛤", image: "Clam", aliases: ["Clam"], locations: ["海水"], basePrice: 50 })
];
