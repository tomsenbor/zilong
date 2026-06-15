const icons = {
  forage: "/assets/game/36px-Bundle_Green.png",
  farming: "/assets/game/36px-Farming_Skill_Icon.png",
  fishing: "/assets/game/36px-Fishing_Skill_Icon.png",
  mining: "/assets/game/36px-Mining.png",
  artisan: "/assets/game/36px-Bundle_Purple.png",
  vault: "/assets/game/18px-Gold.png",
  missing: "/assets/game/36px-Prismatic_Shard.png"
};

const asset = (name, size = 36) => `/assets/game/${size}px-${name}.png`;

const itemAssetNames = {
  "wild-horseradish": "Wild_Horseradish",
  daffodil: "Daffodil",
  leek: "Leek",
  dandelion: "Dandelion",
  "spice-berry": "Spice_Berry",
  "sweet-pea": "Sweet_Pea",
  "common-mushroom": "Common_Mushroom",
  "wild-plum": "Wild_Plum",
  hazelnut: "Hazelnut",
  blackberry: "Blackberry",
  "winter-root": "Winter_Root",
  "crystal-fruit": "Crystal_Fruit",
  "snow-yam": "Snow_Yam",
  crocus: "Crocus",
  "wood-1": "Wood",
  "wood-2": "Wood",
  hardwood: "Hardwood",
  coconut: "Coconut",
  "cave-carrot": "Cave_Carrot",
  "red-mushroom": "Red_Mushroom",
  "purple-mushroom": "Purple_Mushroom",
  "oak-resin": "Oak_Resin",
  "pine-tar": "Pine_Tar",
  morel: "Morel",
  "large-milk": "Large_Milk",
  "large-brown-egg": "Large_Brown_Egg",
  "large-white-egg": "Large_White_Egg",
  "large-goat-milk": "Large_Goat_Milk",
  wool: "Wool",
  "duck-egg": "Duck_Egg",
  "truffle-oil": "Truffle_Oil",
  cloth: "Cloth",
  "goat-cheese": "Goat_Cheese",
  cheese: "Cheese",
  honey: "Honey",
  jelly: "Jelly",
  apple: "Apple",
  apricot: "Apricot",
  orange: "Orange",
  peach: "Peach",
  pomegranate: "Pomegranate",
  cherry: "Cherry",
  "copper-bar": "Copper_Bar",
  quartz: "Quartz",
  "earth-crystal": "Earth_Crystal",
  "frozen-tear": "Frozen_Tear",
  "fire-quartz": "Fire_Quartz",
  slime: "Slime",
  "bat-wing": "Bat_Wing",
  "solar-essence": "Solar_Essence",
  "void-essence": "Void_Essence",
  "fiddlehead-fern": "Fiddlehead_Fern",
  truffle: "Truffle",
  "fried-egg": "Fried_Egg",
  "sea-urchin": "Sea_Urchin",
  "duck-feather": "Duck_Feather",
  "nautilus-shell": "Nautilus_Shell",
  hay: "Hay",
  wine: "Wine",
  "rabbits-foot": "Rabbit's_Foot",
  "silver-wine": "Wine",
  "dinosaur-mayonnaise": "Dinosaur_Mayonnaise",
  caviar: "Caviar"
};

function item(id, name, {
  quantity = 1,
  quality = null,
  image = null,
  seasons = [],
  source
} = {}) {
  const itemImage = itemAssetNames[id] ? asset(itemAssetNames[id]) : image;
  if (!itemImage) throw new Error(`Missing community-center icon mapping: ${id}`);
  return { id, name, quantity, quality, image: itemImage, seasons, source };
}

function bundle(id, name, reward, items, requiredCount = items.length) {
  return { id, name, reward, requiredCount, items };
}

export const communityCenter = [
  {
    id: "crafts-room",
    name: "工艺室",
    image: asset("Bundle_Green"),
    reward: "修复矿区桥梁，开放采石场",
    bundles: [
      bundle("spring-foraging-bundle", "春季采集收集包", "30 个春季种子", [
        item("wild-horseradish", "野山葵", { seasons: ["春季"], source: "春季采集" }),
        item("daffodil", "黄水仙", { seasons: ["春季"], source: "春季采集" }),
        item("leek", "韭葱", { seasons: ["春季"], source: "春季采集" }),
        item("dandelion", "蒲公英", { seasons: ["春季"], source: "春季采集" })
      ]),
      bundle("summer-foraging-bundle", "夏季采集收集包", "30 个夏季种子", [
        item("grape", "葡萄", { image: asset("Grape"), seasons: ["夏季"], source: "夏季采集" }),
        item("spice-berry", "香味浆果", { seasons: ["夏季"], source: "夏季采集" }),
        item("sweet-pea", "甜豌豆", { seasons: ["夏季"], source: "夏季采集" })
      ]),
      bundle("fall-foraging-bundle", "秋季采集收集包", "30 个秋季种子", [
        item("common-mushroom", "普通蘑菇", { seasons: ["秋季"], source: "秋季采集" }),
        item("wild-plum", "野梅", { seasons: ["秋季"], source: "秋季采集" }),
        item("hazelnut", "榛子", { seasons: ["秋季"], source: "秋季采集" }),
        item("blackberry", "黑莓", { seasons: ["秋季"], source: "秋季采集" })
      ]),
      bundle("winter-foraging-bundle", "冬季采集收集包", "30 个冬季种子", [
        item("winter-root", "冬根", { seasons: ["冬季"], source: "冬季挖掘与采集" }),
        item("crystal-fruit", "水晶果", { seasons: ["冬季"], source: "冬季采集" }),
        item("snow-yam", "雪山药", { seasons: ["冬季"], source: "冬季挖掘" }),
        item("crocus", "番红花", { seasons: ["冬季"], source: "冬季采集" })
      ]),
      bundle("construction-bundle", "建筑收集包", "1 个煤炭窑", [
        item("wood-1", "木材", { quantity: 99, source: "砍树" }),
        item("wood-2", "木材", { quantity: 99, source: "砍树" }),
        item("stone", "石头", { quantity: 99, image: asset("Stone"), source: "采矿" }),
        item("hardwood", "硬木", { quantity: 10, source: "大树桩与秘密森林" })
      ]),
      bundle("exotic-foraging-bundle", "异国情调采集收集包", "5 份秋日恩赐", [
        item("coconut", "椰子", { source: "沙漠与姜岛" }),
        item("cactus-fruit", "仙人掌果子", { image: asset("Cactus_Fruit"), source: "沙漠采集" }),
        item("cave-carrot", "山洞萝卜", { source: "矿井木箱与挖掘" }),
        item("red-mushroom", "红蘑菇", { source: "矿井与秘密森林" }),
        item("purple-mushroom", "紫蘑菇", { source: "矿井深层" }),
        item("maple-syrup", "枫糖浆", { image: asset("Maple_Syrup"), source: "枫树树液采集器" }),
        item("oak-resin", "橡树树脂", { source: "橡树树液采集器" }),
        item("pine-tar", "松焦油", { source: "松树树液采集器" }),
        item("morel", "羊肚菌", { seasons: ["春季"], source: "秘密森林与蘑菇洞" })
      ], 5)
    ]
  },
  {
    id: "pantry",
    name: "茶水间",
    image: asset("Bundle_Green"),
    reward: "修复温室",
    bundles: [
      bundle("spring-crops-bundle", "春季作物收集包", "20 个生长激素", [
        item("parsnip", "防风草", { image: asset("Parsnip"), seasons: ["春季"], source: "种植" }),
        item("green-bean", "青豆", { image: asset("Green_Bean"), seasons: ["春季"], source: "种植" }),
        item("cauliflower", "花椰菜", { image: asset("Cauliflower"), seasons: ["春季"], source: "种植" }),
        item("potato", "土豆", { image: asset("Potato"), seasons: ["春季"], source: "种植" })
      ]),
      bundle("summer-crops-bundle", "夏季作物收集包", "1 个优质洒水器", [
        item("tomato", "西红柿", { image: asset("Tomato"), seasons: ["夏季"], source: "种植" }),
        item("hot-pepper", "辣椒", { image: asset("Hot_Pepper"), seasons: ["夏季"], source: "种植" }),
        item("blueberry", "蓝莓", { image: asset("Blueberry"), seasons: ["夏季"], source: "种植" }),
        item("melon", "甜瓜", { image: asset("Melon"), seasons: ["夏季"], source: "种植" })
      ]),
      bundle("fall-crops-bundle", "秋季作物收集包", "1 个蜂房", [
        item("corn", "玉米", { image: asset("Corn"), seasons: ["夏季", "秋季"], source: "种植" }),
        item("eggplant", "茄子", { image: asset("Eggplant"), seasons: ["秋季"], source: "种植" }),
        item("pumpkin", "南瓜", { image: asset("Pumpkin"), seasons: ["秋季"], source: "种植" }),
        item("yam", "山药", { image: asset("Yam"), seasons: ["秋季"], source: "种植" })
      ]),
      bundle("quality-crops-bundle", "品质作物收集包", "1 个罐头瓶", [
        item("gold-parsnip", "防风草", { quantity: 5, quality: "金星", image: asset("Parsnip"), seasons: ["春季"], source: "种植" }),
        item("gold-melon", "甜瓜", { quantity: 5, quality: "金星", image: asset("Melon"), seasons: ["夏季"], source: "种植" }),
        item("gold-pumpkin", "南瓜", { quantity: 5, quality: "金星", image: asset("Pumpkin"), seasons: ["秋季"], source: "种植" }),
        item("gold-corn", "玉米", { quantity: 5, quality: "金星", image: asset("Corn"), seasons: ["夏季", "秋季"], source: "种植" })
      ], 3),
      bundle("animal-bundle", "动物制品收集包", "1 个奶酪机", [
        item("large-milk", "大壶牛奶", { source: "高好感奶牛", image: icons.farming }),
        item("large-brown-egg", "大棕色鸡蛋", { source: "高好感棕色鸡", image: icons.farming }),
        item("large-white-egg", "大白色鸡蛋", { source: "高好感白色鸡", image: icons.farming }),
        item("large-goat-milk", "大壶羊奶", { source: "高好感山羊", image: icons.farming }),
        item("wool", "动物毛", { source: "绵羊与兔子", image: icons.farming }),
        item("duck-egg", "鸭蛋", { source: "鸭", image: icons.farming })
      ], 5),
      bundle("artisan-bundle", "工匠物品收集包", "1 个小桶", [
        item("truffle-oil", "松露油", { source: "产油机", image: icons.artisan }),
        item("cloth", "布料", { source: "织布机", image: icons.artisan }),
        item("goat-cheese", "山羊奶酪", { source: "奶酪机", image: icons.artisan }),
        item("cheese", "奶酪", { source: "奶酪机", image: icons.artisan }),
        item("honey", "蜂蜜", { source: "蜂房", image: icons.artisan }),
        item("jelly", "果酱", { source: "罐头瓶", image: icons.artisan }),
        item("apple", "苹果", { seasons: ["秋季"], source: "苹果树", image: icons.artisan }),
        item("apricot", "杏子", { seasons: ["春季"], source: "杏树", image: icons.artisan }),
        item("orange", "橙子", { seasons: ["夏季"], source: "橙子树", image: icons.artisan }),
        item("peach", "桃子", { seasons: ["夏季"], source: "桃树", image: icons.artisan }),
        item("pomegranate", "石榴", { seasons: ["秋季"], source: "石榴树", image: icons.artisan }),
        item("cherry", "樱桃", { seasons: ["春季"], source: "樱桃树", image: icons.artisan })
      ], 6)
    ]
  },
  {
    id: "fish-tank",
    name: "鱼缸",
    image: asset("Bundle_Blue"),
    reward: "移除矿区入口左侧闪光巨石",
    bundles: [
      bundle("river-fish-bundle", "河鱼收集包", "30 个高级鱼饵", [
        item("sunfish", "太阳鱼", { image: asset("Sunfish"), seasons: ["春季", "夏季"], source: "河流，晴天06:00-19:00" }),
        item("catfish", "鲶鱼", { image: asset("Catfish"), seasons: ["春季", "秋季"], source: "河流，雨天06:00-24:00" }),
        item("shad", "西鲱", { image: asset("Shad"), seasons: ["春季", "夏季", "秋季"], source: "河流，雨天09:00-02:00" }),
        item("tiger-trout", "虎纹鳟鱼", { image: asset("Tiger_Trout"), seasons: ["秋季", "冬季"], source: "河流06:00-19:00" })
      ]),
      bundle("lake-fish-bundle", "湖鱼收集包", "1 个精装旋式鱼饵", [
        item("largemouth-bass", "大嘴鲈鱼", { image: asset("Largemouth_Bass"), seasons: ["春季", "夏季", "秋季", "冬季"], source: "山区湖泊06:00-19:00" }),
        item("carp", "鲤鱼", { image: asset("Carp"), seasons: ["春季", "夏季", "秋季", "冬季"], source: "山区湖泊" }),
        item("bullhead", "大头鱼", { image: asset("Bullhead"), seasons: ["春季", "夏季", "秋季", "冬季"], source: "山区湖泊" }),
        item("sturgeon", "鲟鱼", { image: asset("Sturgeon"), seasons: ["夏季", "冬季"], source: "山区湖泊06:00-19:00" })
      ]),
      bundle("ocean-fish-bundle", "海鱼收集包", "5 个海滩传送图腾", [
        item("sardine", "沙丁鱼", { image: asset("Sardine"), seasons: ["春季", "秋季", "冬季"], source: "海洋06:00-19:00" }),
        item("tuna", "金枪鱼", { image: asset("Tuna"), seasons: ["夏季", "冬季"], source: "海洋06:00-19:00" }),
        item("red-snapper", "红鲷鱼", { image: asset("Red_Snapper"), seasons: ["夏季", "秋季"], source: "海洋，雨天06:00-19:00" }),
        item("tilapia", "罗非鱼", { image: asset("Tilapia"), seasons: ["夏季", "秋季"], source: "海洋06:00-14:00" })
      ]),
      bundle("night-fishing-bundle", "夜间垂钓收集包", "1 个小型光辉戒指", [
        item("walleye", "大眼鱼", { image: asset("Walleye"), seasons: ["秋季"], source: "雨天12:00-02:00" }),
        item("bream", "鲷鱼", { image: asset("Bream"), seasons: ["春季", "夏季", "秋季", "冬季"], source: "河流18:00-02:00" }),
        item("eel", "鳗鱼", { image: asset("Eel"), seasons: ["春季", "秋季"], source: "海洋，雨天16:00-02:00" })
      ]),
      bundle("crab-pot-bundle", "蟹笼收集包", "3 个蟹笼", [
        item("lobster", "龙虾", { image: asset("Lobster"), source: "海水蟹笼" }),
        item("crayfish", "小龙虾", { image: asset("Crayfish"), source: "淡水蟹笼" }),
        item("crab", "螃蟹", { image: asset("Crab"), source: "海水蟹笼或岩石蟹" }),
        item("cockle", "鸟蛤", { image: asset("Cockle"), source: "海水蟹笼或海滩" }),
        item("mussel", "蚌", { image: asset("Mussel"), source: "海水蟹笼或海滩" }),
        item("shrimp", "虾", { image: asset("Shrimp"), source: "海水蟹笼" }),
        item("snail", "蜗牛", { image: asset("Snail"), source: "淡水蟹笼" }),
        item("periwinkle", "玉黍螺", { image: asset("Periwinkle"), source: "淡水蟹笼" }),
        item("oyster", "牡蛎", { image: asset("Oyster"), source: "海水蟹笼或海滩" }),
        item("clam", "蛤", { image: asset("Clam"), source: "海水蟹笼或海滩" })
      ], 5),
      bundle("specialty-fish-bundle", "特色鱼类收集包", "5 份海之菜肴", [
        item("pufferfish", "河豚", { image: asset("Pufferfish"), seasons: ["夏季"], source: "海洋，晴天12:00-16:00" }),
        item("ghostfish", "幽灵鱼", { image: asset("Ghostfish"), source: "矿井20层或60层" }),
        item("sandfish", "沙鱼", { image: asset("Sandfish"), source: "沙漠池塘06:00-20:00" }),
        item("woodskip", "木跃鱼", { image: asset("Woodskip"), source: "秘密森林池塘" })
      ])
    ]
  },
  {
    id: "boiler-room",
    name: "锅炉房",
    image: asset("Bundle_Red"),
    reward: "修复矿车系统",
    bundles: [
      bundle("blacksmith-bundle", "铁匠收集包", "1 个熔炉", [
        item("copper-bar", "铜锭", { source: "熔炼铜矿", image: icons.mining }),
        item("iron-bar", "铁锭", { image: asset("Iron_Bar"), source: "熔炼铁矿" }),
        item("gold-bar", "金锭", { image: asset("Gold_Bar"), source: "熔炼金矿" })
      ]),
      bundle("geologist-bundle", "地质学家收集包", "5 个万象晶球", [
        item("quartz", "石英", { source: "矿井", image: icons.mining }),
        item("earth-crystal", "地晶", { source: "矿井1-39层", image: icons.mining }),
        item("frozen-tear", "泪晶", { source: "矿井40-79层", image: icons.mining }),
        item("fire-quartz", "火水晶", { source: "矿井80层以后", image: icons.mining })
      ]),
      bundle("adventurer-bundle", "冒险家收集包", "1 个小型磁铁戒指", [
        item("slime", "史莱姆泥", { quantity: 99, source: "史莱姆", image: icons.mining }),
        item("bat-wing", "蝙蝠翅膀", { quantity: 10, source: "蝙蝠", image: icons.mining }),
        item("solar-essence", "太阳精华", { source: "幽灵与木乃伊等", image: icons.mining }),
        item("void-essence", "虚空精华", { source: "暗影怪物与飞蛇等", image: icons.mining })
      ], 2)
    ]
  },
  {
    id: "bulletin-board",
    name: "公告栏",
    image: asset("Bundle_Purple"),
    reward: "所有非单身村民提升两心好感",
    bundles: [
      bundle("chef-bundle", "厨师收集包", "3 个粉红蛋糕", [
        item("maple-syrup", "枫糖浆", { image: asset("Maple_Syrup"), source: "枫树树液采集器" }),
        item("fiddlehead-fern", "蕨菜", { seasons: ["夏季"], source: "秘密森林采集", image: icons.artisan }),
        item("truffle", "松露", { source: "成年猪", image: icons.artisan }),
        item("poppy", "虞美人", { image: asset("Poppy"), seasons: ["夏季"], source: "种植" }),
        item("maki-roll", "生鱼寿司", { image: asset("Maki_Roll"), source: "烹饪" }),
        item("fried-egg", "煎蛋", { source: "烹饪", image: icons.artisan })
      ]),
      bundle("dye-bundle", "染料收集包", "1 台种子生产器", [
        item("red-mushroom", "红蘑菇", { source: "矿井与秘密森林", image: icons.artisan }),
        item("sea-urchin", "海胆", { source: "海滩东侧", image: icons.artisan }),
        item("sunflower", "向日葵", { image: asset("Sunflower"), seasons: ["夏季", "秋季"], source: "种植" }),
        item("duck-feather", "鸭毛", { source: "高好感鸭", image: icons.artisan }),
        item("aquamarine", "海蓝宝石", { image: asset("Aquamarine"), source: "矿井" }),
        item("red-cabbage", "红叶卷心菜", { image: asset("Red_Cabbage"), seasons: ["夏季"], source: "种植" })
      ]),
      bundle("field-research-bundle", "实地研究收集包", "1 台回收机", [
        item("purple-mushroom", "紫蘑菇", { source: "矿井深层", image: icons.artisan }),
        item("nautilus-shell", "鹦鹉螺", { seasons: ["冬季"], source: "海滩采集", image: icons.artisan }),
        item("chub", "鲢鱼", { image: asset("Chub"), source: "河流或山区湖泊" }),
        item("frozen-geode", "冰封晶球", { image: asset("Frozen_Geode"), source: "矿井40-79层" })
      ]),
      bundle("fodder-bundle", "饲料收集包", "1 台加热器", [
        item("wheat", "小麦", { quantity: 10, image: asset("Wheat"), seasons: ["夏季", "秋季"], source: "种植" }),
        item("hay", "干草", { quantity: 10, source: "筒仓或玛妮商店", image: icons.artisan }),
        item("apple", "苹果", { quantity: 3, seasons: ["秋季"], source: "苹果树", image: icons.artisan })
      ]),
      bundle("enchanter-bundle", "魔法师收集包", "5 个金锭", [
        item("oak-resin", "橡树树脂", { source: "橡树树液采集器", image: icons.artisan }),
        item("wine", "果酒", { source: "小桶", image: icons.artisan }),
        item("rabbits-foot", "兔子的脚", { source: "高好感兔子", image: icons.artisan }),
        item("pomegranate", "石榴", { seasons: ["秋季"], source: "石榴树", image: icons.artisan })
      ])
    ]
  },
  {
    id: "vault",
    name: "金库",
    image: asset("Bundle_Teal"),
    reward: "修复前往沙漠的巴士",
    bundles: [
      bundle("vault-2500-bundle", "2,500 金收集包", "3 个巧克力蛋糕", [
        item("gold-2500", "2,500 金", { quantity: 2500, source: "捐款", image: icons.vault })
      ]),
      bundle("vault-5000-bundle", "5,000 金收集包", "30 个优质肥料", [
        item("gold-5000", "5,000 金", { quantity: 5000, source: "捐款", image: icons.vault })
      ]),
      bundle("vault-10000-bundle", "10,000 金收集包", "1 个避雷针", [
        item("gold-10000", "10,000 金", { quantity: 10000, source: "捐款", image: icons.vault })
      ]),
      bundle("vault-25000-bundle", "25,000 金收集包", "1 个宝石复制机", [
        item("gold-25000", "25,000 金", { quantity: 25000, source: "捐款", image: icons.vault })
      ])
    ]
  },
  {
    id: "missing-bundle",
    name: "遗失的收集包",
    image: icons.missing,
    reward: "将废弃 Joja 超市改建为电影院",
    bundles: [
      bundle("missing-bundle-items", "遗失的收集包", "电影院", [
        item("silver-wine", "果酒", { quality: "银星", source: "小桶与木桶陈酿", image: icons.missing }),
        item("dinosaur-mayonnaise", "恐龙蛋黄酱", { source: "恐龙蛋放入蛋黄酱机", image: icons.missing }),
        item("prismatic-shard", "五彩碎片", { image: asset("Prismatic_Shard"), source: "矿洞、骷髅洞穴等" }),
        item("gold-ancient-fruit", "远古水果", { quantity: 5, quality: "金星", image: asset("Ancient_Fruit"), source: "种植" }),
        item("gold-void-salmon", "虚空鲑鱼", { quality: "金星", image: asset("Void_Salmon"), source: "女巫沼泽" }),
        item("caviar", "鱼子酱", { source: "鲟鱼鱼籽放入罐头瓶", image: icons.missing })
      ], 5)
    ]
  }
];
