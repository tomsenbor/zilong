const split = (value) => value.split("|").map((part) => part.trim());
const rows = (dataset, text) =>
  text.trim().split("\n").map((line) => {
    const [name, summary, image, attributes = ""] = line.trim().split(";");
    return {
      dataset,
      name,
      summary,
      image: image ? `/assets/game/${image}` : "",
      attributes: Object.fromEntries(
        attributes.split(",").filter(Boolean).map((pair) => {
          const [key, value] = pair.split("=");
          return [key, value?.includes("|") ? split(value) : value];
        })
      )
    };
  });

export const datasets = [
  { name: "作物与种子", slug: "crops", icon: "36px-Farming_Skill_Icon.png", description: "季节、成熟时间、售价与收益速查", fields: ["season", "days", "sellPrice", "source"] },
  { name: "鱼类图鉴", slug: "fish", icon: "36px-Fishing_Skill_Icon.png", description: "时间、天气、地点与难度", fields: ["season", "location", "weather", "time"] },
  { name: "村民关系", slug: "villagers", icon: "32px-HeartIconLarge.png", description: "生日、住址与礼物喜好", fields: ["birthday", "address", "loves"] },
  { name: "料理配方", slug: "cooking", icon: "44px-Cooking_Channel.png", description: "配方来源、材料和增益", fields: ["source", "ingredients", "energy"] },
  { name: "物品百科", slug: "items", icon: "36px-Iridium_Ore.png", description: "资源、矿物、工匠品与装备", fields: ["type", "source", "sellPrice"] },
  { name: "技能职业", slug: "skills", icon: "36px-Farming.png", description: "技能升级与职业路线", fields: ["skill", "level", "effect"] },
  { name: "任务指南", slug: "quests", icon: "28px-Quests_Icon.png", description: "主线、特别订单与齐先生任务", fields: ["type", "trigger", "reward"] },
  { name: "节日活动", slug: "festivals", icon: "36px-Pumpkin.png", description: "日期、地点和活动奖励", fields: ["season", "date", "location"] },
  { name: "地点地图", slug: "locations", icon: "36px-Golden_Walnut.png", description: "开放条件、营业时间与用途", fields: ["area", "open", "features"] },
  { name: "完整图鉴索引", slug: "catalog", icon: "36px-Prismatic_Shard.png", description: "根据本地素材生成的去重对象索引", fields: ["type", "assetName"] }
];

export const entries = [
  ...rows("crops", `
防风草;防风草是春季最稳的基础作物，成熟快且成本低，适合第一周练耕种等级、完成社区中心春季作物收集包，并为品质作物包准备金星样本。它不是暴利作物，但能让新手用很低风险熟悉播种、浇水和收获节奏。;36px-Parsnip.png;season=春季,days=4,sellPrice=35金,source=皮埃尔杂货店,获取方式=春季从皮埃尔杂货店购买种子后种植，第一年开局也会获得少量种子。成熟周期短，适合用来快速回笼现金和提升耕种等级,主要用途=用于社区中心春季作物收集包，金星样本可服务品质作物包，也能作为潘姆喜欢的礼物。前期多余防风草可以出售补充种子和背包资金,新手建议=至少保留一份普通品质用于献祭，再保留若干高品质样本。不要第一天全部卖掉，尤其是准备做社区中心路线的存档,关联规划=适合低成本铺开农田并测试洒水器覆盖范围，也适合和土豆、花椰菜、草莓一起比较春季现金流,links=/tools/crop-profit|/guides/year-one-spring-money-route|/tools/community-center|/wiki/crops
土豆;土豆是第一年春季现金周转作物，成熟时间适中且有额外产出概率。它不如草莓爆发高，但更早可种、风险更低，适合在复活节前补充背包、矿洞和草莓本金。;36px-Potato.png;season=春季,days=6,sellPrice=80金,source=皮埃尔杂货店,获取方式=春季从皮埃尔杂货店购买种子后种植，成熟后有机会额外产出。它的播种窗口比草莓更早，适合作为春季前半段的现金桥梁,主要用途=用于春季作物收集包，早期出售可补充背包、鱼竿、矿洞食物和复活节草莓本金。也适合练耕种等级,新手建议=第一周可以种一小片土豆，但不要把全部资金压进去。保留一份用于社区中心，其余根据现金需求出售,关联规划=适合和防风草、花椰菜、草莓一起用收益计算器比较播种日期与剩余季节天数,links=/tools/crop-profit|/guides/year-one-spring-money-route|/guides/crop-profit-calculator-guide|/wiki/crops
花椰菜;花椰菜是春季单次售价较高的作物，成熟较慢但适合做春季作物收集包和巨大作物布局。第一年建议小片种植，既能补献祭，也能在草莓前后提供一笔稳定收入。;36px-Cauliflower.png;season=春季,days=12,sellPrice=175金,source=皮埃尔杂货店,获取方式=春季从皮埃尔杂货店购买种子后种植。成熟周期较长，播种前要确认春季剩余天数，避免月底来不及收获,主要用途=用于社区中心春季作物收集包，也可作为春季高价值出售作物。合适布局下有机会形成巨大作物，适合保留一片三乘三地块尝试,新手建议=第一年不要只看单价就大面积种植。建议至少保留一份普通品质用于献祭，其余根据资金需求出售,关联规划=适合和防风草、土豆、草莓一起比较春季现金流，决定复活节前保留多少本金,links=/tools/crop-profit|/guides/year-one-spring-money-route|/tools/community-center|/wiki/crops
草莓;草莓是复活节后最常见的春季爆发作物，种子购买窗口短，越早种越能发挥重复收获优势。第一年不必盲目满田，优先保证每天能浇完，并把第一批收入转化为背包、工具和夏季启动资金。;36px-Strawberry.png;season=春季,days=8,sellPrice=120金,source=复活节,获取方式=春季13日复活节商店购买草莓种子后种植。第一年购买时间偏晚，节日前提前翻地和准备稻草人能减少浪费,主要用途=用于春季现金流，后续可通过种子生产器扩种，也能作为部分村民礼物。适合为夏季蓝莓、洒水器和背包升级积累本金,新手建议=第一年草莓数量以能稳定浇完为上限。不要为了追求收益把体力锁死，否则会拖慢钓鱼、下矿和社区中心进度,关联规划=草莓收益强依赖播种日和收获次数，建议在购买前用收益计算器估算地块规模,links=/tools/crop-profit|/guides/year-one-spring-money-route|/guides/crop-profit-calculator-guide|/wiki/crops
大黄;大黄是绿洲出售的春季高价值作物，通常要修复巴士后才稳定购买。它更适合第二年或已经解锁沙漠的存档，不是第一年春季开局必须追求的目标。;36px-Rhubarb.png;season=春季,days=13,sellPrice=220金,source=绿洲,获取方式=修复巴士后前往沙漠绿洲购买大黄种子，再于春季种植。它成熟时间较长，适合在春季前半段下种,主要用途=作为春季高价值现金作物，后续可进入加工路线。它不是社区中心新手前期的硬性卡点，更偏向中期收益规划,新手建议=第一年没有沙漠时不用强求。解锁绿洲后可用收益计算器比较大黄、草莓和花椰菜的播种窗口,关联规划=适合在第二年春季或温室作物规划中使用，和高价值作物加工路线一起评估,links=/tools/crop-profit|/guides/crop-profit-calculator-guide|/guides/greenhouse-crops-processing-route|/wiki/crops
青豆;青豆是春季藤架作物，成熟后可重复收获，但藤架会阻挡通行。它适合少量种植补社区中心和图鉴，不适合新手在没有规划通道时大面积铺开。;36px-Green_Bean.png;season=春季,days=10,sellPrice=40金,source=皮埃尔杂货店,获取方式=春季从皮埃尔杂货店购买青豆种子后种植。青豆属于藤架作物，种植时必须预留通道，否则会影响浇水和收获,主要用途=用于社区中心春季作物收集包，也可作为春季重复收获作物补充小额现金。料理和送礼需求不高，核心价值是献祭与图鉴,新手建议=建议第一年只种少量，至少保留一份用于献祭。不要把藤架放在农田中央阻断路线,关联规划=适合和社区中心清单一起检查春季作物缺口，也适合用收益计算器核对重复收获次数,links=/tools/community-center|/tools/crop-profit|/guides/year-one-spring-money-route|/wiki/crops
甘蓝菜;甘蓝菜是春季短周期蔬菜，成熟速度快，适合在复活节前后补充现金和耕种经验。它不属于社区中心春季作物核心需求，但能填补草莓种植前后的空档。;36px-Kale.png;season=春季,days=6,sellPrice=110金,source=皮埃尔杂货店,获取方式=春季从皮埃尔杂货店购买种子后种植。成熟周期较短，适合在春季中段或草莓资金不足时补种,主要用途=用于出售、练耕种等级和补充春季现金流。相比防风草更偏收益，相比花椰菜更灵活,新手建议=如果复活节前资金不足，可以少量种甘蓝菜过渡。不要为了它挤掉社区中心必需作物的样本,关联规划=适合和春季赚钱路线配合，按剩余天数决定补种防风草、土豆还是甘蓝菜,links=/tools/crop-profit|/guides/year-one-spring-money-route|/guides/crop-profit-calculator-guide|/wiki/crops
咖啡豆;咖啡豆春夏两季可种植并重复收获，单个售价不高，但适合长期积累咖啡和三倍浓缩咖啡。它的价值更多体现在移动速度和日程效率，不适合只按单次出售价格判断。;36px-Coffee_Bean.png;season=春季|夏季,days=10,sellPrice=15金,source=旅行货车,获取方式=可从旅行货车购买，也可能通过特定怪物掉落取得。拿到第一颗后可以种植并逐步扩种，春夏两季都能利用,主要用途=制作咖啡和三倍浓缩咖啡，提升跑图、下矿、钓鱼和送礼效率。温室解锁前也可少量种植作为速度储备,新手建议=前期拿到咖啡豆建议留种扩种，不建议只为了出售而大面积种植。咖啡的时间收益往往比单价更重要,关联规划=适合在收益计算时把速度收益和重复收获一起考虑，也适合配合背包升级与体力管理路线使用,links=/tools/crop-profit|/guides/crop-profit-calculator-guide|/guides/beginner-backpack-and-energy-route|/wiki/crops
蓝莓;蓝莓是第一年夏季最稳定的多次收获作物之一，成熟后能持续产出，适合普通新手建立夏季现金流。它不要求复杂加工，但地块过大仍会带来浇水压力。;36px-Blueberry.png;season=夏季,days=13,sellPrice=50金,source=皮埃尔杂货店,获取方式=夏季从皮埃尔杂货店购买种子后种植，成熟后可多次收获。夏1及时下种能显著提高整季收益,主要用途=用于夏季稳定现金流，支持背包升级、洒水器制作、鸡舍畜棚和秋季启动资金。也可作为后续加工和种子生产器过渡材料,新手建议=适合作为第一年夏季主力作物之一，但不要忽略洒水器和矿洞材料。能稳定浇完的地块比盲目扩大更重要,关联规划=建议和甜瓜、啤酒花、辣椒一起用作物收益计算器比较剩余天数、地块数量和加工能力,links=/tools/crop-profit|/guides/year-one-summer-money-route|/guides/crop-profit-calculator-guide|/wiki/crops
甜瓜;甜瓜是夏季高价值作物，成熟较慢但单次收益高，并且可参与社区中心和巨大作物规划。它适合小片高价值种植，不一定适合第一年新手满田。;36px-Melon.png;season=夏季,days=12,sellPrice=250金,source=皮埃尔杂货店,获取方式=夏季从皮埃尔杂货店购买种子后种植。成熟时间较长，晚播时要确认季节剩余天数是否足够,主要用途=用于社区中心夏季作物收集包，品质作物规划，出售换取中期资金，也可在合适布局下尝试巨大作物,新手建议=第一年建议保留普通品质和高品质样本各一份。若洒水器不足，不要因为单价高就种到超出体力上限,关联规划=适合与蓝莓形成夏季现金流组合，用收益计算器核对晚播是否还能成熟,links=/tools/crop-profit|/guides/year-one-summer-money-route|/tools/community-center|/wiki/crops
啤酒花;啤酒花每日重复收获，单卖不突出，但配合小桶后能进入酿造路线。它需要棚架，会影响通行和布局，因此更适合已经开始规划加工设备的玩家。;36px-Hops.png;season=夏季,days=11,sellPrice=25金,source=皮埃尔杂货店,获取方式=夏季购买啤酒花种子后种植，成熟后每日可收获。棚架作物会阻挡移动，播种前要预留通道,主要用途=主要用于酿造淡啤酒，也可作为夏季重复收获作物积累加工材料。直接出售价值有限，加工后路线更清晰,新手建议=第一年不建议满田啤酒花。可以小规模尝试，等小桶数量跟上后再扩大,关联规划=适合和温室加工路线、小桶容量、夏季地块规划一起考虑,links=/tools/crop-profit|/guides/year-one-summer-money-route|/guides/greenhouse-crops-processing-route|/wiki/crops
杨桃;杨桃是夏季高价值作物，直接出售已经很强，配合小桶酿酒后是中后期重要收益来源。它种子成本较高，适合有沙漠、洒水器和加工能力后集中规划。;36px-Starfruit.png;season=夏季,days=13,sellPrice=750金,source=绿洲,获取方式=修复巴士后在沙漠绿洲购买杨桃种子，夏季种植。成熟时间较长且种子昂贵，播种前要确认资金和剩余天数,主要用途=用于高价值出售和小桶酿酒，是温室、姜岛和中后期加工路线的重要作物。少量也可用于任务和收藏,新手建议=第一年夏季如果资金、浇水和小桶都不足，不必强行大规模种杨桃。先保证蓝莓、甜瓜和洒水器路线更稳,关联规划=适合和温室加工路线、作物收益计算器一起使用，比较直接出售与酿酒的节奏,links=/tools/crop-profit|/guides/greenhouse-crops-processing-route|/guides/crop-profit-calculator-guide|/wiki/crops
辣椒;辣椒是夏季短周期重复收获作物，启动快，维护轻，适合补社区中心、送礼和料理。它单价不高，但能稳定产出，适合新手在夏季边角地块种一小片。;36px-Hot_Pepper.png;season=夏季,days=5,sellPrice=40金,source=皮埃尔杂货店,获取方式=夏季从皮埃尔杂货店购买种子后种植，成熟后可重复收获。它前期成熟快，适合夏季初期快速补样本,主要用途=用于社区中心夏季作物收集包，谢恩和刘易斯等村民礼物，料理与小额现金流,新手建议=建议保留几颗普通品质辣椒，不要全部卖掉。它适合辅助蓝莓和甜瓜，而不是作为唯一主力作物,关联规划=适合和夏季赚钱路线、礼物推荐、社区中心清单一起规划,links=/tools/crop-profit|/guides/year-one-summer-money-route|/tools/community-center|/wiki/crops
番茄;番茄是夏季重复收获蔬菜，适合补社区中心夏季作物收集包和料理材料。它现金爆发不如蓝莓，但用途更偏图鉴、献祭和厨房储备。;36px-Tomato.png;season=夏季,days=11,sellPrice=60金,source=皮埃尔杂货店,获取方式=夏季从皮埃尔杂货店购买种子后种植，成熟后可重复收获。夏季早下种才能发挥多次收获价值,主要用途=用于社区中心夏季作物收集包，也常作为料理材料。多余番茄可以出售或留给厨房路线,新手建议=第一年建议至少种几株并保留一份普通品质。若只追求现金流，可与蓝莓、甜瓜分配地块,关联规划=适合用社区中心清单确认夏季作物包，再用收益计算器控制种植规模,links=/tools/community-center|/tools/crop-profit|/guides/year-one-summer-money-route|/wiki/crops
玉米;玉米能横跨夏秋两季重复收获，单次售价不高，但种得早可以吃满两个季节。它适合做社区中心、品质作物和长期低维护农田，不适合月底临时补种。;36px-Corn.png;season=夏季|秋季,days=14,sellPrice=50金,source=皮埃尔杂货店,获取方式=夏季或秋季从皮埃尔杂货店购买种子后种植。夏季尽早下种价值更高，因为可以延续到秋季继续收获,主要用途=用于社区中心夏季作物和品质作物规划，也可作为料理与加工储备。跨季特性适合减少秋季重新播种成本,新手建议=若打算做品质作物包，夏季可以提前种一片玉米并保留高品质样本。不要在秋季末才补种,关联规划=适合和夏季、秋季赚钱路线一起看，用收益计算器核对跨季收获次数,links=/tools/crop-profit|/tools/community-center|/guides/year-one-summer-money-route|/wiki/crops
红叶卷心菜;红叶卷心菜是夏季作物，也是社区中心染料包常见卡点。普通路线通常第二年稳定购买，第一年想提前完成社区中心时需要留意旅行货车。;36px-Red_Cabbage.png;season=夏季,days=9,sellPrice=260金,source=皮埃尔杂货店,获取方式=通常第二年夏季从皮埃尔杂货店购买种子后种植，第一年可留意旅行货车是否出售相关种子或成品,主要用途=用于社区中心公告板染料包，也可出售获得不错收益。它对追求第一年完成社区中心的玩家很关键,新手建议=如果第一年刷到红叶卷心菜或种子，建议优先保留，不要随手卖掉。普通新手第二年再补也没问题,关联规划=适合和社区中心前期路线、季节物品保留清单一起规划，避免染料包卡进度,links=/tools/community-center|/guides/early-community-center-priority-route|/guides/seasonal-items-to-keep|/wiki/crops
蔓越莓;蔓越莓是秋季稳定多次收获作物，适合第一年秋季建立持续现金流。它的优势在于整季收益稳定，不需要像南瓜那样等待较长成熟周期。;36px-Cranberries.png;season=秋季,days=7,sellPrice=75金,source=皮埃尔杂货店,获取方式=秋季从皮埃尔杂货店购买种子后种植，成熟后可多次收获。秋1下种可以更好发挥整季收益,主要用途=用于秋季现金流，支持第二年准备、畜牧建筑、工具升级和加工设备扩张。多余产物也可进入小桶或种子生产器规划,新手建议=适合作为秋季主力作物之一，但仍要保留资金给南瓜、玉米、社区中心和动物建筑,关联规划=适合在秋季路线中和南瓜、茄子、山药等作物一起比较现金流和献祭需求,links=/tools/crop-profit|/guides/year-one-fall-money-route|/guides/crop-profit-calculator-guide|/wiki/crops
南瓜;南瓜是秋季高价值作物，成熟较慢但单次出售价值高，并可参与社区中心、料理和巨大作物规划。它适合稳定地块种植，不适合临近月底盲目补种。;36px-Pumpkin.png;season=秋季,days=13,sellPrice=320金,source=皮埃尔杂货店,获取方式=秋季从皮埃尔杂货店购买种子后种植。成熟周期较长，播种前要确认秋季剩余天数,主要用途=用于社区中心秋季作物收集包，品质作物规划，送礼和料理，也可尝试巨大作物,新手建议=第一年建议至少保留普通品质和高品质样本。若资金紧张，可以和蔓越莓分配地块，不必全押南瓜,关联规划=适合在秋季赚钱路线中用收益计算器比较南瓜与蔓越莓的现金回收节奏,links=/tools/crop-profit|/guides/year-one-fall-money-route|/tools/community-center|/wiki/crops
葡萄;葡萄既可作为秋季藤架作物，也可在夏季采集路线中出现。它的价值在于重复收获、料理和部分送礼需求，适合少量保留，不建议只按售价判断。;36px-Grape.png;season=秋季,days=10,sellPrice=80金,source=皮埃尔杂货店,获取方式=秋季购买葡萄种子种植后重复收获，也可通过夏季采集获得。藤架作物需要预留通行空间,主要用途=用于图鉴、料理、送礼和秋季现金流补充。采集到的葡萄也可帮助新手提前完成部分季节物品储备,新手建议=秋季种植时不要堵住农田通道。前期建议保留几份普通品质，确认料理和送礼需求后再出售多余产物,关联规划=适合和春夏秋必留物品清单一起使用，区分作物版葡萄和采集版葡萄的用途,links=/guides/seasonal-items-to-keep|/tools/crop-profit|/wiki/crops
茄子;低成本重复收获作物;36px-Eggplant.png;season=秋季,days=5,sellPrice=60金,source=皮埃尔杂货店
山药;秋季献祭常用作物;36px-Yam.png;season=秋季,days=10,sellPrice=160金,source=皮埃尔杂货店
苋菜;玛妮任务所需作物;36px-Amaranth.png;season=秋季,days=7,sellPrice=150金,source=皮埃尔杂货店
朝鲜蓟;第二年解锁的秋季蔬菜;36px-Artichoke.png;season=秋季,days=8,sellPrice=160金,source=皮埃尔杂货店
甜菜;沙漠种子，可用于制糖;36px-Beet.png;season=秋季,days=6,sellPrice=100金,source=绿洲
小麦;小麦是夏秋两季都能种的短周期作物，售价不高，但成熟快、窗口灵活，适合补空地、做加工和维持农场节奏。它还可能帮助动物饲料路线衔接。;36px-Wheat.png;season=夏季|秋季,days=4,sellPrice=25金,source=皮埃尔杂货店,获取方式=夏季或秋季从皮埃尔杂货店购买种子后种植。成熟周期短，适合在季末仍有少量剩余天数时补种,主要用途=可用于小桶加工啤酒、磨坊路线和部分料理材料，也适合作为低成本快速作物填补空地,新手建议=小麦不是主力赚钱作物，但很适合补季末空窗。不要因为单价低就完全忽略它的加工和衔接价值,关联规划=适合和作物收益计算器一起看剩余季节天数，决定季末补种是否划算,links=/tools/crop-profit|/guides/crop-profit-calculator-guide|/guides/year-one-summer-money-route|/wiki/crops
远古水果;远古水果是温室和姜岛长期种植的核心作物，成熟慢但维护频率低，适合配合小桶形成稳定现金流。新手拿到第一批远古种子后，建议先扩种，不要急着全部出售。;36px-Ancient_Fruit.png;season=春季|夏季|秋季,days=28,sellPrice=550金,source=远古种子,获取方式=远古种子种植后收获，后续可用种子生产器扩种。户外只能在春夏秋种植，温室和姜岛适合长期保留,主要用途=温室和姜岛长期种植，小桶酿酒，后期稳定收益核心。第一批产物通常更适合转化为更多种子,新手建议=建议保留第一批产物用于扩种，产量稳定后再出售或加工。不要因为单价高就过早卖掉种源,关联规划=适合用作物收益计算器比较地块数量、季节剩余天数和加工设备容量,links=/tools/crop-profit|/guides/crop-profit-calculator-guide|/guides/greenhouse-crops-processing-route|/wiki/crops
菠萝;姜岛可重复收获作物;36px-Pineapple.png;season=夏季,days=14,sellPrice=300金,source=姜岛
芋头;靠近水源时成长更快;36px-Taro_Root.png;season=夏季,days=10,sellPrice=100金,source=姜岛
齐瓜;齐先生特别订单限时作物;36px-Qi_Fruit.png;season=全部,days=4,sellPrice=1金,source=齐先生任务
霜瓜;1.6 新增冬季作物;36px-Powdermelon.png;season=冬季,days=7,sellPrice=60金,source=冬季挖掘
胡萝卜;1.6 新增春季短周期作物;36px-Carrot.png;season=春季,days=3,sellPrice=35金,source=种子点
西兰花;1.6 新增秋季重复收获作物;36px-Broccoli.png;season=秋季,days=8,sellPrice=70金,source=种子点
夏南瓜;1.6 新增夏季重复收获作物;36px-Summer_Squash.png;season=夏季,days=6,sellPrice=45金,source=种子点
`),
  ...rows("fish", `
河豚;河豚是夏季晴天中午出没的海鱼，时间窗口短，容易被新手错过。它也是部分送礼和收集路线中的重要鱼，适合提前用筛选器锁定条件。;36px-Pufferfish.png;season=夏季,location=海洋,weather=晴天,time=12:00-16:00,获取方式=夏季晴天中午到下午在海洋钓鱼获得。窗口集中在白天中段，出门前要留出从农场到海滩的路程时间,主要用途=用于鱼类图鉴、送礼和部分任务路线。由于条件限制明显，第一条建议保留到确认用途后再出售,新手建议=钓鱼等级低时可以先练普通海鱼，再在晴天集中挑战。不要把晴天中午全部安排给矿洞或砍树,关联规划=适合用鱼类查询器按夏季、晴天、海洋和中午时间筛选,links=/tools/fish|/guides/beginner-fishing-guide-and-fish-search|/wiki/fish
鲶鱼;鲶鱼是春秋雨天河流里的高难度鱼，也是社区中心鱼缸前期容易漏掉的目标。新手如果钓不上来，可以先练级、准备食物和浮标，再在雨天集中补。;36px-Catfish.png;season=春季|秋季,location=河流,weather=雨天,time=06:00-24:00,获取方式=春季或秋季雨天在河流钓鱼获得。雨天窗口很关键，如果当前季节雨天少，建议优先安排钓鱼,主要用途=用于社区中心河鱼收集包，威利喜欢的礼物，前期高价值鱼出售。第一条通常优先献祭或保留,新手建议=钓鱼等级低时不要硬拼整天，可以先练级、准备食物和浮标。钓到第一条前不要把雨天全部用来下矿,关联规划=适合用鱼类查询器按雨天和河流筛选，再放入社区中心路线规划,links=/tools/fish|/tools/community-center|/guides/community-center-fish-tank-route|/wiki/fish
鲟鱼;鲟鱼出现在山区湖泊，是鱼缸收集包和鱼塘路线的重要鱼。它的长期价值来自鱼塘产出的鱼籽，后续可加工为鱼子酱，因此不建议第一条直接卖掉。;36px-Sturgeon.png;season=夏季|冬季,location=山区湖泊,weather=任意,time=06:00-19:00,获取方式=夏季或冬季在山区湖泊钓鱼获得。相比普通湖鱼更难钓，建议在钓鱼等级提升后集中尝试,主要用途=用于社区中心湖鱼收集包，鱼塘养殖，鱼籽和鱼子酱路线。后期也适合保留作为鱼塘启动鱼,新手建议=至少保留一条用于献祭或鱼塘，不建议第一条直接出售。钓不上来时可以搭配陷阱浮标或钓鱼料理,关联规划=适合用鱼类查询器确认季节窗口，并在社区中心清单中标记鱼缸进度,links=/tools/fish|/tools/community-center|/guides/community-center-fish-tank-route|/wiki/fish
大嘴鲈鱼;大嘴鲈鱼是山区湖泊白天常见鱼，也是社区中心湖鱼收集包的重要目标。它出现条件宽松，适合新手在矿洞和木匠商店路线中顺手补钓。;36px-Largemouth_Bass.png;season=全部,location=山区湖泊,weather=任意,time=06:00-19:00,获取方式=任意季节白天在山区湖泊钓鱼获得。天气限制少，适合钓鱼等级不高时练习,主要用途=用于社区中心湖鱼收集包、图鉴补全和早期出售。多余鱼也可作为料理材料或任务储备,新手建议=第一条建议优先保留用于鱼缸，之后再出售多余鱼。去矿洞前后顺路钓几竿效率很高,关联规划=适合用鱼类查询器按山区湖泊筛选，并和社区中心鱼缸路线一起安排,links=/tools/fish|/tools/community-center|/guides/community-center-fish-tank-route|/wiki/fish
沙丁鱼;沙丁鱼是海洋常见鱼，难度低、出现季节多，适合新手练钓鱼等级和补充早期现金。它不是稀有鱼，但常用于料理、任务和图鉴补全。;36px-Sardine.png;season=春季|秋季|冬季,location=海洋,weather=任意,time=06:00-19:00,获取方式=春季、秋季或冬季白天在海洋钓鱼获得。出现条件宽松，很适合新手练习钓鱼小游戏,主要用途=用于图鉴收集、料理和部分任务。多余沙丁鱼可以出售或留作料理材料,新手建议=早期可以用它练等级，不必每条都保留。若正在补料理或任务，留几条普通品质即可,关联规划=适合和社区中心鱼缸路线一起查看，区分常见鱼和季节限定鱼,links=/tools/fish|/guides/beginner-fishing-guide-and-fish-search|/wiki/fish
金枪鱼;金枪鱼是夏季和冬季白天海鱼，窗口清晰，适合新手补海鱼图鉴和社区中心鱼缸。它不依赖天气，但错过季节就要等到下一季窗口。;36px-Tuna.png;season=夏季|冬季,location=海洋,weather=任意,time=06:00-19:00,获取方式=夏季或冬季白天在海洋钓鱼获得。它不要求雨天，适合安排在普通晴天海滩路线中,主要用途=用于社区中心海鱼收集包、图鉴和料理储备。第一条建议先留作献祭或收藏,新手建议=夏季如果忙于种地，也要抽一天白天去海边补金枪鱼。冬季可作为补漏窗口,关联规划=适合和鱼类查询器、社区中心鱼缸路线一起检查夏冬海鱼缺口,links=/tools/fish|/guides/community-center-fish-tank-route|/guides/beginner-fishing-guide-and-fish-search|/wiki/fish
红鲷鱼;红鲷鱼是夏秋雨天海鱼，条件不算复杂，但雨天限制会让新手误以为海边没有目标。它适合在雨天安排海钓时顺手补图鉴。;36px-Red_Snapper.png;season=夏季|秋季,location=海洋,weather=雨天,time=06:00-19:00,获取方式=夏季或秋季雨天白天在海洋钓鱼获得。需要雨天条件，晴天无法钓到,主要用途=用于鱼类图鉴、鱼缸规划和任务储备。若正在推进社区中心，第一条建议先保留,新手建议=雨天不要只盯着河流鱼，海洋也有红鲷鱼这类限定目标。可以一次雨天同时补多种海鱼,关联规划=适合用鱼类查询器按雨天、海洋和夏秋季节筛选，避免错过鱼缸窗口,links=/tools/fish|/guides/community-center-fish-tank-route|/wiki/fish
鲷鱼;鲷鱼是夜间河流常见鱼，条件简单但时间段容易被新手忽略。它适合补图鉴、练钓鱼，也能在前期作为夜晚活动的稳定目标。;36px-Bream.png;season=任意季节,location=河流,weather=任意,time=18:00-02:00,获取方式=夜晚在河流钓鱼获得。它不依赖特定天气，适合白天忙完农场和矿洞后补钓,主要用途=用于鱼类图鉴、料理和任务储备。由于获取条件稳定，多余鱼可以出售,新手建议=如果白天没有钓鱼时间，可以用夜晚河流补等级。注意保留体力和返程时间,关联规划=适合用鱼类查询器按夜间和河流筛选，并与鳗鱼、大海参等夜间目标区分,links=/tools/fish|/guides/beginner-fishing-guide-and-fish-search|/wiki/fish
鳗鱼;鳗鱼是春秋雨夜海洋鱼，窗口比普通鱼更容易错过。它既用于鱼缸夜间钓鱼收集包，也能制作香辣鳗鱼，后期对矿洞和骷髅洞穴很实用。;36px-Eel.png;season=春季|秋季,location=海洋,weather=雨天,time=16:00-02:00,获取方式=春季或秋季雨夜在海洋钓鱼获得。它需要同时满足雨天、海洋和夜间条件,主要用途=用于社区中心夜间钓鱼收集包，香辣鳗鱼料理，任务和鱼塘储备。后期料理价值较高,新手建议=第一条建议保留，不要忽略雨夜时间窗口。低等级时先用普通鱼练手，再集中挑战,关联规划=适合用鱼类查询器按雨天、夜间和海洋筛选，避免错过季节,links=/tools/fish|/tools/community-center|/guides/community-center-fish-tank-route|/wiki/fish
章鱼;章鱼是夏季海洋高难度鱼，出现时间偏早，钓鱼条移动压力很大。它更适合有一定钓鱼等级和食物加成后挑战，不建议新手第一天硬追。;36px-Octopus.png;season=夏季,location=海洋,weather=任意,time=06:00-13:00,获取方式=夏季上午到中午在海洋钓鱼获得。时间窗口结束较早，想钓章鱼需要把海边安排放在当天前半段,主要用途=用于鱼类图鉴、任务、鱼塘和高难度钓鱼挑战。它不是前期社区中心必抢目标，可以等装备更好再补,新手建议=钓鱼等级不足时不要消耗整天硬钓。可以先升级鱼竿、准备钓鱼食物和合适浮标,关联规划=适合在鱼类查询器中标记高难度鱼，和普通夏季海鱼分开安排,links=/tools/fish|/guides/beginner-fishing-guide-and-fish-search|/wiki/fish
大海参;大海参是夏秋夜间海鱼，价值和用途都比普通海鱼更高。它适合夜晚补海边路线，也能用于鱼塘和部分后期配方规划。;36px-Super_Cucumber.png;season=夏季|秋季,location=海洋,weather=任意,time=18:00-02:00,获取方式=夏季或秋季夜晚在海洋钓鱼获得。白天无法钓到，适合在白天种地或下矿后作为夜间安排,主要用途=用于图鉴、鱼塘、特殊用途和出售补充现金。后期如果计划鱼塘，可以保留第一条,新手建议=夜钓前确认返程时间和体力，不要因为追鱼错过回家时间。第一条建议先保留,关联规划=适合和鳗鱼等夜间鱼一起用查询器筛选，提高夜间钓鱼效率,links=/tools/fish|/guides/community-center-fish-tank-route|/wiki/fish
幽灵鱼;幽灵鱼来自矿井水域，也可能与矿洞探索路线同步获得。它是特殊鱼类收集目标之一，适合在推进矿洞电梯时顺手补，不需要单独安排整天钓鱼。;36px-Ghostfish.png;season=全部,location=矿井,weather=任意,time=全天,获取方式=在矿井水域钓鱼获得，也可能通过矿井相关怪物掉落。进入对应楼层后可以顺手尝试,主要用途=用于鱼类图鉴和社区中心特殊鱼类规划。它连接钓鱼与矿洞路线，适合边下矿边补收集,新手建议=不要为了幽灵鱼耽误矿洞主线推进。到达电梯节点后再集中补钓更稳,关联规划=适合与矿洞前40层路线、鱼类查询器和社区中心鱼缸路线一起规划,links=/tools/fish|/guides/mines-floor-40-preparation-route|/guides/community-center-fish-tank-route|/wiki/fish
冰柱鱼;冰柱鱼出现在矿井 60 层水域，难度比普通鱼高，更适合钓鱼等级和矿洞进度都稳定后再挑战。它是图鉴补全和矿洞鱼类路线的重要目标。;36px-Ice_Pip.png;season=全部,location=矿井60层,weather=任意,time=全天,获取方式=抵达矿井 60 层后在该层水域钓鱼获得。它对新手有一定难度，建议准备钓鱼增益或浮标后再尝试,主要用途=用于鱼类图鉴、特殊鱼类收集和后期鱼塘路线。直接出售价值不错，但第一条更适合保留到确认用途,新手建议=前期先把矿洞电梯推到 60 层，再挑体力充足的日子补钓。不要在装备不足时反复消耗一整天,关联规划=适合和矿洞路线、钓鱼入门指南一起使用，按楼层和难度分批补图鉴,links=/tools/fish|/guides/mines-floor-40-preparation-route|/guides/beginner-fishing-guide-and-fish-search|/wiki/fish
岩浆鳗鱼;岩浆鳗鱼是高价值高难度鱼，常见于矿井深层或火山相关水域。它更偏中后期挑战和鱼塘规划，不适合钓鱼等级很低时硬钓。;36px-Lava_Eel.png;season=全部,location=矿井100层|火山,weather=任意,time=全天,获取方式=在矿井 100 层或火山相关水域钓鱼获得。需要较高钓鱼稳定性，建议带上钓鱼料理和合适渔具,主要用途=用于图鉴补全、高价值出售和鱼塘路线。它的长期价值通常比普通鱼更高，适合后期专门安排,新手建议=第一年早期不用强求岩浆鳗鱼。先提高钓鱼等级、解锁矿洞电梯，再集中挑战会更省时间,关联规划=适合和鱼类查询器、矿洞路线和后期收益规划一起查看,links=/tools/fish|/guides/mines-floor-40-preparation-route|/guides/beginner-fishing-guide-and-fish-search|/wiki/fish
木跃鱼;木跃鱼是秘密森林特有鱼，和钢斧、硬木、秘密森林解锁进度相关。它是社区中心特殊鱼类路线中的常见目标，容易被只在河流和海洋钓鱼的新手漏掉。;36px-Woodskip.png;season=全部,location=秘密森林,weather=任意,time=全天,获取方式=进入秘密森林后在内部水域钓鱼获得。需要先用合适等级的斧头清理入口障碍,主要用途=用于社区中心特殊鱼类收集包、图鉴补全和秘密森林路线。多余鱼可出售或留作鱼塘规划,新手建议=解锁秘密森林后建议顺手补一条木跃鱼。不要只关注硬木，鱼缸进度也可能卡在这里,关联规划=适合和社区中心清单、硬木路线、鱼类查询器一起检查,links=/tools/fish|/tools/community-center|/guides/community-center-fish-tank-route|/wiki/fish
沙鱼;沙鱼是沙漠池塘鱼类，通常在修复巴士后才能稳定获取。它是特殊鱼类收集路线的重要目标，和沙漠、绿洲、骷髅洞穴进度放在一起规划更高效。;36px-Sandfish.png;season=全部,location=沙漠,weather=任意,time=06:00-20:00,获取方式=修复巴士后前往沙漠，在白天到傍晚的池塘钓鱼获得。去沙漠时可顺路处理绿洲购物和骷髅洞穴准备,主要用途=用于社区中心特殊鱼类收集包和图鉴补全。第一条建议优先保留，避免之后专门再跑一趟沙漠,新手建议=不要在没带食物和返程时间的情况下临时挑战。沙漠日程最好同时安排购物、下矿和钓鱼,关联规划=适合和社区中心鱼缸路线、鱼类查询器、沙漠相关路线一起使用,links=/tools/fish|/guides/community-center-fish-tank-route|/guides/early-community-center-priority-route|/wiki/fish
蝎鲤鱼;蝎鲤鱼同样出现在沙漠池塘，但难度更高，适合钓鱼等级提升后再补。它不是新手鱼缸最优先目标，却是图鉴和沙漠鱼类路线的重要补完。;36px-Scorpion_Carp.png;season=全部,location=沙漠,weather=任意,time=06:00-20:00,获取方式=修复巴士后在沙漠池塘白天到傍晚钓鱼获得。难度较高，建议准备钓鱼增益和更好的鱼竿,主要用途=用于鱼类图鉴、沙漠鱼类收集和后期挑战。相比沙鱼更适合在钓鱼等级稳定后处理,新手建议=如果一直钓不上来，不要卡在沙漠浪费整天。先完成更容易的鱼缸目标，再回头补图鉴,关联规划=适合用鱼类查询器筛选沙漠鱼，并和新手钓鱼指南一起规划挑战顺序,links=/tools/fish|/guides/beginner-fishing-guide-and-fish-search|/guides/community-center-fish-tank-route|/wiki/fish
狮子鱼;狮子鱼是姜岛海域鱼类，属于后期岛屿内容的一部分。它没有前期社区中心压力，更适合在姜岛农场、核桃和火山路线稳定后补图鉴。;36px-Lionfish.png;season=全部,location=姜岛海洋,weather=任意,time=全天,获取方式=解锁姜岛后在岛屿海域钓鱼获得。全天可钓，适合探索岛屿时顺手补,主要用途=用于鱼类图鉴、姜岛鱼类收集和后期鱼塘规划。它更多服务后期补全，不是第一年核心目标,新手建议=未解锁姜岛前不用提前焦虑。到岛上后把钓鱼、火山和核桃探索安排在同一批日程中,关联规划=适合和鱼类查询器、姜岛相关资料一起检查岛屿鱼类缺口,links=/tools/fish|/guides/beginner-fishing-guide-and-fish-search|/wiki/fish|/wiki/locations
黄貂鱼;黄貂鱼来自姜岛海盗湾，和岛屿后期探索路线相关。它的获取地点较特殊，常常不是钓鱼等级问题，而是玩家还没推进到对应区域。;36px-Stingray.png;season=全部,location=海盗湾,weather=任意,time=全天,获取方式=解锁姜岛并进入海盗湾后，在当地水域钓鱼获得。地点本身有前置探索要求，先推进岛屿路线更重要,主要用途=用于鱼类图鉴、姜岛收集和后期鱼塘规划。部分玩家会为了鱼塘产物和图鉴补完专门保留,新手建议=看到图鉴缺黄貂鱼时，先确认自己是否已经能进入海盗湾。不要在普通海滩反复钓,关联规划=适合和鱼类查询器、姜岛地点资料一起定位具体获取位置,links=/tools/fish|/wiki/fish|/wiki/locations
蓝铁饼鱼;姜岛河流鱼类;36px-Blue_Discus.png;season=全部,location=姜岛河流,weather=任意,time=全天
传说之鱼;春季雨天传奇鱼;36px-Legend.png;season=春季,location=山区湖泊,weather=雨天,time=全天
绯红鱼;夏季传奇鱼;36px-Crimsonfish.png;season=夏季,location=东码头,weather=任意,time=全天
鮟鱇鱼;秋季传奇鱼;36px-Angler.png;season=秋季,location=木板桥北侧,weather=任意,time=全天
冰川鱼;冬季传奇鱼;36px-Glacierfish.png;season=冬季,location=箭头岛,weather=任意,time=全天
变种鲤鱼;下水道传奇鱼;36px-Mutant_Carp.png;season=全部,location=下水道,weather=任意,time=全天
虾虎鱼;1.6 新增瀑布鱼类;36px-Goby.png;season=全部,location=煤矿森林瀑布,weather=任意,time=全天
`),
  ...rows("villagers", `
阿比盖尔;阿比盖尔喜欢冒险和矿洞话题，是前期送礼路线中比较容易规划的村民之一。她的最爱里包含紫水晶、南瓜和河豚，分别对应矿洞、秋季作物和夏季钓鱼。;36px-Abigail_Icon.png;birthday=秋季13日,address=皮埃尔杂货店,loves=紫水晶|南瓜|河豚,获取方式=常在皮埃尔杂货店、镇上和山区附近活动。想稳定提升好感，优先记住秋季13日生日和她常见的行动路线,主要用途=用于村民好感、剧情事件、送礼规划和生日礼物安排。紫水晶来自矿洞，南瓜来自秋季作物，河豚需要夏季晴天海钓,新手建议=前期最稳的是保留紫水晶送礼。南瓜和河豚有季节限制，不要为了送礼影响社区中心或赚钱路线,关联规划=适合和矿洞材料、秋季作物、鱼类查询一起规划礼物来源,links=/wiki/villagers|/wiki/crops|/tools/fish|/guides/year-one-fall-money-route
亚历克斯;亚历克斯常围绕运动和自我训练展开行动路线，住处靠近镇中心，适合新手在买种子、去海滩或路过河间大道时顺路互动。他的最爱礼物偏料理，前期可以先用稳定喜欢礼物过渡。;36px-Alex_Icon.png;birthday=夏季13日,address=河间大道1号,loves=完整早餐|鲑鱼晚餐,获取方式=常在河间大道家中、狗舍附近、海滩和镇中心活动。夏季13日生日适合提前准备料理或高品质替代礼物，避免当天临时找不到人,主要用途=用于提升村民好感、触发剧情事件和婚姻路线。完整早餐和鲑鱼晚餐都偏料理路线，适合厨房解锁后稳定准备,新手建议=第一年不必急着追最爱料理，可以先保持交谈和普通喜欢礼物。等厨房、钓鱼和料理材料稳定后，再用生日集中提升好感,关联规划=适合把送礼安排在镇中心和海滩路线中，和背包升级、钓鱼日程、生日礼物箱一起规划,links=/wiki/villagers|/guides/villager-gift-birthday-recommendation|/guides/beginner-backpack-and-energy-route|/tools/fish
艾米丽;艾米丽在星之果实餐吧工作，行动路线容易掌握，礼物来源和宝石、布料、动物产品相关。她是前期比较适合用矿洞产物推进好感的村民之一。;36px-Emily_Icon.png;birthday=春季27日,address=柳巷2号,loves=布料|羊毛|宝石,获取方式=常在柳巷家中和星之果实餐吧活动，春季27日生日在第一年较早。矿洞宝石、羊毛和布料都能成为后续稳定礼物来源,主要用途=用于好感、剧情事件、送礼路线和料理服装相关规划。宝石来自矿洞，羊毛和布料依赖动物与加工路线,新手建议=前期可以保留多余宝石送礼，但不要把博物馆首件或关键任务材料直接送掉。布料与羊毛稳定前，用普通喜欢礼物过渡即可,关联规划=适合和矿洞路线、动物产品路线、礼物推荐一起使用，避免稀有材料误送,links=/wiki/villagers|/guides/villager-gift-birthday-recommendation|/guides/mines-floor-40-preparation-route|/guides/coop-barn-animal-products-route
艾利欧特;艾利欧特住在海滩小屋，送礼路线适合和钓鱼、海滩采集、鱼店购买补给合并。他的最爱礼物包括鸭毛、龙虾和石榴，分别对应畜牧、蟹笼和果树路线。;36px-Elliott_Icon.png;birthday=秋季5日,address=海滩小屋,loves=鸭毛|龙虾|石榴,获取方式=常在海滩小屋、海边和镇上活动。秋季5日生日适合提前准备石榴、龙虾或其他稳定礼物,主要用途=用于好感、剧情事件和海滩路线送礼规划。龙虾来自蟹笼，鸭毛来自鸭子，石榴来自果树，都是中期更容易稳定的来源,新手建议=第一年早期不必为了他强行建高级鸡舍或果树。海滩钓鱼时顺路交谈即可，等蟹笼、鸭子或果树上线后再重点推进,关联规划=适合和鱼类查询、动物产品、季节留物清单一起规划礼物来源,links=/wiki/villagers|/tools/fish|/guides/coop-barn-animal-products-route|/guides/seasonal-items-to-keep
哈维;哈维是镇上的医生，住在诊所楼上，礼物路线偏咖啡、腌菜和松露油。相比稀有材料，他更适合在中期用稳定加工品推进好感。;36px-Harvey_Icon.png;birthday=冬季14日,address=诊所楼上,loves=咖啡|松露油|腌菜,获取方式=常在诊所工作，也会在镇上和商店附近活动。冬季14日生日较晚，玩家通常有足够时间准备咖啡或加工品,主要用途=用于好感、剧情事件和医疗相关 NPC 路线。咖啡来源稳定，腌菜依赖罐头瓶，松露油需要猪和榨油机,新手建议=前期可以用咖啡作为低风险礼物，不必急着追松露油。加工品未成型前，先保持交谈和每周稳定送礼,关联规划=适合和咖啡豆、加工设备、温室加工路线一起规划后期礼物库存,links=/wiki/villagers|/wiki/crops|/guides/greenhouse-crops-processing-route|/guides/villager-gift-birthday-recommendation
海莉;海莉热爱摄影和时尚，前期路线主要围绕生日、常见住处和礼物来源规划。她喜欢椰子、向日葵和水果沙拉，礼物来源横跨沙漠、夏秋作物和料理。;36px-Haley_Icon.png;birthday=春季14日,address=柳巷2号,loves=椰子|向日葵|水果沙拉,获取方式=常在柳巷、镇上和海边附近活动。春季14日生日很早，新手如果没有最爱礼物，可以先用喜欢礼物过渡,主要用途=用于村民好感、生日送礼、剧情事件和礼物清单规划。向日葵可通过夏秋种植获得，椰子依赖沙漠或其他来源,新手建议=第一年春季不要为了生日礼物打乱主线节奏。夏秋可以提前种向日葵，后续再补高价值礼物,关联规划=适合和作物资料、季节留物清单一起规划礼物来源,links=/wiki/villagers|/wiki/crops|/guides/seasonal-items-to-keep
莉亚;莉亚住在森林中的小屋，喜欢自然、艺术和较容易规划的食物类礼物。她的礼物路线适合新手在觅食、料理和畜牧加工逐步展开后推进。;36px-Leah_Icon.png;birthday=冬季23日,address=莉亚的小屋,loves=沙拉|松露|葡萄酒,获取方式=常在莉亚的小屋、森林和镇上活动。住处靠近农场南部，适合顺路送礼,主要用途=用于村民好感、剧情事件和礼物规划。沙拉来源稳定，松露依赖猪和畜牧路线，葡萄酒依赖小桶加工,新手建议=前期可用较容易购买或制作的礼物过渡，不必急着追松露和葡萄酒。等畜牧和加工稳定后再提高礼物质量,关联规划=适合和畜牧产品路线、温室加工路线一起规划后期礼物,links=/wiki/villagers|/guides/coop-barn-animal-products-route|/guides/greenhouse-crops-processing-route
玛鲁;玛鲁住在木匠家，礼物来源横跨电池组、草莓和铱锭，既能连接春季作物，也能连接后期资源路线。她适合和山区、矿洞、木匠商店行程一起规划。;36px-Maru_Icon.png;birthday=夏季10日,address=木匠的商店,loves=电池组|草莓|铱锭,获取方式=常在木匠商店、诊所和山区附近活动。夏季10日生日适合在春季提前留草莓，或者中后期准备电池组与铱锭,主要用途=用于好感、剧情事件和礼物资源规划。草莓来自复活节，电池组依赖避雷针或后期设备，铱锭更偏后期资源,新手建议=第一年最稳的是保留少量草莓，不要为了送礼消耗关键铱锭。电池组前期也很重要，优先满足工具和设备需求后再送礼,关联规划=适合和春季赚钱路线、矿洞路线、作物收益计算一起规划礼物成本,links=/wiki/villagers|/wiki/crops|/tools/crop-profit|/guides/year-one-spring-money-route
潘妮;潘妮住在拖车，常在博物馆附近照看孩子，礼物路线适合和秋季甜瓜、矿洞宝石以及镇中心日程结合。她对兔子的脚例外不喜欢，送礼前要特别确认。;36px-Penny_Icon.png;birthday=秋季2日,address=拖车,loves=钻石|绿宝石|甜瓜,获取方式=常在拖车、博物馆、镇中心和河边活动。秋季2日生日较早，最好在夏季提前保留甜瓜或宝石,主要用途=用于好感、剧情事件和婚姻路线。钻石与绿宝石来自矿洞，甜瓜来自夏季作物，也能服务社区中心与品质作物规划,新手建议=不要把兔子的脚当作通用安全礼物送给潘妮。第一年可提前留一颗甜瓜，宝石首件先考虑博物馆和任务需求,关联规划=适合和夏季作物、季节留物清单、礼物推荐一起规划，避免生日当天缺材料,links=/wiki/villagers|/wiki/crops|/guides/seasonal-items-to-keep|/guides/villager-gift-birthday-recommendation
塞巴斯蒂安;塞巴斯蒂安住在罗宾家的地下室，行动路线相对固定但作息偏室内。最爱礼物包含黑曜石、生鱼片和虚空蛋，来源分别对应矿洞、料理和特殊动物路线。;36px-Sebastian_Icon.png;birthday=冬季10日,address=木匠的商店,loves=黑曜石|生鱼片|虚空蛋,获取方式=常在木匠商店地下室、山区和湖边附近活动。想送礼需要注意他白天经常待在室内,主要用途=用于村民好感、剧情事件、生日礼物和矿洞材料礼物规划。黑曜石与矿洞进度相关，生鱼片需要料理能力,新手建议=前期不必硬追最爱礼物，可以先推进矿洞和料理。冬季生日之前准备稳定礼物即可,关联规划=适合和矿洞路线、鱼类与料理材料路线一起规划,links=/wiki/villagers|/guides/mines-floor-40-preparation-route|/tools/fish
山姆;山姆住在柳巷，行动路线和镇中心、海滩、家门口高度相关，适合顺路送礼。最爱礼物包含披萨、虎眼石和仙人掌果子，分别对应餐吧、矿洞和沙漠。;36px-Sam_Icon.png;birthday=夏季17日,address=柳巷1号,loves=披萨|虎眼石|仙人掌果子,获取方式=常在柳巷家中、镇中心、海滩和桥边活动。夏季17日生日可以准备披萨或矿洞宝石类礼物,主要用途=用于好感、剧情事件和年轻 NPC 送礼路线。披萨可从餐吧购买，虎眼石来自矿洞，仙人掌果子依赖沙漠,新手建议=第一年没有沙漠时不要强求仙人掌果子。披萨虽然方便但要花钱，缺现金时先用稳定喜欢礼物和交谈维持进度,关联规划=适合和背包升级、矿洞路线、沙漠解锁后的礼物库存一起规划,links=/wiki/villagers|/guides/beginner-backpack-and-energy-route|/guides/mines-floor-40-preparation-route|/guides/villager-gift-birthday-recommendation
谢恩;谢恩在 Joja 超市工作，住在玛妮的牧场，前期很容易在镇上和牧场路线中遇到。最爱礼物包含啤酒、辣椒和披萨，礼物来源相对清晰。;36px-Shane_Icon.png;birthday=春季20日,address=玛妮的牧场,loves=啤酒|辣椒|披萨,获取方式=常在玛妮的牧场、Joja 超市和星之果实餐吧附近活动。春季20日生日较早，适合提前准备礼物,主要用途=用于村民好感、剧情事件和生日送礼。辣椒来自夏季作物，啤酒和披萨可通过餐吧或加工路线处理,新手建议=第一年春季可以用容易获得的礼物过渡，不要为了高价礼物影响种子和背包资金。夏季种少量辣椒后送礼更稳定,关联规划=适合和夏季作物、背包升级、日程路线一起规划,links=/wiki/villagers|/wiki/crops|/guides/year-one-summer-money-route
卡洛琳;卡洛琳住在皮埃尔杂货店，路线集中在镇中心和家中，适合购物时顺手互动。她的礼物路线包含绿茶、夏季亮片和鱼肉卷，能把作物、料理和茶苗系统连接起来。;36px-Caroline_Icon.png;birthday=冬季7日,address=皮埃尔杂货店,loves=鱼肉卷|绿茶|夏季亮片,获取方式=常在皮埃尔杂货店、家中和镇中心活动。冬季7日生日给玩家较长准备时间，绿茶和夏季亮片都可以提前存放,主要用途=用于好感、剧情事件、生日礼物和茶苗相关路线。绿茶适合中期稳定准备，夏季亮片来自夏季种植，鱼肉卷偏料理路线,新手建议=第一年可以保留少量夏季亮片，不必为了鱼肉卷提前投入复杂料理。去杂货店买种子时顺手交谈即可稳定推进,关联规划=适合和作物资料、礼物推荐、季节留物清单一起安排礼物库存,links=/wiki/villagers|/wiki/crops|/guides/seasonal-items-to-keep|/guides/villager-gift-birthday-recommendation
克林特;克林特经营铁匠铺，礼物路线和矿洞、矿石、宝石高度相关。由于他的位置与开晶球和工具升级路线重合，新手很容易顺路提升好感。;36px-Clint_Icon.png;birthday=冬季26日,address=铁匠铺,loves=宝石|金锭|铱锭,获取方式=常在铁匠铺工作，处理开晶球、工具升级和矿石业务时可以顺路互动。冬季26日生日适合用富余宝石准备,主要用途=用于好感、剧情事件和矿洞材料礼物规划。宝石、金锭和铱锭都来自矿洞与熔炼系统，但矿锭也常用于工具和设备,新手建议=不要把第一批金锭或铱锭优先送礼。宝石若已捐赠首件或有重复品，再拿来送克林特更稳,关联规划=适合和矿洞前40层、矿洞掉落、工具升级节奏一起规划,links=/wiki/villagers|/wiki/items|/guides/mines-floor-40-preparation-route|/guides/mines-drops-and-floor-resource-route
德米特里厄斯;德米特里厄斯住在木匠家，礼物路线和草莓、料理、山地区域日程有关。他适合和罗宾、玛鲁、塞巴斯蒂安一起做山区送礼路线。;36px-Demetrius_Icon.png;birthday=夏季19日,address=木匠的商店,loves=草莓|豆类火锅|冰淇淋,获取方式=常在木匠商店、山区湖泊附近和家中活动。夏季19日生日可提前保留草莓，也可以准备料理或购买类礼物,主要用途=用于好感、剧情事件和山区 NPC 路线。草莓来自复活节，豆类火锅和冰淇淋更偏料理与购买路线,新手建议=第一年春季如果种了草莓，建议留少量给礼物和种子生产器。不要为了礼物影响夏季启动资金,关联规划=适合和春季作物、山区矿洞路线、村民礼物路线一起管理,links=/wiki/villagers|/wiki/crops|/guides/year-one-spring-money-route|/guides/villager-gift-birthday-recommendation
矮人;矮人位于矿井入口，礼物来源几乎全部与矿洞和特殊鱼类相关。解锁交流后，他很适合和每日下矿路线绑定。;36px-Dwarf_Icon.png;birthday=夏季22日,address=矿井,loves=紫水晶|翡翠|熔岩鳗鱼,获取方式=清理矿井入口障碍并满足交流条件后可稳定互动。常驻矿井入口，去下矿、买炸弹或补资源时都能顺路送礼,主要用途=用于好感、矿洞商店相关互动和矿物礼物规划。紫水晶与翡翠来自矿洞，熔岩鳗鱼属于高难度鱼类，适合后期准备,新手建议=前期用重复宝石更现实，不要为了熔岩鳗鱼卡住送礼。宝石首件仍建议先确认博物馆和任务需求,关联规划=适合和矿洞路线、鱼类查询、矿物资料一起规划礼物来源,links=/wiki/villagers|/wiki/items|/tools/fish|/guides/mines-drops-and-floor-resource-route
艾芙琳;艾芙琳住在河间大道，是镇中心路线中最容易顺手互动的村民之一。她的礼物偏甜点、花卉和甜菜，适合温和推进好感。;36px-Evelyn_Icon.png;birthday=冬季20日,address=河间大道1号,loves=甜菜|巧克力蛋糕|郁金香,获取方式=常在河间大道家中、镇中心花坛和社区区域活动。冬季20日生日可以用前期保存的花卉、甜菜或料理准备,主要用途=用于好感、剧情事件和镇中心送礼路线。郁金香适合春季留存，甜菜依赖沙漠种子，巧克力蛋糕来自料理或活动奖励,新手建议=第一年春季可留一朵郁金香作为安全礼物。没有沙漠前不用追甜菜，先用容易获得的喜欢礼物即可,关联规划=适合和季节留物、作物资料、礼物推荐一起整理礼物箱,links=/wiki/villagers|/wiki/crops|/guides/seasonal-items-to-keep|/guides/villager-gift-birthday-recommendation
乔治;乔治住在河间大道，位置固定，适合和艾芙琳一起处理镇中心送礼。最爱礼物包含韭葱和炒蘑菇，前者适合春季采集路线。;36px-George_Icon.png;birthday=秋季24日,address=河间大道1号,loves=韭葱|炒蘑菇,获取方式=常在河间大道家中或家附近活动。秋季24日生日较晚，可以提前在春季保留韭葱或后续准备料理,主要用途=用于好感、剧情事件和采集物礼物规划。韭葱来自春季采集，炒蘑菇需要料理和材料准备,新手建议=春季采到韭葱可以留一两份，不要全部出售。料理条件未成熟前，韭葱是更低成本的礼物选择,关联规划=适合和季节留物清单、镇中心送礼路线、背包管理一起安排,links=/wiki/villagers|/guides/seasonal-items-to-keep|/guides/beginner-backpack-and-energy-route|/guides/villager-gift-birthday-recommendation
格斯;格斯经营星之果实餐吧，晚间很容易找到，也能顺路接触很多村民。礼物路线包含钻石、鱼肉卷和橙子，分别对应矿洞、料理和果树。;36px-Gus_Icon.png;birthday=夏季8日,address=星之果实餐吧,loves=钻石|鱼肉卷|橙子,获取方式=常在星之果实餐吧工作。夏季8日生日适合提前准备钻石或其他稳定礼物，周五晚餐吧也是集中送礼好地点,主要用途=用于好感、料理相关互动和餐吧路线规划。钻石来自矿洞，橙子来自果树，鱼肉卷偏料理路线,新手建议=前期不要为了送礼消耗唯一钻石。餐吧位置稳定，缺最爱时先交谈和普通礼物即可,关联规划=适合和矿洞路线、果树留物、周五餐吧集中送礼策略一起规划,links=/wiki/villagers|/wiki/items|/guides/mines-floor-40-preparation-route|/guides/villager-gift-birthday-recommendation
贾斯;贾斯住在玛妮的牧场，常和孩子相关行程绑定，礼物多为甜点和花卉。她适合在去牧场买动物、干草或处理畜牧路线时顺路互动。;36px-Jas_Icon.png;birthday=夏季4日,address=玛妮的牧场,loves=仙女玫瑰|粉红蛋糕|葡萄干布丁,获取方式=常在玛妮牧场、镇上和博物馆附近活动。夏季4日生日较早，第一年通常先用安全喜欢礼物过渡,主要用途=用于好感、剧情事件和牧场路线送礼。仙女玫瑰来自秋季，粉红蛋糕和葡萄干布丁偏料理与活动来源,新手建议=第一年夏季如果没有最爱礼物，不要强行追甜点。去牧场办事时顺路交谈，秋季再准备仙女玫瑰更稳,关联规划=适合和动物产品路线、季节留物清单、礼物推荐一起规划,links=/wiki/villagers|/guides/coop-barn-animal-products-route|/guides/seasonal-items-to-keep|/guides/villager-gift-birthday-recommendation
乔迪;乔迪住在柳巷，送礼路线能和山姆、肯特、文森特所在区域合并。她的礼物包含钻石、薄煎饼和蔬菜杂烩，偏矿洞和料理路线。;36px-Jodi_Icon.png;birthday=秋季11日,address=柳巷1号,loves=钻石|薄煎饼|蔬菜杂烩,获取方式=常在柳巷家中、杂货店和镇中心活动。秋季11日生日可以用夏秋积累的料理或重复宝石准备,主要用途=用于好感、剧情事件、家庭 NPC 路线和料理礼物规划。钻石价值高，薄煎饼和蔬菜杂烩需要厨房与材料,新手建议=不要把唯一钻石用于普通日送礼。料理稳定后再把她列入重点好感目标，前期以顺路交谈为主,关联规划=适合和秋季路线、厨房料理、家庭住址路线一起安排,links=/wiki/villagers|/guides/year-one-fall-money-route|/guides/villager-gift-birthday-recommendation|/wiki/items
肯特;肯特第二年才回到鹈鹕镇，礼物路线不需要第一年过早投入。最爱礼物偏料理，适合玩家厨房和材料库存稳定后再推进。;36px-Kent_Icon.png;birthday=春季4日,address=柳巷1号,loves=烤榛子|意式蕨菜炖饭,获取方式=第二年开始出现在柳巷家中和镇上。春季4日生日很早，最好在第一年冬季或第二年春季前提前准备礼物,主要用途=用于好感、剧情事件和第二年人物关系补完。烤榛子与秋季采集相关，意式蕨菜炖饭依赖料理和材料准备,新手建议=第一年不用为肯特分配礼物库存，但秋季榛子可以留一些。第二年春季先补生日，再慢慢推进普通送礼,关联规划=适合和冬季整理、第二年路线、季节留物一起规划,links=/wiki/villagers|/guides/winter-prep-year-two-route|/guides/seasonal-items-to-keep|/guides/villager-gift-birthday-recommendation
科罗布斯;科罗布斯住在下水道，解锁较晚，礼物路线和虚空系物品、南瓜、下水道商店相关。前期只需要知道他不是第一年春夏重点目标。;36px-Krobus_Icon.png;birthday=冬季1日,address=下水道,loves=南瓜|虚空蛋|虚空蛋黄酱,获取方式=解锁下水道后可在固定位置互动。冬季1日生日很早，若已解锁可提前准备南瓜或虚空系礼物,主要用途=用于好感、特殊同居路线、下水道商店和虚空物品规划。南瓜来自秋季，虚空蛋与虚空蛋黄酱依赖后续动物路线,新手建议=第一年未解锁下水道时不用强求。秋季可留南瓜，等下水道开放后作为稳定礼物使用,关联规划=适合和秋季作物、动物产品、冬季整理路线一起规划,links=/wiki/villagers|/wiki/crops|/guides/year-one-fall-money-route|/guides/coop-barn-animal-products-route
刘易斯;刘易斯是镇长，住在镇长庄园，生日很早，适合新手用低成本礼物建立关系。最爱包含辣椒、绿茶和秋日恩赐，横跨作物、加工和料理。;36px-Lewis_Icon.png;birthday=春季7日,address=镇长庄园,loves=秋日恩赐|绿茶|辣椒,获取方式=常在镇长庄园、镇中心和各商店附近活动。春季7日生日非常早，第一年可先用喜欢礼物或后续补普通送礼,主要用途=用于好感、剧情事件、镇长相关任务和礼物路线。辣椒来自夏季，绿茶需要茶苗或加工路线，秋日恩赐偏料理,新手建议=第一年春季不要为了生日消耗关键资源。夏季种少量辣椒后再补好感更稳定,关联规划=适合和夏季赚钱路线、作物资料、礼物推荐一起安排,links=/wiki/villagers|/wiki/crops|/guides/year-one-summer-money-route|/guides/villager-gift-birthday-recommendation
莱纳斯;莱纳斯住在山区帐篷，常在矿井和山湖附近活动，和下矿、钓鱼路线高度重合。他的礼物包含椰子、仙人掌果子和山药，适合中后期补好感。;36px-Linus_Icon.png;birthday=冬季3日,address=帐篷,loves=椰子|仙人掌果子|山药,获取方式=常在山区帐篷、矿井附近和山湖周边活动。冬季3日生日适合提前准备秋季山药或沙漠采集物,主要用途=用于好感、剧情事件、邮件资源和山区路线。山药来自秋季，椰子和仙人掌果子依赖沙漠或特殊来源,新手建议=前期去矿洞时顺路交谈即可，秋季保留山药会更稳。沙漠未解锁时不要把椰子与仙人掌果子列为硬目标,关联规划=适合和矿洞路线、秋季留物、鱼类查询山湖路线一起规划,links=/wiki/villagers|/guides/mines-floor-40-preparation-route|/guides/seasonal-items-to-keep|/tools/fish
玛妮;玛妮经营牧场用品店，礼物路线和畜牧、料理、南瓜派相关。她的位置适合和买动物、干草、照顾牧场区域一起规划。;36px-Marnie_Icon.png;birthday=秋季18日,address=玛妮的牧场,loves=钻石|粉红蛋糕|南瓜派,获取方式=常在玛妮牧场和镇上活动，经营牧场用品店但有固定离店时间。秋季18日生日可提前准备南瓜派或重复宝石,主要用途=用于好感、剧情事件、牧场服务和动物路线。钻石来自矿洞，粉红蛋糕与南瓜派偏料理或活动来源,新手建议=需要买动物或干草时顺路互动。前期不要为了礼物消耗唯一钻石，秋季南瓜和料理稳定后再推进,关联规划=适合和动物产品路线、秋季作物、礼物推荐一起安排,links=/wiki/villagers|/guides/coop-barn-animal-products-route|/guides/year-one-fall-money-route|/guides/villager-gift-birthday-recommendation
帕姆;帕姆住在拖车，后续会与巴士路线相关，礼物来源较容易规划。防风草、啤酒和仙人掌果子分别对应春季作物、餐吧和沙漠。;36px-Pam_Icon.png;birthday=春季18日,address=拖车,loves=啤酒|防风草|仙人掌果子,获取方式=常在拖车、星之果实餐吧和巴士站附近活动。春季18日生日适合提前留防风草，第一年非常容易准备,主要用途=用于好感、剧情事件和巴士相关路线。防风草是低成本礼物，啤酒可从餐吧购买，仙人掌果子依赖沙漠,新手建议=第一年春季建议留一份防风草给帕姆生日。不要为了啤酒频繁花钱影响种子、背包和工具预算,关联规划=适合和春季作物、背包升级、沙漠解锁路线一起规划,links=/wiki/villagers|/wiki/crops|/guides/year-one-spring-money-route|/guides/beginner-backpack-and-energy-route
皮埃尔;皮埃尔经营杂货店，是每天买种子时最容易遇到的 NPC 之一，但最爱礼物选择较少。与其强追最爱，不如用稳定互动和生日集中提升。;36px-Pierre_Icon.png;birthday=春季26日,address=皮埃尔杂货店,loves=炸鱿鱼,获取方式=常在皮埃尔杂货店柜台和家中活动。春季26日生日在第一年较早，炸鱿鱼需要鱼类和料理条件，不一定适合开局硬追,主要用途=用于好感、剧情事件和杂货店路线。由于常驻店内，交谈非常方便，送礼可以安排在买种子时顺路完成,新手建议=第一年如果没有炸鱿鱼，不要为了生日打乱钓鱼和料理节奏。先保持交谈，等厨房和鱼类材料稳定后再补最爱,关联规划=适合和作物购买、鱼类查询、生日礼物路线一起使用,links=/wiki/villagers|/tools/fish|/guides/villager-gift-birthday-recommendation|/guides/year-one-spring-money-route
罗宾;罗宾是木匠，住在山区，建筑、房屋升级和农场设施都要经常找她。礼物路线包含山羊奶酪、桃子和意大利面，适合中期结合畜牧与料理推进。;36px-Robin_Icon.png;birthday=秋季21日,address=木匠的商店,loves=山羊奶酪|桃子|意大利面,获取方式=常在木匠商店工作，去山区、矿井或安排建筑时可顺路互动。秋季21日生日适合提前准备料理或畜牧产品,主要用途=用于好感、剧情事件和木匠服务路线。山羊奶酪依赖畜棚，桃子来自果树，意大利面可通过料理或餐吧解决,新手建议=第一年不要为了山羊奶酪提前压缩基础建设预算。建房、建鸡舍、升级农场设施时顺路交谈即可,关联规划=适合和动物产品、农场布局、矿洞路线一起规划山区行程,links=/wiki/villagers|/guides/coop-barn-animal-products-route|/guides/mines-floor-40-preparation-route|/guides/beginner-year-one-route-overview
桑迪;桑迪经营沙漠绿洲，解锁巴士后才能稳定互动。她的礼物包含水仙花、番红花和芒果糯米饭，适合把季节采集物提前留好。;36px-Sandy_Icon.png;birthday=秋季15日,address=绿洲,loves=水仙花|芒果糯米饭|番红花,获取方式=修复巴士后可在沙漠绿洲找到她。秋季15日生日建议提前携带水仙花或番红花，不要到沙漠后才临时准备,主要用途=用于好感、沙漠商店路线和后期礼物补完。水仙花和番红花是低成本采集物，芒果糯米饭偏后期料理,新手建议=未修复巴士前不用为桑迪送礼占用太多精力。春冬采集物可以各留几份，后续去沙漠时顺路赠送,关联规划=适合和季节留物、沙漠作物、巴士解锁后的赚钱路线一起安排,links=/wiki/villagers|/guides/seasonal-items-to-keep|/wiki/crops|/guides/year-one-fall-money-route
威利;威利住在海滩鱼店，礼物路线和钓鱼系统高度绑定。最爱礼物包含鲶鱼、南瓜和海参，既能连接鱼类查询，也能连接秋季作物。;36px-Willy_Icon.png;birthday=夏季24日,address=鱼店,loves=鲶鱼|南瓜|海参,获取方式=常在海滩鱼店、码头和钓鱼区域活动。夏季24日生日可以提前准备鱼类或后续用南瓜补好感,主要用途=用于好感、钓鱼相关剧情、鱼店服务和鱼类路线。鲶鱼是雨天高难度鱼，海参来自海钓，南瓜来自秋季作物,新手建议=不要为了送礼消耗唯一鲶鱼，尤其社区中心还需要鱼缸进度。第一条关键鱼优先献祭或保留，礼物可后补,关联规划=适合和鱼类查询、社区中心鱼缸、秋季作物一起规划,links=/wiki/villagers|/tools/fish|/guides/community-center-fish-tank-route|/wiki/crops
法师;法师住在法师塔，位置偏远，礼物路线和神秘材料、矿洞掉落、蘑菇相关。适合在去煤矿森林、秘密森林或处理任务时顺路互动。;36px-Wizard_Icon.png;birthday=冬季17日,address=法师塔,loves=紫蘑菇|太阳精华|虚空精华,获取方式=常驻法师塔，路线距离较远，建议和煤矿森林、秘密森林或特殊任务合并安排。冬季17日生日可提前准备精华或紫蘑菇,主要用途=用于好感、剧情事件和神秘相关内容。太阳精华与虚空精华来自怪物掉落，紫蘑菇来自矿洞或蘑菇路线,新手建议=前期不要为了送礼专门跑远路。下矿有富余精华后再推进，第一批怪物材料先确认任务和制作需求,关联规划=适合和矿洞掉落、任务路线、社区中心进度一起安排,links=/wiki/villagers|/guides/mines-drops-and-floor-resource-route|/guides/quest-board-special-orders-route|/tools/community-center
雷欧;雷欧来自姜岛，属于后期岛屿内容，礼物路线和芒果、鸭毛、鸵鸟蛋等岛屿或畜牧资源相关。新手前期只需知道他不是第一年核心目标。;36px-Leo_Icon.png;birthday=夏季26日,address=姜岛树屋,loves=鸭毛|芒果|鸵鸟蛋,获取方式=解锁姜岛并推进岛屿剧情后才能稳定互动。常在姜岛树屋和岛屿区域活动，夏季26日生日适合后期提前准备礼物,主要用途=用于好感、岛屿剧情和后期人物关系补完。芒果来自岛屿果树，鸭毛来自鸭子，鸵鸟蛋属于岛屿后期资源,新手建议=未解锁姜岛前不用占用礼物箱空间。进入岛屿后再把芒果、鸭毛和相关资源纳入礼物计划,关联规划=适合和姜岛地点、动物产品、后期作物加工路线一起规划,links=/wiki/villagers|/wiki/locations|/guides/coop-barn-animal-products-route|/guides/greenhouse-crops-processing-route
`),
  ...rows("cooking", `
生鱼片;将任意鱼制作成简单料理;36px-Sashimi.png;source=莱纳斯3心,ingredients=任意鱼,energy=75
幸运午餐;提高幸运的强力料理;36px-Lucky_Lunch.png;source=酱料女皇,ingredients=海参|玉米饼|蓝爵,energy=100
矿工特供;提高采矿和磁性;36px-Miner's_Treat.png;source=采矿3级,ingredients=山洞萝卜|糖|牛奶,energy=125
蟹黄糕;长时间提高速度和防御;36px-Crab_Cakes.png;source=酱料女皇,ingredients=螃蟹|小麦粉|蛋|油,energy=225
香辣鳗鱼;提高幸运和速度;36px-Spicy_Eel.png;source=乔治7心,ingredients=鳗鱼|辣椒,energy=115
南瓜汤;提高幸运和防御;36px-Pumpkin_Soup.png;source=罗宾7心,ingredients=南瓜|牛奶,energy=200
海之菜肴;提高钓鱼等级;36px-Dish_O'_The_Sea.png;source=钓鱼3级,ingredients=沙丁鱼|薯饼,energy=150
龙虾浓汤;长时间提高钓鱼;36px-Lobster_Bisque.png;source=威利9心,ingredients=龙虾|牛奶,energy=225
三倍浓缩咖啡;提供长时间速度加成;36px-Triple_Shot_Espresso.png;source=星之果实餐吧,ingredients=咖啡×3,energy=8
姜汁汽水;提高幸运;36px-Ginger_Ale.png;source=矮人商店,ingredients=姜|糖,energy=63
粉红蛋糕;多位村民喜爱的甜点;36px-Pink_Cake.png;source=酱料女皇,ingredients=甜瓜|小麦粉|糖|蛋,energy=250
水果沙拉;高能量水果料理;36px-Fruit_Salad.png;source=酱料女皇,ingredients=蓝莓|甜瓜|杏子,energy=263
`),
  ...rows("items", `
铱锭;铱锭是后期工具升级、设备制作和姜岛解锁的重要材料。它的出售价格不低，但前中期更建议保留，用在洒水器、工具升级、船只修复和高级设备上，避免后续卡进度。;36px-Iridium_Bar.png;type=矿物,source=熔炉|完美雕像,sellPrice=1000金,获取方式=主要通过熔炼铱矿石获得，也可来自完美雕像和后期资源循环。稳定来源通常出现在矿洞和骷髅洞穴推进之后,主要用途=用于工具升级、铱制洒水器、姜岛船只修复、高级设备制作和后期资源规划,新手建议=不建议前期出售。优先保留给工具、洒水器和姜岛路线，确认富余后再考虑出售,关联规划=适合结合矿洞路线规划铱矿、煤炭和电池组储备,links=/guides/mines-floor-40-preparation-route|/guides/sprinkler-unlock-and-ore-route|/wiki/items
铱矿石;铱矿石是熔炼铱锭的基础材料，通常代表存档进入中后期资源阶段。它本身可以出售，但更重要的用途是转化为铱锭，服务工具、洒水器和姜岛推进。;36px-Iridium_Ore.png;type=矿物,source=骷髅洞穴|铱矿点|神秘石,sellPrice=100金,获取方式=主要来自铱矿点、神秘石、骷髅洞穴和后期矿物来源。需要镐子、食物、炸弹和下矿路线配合,主要用途=熔炼铱锭，用于工具升级、铱制洒水器、后期设备和姜岛相关材料储备,新手建议=前几批建议全部保留并熔炼，不要因为短期缺钱直接出售。煤炭不足时要同步规划燃料来源,关联规划=适合和矿洞收益路线、洒水器路线一起看，决定什么时候开始集中刷矿,links=/guides/mines-floor-40-preparation-route|/guides/sprinkler-unlock-and-ore-route|/wiki/items
电池组;电池组来自避雷针和太阳能板，是中后期设备制作、任务和姜岛路线中经常卡住的材料。它能卖出不错价格，但第一批更适合保留。;36px-Battery_Pack.png;type=资源,source=避雷针|太阳能板,sellPrice=500金,获取方式=雷雨天避雷针充能后产出，后期也可由太阳能板等来源获得。想稳定获取需要提前制作避雷针并留出摆放位置,主要用途=用于高级设备、任务、姜岛船只修复和部分后期制作。它经常和铱锭、硬木一起成为进度材料,新手建议=第一批不建议出售，优先保留到确认任务和解锁需求。雷雨季节前准备避雷针会明显减少卡材料,关联规划=适合和社区中心、姜岛解锁、矿洞材料路线一起规划,links=/guides/early-community-center-priority-route|/guides/sprinkler-unlock-and-ore-route|/wiki/items
硬木;硬木是稳定卡进度的资源之一，常用于建筑、设备、任务和后期解锁。它不像普通木材那样容易大量获得，因此早期看到硬木来源时建议有意识积累。;36px-Hardwood.png;type=资源,source=大树桩|秘密森林|农场资源,sellPrice=15金,获取方式=砍伐大树桩、大圆木或在秘密森林等区域获得。需要合适等级的斧头才能稳定采集,主要用途=用于建筑升级、设备制作、任务需求和后期区域解锁。它常和铱锭、电池组一起构成重要材料清单,新手建议=不要随手卖硬木。每天能稳定获取后再考虑富余处理，前期优先留给建筑和解锁,关联规划=适合和背包升级、工具升级、姜岛前置材料一起安排,links=/guides/beginner-backpack-and-energy-route|/guides/early-community-center-priority-route|/wiki/items
  煤炭;煤炭是熔炼和制作的基础燃料，看起来普通，但前期消耗极快。铜锭、铁锭、金锭和铱锭都离不开煤炭，缺煤会直接拖慢洒水器和工具升级节奏。;36px-Coal.png;type=资源,source=矿洞|木炭窑|怪物掉落,sellPrice=15金,获取方式=矿洞采集、矿车和背包箱、怪物掉落、木炭窑转化木材等方式获得。下矿时顺手收集很重要,主要用途=用于熔炉冶炼矿石，制作炸弹、设备和多种基础材料。它是洒水器路线和矿洞推进的核心消耗品,新手建议=不要把煤炭当普通杂物卖掉。前期应优先留给铜锭、铁锭和工具升级，缺煤时考虑专门补矿洞或木炭窑,关联规划=适合和洒水器解锁、矿洞前40层路线一起规划,links=/guides/sprinkler-unlock-and-ore-route|/guides/mines-floor-40-preparation-route|/wiki/items
  石英;石英是矿洞早期常见矿物，获取容易但用途不少。它可用于收集、送礼、制作和后续材料路线，是新手下矿时值得顺手保留的基础矿物。;36px-Quartz.png;type=矿物,source=矿洞|垃圾回收|晶球,sellPrice=25金,获取方式=主要在矿洞低层采集，也可通过其他资源循环获得。它出现频率较高，适合前期稳定积累,主要用途=用于博物馆、送礼、制作和精炼石英路线。后续部分设备和建筑材料会消耗相关矿物,新手建议=第一份建议捐博物馆或保留，之后再根据制作需求出售。前期不要把所有矿物都清仓,关联规划=适合和矿洞收益路线一起整理，区分可出售矿物和需要留存的材料,links=/guides/mines-floor-40-preparation-route|/guides/sprinkler-unlock-and-ore-route|/wiki/items
  铜矿石;铜矿石是前期工具升级、熔炉循环和基础设备制作的核心矿石。它单个售价不高，但能转化为铜锭，直接影响洒水器、工具和矿洞推进节奏。;36px-Copper_Ore.png;type=矿石,source=矿井前段|晶球|怪物掉落,sellPrice=5金,获取方式=主要在矿井前段铜矿点采集，也可通过晶球、背包箱和少量怪物掉落补充。前期下矿时铜矿石和煤炭应优先带走,主要用途=用于熔炼铜锭、升级工具、制作基础设备和推进洒水器前置。直接出售通常不如转化为工具效率和农场自动化,新手建议=第一批铜矿石全部保留，先满足熔炉、工具和设备需求。背包满时优先丢低价值杂物，不要丢矿石和煤炭,关联规划=适合和矿洞前40层、洒水器解锁路线一起规划前期材料缺口,links=/guides/mines-floor-40-preparation-route|/guides/sprinkler-unlock-and-ore-route|/guides/mines-drops-and-floor-resource-route|/wiki/items
  铜锭;铜锭是矿石路线的第一道成品材料，决定玩家能否尽快升级工具、制作基础设备并进入更高效率的农场循环。它比铜矿石更重要，不建议早期出售。;36px-Copper_Bar.png;type=金属锭,source=熔炉,sellPrice=60金,获取方式=使用熔炉将铜矿石配合煤炭熔炼获得，也可能通过宝箱或回收路线少量取得。稳定来源仍是采矿加熔炉,主要用途=用于工具升级、基础设备、部分建筑材料和早期自动化准备。铜锭常常是从手动农场转向洒水器农场的第一步,新手建议=前几块铜锭优先留给工具和设备，不要因为短期缺钱卖掉。缺煤时先补煤炭，否则矿石无法转化为实际进度,关联规划=适合和洒水器解锁、背包升级和矿洞收益路线一起安排,links=/guides/sprinkler-unlock-and-ore-route|/guides/beginner-backpack-and-energy-route|/guides/mines-drops-and-floor-resource-route|/wiki/items
  铁矿石;铁矿石是从前期过渡到稳定自动化的关键矿石，常用于铁锭、优质洒水器和中期工具升级。它的价值不在直接出售，而在解放每天浇水时间。;36px-Iron_Ore.png;type=矿石,source=矿井中段|晶球|怪物掉落,sellPrice=10金,获取方式=主要在矿井中段铁矿点采集，推进到对应楼层后会更稳定。也可通过晶球、宝箱和少量怪物掉落获得,主要用途=用于熔炼铁锭、制作优质洒水器、升级工具和制作中期设备。铁矿石会明显影响夏秋农场扩张速度,新手建议=第一年春末到夏季应有意识囤铁矿石。想扩大种植面积前，先确认铁锭和煤炭是否够用,关联规划=适合接在矿洞前40层路线之后，配合洒水器解锁推进农场规模,links=/guides/mines-floor-40-preparation-route|/guides/sprinkler-unlock-and-ore-route|/tools/crops|/wiki/items
  铁锭;铁锭是优质洒水器、工具升级和多种设备的核心材料。它通常比单纯扩大作物面积更能提高效率，因为它能减少每日浇水和跑图压力。;36px-Iron_Bar.png;type=金属锭,source=熔炉,sellPrice=120金,获取方式=使用熔炉将铁矿石和煤炭熔炼获得。稳定产出依赖矿井中段推进、足够煤炭和持续下矿计划,主要用途=用于优质洒水器、工具升级、加工设备和中期农场建设。它是第一年夏秋扩张路线的重要材料,新手建议=不要把铁锭当成普通高价物出售。优先满足洒水器和工具升级，剩余再考虑设备制作,关联规划=适合和作物收益计算器、洒水器路线一起决定是否扩大种植规模,links=/guides/sprinkler-unlock-and-ore-route|/tools/crops|/guides/year-one-summer-money-route|/wiki/items
  金矿石;金矿石是中后段矿井的重要矿石，通常用于金锭、工具升级和高级设备准备。它代表玩家已经能稳定推进较深楼层，适合开始规划更高等级材料。;36px-Gold_Ore.png;type=矿石,source=矿井后段|晶球|骷髅洞穴,sellPrice=25金,获取方式=主要在矿井后段金矿点采集，也可通过晶球、宝箱和更高难度矿洞来源获得。想稳定采集需要较好的武器、食物和电梯节点,主要用途=用于熔炼金锭、升级工具、制作高级设备和准备后期路线。金矿石直接出售收益有限，通常应先转化为进度材料,新手建议=第一次稳定获得金矿石时先保留，不要急着卖。若武器和体力不足，优先保证安全到达电梯层,关联规划=适合和矿洞掉落路线、前40层之后的资源推进一起整理,links=/guides/mines-drops-and-floor-resource-route|/guides/mines-floor-40-preparation-route|/guides/sprinkler-unlock-and-ore-route|/wiki/items
  金锭;金锭是工具升级、高级设备和后期自动化路线的重要成品材料。它的获取成本高于铜锭和铁锭，需要更深楼层、更多煤炭和更稳定的下矿准备。;36px-Gold_Bar.png;type=金属锭,source=熔炉,sellPrice=250金,获取方式=使用熔炉将金矿石和煤炭熔炼获得。稳定来源通常建立在矿井后段电梯节点、足够食物和较好武器基础上,主要用途=用于高级工具升级、设备制作、部分任务和后期材料路线。它能把农场从中期效率推进到更完整的自动化,新手建议=第一批金锭优先留给工具和关键设备，不建议直接出售。若煤炭不足，先处理燃料缺口再集中熔炼,关联规划=适合和矿洞收益路线、洒水器路线、秋冬准备路线一起看,links=/guides/mines-drops-and-floor-resource-route|/guides/sprinkler-unlock-and-ore-route|/guides/winter-prep-year-two-route|/wiki/items
  晶球;晶球是矿洞早期常见掉落，打开后能获得矿物、资源和博物馆藏品。它的价值不稳定，但对补图鉴、博物馆和早期材料很有帮助。;36px-Geode.png;type=晶球,source=矿井|石头|怪物掉落,sellPrice=50金,获取方式=在矿井挖石头、打怪、开箱或采集相关资源时获得。早期遇到晶球可以先存起来，等资金允许时集中处理,主要用途=交给铁匠打开以获得矿物、宝石、资源和博物馆藏品。它能补齐部分难以直接采集的矿物,新手建议=前期不要全部出售晶球。先打开一批补博物馆和基础材料，重复矿物再考虑出售,关联规划=适合和矿洞掉落路线一起整理，区分需要捐赠的矿物和可出售重复品,links=/guides/mines-drops-and-floor-resource-route|/guides/mines-floor-40-preparation-route|/wiki/locations|/wiki/items
  冰封晶球;冰封晶球主要来自矿井冰层区域，常见于中段推进阶段。它能开出一批偏冰层和矿物主题的资源，是补博物馆和矿洞资料的重要来源。;36px-Frozen_Geode.png;type=晶球,source=矿井冰层|怪物掉落,sellPrice=100金,获取方式=在矿井冰层相关楼层挖石头、打怪和开箱时获得。推进电梯节点后可以更稳定地反复刷取,主要用途=用于铁匠开晶球，获取矿物、宝石和博物馆藏品。它适合补中段矿洞的收藏缺口,新手建议=第一次获得时建议打开，不要直接出售。若资金紧张，可以存到下矿收益较好的一天集中处理,关联规划=适合配合矿洞楼层资源路线查看哪些楼层更适合刷材料,links=/guides/mines-drops-and-floor-resource-route|/guides/mines-floor-40-preparation-route|/wiki/locations|/wiki/items
  岩浆晶球;岩浆晶球主要来自矿井深层火山风格区域，是更后段矿物和资源的重要来源。它通常代表玩家已经接近矿井底部，适合整理中后期收藏和材料。;36px-Magma_Geode.png;type=晶球,source=矿井深层|怪物掉落,sellPrice=150金,获取方式=在矿井深层挖石头、打怪和开箱时获得。需要更好的武器、食物和矿洞路线才能稳定收集,主要用途=用于铁匠开晶球，获得更后段矿物、资源和博物馆相关物品。重复品可出售或用于整理收藏进度,新手建议=不要为了单个晶球硬冲危险楼层。先保证武器、食物和电梯节点，再集中收集效率更高,关联规划=适合和矿洞掉落路线、战斗准备、冬季资源整理一起规划,links=/guides/mines-drops-and-floor-resource-route|/guides/mines-floor-40-preparation-route|/guides/winter-prep-year-two-route|/wiki/items
  万能晶球;万能晶球能开出范围更广的矿物和资源，是补图鉴、博物馆和后期材料的通用来源。它比普通晶球更适合在需要补收藏时集中处理。;36px-Omni_Geode.png;type=晶球,source=矿洞|骷髅洞穴|火山地牢,sellPrice=0金,获取方式=可来自矿洞、骷髅洞穴、火山地牢、宝箱和其他后期资源来源。来源较多，但稳定积累通常需要较高探索进度,主要用途=交给铁匠打开以获取大量可能矿物，也可参与部分交换和后期收集路线。适合补博物馆缺口,新手建议=前期拿到后可以先存着，等资金宽裕时集中打开。不要把它当成短期现金来源,关联规划=适合和矿洞掉落路线、博物馆整理、后期资源路线一起使用,links=/guides/mines-drops-and-floor-resource-route|/guides/winter-prep-year-two-route|/wiki/items
  地晶;地晶是矿井早期常见矿物之一，通常用于博物馆、制作和前期材料整理。虽然单个价值不高，但第一份和少量备用都值得保留。;36px-Earth_Crystal.png;type=矿物,source=矿井前段|晶球,sellPrice=50金,获取方式=主要在矿井前段采集或通过晶球获得。前期下矿时顺路捡取即可，不需要专门为它耗费整天,主要用途=用于博物馆捐赠、制作配方和部分材料需求。它能帮助玩家建立早期矿物收藏和制作基础,新手建议=第一份优先捐博物馆或保留，后续保留少量备用。重复过多时再出售，不要第一天就清空,关联规划=适合和矿洞掉落资料、前期背包整理、博物馆进度一起查看,links=/guides/mines-drops-and-floor-resource-route|/guides/beginner-backpack-and-energy-route|/wiki/items
  泪晶;泪晶常见于矿井冰层相关区域，是中段矿物收藏和礼物路线中较有辨识度的物品。它不应只按售价处理，第一批更适合留作收藏和备用。;36px-Frozen_Tear.png;type=矿物,source=矿井冰层|冰封晶球,sellPrice=75金,获取方式=主要在矿井冰层区域采集或通过冰封晶球获得。推进到中段电梯后更容易稳定补充,主要用途=用于博物馆捐赠、送礼和部分制作需求。它也能作为判断冰层资源是否已稳定获取的标志,新手建议=第一份优先保留或捐赠，后续根据送礼和制作需求决定是否出售。背包紧张时可只留少量备用,关联规划=适合和矿洞楼层路线、礼物推荐和社区中心前期规划一起看,links=/guides/mines-drops-and-floor-resource-route|/guides/villager-gift-birthday-recommendation|/guides/early-community-center-priority-route|/wiki/items
  火水晶;火水晶通常出现在矿井深层和岩浆晶球相关来源，是后段矿物收藏和制作路线的重要材料。它比早期矿物更难稳定获得，建议优先留存。;36px-Fire_Quartz.png;type=矿物,source=矿井深层|岩浆晶球,sellPrice=100金,获取方式=主要在矿井深层采集，或通过岩浆晶球等来源获得。稳定收集需要较好的战斗能力和电梯节点,主要用途=用于博物馆捐赠、制作和后续材料路线。它也常作为矿井深层是否稳定推进的资源标志,新手建议=第一份不要出售。先满足收藏和制作需求，后续有稳定来源后再处理重复品,关联规划=适合和矿洞掉落路线、洒水器矿石路线和冬季资源整理一起规划,links=/guides/mines-drops-and-floor-resource-route|/guides/sprinkler-unlock-and-ore-route|/guides/winter-prep-year-two-route|/wiki/items
  史莱姆泥;史莱姆泥是击败史莱姆后常见的怪物掉落，看起来杂，但会用于制作、任务和后期养殖相关内容。前期不用大量囤满箱子，但也不要完全清空。;36px-Slime.png;type=怪物掉落,source=史莱姆,sellPrice=5金,获取方式=主要通过击败矿洞中的史莱姆获得，也可在相关养殖和后期来源中积累。前期下矿时自然会获得不少,主要用途=用于制作、任务、怪物相关内容和后期史莱姆养殖路线。它不是高价值出售品，更多是功能材料,新手建议=前期保留一组左右即可，多余可视背包和箱子空间处理。不要为了它牺牲矿石、煤炭和晶球,关联规划=适合和矿洞掉落路线、背包管理、战斗准备一起整理优先级,links=/guides/mines-drops-and-floor-resource-route|/guides/beginner-backpack-and-energy-route|/guides/mines-floor-40-preparation-route|/wiki/items
  蝙蝠翅膀;蝙蝠翅膀是矿洞蝙蝠类怪物的常见掉落，主要用于制作和部分任务准备。它的单个价值不高，但作为怪物材料有必要保留一定数量。;36px-Bat_Wing.png;type=怪物掉落,source=蝙蝠类怪物,sellPrice=15金,获取方式=主要通过击败矿洞和相关区域的蝙蝠类怪物获得。夜间矿洞、特定楼层和后期区域都会逐步积累,主要用途=用于制作配方、任务需求和怪物材料储备。它适合放在资源箱中长期留少量备用,新手建议=前期保留一组以内即可，不必无限囤积。若背包紧张，优先保留矿石、煤炭、晶球和当前任务物品,关联规划=适合和矿洞掉落路线、战斗路线和背包体力管理一起查看,links=/guides/mines-drops-and-floor-resource-route|/guides/mines-floor-40-preparation-route|/guides/beginner-backpack-and-energy-route|/wiki/items
  太阳精华;太阳精华是中后期怪物掉落材料，可用于制作、任务和后期资源准备。它不适合只当普通战利品出售，尤其在制作需求出现前建议保留。;36px-Solar_Essence.png;type=怪物掉落,source=幽灵|矿洞怪物,sellPrice=40金,获取方式=主要通过击败特定矿洞怪物获得，也可在后期探索和部分商店路线中补充。稳定获取通常需要玩家进入较深楼层,主要用途=用于制作、任务、怪物材料储备和后期路线准备。它常和虚空精华一起作为战斗材料管理,新手建议=第一批建议保留，不要刚获得就出售。等制作和任务需求明确后，再处理多余数量,关联规划=适合和矿洞掉落路线、冬季准备和战斗资源整理一起规划,links=/guides/mines-drops-and-floor-resource-route|/guides/winter-prep-year-two-route|/guides/mines-floor-40-preparation-route|/wiki/items
  虚空精华;虚空精华是较深矿洞和后期怪物常见的功能材料，常用于制作、任务和特殊路线。它的用途比售价更重要，前中期应有意识留存。;36px-Void_Essence.png;type=怪物掉落,source=暗影怪物|矿洞深层,sellPrice=50金,获取方式=主要通过击败矿洞深层和相关区域的暗影类怪物获得，也可通过后期商店或探索来源补充,主要用途=用于制作、任务、特殊物品和战斗材料储备。它能帮助玩家衔接矿洞深层、下水道和后期内容,新手建议=前期第一次获得时不要出售。留一批备用，等制作和任务需求完成后再考虑多余处理,关联规划=适合和矿洞掉落路线、下水道解锁、冬季资源整理一起查看,links=/guides/mines-drops-and-floor-resource-route|/guides/winter-prep-year-two-route|/wiki/locations|/wiki/items
  山洞萝卜;山洞萝卜是矿洞中的可食用资源，常用于前期补体力、任务和少量料理路线。它不属于高价物，但在新手下矿时很实用。;36px-Cave_Carrot.png;type=采集,source=矿洞土块|箱子,sellPrice=25金,获取方式=主要在矿洞中锄地、开箱或探索时获得。前期如果食物不足，山洞萝卜能作为低成本补给,主要用途=用于恢复体力、部分料理和任务需求。它能延长下矿或钓鱼日的操作时间,新手建议=前期建议保留一部分当食物，不要全部出售。背包满时再根据当天目标决定是否带回,关联规划=适合和矿洞前40层、背包体力路线一起规划下矿补给,links=/guides/mines-floor-40-preparation-route|/guides/beginner-backpack-and-energy-route|/guides/mines-drops-and-floor-resource-route|/wiki/items
  红蘑菇;红蘑菇可来自矿洞和采集路线，属于需要谨慎处理的资源。它能用于收集、任务和后期路线，但不适合作为普通恢复食物随便吃。;36px-Red_Mushroom.png;type=采集,source=矿洞|蘑菇洞|秘密森林,sellPrice=75金,获取方式=可在矿洞、蘑菇洞、秘密森林等来源获得。稳定来源取决于农场洞穴选择和探索进度,主要用途=用于收集、任务、料理和部分特殊需求。它更适合放进资源箱等待明确用途,新手建议=不要把第一批红蘑菇随手卖光或当食物消耗。至少保留几份，应对社区中心和任务需求,关联规划=适合和春夏秋必留物品清单、社区中心路线、矿洞掉落资料一起查看,links=/guides/seasonal-items-to-keep|/tools/community-center|/guides/mines-drops-and-floor-resource-route|/wiki/items
  紫蘑菇;紫蘑菇是较有价值的蘑菇类资源，可来自矿洞、蘑菇洞和后期探索。它兼具出售、恢复、收集和任务价值，适合优先保留。;36px-Purple_Mushroom.png;type=采集,source=矿洞|蘑菇洞|秘密森林,sellPrice=250金,获取方式=可在矿洞深层、蘑菇洞、秘密森林和后期探索中获得。稳定来源通常需要一定探索进度或农场洞穴规划,主要用途=用于收集、恢复、任务和部分料理路线。它也能作为高价值采集物补充收入,新手建议=第一批紫蘑菇建议保留，不要只看售价直接卖掉。等社区中心和任务需求确认后，再处理多余数量,关联规划=适合和社区中心清单、春夏秋必留物品、矿洞掉落路线一起整理,links=/tools/community-center|/guides/seasonal-items-to-keep|/guides/mines-drops-and-floor-resource-route|/wiki/items
  五彩碎片;五彩碎片是极稀有矿物，第一块不要急着送礼或出售。它可用于关键解锁、博物馆捐赠和部分后期内容，虽然多数村民喜欢，但前期更适合先保留到明确用途。;36px-Prismatic_Shard.png;type=矿物,source=神秘石|铱矿点,sellPrice=2000金,获取方式=来自神秘石、铱矿点、矿洞和骷髅洞穴等稀有来源。获取概率低，通常需要持续下矿或后期资源积累,主要用途=用于关键解锁、博物馆捐赠、后期任务和高价值礼物。它的战略价值通常高于直接出售,新手建议=第一块不要急着送礼或出售，优先确认是否需要用于解锁和收藏。后续富余后再考虑礼物用途,关联规划=适合配合矿洞收益路线决定是否深挖骷髅洞穴,links=/guides/mines-floor-40-preparation-route|/guides/early-community-center-priority-route|/wiki/items
恐龙蛋;恐龙蛋是稀有文物，也可以孵化出恐龙，后续产出恐龙蛋并制作恐龙蛋黄酱。第一颗不建议直接卖掉，通常要在捐博物馆和孵化之间做选择。;36px-Dinosaur_Egg.png;type=文物,source=山区挖掘|霸王喷火龙,sellPrice=350金,获取方式=可来自文物点、钓鱼宝箱、特定怪物掉落等途径。获取并不稳定，通常需要探索、钓鱼或矿洞进度积累,主要用途=用于博物馆捐赠、孵化恐龙、后续恐龙蛋黄酱和收藏。若先孵化，后续还能稳定补捐赠样本,新手建议=第一颗不要出售。若已有升级鸡舍且想长期产出，可以优先孵化；若追求博物馆进度，也可以先捐赠,关联规划=适合和畜牧路线、矿洞路线、春夏秋必留物品清单一起规划,links=/guides/coop-barn-animal-products-route|/guides/mines-floor-40-preparation-route|/guides/seasonal-items-to-keep|/wiki/items
兔子的脚;兔子的脚是稀有畜产品，也是送礼和社区中心路线中的重要物品。它看起来售价不错，但第一批更适合保留，避免后续公告板或好感规划卡住。;36px-Rabbit's_Foot.png;type=畜产品,source=兔子|飞蛇,sellPrice=565金,获取方式=主要由兔子在高心情和高好感时产出，也可来自特定怪物掉落。稳定来源依赖畜棚升级和动物照料,主要用途=用于社区中心公告板相关收集、送礼和特殊事件准备。多数村民对它评价很高，因此礼物价值也很强,新手建议=第一只兔子的脚建议保留，不要因为缺钱卖掉。等兔子稳定产出后再考虑送礼或出售,关联规划=适合和动物产品路线、社区中心清单、礼物推荐一起使用,links=/guides/coop-barn-animal-products-route|/tools/community-center|/guides/villager-gift-birthday-recommendation|/wiki/items
松露;松露由猪在户外找到，是畜牧转工匠品路线的重要材料。它可以直接出售，也能加工成松露油，适合中期有畜棚和加工设备后稳定赚钱。;36px-Truffle.png;type=采集,source=猪,sellPrice=625金,获取方式=成年猪在户外活动时发现。冬季和雨天等条件会影响产出节奏，因此需要配合季节和动物心情管理,主要用途=用于松露油加工、料理和社区中心厨师收集路线。它是畜牧经济从普通动物产品转向高价值产物的重要节点,新手建议=第一批松露建议先确认社区中心和料理需求，再决定出售或加工。猪的投入较高，适合农场现金流稳定后再扩张,关联规划=适合和畜牧路线、工匠品加工路线、社区中心清单一起规划,links=/guides/coop-barn-animal-products-route|/guides/greenhouse-crops-processing-route|/tools/community-center|/wiki/items
上古水果酒;上古水果酒是后期稳定收益工匠品，核心不是单瓶售价，而是温室、姜岛、小桶数量和周转节奏。它适合长期自动化农场，不适合在小桶不足时盲目囤满箱子。;36px-Wine.png;type=工匠品,source=小桶,sellPrice=基础水果价×3,获取方式=将上古水果放入小桶加工获得。稳定产出依赖上古水果种源、温室或姜岛地块，以及足够数量的小桶,主要用途=用于长期收益、酒窖陈酿和工匠品路线。它是后期农场现金流的核心产品之一,新手建议=先扩种上古水果，再逐步补小桶。加工能力不足时，不必把所有资金都压在木材和树液消耗上,关联规划=适合和温室作物加工路线、工匠品收益路线、作物收益计算器一起规划,links=/guides/greenhouse-crops-processing-route|/guides/crop-profit-calculator-guide|/tools/crop-profit|/wiki/items
鱼子酱;鱼子酱由鲟鱼鱼籽加工而来，是鱼塘和工匠品路线的代表产物。它不适合靠临时钓鱼解决，重点在于先保留鲟鱼并建立鱼塘。;36px-Caviar.png;type=工匠品,source=腌菜缸,sellPrice=500金,获取方式=先把鲟鱼放入鱼塘获得鱼籽，再用腌菜缸加工成鱼子酱。流程需要鱼塘、鲟鱼和一定等待时间,主要用途=用于工匠品收益、特殊收集和后期内容准备。它也能帮助玩家理解鱼塘产物的长期价值,新手建议=钓到第一条鲟鱼时不要急着卖，优先考虑献祭或鱼塘。鱼子酱是规划结果，不是前期短期现金来源,关联规划=适合和鲟鱼资料、鱼类查询器、社区中心鱼缸路线一起查看,links=/tools/fish|/guides/community-center-fish-tank-route|/guides/greenhouse-crops-processing-route|/wiki/items
自动抚摸机;自动抚摸机能减少动物照料压力，对大型畜牧场非常有价值。它不是早期必需品，但当鸡舍和畜棚数量增加后，可以明显降低每日操作负担。;36px-Auto-Petter.png;type=设备,source=Joja|骷髅洞穴,sellPrice=不可出售,获取方式=可通过 Joja 路线购买，或在骷髅洞穴等后期来源中取得。社区中心路线玩家通常更依赖后期探索和运气,主要用途=自动维持动物抚摸需求，降低大型畜牧场的每日管理成本。适合配合多鸡舍、多畜棚和工匠品生产,新手建议=前期不用为它改变主线选择。动物数量少时手动照料完全够用，后期扩张后再追求自动化,关联规划=适合和畜牧路线、骷髅洞穴收益路线、工匠品加工路线一起规划,links=/guides/coop-barn-animal-products-route|/guides/mines-floor-40-preparation-route|/guides/greenhouse-crops-processing-route|/wiki/items
祝福雕像;祝福雕像是 1.6 精通阶段的设备，可提供每日祝福效果。它属于后期强化工具，价值在于把每日计划和随机增益结合起来，而不是直接提供短期现金。;36px-Statue_Of_Blessings.png;type=设备,source=耕种精通,sellPrice=不可出售,获取方式=进入精通阶段并解锁相关奖励后制作或获得。需要玩家已经推进到五项技能后期内容,主要用途=提供每日祝福，帮助安排种地、下矿、钓鱼或跑图计划。不同祝福适合不同日程,新手建议=第一年不用考虑它。解锁后建议每天先查看祝福，再决定当天是下矿、钓鱼、跑图还是处理农场,关联规划=适合和精通系统、矿洞路线、作物收益规划一起使用,links=/wiki/skills|/guides/mines-floor-40-preparation-route|/tools/crop-profit|/wiki/items
矮人王雕像;矮人王雕像是 1.6 采矿精通相关设备，主要服务下矿和资源获取路线。它的价值取决于玩家是否经常安排矿洞、骷髅洞穴或火山日程。;36px-Statue_Of_The_Dwarf_King.png;type=设备,source=采矿精通,sellPrice=不可出售,获取方式=进入精通阶段并解锁采矿相关奖励后获得或制作。前置是较高技能进度和后期资源积累,主要用途=提供与采矿相关的每日增益或路线辅助，帮助提高矿石、晶球、楼层推进等效率,新手建议=前期不用为它规划资源。解锁后把它和好运日、炸弹、食物、楼梯等下矿准备一起安排,关联规划=适合和矿洞掉落路线、洒水器矿石路线、骷髅洞穴收益规划一起看,links=/wiki/skills|/guides/sprinkler-unlock-and-ore-route|/guides/mines-floor-40-preparation-route|/wiki/items
铱镰刀;铱镰刀是精通阶段的高级工具，可显著改善大面积作物收获体验。它不是提高单株收益的道具，而是减少后期农场收获时间和操作负担。;36px-Iridium_Scythe.png;type=工具,source=精通洞窟,sellPrice=不可出售,获取方式=进入精通洞窟并解锁对应奖励后获得。它属于后期工具升级线，前期无法直接取得,主要用途=用于快速收获大量作物，尤其适合温室、姜岛和大面积重复收获农田。能让玩家把更多时间留给加工、下矿和跑图,新手建议=前期重点仍是洒水器、背包和工具升级。拿到铱镰刀后再扩大高维护作物规模会更舒服,关联规划=适合和温室加工路线、作物收益计算器、背包体力路线一起规划,links=/guides/greenhouse-crops-processing-route|/tools/crop-profit|/guides/beginner-backpack-and-energy-route|/wiki/items
`),
  ...rows("skills", `
耕种;提升锄头和喷壶效率并解锁配方;36px-Farming_Skill_Icon.png;skill=耕种,level=1-10,effect=作物与动物产品售价
采矿;提升十字镐效率并解锁炸弹;36px-Mining_Skill_Icon.png;skill=采矿,level=1-10,effect=矿石与宝石路线
采集;提升斧头效率和采集品质;36px-Foraging_Skill_Icon.png;skill=采集,level=1-10,effect=木材与采集路线
钓鱼;扩大钓鱼条并解锁渔具;36px-Fishing_Skill_Icon.png;skill=钓鱼,level=1-10,effect=渔夫与捕兽者路线
战斗;增加生命并解锁战斗配方;36px-Combat_Skill_Icon.png;skill=战斗,level=1-10,effect=战士与侦察兵路线
精通系统;五项技能满级后开放;36px-Mastery_Cave.png;skill=精通,level=满级后,effect=解锁五类精通奖励
`),
  ...rows("quests", `
社区中心;修复鹈鹕镇社区中心的长期主线;36px-Junimo.png;type=主线,trigger=进入社区中心, reward=修复城镇设施
Joja 发展申请书;付费完成城镇项目的替代路线;36px-Joja_Cola.png;type=主线,trigger=购买会员, reward=城镇设施
神秘的齐;解锁赌场的系列任务;36px-Mr._Qi_Icon.png;type=系列任务,trigger=隧道电池箱, reward=赌场会员卡
哥布林问题;进入女巫沼泽并取回魔法墨水;36px-Void_Mayonnaise.png;type=主线,trigger=黑暗护符, reward=魔法建筑
海盗的妻子;姜岛物品交换链;36px-War_Memento.png;type=姜岛,trigger=与鸟蒂交谈, reward=仙尘配方
齐先生的五彩农场;提交六种颜色各100件物品;36px-Qi_Gem.png;type=齐先生,trigger=核桃房, reward=35齐钻
深处的危险;一周内再次抵达矿井底部;36px-Danger_In_The_Deep.png;type=齐先生,trigger=核桃房, reward=50齐钻
罗宾的资源大作战;收集并提交大量木材或石头;36px-Robin_Icon.png;type=特别订单,trigger=特别订单板, reward=石箱配方
`),
  ...rows("festivals", `
复活节;参加彩蛋大寻宝并购买草莓种子;36px-Strawberry.png;season=春季,date=13日,location=鹈鹕镇
花舞节;与达到4心的可婚村民跳舞;36px-Tulip.png;season=春季,date=24日,location=煤矿森林
夏威夷宴会;向百乐汤加入食材接受评价;36px-Soup.png;season=夏季,date=11日,location=海滩
月光水母起舞;观看水母迁徙;36px-Moonlight_Jellies_Banner.png;season=夏季,date=28日,location=海滩
星露谷展览会;展示九件物品并游玩小游戏;36px-Star_Token.png;season=秋季,date=16日,location=鹈鹕镇
万灵节;探索迷宫获取金色南瓜;36px-Golden_Pumpkin.png;season=秋季,date=27日,location=鹈鹕镇
冰雪节;参加冰钓比赛;36px-Perch.png;season=冬季,date=8日,location=煤矿森林
夜市;连续三晚开放的海上市场;36px-Pearl.png;season=冬季,date=15-17日,location=海滩
冬日星盛宴;秘密送礼活动;36px-Secret_Gift.png;season=冬季,date=25日,location=鹈鹕镇
沙漠节;1.6 新增三日沙漠活动;36px-Calico_Egg.png;season=春季,date=15-17日,location=沙漠
鳟鱼大赛;1.6 新增钓鱼活动;36px-Rainbow_Trout.png;season=夏季,date=20-21日,location=煤矿森林
鱿鱼节;1.6 新增冬季钓鱼活动;36px-Squid.png;season=冬季,date=12-13日,location=海滩
`),
  ...rows("locations", `
农场;玩家经营和建设的核心区域;36px-Farmhouse.png;area=山谷西部,open=全天,features=耕种|畜牧|建筑
鹈鹕镇;商店和多数居民所在地;36px-Town.png;area=山谷中心,open=全天,features=商店|任务|节日
海滩;鱼店、潮池和海洋钓鱼区;36px-Beach.png;area=山谷南部,open=全天,features=钓鱼|采集|节日
山区;矿井、湖泊和木匠商店区域;36px-Mountain.png;area=山谷北部,open=全天,features=矿井|湖泊|木匠
矿井;共120层的采矿和战斗区域;36px-Mining_Skill_Icon.png;area=山区,open=全天,features=矿石|怪物|电梯
沙漠;修复巴士后开放;36px-Desert.png;area=卡利科沙漠,open=10:10-23:50,features=绿洲|骷髅洞穴|沙漠节
下水道;捐赠60件博物馆藏品后开放;36px-Krobus_Icon.png;area=地下,open=全天,features=科罗布斯|变种虫穴
秘密森林;升级钢斧后可进入;36px-Hardwood.png;area=煤矿森林,open=全天,features=硬木|木跃鱼|雕像
姜岛;修复威利的船后开放;36px-Golden_Walnut.png;area=蕨岛群岛,open=全天,features=核桃|火山|岛屿农场
火山地牢;姜岛十层地牢;36px-Volcano_Dungeon.png;area=姜岛北部,open=全天,features=锻造台|龙牙|火山晶石
齐先生的核桃房;收集100个金色核桃后开放;36px-Qi_Gem.png;area=姜岛西部,open=全天,features=特别任务|齐钻商店
精通洞窟;五项技能满级后开放;36px-Mastery_Cave.png;area=煤矿森林,open=全天,features=精通奖励
`)
];

const baseArticles = [
  {
    title: "第一年春季完整发展路线",
    summary: "从防风草到草莓，兼顾社区中心、矿井和洒水器的每日规划。",
    body: `# 第一年春季完整发展路线

第一年春季的目标是建立稳定收入、解锁矿井与社区中心，并为夏季自动化农场准备矿石和资金。这套路线适合标准农场与第一次游玩的玩家，不要求极限操作。

整套规划以“稳定完成”为原则，不要求每天耗尽体力，也不依赖罕见掉落。遇到下雨、好运或临时任务时可以调整顺序，只要月底检查目标大致完成，就不会影响夏季发展。

## 第 1 至 4 日：建立现金流

第一天清理房屋附近的一小块土地，种下系统赠送的 15 颗防风草。只砍足够制作箱子的木材，把纤维、树液、煤炭和献祭物品存起来。第二天前往海滩领取鱼竿，山区湖泊适合练级，雨天河流则优先挑战鲶鱼。尽早修复海滩木桥，每日珊瑚和海胆能补充收入。

不要一开始买满种子。保留至少 2,000 金用于背包和后续投资，并留下防风草、土豆、花椰菜与青豆各一份，避免错过春季作物收集包。

## 第 5 至 12 日：矿井与工具

矿井开放后以每次推进 5 层为目标解锁电梯。铜矿用于熔炉与工具升级，煤炭优先保留。查看天气预报，在下雨前一天把喷壶交给克林特，可以减少无法浇水的损失。

春季应储备铁锭、金锭和精炼石英，为耕种 6 级后的优质洒水器做准备。普通洒水器覆盖范围太小，不建议大量制作。社区中心开放后，保留野山葵、水仙花、韭葱和蒲公英完成春季采集包。

## 复活节与草莓

复活节在春季 13 日举行，草莓种子只在节日商店出售。理想情况下准备 8,000 至 12,000 金；休闲玩法购买 20 至 40 颗也足够。节日结束后直接进入晚上，因此土地必须提前翻好并浇水。

13 日当晚种下草莓，月底前可以正常收获两次。草莓利润优先投入背包、工具与夏季种子，不要过早购买大量装饰或高维护建筑。

## 月末检查

春季结束前建议准备 20,000 金左右的夏季启动资金，矿井推进到 40 层以上，升级一次喷壶与十字镐，并完成春季限定鱼和作物的献祭。储备铜锭、铁锭、煤炭、精炼石英和基础木材。

常见失误包括：种植过量导致每天浇水耗尽体力；卖掉所有采集物使献祭延迟；复活节前没有准备土地；晴天只种田不下矿；在普通洒水器上浪费材料。

## 每日优先级

按“浇水与收获、限时任务、雨天鱼类、矿井电梯、普通采集”的顺序安排。电视天气预报决定工具升级时机，幸运频道决定是否深挖矿井。只要春末拥有稳定现金、基础矿石和草莓收入，夏季就能顺利进入自动化阶段。`,
    coverImage: "/assets/game/36px-Parsnip.png",
    featured: 1,
    categories: ["新手入门", "农场经营"],
    chapterChecks: [
      "第 2 日前制作木箱，并分别保存献祭品、矿石和建造材料。|每天只规划一个主要赚钱活动，背包扩容前减少低价值物品占格。|睡前检查次日天气，提前把鱼竿、食物或采矿工具放进背包。",
      "普通日刷铜铁矿，好运日集中冲电梯层数，不在怪物层恋战。|工具升级前确认未来两天天气与作物状态，避免喷壶离手时断水。|优先预留煤炭、铁锭和精炼石英，不把全部矿石立即出售。",
      "节日前一晚完成翻地、稻草人覆盖和体力食物准备。|草莓购买数量以每天能够稳定浇完为上限，不盲目追求满地种植。|第一批利润先补背包、工具和夏季种子，保留少量高品质草莓。",
      "按献祭、农田、矿石和现金四项逐一核对，不在最后一天临时补救。|春季 28 日睡前集中摆好种子、肥料、水壶和稻草人。|优先补季节限定鱼与作物，全年可得的普通材料可以延后。",
      "每天采用浇水收获、限时事项、主要目标、返程整理的固定顺序。|下雨天处理鱼类和工具升级，好运日下矿，低运日整理农场与送礼。|任务过多时保留主要目标，主动放弃低收益的跨地图往返。"
    ]
  },
  {
    title: "温室解锁与全年种植布局",
    summary: "温室解锁条件、洒水器摆法与远古水果收益方案。",
    body: `# 温室解锁与全年种植布局

温室不受季节、天气和乌鸦影响，是稳定生产高价值作物的核心建筑。合理布局后，只需定期收获并补充小桶，就能建立全年不断档的收入。

## 两条解锁路线

社区中心路线需要完成茶水间的六个收集包，包括三季作物、品质作物、动物产品和工匠物品。最容易拖延的是品质作物与动物产品，种植时应使用肥料，动物建筑则要提前升级。

Joja 路线需要购买会员，再支付 35,000 金完成温室项目。它更快直接，但会放弃社区中心剧情。无论选择哪条路线，修复后的温室第二天即可使用。

## 洒水器与果树

温室内部有 10×12 块可耕土地。6 个铱制洒水器可覆盖主要区域，压力喷头能进一步减少设备数量。获得高级保水土壤后，也可以一次浇水永久保湿，把全部土地用于作物。

果树可种在边缘非耕地区域，最多可舒适摆放 18 棵。成熟后周围可以放装饰或设备。优先种植石榴、苹果、桃子和香蕉，兼顾献祭、礼物与收益。

## 作物收益选择

远古水果最省心：成熟 28 天，之后每 7 天收获。先通过种子生产器扩大规模，再用小桶酿酒。杨桃酒单次价值更高，但每轮需要重新买种和播种，适合追求最高收益。

菠萝可重复收获，咖啡豆适合制作速度饮品，甜宝石浆果价值高但不能酿酒。温室初期不用等待完美作物，先种草莓、蓝莓、蔓越莓和咖啡豆，再逐步替换为远古水果。

## 加工区规划

小桶数量最好接近每周收获量，否则高价值果实会长期积压。棚屋适合集中放置小桶，便于统一装填和收取。地窖木桶容量有限，只陈酿部分高价值酒即可，不必让全部产品等待数月。

## 常见问题

稀有种子长成甜宝石浆果，不是远古种子。温室没有枯萎问题，但仍需要浇水。果树种植时周围 8 格必须空旷。洒水器可以放在部分木质边缘，布局时应实际确认覆盖格。

推荐最终方案为：边缘种果树，中央以远古水果为主，少量保留料理、任务和礼物作物；配套两间以上小桶棚并固定每周收获日。这样维护简单，现金流也最稳定。

## 温室维护清单

每周固定一天收获、补种和装填小桶，箱子中常备种子、肥料与传送图腾。发现小桶长期空置时应减少出售原果，发现水果大量积压时则扩建加工棚。定期检查果树间距和洒水器覆盖，不要让临时摆放的箱子占据作物格。`,
    coverImage: "/assets/game/36px-Ancient_Fruit.png",
    featured: 1,
    categories: ["农场经营"],
    chapterChecks: [
      "社区中心路线建立跨季节献祭箱，每周核对仍缺少的物品。|Joja 路线先保证稳定收入再付款，不出售关键生产资料强行凑钱。|解锁前准备种子、洒水器和肥料，修复后第二天即可投入生产。",
      "先在空地模拟洒水器覆盖，再种远古水果等难以移动的作物。|果树成熟前保持周围八格完全空白，出现提示时逐格检查障碍。|入口保留通道和临时任务区，避免收获时被设备或箱子阻挡。",
      "划分现金作物、种子扩繁和任务作物三个区域，避免单一作物锁死布局。|第一批果实优先进入种子生产器，覆盖稳定后再扩大酿酒规模。|按基础价值安排小桶，低价多产作物转入罐头瓶或直接出售。",
      "收获箱按待加工、可出售、种子和任务物品分类，减少误卖。|每周统一装填同一批设备，用收获日作为加工完成提醒。|水果持续积压时先扩设备与树脂供应，不继续无上限扩种。",
      "果树不生长时检查八邻格，作物漏水时检查洒水器覆盖空洞。|重新规划应等待当前作物收获后分区进行，避免温室整体停产。|肥料按加工或直售目标选择，不频繁铲除成熟的长期作物。",
      "固定每周维护日，按收获、补种、果树、设备和箱子的顺序巡场。|比较每周产量与小桶容量，决定下一批资源投入设备还是种植。|长期保留远古种子、杨桃种子与任务作物，随时应对订单。"
    ]
  },
  {
    title: "全鱼类季节与天气速查",
    summary: "按季节、地点、天气整理鱼类出现条件和献祭用途。",
    body: `# 全鱼类季节与天气速查

完成鱼类图鉴的难点在于季节、天气、地点和时间四个条件同时满足。建立固定检查顺序，可以避免到了地点才发现天气或时间错误。

## 出发前准备

每天先看天气预报。雨天优先捕捉鲶鱼、鳗鱼、红鲷鱼和大眼鱼。背包准备鱼饵、浮标、钓鱼料理与恢复体力的食物。铱金鱼竿可同时使用鱼饵和渔具，是后期补图鉴的主要工具。

陷阱浮标适合章鱼和传奇鱼，软木塞浮标扩大钓鱼条。挑战高难度鱼时先保证成功，不要为宝箱或完美钓鱼冒险。

## 四季重点

春季雨天河流有鲶鱼，山区湖泊雨天可挑战传说之鱼。夏季海洋中午出现河豚，早晨有章鱼；东码头可捕捉绯红鱼。秋季雨天补齐鲶鱼和大眼鱼，木板桥北侧有鮟鱇鱼。冬季山区湖泊有鲟鱼，箭头岛附近可挑战冰川鱼。

蟹笼鱼类同样属于图鉴。把蟹笼放在海水或淡水中，加入鱼饵后次日可获得龙虾、螃蟹、虾、蜗牛等。

## 特殊地点鱼类

矿井 20、60 和 100 层分别有石鱼、冰柱鱼和岩浆鳗鱼。秘密森林有木跃鱼，沙漠池塘有沙鱼和蝎鲤鱼，下水道有变种鲤鱼。姜岛提供蓝铁饼鱼、狮子鱼和黄貂鱼。

1.6 新增虾虎鱼，出现在煤矿森林瀑布区域。冬季夜市潜水艇则可捕捉午夜鱿鱼、幽灵鱼和水滴鱼。

## 传奇鱼技巧

挑战前把钓鱼提升到 10 级，食用海泡布丁或龙虾浓汤，并装备陷阱浮标。鱼快速上冲时不要立即顶满，保留回落空间；向下坠时连续短按，减少触底反弹。

五条基础传奇鱼通常每个存档各捕捉一次。失败后可以立刻重新抛竿，只要季节、天气和位置仍满足条件，就有机会再次咬钩。

## 献祭与收藏

捕到新鱼后先检查社区中心鱼缸包。鲟鱼至少留一条放入鱼塘生产鱼籽，河豚、鳗鱼、海参和午夜鲤鱼常用于任务或料理。高品质鱼出售，普通品质鱼更适合料理。

按“天气限定、季节限定、全天常见”的顺序补图鉴，并在资料库筛选当前季节与天气。通常两年内即可稳定完成绝大多数鱼类收藏。

## 实用补鱼清单

每个季节第一天列出本季缺失鱼类，标记雨天限定项目。冰箱保存提高钓鱼等级的料理，鱼箱中常备鱼饵、陷阱浮标和软木塞浮标。至少建一个鱼塘养殖鲟鱼，再按任务需求选择岩浆鳗鱼、黄貂鱼或大海参。

如果只差一两条鱼，检查是否混淆河流、森林池塘和山区湖泊，也要确认跨越午夜后的时间。魔法鱼饵可以忽略季节、时间和天气限制，是后期查漏的有效工具，但仍必须在正确地点抛竿。`,
    coverImage: "/assets/game/36px-Pufferfish.png",
    featured: 1,
    categories: ["钓鱼"],
    chapterChecks: [
      "出门前确认季节、天气、地点和时间四项条件，避免无效等待。|高难鱼准备增益料理、恢复食物和两种备用浮标。|背包留出鱼获与宝箱空间，低体力时提前返程而不是冒险昏倒。",
      "每季第一天列出本季限定鱼，把雨天鱼单独标记并优先处理。|同一天按时间窗口规划路线，先捕短时段鱼，再补全天鱼。|蟹笼分开布置在海水与淡水，连续收取直到图鉴项目齐全。",
      "矿井鱼提前解锁对应电梯层，姜岛鱼与岛屿任务放在同一天完成。|夜市潜水艇只在活动期间开放，出发前准备足够时间和金币。|地点相近但水域不同也会改变鱼池，抛竿前确认站位。",
      "挑战前把钓鱼等级和增益堆高，优先保证成功而不是追宝箱。|快速上冲时保留钓鱼条回落空间，下坠时使用连续短按控制。|失败后立即检查时间和天气，只要条件仍在即可继续尝试。",
      "新鱼先查献祭、鱼塘、料理和任务用途，再决定出售。|鲟鱼、岩浆鳗鱼等有长期价值的鱼至少保留一条。|鱼箱按献祭、料理、高价值和普通鱼分类，防止误用稀有鱼。",
      "查漏时逐项核对水域、站位、跨午夜时间与特殊活动。|魔法鱼饵只忽略季节天气时间，仍需在正确地点抛竿。|完成一季后更新缺失清单，不重复捕捉已经确认的常见鱼。"
    ]
  },
  {
    title: "村民送礼与生日指南",
    summary: "快速查找所有村民生日、最爱礼物和常见行程。",
    body: `# 村民送礼与生日指南

村民好感会解锁食谱、邮件、剧情事件和婚姻内容。高效提升好感不需要每天跑遍全镇，关键是利用生日倍率、常备礼物和固定路线。

## 好感规则

与村民交谈会增加少量好感，一般每周可赠送两次礼物，生日礼物不受本周次数限制。生日当天赠送最爱礼物具有极高倍率，是全年最有效的一次互动。

礼物分为最爱、喜欢、一般、不喜欢和讨厌。品质会影响收益，因此金星或铱星最爱礼物价值很高。兔子的脚通常是通用最爱，但潘妮不喜欢；五彩碎片也有海莉这一例外。

## 常备礼物

水果树果实、咖啡、绿茶、宝石和料理适合放进礼物箱。阿比盖尔喜欢紫水晶，艾米丽喜欢宝石，哈维喜欢咖啡，莉亚喜欢沙拉，谢恩喜欢啤酒与辣椒，潘姆喜欢防风草和啤酒。

不要为了送礼耗尽关键资源。电池组、铱锭、恐龙蛋在前期更有建设价值，优先赠送可重复生产的作物、树果和料理。

## 每周路线

周五晚上星之果实餐吧聚集多位村民，是集中送礼的最佳地点。皮埃尔杂货店、诊所和镇中心也适合顺路互动。节日当天可以一次与大量镇民交谈。

在农场门口放一个礼物箱，按生日月份准备礼物。周一重置次数后处理本周生日角色，周五餐吧补第二次礼物，无需记住所有人的每日行程。

## 红心事件与婚姻

达到指定心数后，需要在正确时间、天气和地点进入区域才能触发事件。可婚角色 8 心后可赠花束，10 心并升级房屋后可使用美人鱼吊坠求婚。

雨天海滩东侧的老水手出售吊坠。普通冬季不会下雨，需要特殊天气方式。婚后保持交谈、偶尔赠礼并维护家庭关系即可。

## 推荐顺序

优先提升会赠送关键配方或资源的村民，例如莱纳斯、罗宾、威利和乔治，再逐步补齐其他角色。生日礼物加固定周路线，可以在不牺牲农场进度的情况下完成全员满心。

## 礼物准备表

春季储备防风草、草莓和水仙花；夏季保留辣椒、甜瓜与向日葵；秋季准备南瓜、山药与蔓越莓；冬季依靠果树、宝石、咖啡和料理。冰箱旁放一只专用箱，按生日礼物、通用礼物和任务物品分类。

每月 1 日查看日历并记录生日。若目标村民难以找到，可以在傍晚前往餐吧、广场或回家路线等待。冬季农田维护较少，是集中补好感和触发红心事件的好时机。

## 常见失误

不要把任务物品提前送掉，也不要在背包满时领取邮件附件。红心事件未触发时，核对心数、天气、时间、入口与前置事件。部分角色在节日、雨天和诊所日会改变路线。`,
    coverImage: "/assets/game/32px-HeartIconLarge.png",
    featured: 1,
    categories: ["人物关系"],
    chapterChecks: [
      "周一刷新后安排两次普通赠礼，生日礼物作为额外机会单独准备。|优先使用金星或铱星最爱礼物，通用最爱也要记住角色例外。|每天遇到目标角色时先交谈，避免长期不互动造成好感衰减。",
      "农舍门口设置礼物箱，分为生日、通用和任务物品三组。|前期只送可重复生产的作物、树果和料理，不消耗建设资源。|每月初根据日历补货，缺少最爱礼物时准备稳定的喜欢礼物。",
      "周一处理生日角色与难找角色，周五利用餐吧集中完成第二次赠礼。|送礼路线结合商店、矿井、海滩等本来要去的目的地。|节日中先与所有到场村民交谈，再进行活动和小游戏。",
      "事件未触发时依次核对心数、前置事件、天气、时间、地点和进入方向。|赠送花束或求婚前完成房屋升级与必要关系条件。|婚后继续交谈和赠礼，不把满心视为永久无需维护。",
      "先提升会提供关键配方、邮件资源或常用服务的村民。|每季选三至五名重点角色，避免同时追全员导致路线失控。|利用生日完成大幅提升，普通周只维持固定两次赠礼。",
      "季节结束前把当季高品质礼物存入专用箱，不全部出售。|冰箱保存料理原料，宝石复制机可稳定提供部分最爱礼物。|每月 1 日更新生日表，提前一周确认礼物库存。",
      "任务物品、博物馆首件和建设材料不要混入礼物箱。|角色不在常规位置时检查节日、雨天、诊所和特殊剧情行程。|误送讨厌礼物后停止盲目尝试，先在资料库确认偏好。"
    ]
  },
  {
    title: "1.6 精通系统详解",
    summary: "五项技能满级后的精通经验、奖励顺序与新设备说明。",
    body: `# 1.6 精通系统详解

精通系统是 1.6 的后期内容。耕种、采矿、采集、钓鱼和战斗全部达到 10 级后，煤矿森林的精通洞窟开放，之后获得的各类技能经验会共同填充精通经验条。

## 开启条件

检查技能页面确认五项全部满级，尤其容易遗漏战斗和钓鱼。进入洞窟后能看到五座奖励台，每填满一次精通经验即可选择一项奖励。

经验不区分来源。收获、照顾动物、砍树、采矿、钓鱼和战斗都会贡献进度，因此维持正常农场循环通常比单刷某一种活动更有效。

## 五类奖励

耕种精通提供铱镰刀和祝福雕像。铱镰刀可收获成熟作物，明显提高大型农田效率。采矿精通提供重型熔炉和矮人王雕像，适合处理大量矿石并强化洞穴探索。

采集精通强化树木与神秘种子收益，并提供宝藏图腾。钓鱼精通解锁高级鱼竿能力。战斗精通开启饰品系统，为角色增加攻击、防御或资源效果。

## 推荐顺序

大型农场优先耕种；需要铱矿和放射性矿石时优先采矿；专注全图鉴和传奇鱼则选钓鱼。战斗饰品强度高，但需要后续刷取与重铸。

所有奖励最终都能获得，没有永久选错的问题。优先解决当前最大的效率瓶颈即可。

## 获取经验

大面积收获高价值作物、砍伐树木、用炸弹清理骷髅洞穴、连续钓鱼和挑战危险矿井都能快速获得经验。温室与姜岛保证全年耕种经验，树木农场则提供稳定采集经验。

不要为了刷经验放弃正常生产。精通本身就是长期目标，结合幸运日、食物增益和日常工作自然推进更轻松。

## 资源准备

重型熔炉、雕像和新工具需要矿石、放射性材料与高级资源。领取奖励前储备铱锭、煤炭、硬木和电池组，可以立刻制作。重复饰品可通过重铸调整属性。

完成精通后，重点从解锁技能转向优化效率。组合铱镰刀、重型熔炉、雕像增益与饰品，能减少维护时间，把更多日程留给收集、装修和挑战。

## 五项精通检查

领取奖励后确认新配方已经制作、工具放进常用箱、雕像摆在每天会经过的位置。重型熔炉适合放在矿石仓库旁，祝福雕像放在农舍出口，避免忘记领取每日效果。

饰品应按活动切换：骷髅洞穴重视伤害与生存，普通采矿可以选择资源效果，危险矿井更需要控制与防御。附魔和饰品并非一次定型，保留火山晶石与重复饰品用于调整。

全部精通后，可把目标转向完美度、齐先生任务、全图鉴和农场美化。效率工具的意义不只是赚钱，更是释放每天的时间。`,
    coverImage: "/assets/game/36px-Prismatic_Shard.png",
    featured: 1,
    categories: ["进阶攻略"],
    chapterChecks: [
      "逐项确认五项技能达到 10 级，未满项目安排对应的稳定经验来源。|洞窟开放后继续正常经营，所有技能经验都会汇入同一精通条。|领取奖励前先查看配方材料，确保解锁后能够立即制作。",
      "根据当前瓶颈选择奖励，不只看单次强度：耕种省操作，采矿提炼资源。|领取后阅读新工具与设备说明，并放到日常路线能经过的位置。|饰品和新设备需要后续投入，预留材料与测试时间。",
      "大农田优先耕种，缺矿优先采矿，收藏目标优先钓鱼。|第一项选择只影响获得顺序，记录下一阶段要补的精通。|每次领取后重新评估瓶颈，避免机械照搬固定顺序。",
      "把刷经验与正常收益结合，例如温室收获、树场砍伐和幸运日下矿。|准备速度、幸运和技能增益食物，减少无收益的移动时间。|精通是长期进度，不为短期冲刺牺牲整季生产节奏。",
      "提前储备铱锭、煤炭、硬木、电池组和放射性材料。|新设备按原料流向摆放，重型熔炉靠近矿石箱，雕像靠近出口。|重复饰品和火山晶石不要出售，保留用于重铸与组合测试。",
      "逐项确认奖励、配方、设备、工具和饰品已经实际投入使用。|根据骷髅洞穴、危险矿井或日常采矿切换饰品配置。|全部精通后把节省的时间投入完美度、齐任务、收藏和美化。"
    ]
  },
  {
    title: "姜岛解锁与金色核桃收集路线",
    summary: "从修复威利的船到岛屿农场、火山地牢与核桃房的完整推进顺序。",
    body: `# 姜岛解锁与金色核桃收集路线

完成社区中心或 Joja 城镇项目后，威利会邀请玩家进入鱼店后方。修复船只需要 200 硬木、5 个电池组和 5 个铱锭。完成后每次支付 1,000 金即可乘船前往姜岛。

## 首次登岛

抵达南部海滩后跟随雷欧进入东部。金色核桃是岛上的解锁货币，来源包括挖掘、钓鱼、种植、战斗、解谜和任务。看到异常地面、石圈或树叶标记时用锄头挖掘。

不要一开始随意花费核桃。推荐优先解锁西部通道与岛屿农场，再修复睡眠小屋和邮箱，减少每日往返。

## 西部农场

岛屿农场没有季节限制，适合杨桃、菠萝、远古水果和芋头。修复睡眠小屋后可在岛上过夜。海滩度假村会改变村民行程，可在基础设施完成后再解锁。

青蛙美食家要求依次种植并保持成熟的甜瓜、小麦和大蒜，不要提前收获。海盗妻子任务从鸟蒂开始，完成物品交换链可获得仙尘配方和核桃。

## 火山地牢

火山共有 10 层。用喷壶浇灭岩浆生成道路，携带食物、炸弹和足够水量。第五层是矮人商店，第十层有锻造台，首次到顶后会打开快捷出口。

收集火山晶石用于锻造武器、附魔工具和合成戒指。龙牙用于岛屿图腾柱等高级配方。高幸运日使用炸弹可显著提高探索效率。

## 核桃分类

固定核桃来自挖掘点、隐藏通道、宝箱、谜题和任务。重复活动中的核桃有数量上限，例如钓鱼、收获、金色椰子和火山怪物。考古办公室需要收集骨骼化石并完成调查。

美人鱼谜题需要雨天和长笛块，海盗湾有飞镖小游戏，水晶洞穴要求重复颜色顺序。长期缺少少量核桃时，应按区域清单逐项排查。

## 核桃房

累计获得 100 个金色核桃后，齐先生核桃房开放。房内有特别任务、完美度统计和齐钻商店。任务包括齐瓜、危险矿井、五彩农场和料理出售等。

齐钻优先购买能改善长期效率的压力喷头、马笛和关键配方，再考虑一次性资源。

## 推荐顺序

推荐按修船、解锁西部、修复小屋、建立农场、推进火山、完成雷欧与考古任务、收集 100 核桃的顺序进行。把姜岛当作第二农场，每周安排两至三天，通常能自然完成大部分收集。

## 登岛背包清单

常备喷壶、锄头、十字镐、武器、炸弹、食物和回程图腾。准备香蕉用于岛屿祭坛，保留骨头碎片与化石，不要出售首次获得的特殊物品。完成岛屿图腾柱后，往返成本会显著下降，姜岛也会真正成为稳定的第二生产基地。`,
    coverImage: "/assets/game/36px-Golden_Walnut.png",
    featured: 1,
    categories: ["进阶攻略", "新手入门"],
    chapterChecks: [
      "首次探索携带锄头并观察地面图案、石圈、树叶和隐藏通道。|前期核桃优先投入西部通道、农场与睡眠小屋，不先开娱乐设施。|每获得一批核桃就记录来源区域，避免后期无法判断缺口。",
      "先修复睡眠小屋和邮箱，再逐步建立种植区与洒水系统。|青蛙任务作物成熟后保持原地，确认任务完成前不要收获。|海盗妻子交换链物品单独存放，不出售首次获得的任务道具。",
      "进火山前装满喷壶，准备高恢复食物、炸弹和回程方式。|前几次以到达第 10 层和开启出口为目标，不为每个矿点停留。|火山晶石、龙牙和稀有掉落分箱保存，优先用于关键锻造与建筑。",
      "按南部、东部、西部、北部和火山分区核对固定核桃。|重复活动存在数量上限，长期无收获时立即换另一类来源。|考古、谜题、任务和隐藏通道分别记录，缺少少量时逐项排查。",
      "达到 100 核桃后先查看完美度缺口，再选择齐先生任务。|齐钻优先购买压力喷头、马笛和长期有效的配方或设施。|大型限时任务开始前确认季节、空地、加工能力和库存。",
      "推进顺序保持修船、西部、小屋、农场、火山、任务与核桃房。|每周安排两至三天集中处理姜岛，减少每日 1,000 金船费和移动。|完成传送设施后再把姜岛升级为长期第二生产基地。",
      "固定携带喷壶、锄头、十字镐、武器、炸弹、食物和返程工具。|香蕉、化石、骨头碎片和特殊任务物品单独保存。|出发前检查当天目标，只带相关工具，为核桃和火山掉落留出空间。"
    ]
  },
  {
    title: "第一年春季赚钱路线",
    slug: "year-one-spring-money-route",
    summary: "按日期拆解春季现金流、草莓投资、矿洞推进和夏季启动资金。关心收益时可配合作物收益计算器核对种植规模。",
    body: `# 第一年春季赚钱路线

第一年春季不是单纯把地种满，而是用有限体力换取稳定现金、矿石和社区中心进度。建议把这篇作为春季日程骨架，再用[作物收益计算器](/tools/crop-profit)核对草莓、土豆和花椰菜的投入产出，用[作物与种子资料库](/wiki/crops)确认作物成熟时间。

## 春 1 至 4 日：先建立现金流

第 1 天种下赠送的 15 个防风草，清理农舍门口一小片区域即可，不要砍到体力见底。优先制作木箱，把春季采集物、树液、煤炭、混合种子和献祭物分开放。第 2 天拿到竹鱼竿后，湖泊钓鱼比盲目扩田更稳定；不擅长钓鱼时可在河流和海边练手，先追求命中率而不是宝箱。

第 3 至 4 天根据体力决定补种土豆或花椰菜。土豆有额外产出概率，适合现金周转；花椰菜周期长但单价高，并且用于春季作物收集包。第一周不要把所有钱买成种子，至少留出背包扩容和复活节草莓本金。

## 春 5 至 12 日：矿洞和种田并行

矿洞开放后，每次下矿以推进 5 层电梯为目标。铜矿优先做熔炉和工具升级，煤炭不要随手出售。低运日处理农场、采集和送礼，好运日集中下矿；下雨日可以升级喷壶或去钓鲶鱼。春 12 前如果能推进到 20 层以上，后续拿铁矿和完成锅炉房会更顺。

农田规模控制在自己能轻松浇完的范围。没有洒水器时，30 至 50 格作物已经足够占用上午大半体力。春季作物收集包需要防风草、土豆、花椰菜和青豆各一份，青豆架会挡路，建议靠边种植。

## 春 13 日：复活节草莓投资

复活节前一天把草莓区域翻好，稻草人覆盖到位，水壶留满水。节日商店出售草莓种子，休闲路线准备 4,000 至 8,000 金即可；想冲收益可准备 10,000 金以上，但前提是每天能浇完。节日结束已是晚上，回家后直接种下草莓。

春 13 当晚种下的草莓通常能在春 21 和春 25 收获两次。草莓不是唯一答案，但它是第一年春季最容易形成爆发现金流的作物。第一批收入建议优先补背包、升级工具、购买夏季种子和准备基础建筑，不建议立刻买大量装饰。

## 春 14 至 28 日：把钱转成夏季启动能力

后半月重点不是继续无限扩田，而是把草莓收入转化为夏季效率。矿洞目标推进到 40 层，开始稳定拿铁矿；铜斧、铜镐、铜喷壶至少完成一到两项升级。遇到雨天时补春季限定鱼，晴天则按作物、矿洞、采集三件事轮换。

春 23 至 28 日不要再买无法成熟的春季作物。把现金留给夏季蓝莓、甜瓜、啤酒花和玉米。春 28 睡前整理箱子，把夏季种子、肥料、稻草人、洒水器材料和水壶放在门口，避免夏 1 浪费整天找物品。

## 月底验收清单

春末合理目标是：手上有 15,000 至 25,000 金，矿洞 40 层左右，背包至少升级一次，春季采集包与春季作物包基本完成，铜锭、铁矿、煤炭和精炼石英有一定库存。如果钓鱼熟练，现金可以更高；如果偏休闲，只要夏季有种子本金和基础矿石，就没有落后。

最常见失误是种太多导致每天只剩浇水、复活节前没有留本金、卖掉所有献祭物、晴天只钓鱼不下矿。春季真正的收益不是单日最高利润，而是让夏季开始时拥有资金、工具和矿石三条腿。`,
    coverImage: "/assets/game/36px-Strawberry.png",
    featured: 1,
    categories: ["新手入门", "农场经营"],
    chapterChecks: [
      "第 2 天前制作木箱，采集物、矿石、献祭品和出售品分开存放。|第一周不要把钱全部买种子，保留背包扩容和草莓本金。|钓鱼不熟练时先练普通鱼，稳定收入比反复失败更重要。",
      "每次下矿以 5 层电梯为单位，不在怪物层恋战。|煤炭、铜矿和铁矿优先留作熔炉、工具和洒水器材料。|青豆靠边种，防风草、土豆、花椰菜各留一份献祭。",
      "节日前一天完成翻地、稻草人覆盖和水壶准备。|草莓数量以每天能浇完为上限，不牺牲矿洞推进。|草莓第一批收入先补背包、工具和夏季种子。",
      "春 23 后不再购买无法成熟的春季作物。|后半月以矿洞 40 层、工具升级和夏季本金为核心。|春 28 晚上把夏季开局物品集中放在门口箱子。",
      "月底按现金、矿洞、工具、献祭和材料五项验收。|发现短板时优先补夏季启动能力，而不是追求春季最后一天收益。|保留少量高品质作物和鱼，方便献祭、送礼和任务。"
    ]
  },
  {
    title: "新手钓鱼入门与鱼类查询使用指南",
    slug: "beginner-fishing-guide-and-fish-search",
    summary: "从抛竿、控条、鱼饵到按季节筛选鱼类条件，帮助新手稳定完成鱼缸和图鉴。",
    body: `# 新手钓鱼入门与鱼类查询使用指南

钓鱼前期手感难，但一旦钓鱼等级提高、鱼竿和鱼饵解锁，收入和献祭都会明显稳定。建议先用[鱼类查询器](/tools/fish)按季节、天气和地点筛选，再到[鱼类图鉴](/wiki/fish)确认目标鱼的时间窗口。

## 先理解钓鱼条

新手最容易犯的错是长按不放。绿色钓鱼条有惯性，鱼向上冲时用短按或连续点按追上，鱼向下坠时提前松开，快到底部再点按缓冲。目标不是每次完美，而是让鱼一直留在条内。前几级优先钓低难度鱼，提升等级后钓鱼条会变长。

鱼竿升级很重要。竹鱼竿只能练手，玻璃纤维鱼竿可以用鱼饵减少等待时间，铱金鱼竿可同时使用鱼饵和渔具。新手不必过早购买昂贵渔具，先把钱投到背包和稳定鱼饵上更实际。

## 用查询器确认四个条件

多数鱼由季节、天气、地点和时间共同决定。打开鱼类查询器后，先选当前季节，再选天气；如果只想做社区中心鱼缸，可以把地点缩小到河流、山区湖泊、海洋或秘密森林。不要只凭鱼名去钓，因为同一地点在不同天气会完全不同。

例如春季雨天河流优先找鲶鱼，夏季中午海洋有河豚，冬季山区湖泊可以补鲟鱼。跨午夜的鱼要注意日期变化，夜间 16:00 至 02:00 的窗口并不等于整晚随时可得。

## 第一年前期推荐路线

第 2 天拿到鱼竿后，山湖的大嘴鲈鱼和鲤鱼适合练级；海洋鱼价值稳定，顺便可以捡贝壳补收入。春季雨天优先挑战鲶鱼，如果失败太多，就先钓普通鱼升级。夏季有更多高价值海鱼，秋季雨天继续补鲶鱼和鳗鱼，冬季则集中处理鲟鱼和冰川鱼相关目标。

钓鱼收益要和农场节奏结合。上午浇水，下午钓鱼，雨天全天钓鱼或下矿，是第一年前期最稳的安排。背包里带上田间小食、藻类或低价鱼，避免体力耗尽后被迫回家。

## 鱼饵、渔具和料理

鱼饵只减少等待时间，不会让鱼更容易控制；陷阱浮标能减慢逃脱速度，适合章鱼、鲟鱼和传奇鱼；软木塞浮标会加长钓鱼条，手感更稳定。料理方面，海之菜肴、龙虾浓汤和海泡布丁能提高钓鱼等级，挑战传奇鱼前再使用，普通练级不用浪费。

蟹笼也是图鉴的一部分。淡水和海水产物不同，建议各放几只。蟹笼需要鱼饵，收取后把献祭物先留一份，重复产物再出售或做料理。

## 献祭和收藏顺序

新鱼先检查是否用于鱼缸收集包、料理、任务或鱼塘。鲟鱼建议至少留一条，后期鱼塘产鱼籽可加工鱼子酱。河豚、鳗鱼、海参、大嘴鲈鱼也常用于任务或料理，普通品质更适合保存，高品质则出售。

如果只差几条鱼，先用查询器反查当前季节能钓什么，再决定是否等雨天或用魔法鱼饵。魔法鱼饵可忽略季节、天气和时间，但地点仍然必须正确。`,
    coverImage: "/assets/game/48px-Fishing_Skill_Icon.png",
    featured: 1,
    categories: ["新手入门", "钓鱼"],
    chapterChecks: [
      "练习时用短按控制惯性，不追求每条鱼完美。|钓鱼等级低时先选低难度水域，减少失败带来的体力浪费。|玻璃纤维鱼竿解锁后尽快使用鱼饵，提高单位时间鱼获。",
      "每次出门前确认季节、天气、地点和时间四项条件。|雨天鱼、夜间鱼和特殊地点鱼单独标记，优先处理短窗口目标。|用查询器缩小范围后再出发，不在错误水域盲钓。",
      "第一年春季以山湖和海洋练级，雨天再挑战鲶鱼。|上午处理农场，下午钓鱼，雨天全天钓鱼或升级工具。|背包常备恢复食物，低体力时提前返程。",
      "普通练级主要用鱼饵，高难目标再使用陷阱浮标或料理。|蟹笼分淡水和海水布置，献祭物先留一份。|传奇鱼前确认钓鱼等级、料理、渔具和站位。",
      "新鱼先查献祭、鱼塘、料理和任务用途再出售。|稀有鱼至少留一条，普通鱼按料理和任务需求分箱。|缺鱼时优先核对地点和天气，再考虑魔法鱼饵。"
    ]
  },
  {
    title: "社区中心前期优先完成路线",
    slug: "early-community-center-priority-route",
    summary: "按第一年春夏秋的实际可完成顺序整理社区中心早期收集包，避免错过季节限定物品。",
    body: `# 社区中心前期优先完成路线

社区中心不是一次性清空的任务，而是贯穿前两年的长期清单。前期重点是季节限定物品、低成本收集包和能带来实用奖励的房间。建议用[社区中心进度清单](/tools/community-center)记录缺口，再用[作物与种子资料库](/wiki/crops)核对成熟日期。

## 先做容易错过的季节物品

第一年春季必须优先保存春季采集四件套：野山葵、水仙花、韭葱和蒲公英。作物方面留下防风草、土豆、花椰菜和青豆各一份。若想做品质作物包，春季金星防风草要从第一批开始用肥料争取，不要等月底再补。

夏季需要甜瓜、番茄、蓝莓和辣椒，秋季需要玉米、茄子、南瓜和山药。跨季节作物玉米可以夏季种下，秋季继续收获，适合同时处理献祭和现金流。

## 优先完成工艺室和锅炉房

工艺室材料主要来自采集、木材、石头和硬木，成本低，奖励能修复桥梁，早完成有助于解锁采石场。锅炉房需要矿洞材料和怪物掉落，推进矿洞时顺手保存铜锭、铁锭、金锭、石英、火水晶、地晶和泪晶。

矿洞不要只卖宝石。第一份矿物、晶球开出的新物品和怪物掉落都先放献祭箱。锅炉房修复后矿车开放，往返矿井、公交站和城镇会节省大量时间，是前期最有价值的奖励之一。

## 茶水间决定温室速度

茶水间是社区中心路线的核心，因为完成后解锁温室。第一年能做的部分包括春夏秋作物、品质作物、部分动物产品和工匠物品。动物产品会被鸡舍和畜棚进度限制，建议先建鸡舍，再根据现金情况升级畜棚。

工匠物品包可以通过果树、蜂蜜、果酱、奶酪、布料和松露油完成。前期不必强行一次性买齐果树，但苹果和石榴常被多个目标使用，越早种越不容易卡进度。

## 鱼缸按天气窗口处理

鱼缸最容易漏掉天气和季节。春季雨天河流鲶鱼、夏季中午海洋河豚、冬季山湖鲟鱼都要提前安排。不会钓高难鱼时，先练级并使用鱼饵，等钓鱼条变长后再补。具体鱼类条件可配合[鱼类查询器](/tools/fish)筛选。

蟹笼收集包不难，但需要把蟹笼放在淡水和海水中连续收取。海滩采集物、矿洞怪物掉落和旅行货车也能补部分缺口。

## 前期存箱规则

在农舍或社区中心门口放一个“献祭箱”，按房间分类：工艺室、茶水间、鱼缸、锅炉房、公告栏、保险柜。任何新物品先查是否献祭，再决定出售。高价值物品不一定要马上交，但至少留一份，避免季节结束后等一年。

第一年结束前，理想状态是工艺室和锅炉房完成，茶水间大半完成，鱼缸补齐大部分常见鱼，公告栏开始积累。这样第二年只需要处理少数动物产品、果树和遗漏鱼类。

如果某个收集包只差旅行货车物品，不要每天反复跑图；周五和周日固定检查即可。把缺口写进清单，比依靠记忆更可靠，也能避免把最后一份红叶卷心菜、鸭毛或兔子的脚误卖。`,
    coverImage: "/assets/game/36px-Junimo.png",
    featured: 1,
    categories: ["新手入门", "农场经营"],
    chapterChecks: [
      "每季第一天列出当季作物和采集献祭物。|第一份季节限定物品先存箱，不因高价或任务急着出售。|品质作物从播种时就使用肥料，不等月底补救。",
      "采集、木材、石头和矿物先留一份，重复品再出售。|矿洞推进时按矿物、锭、怪物掉落分箱保存。|锅炉房优先完成，矿车能显著减少前期移动时间。",
      "茶水间按作物、品质、动物和工匠四类推进。|鸡舍和畜棚尽早规划，不把动物产品全部卖掉。|苹果和石榴等果树越早种，越不容易卡温室。",
      "鱼类先查季节、天气、地点和时间，不在错误窗口浪费一天。|高难鱼等钓鱼等级提升后再补，必要时使用料理和浮标。|蟹笼淡水、海水分开放，连续收取直到清单齐全。",
      "献祭箱按房间分类，任何新物品先查用途。|每月最后一天核对季节限定缺口。|第一年目标是完成低成本房间并减少第二年等待。"
    ]
  },
  {
    title: "矿洞前 40 层准备与收益路线",
    slug: "mines-floor-40-preparation-route",
    summary: "第一年春季矿洞 1 至 40 层的装备、食物、楼层推进、矿石收益和返程策略。",
    body: `# 矿洞前 40 层准备与收益路线

矿洞前 40 层是第一年效率转折点：铜矿、铁矿、煤炭、晶球和早期武器都来自这里。它直接影响工具升级、洒水器和社区中心锅炉房。进入前可先查[物品百科](/wiki/items)确认矿物与材料用途，避免把关键资源卖掉。

## 下矿前准备

背包至少保留十字镐、武器、食物和少量空格。第一年春季可用田间小食、春季采集物、低价鱼和鲑莓作为恢复来源。出门前看电视幸运值，好运日更适合冲层和开晶球，低运日适合收集铜矿或整理农场。

矿洞以电梯为核心机制，每 5 层保存一次进度。不要把目标设成“清空整层”，而是尽快找到梯子、推进到下一个电梯层，再决定是否回头挖矿。晚上 22:00 后要准备返程，避免昏倒损失金钱和物品。

## 1 至 20 层：铜矿和基础材料

前 20 层怪物压力不高，主要目标是铜矿、煤炭、石头和晶球。铜矿优先做熔炉、升级工具和制作基础设备。发现大量木箱、桶和矿点时可以多停留；怪物层或长地图则快速找梯子，不要耗到半夜。

地晶、石英、泪晶和火水晶用于锅炉房和制作。第一份全部保存，重复品再考虑出售或捐博物馆。普通晶球不要急着堆在箱子里，早期开出矿物和煤炭都很有价值。

## 21 至 40 层：向铁矿过渡

20 层以后敌人更密集，武器如果伤害太低，应优先处理冒险家公会奖励或购买过渡武器。目标是尽快抵达 40 层，因为 40 层后开始稳定出现铁矿。铁矿是优质洒水器、工具升级和大量机器的基础。

如果体力充足，可以在 30 至 39 层多挖铜矿和宝石；如果时间紧张，直冲电梯更重要。记住矿洞收益不是一次赚多少，而是是否解锁后续稳定资源。

## 收益怎么处理

铜矿、铁矿、煤炭、石头、精炼石英相关材料优先保留。紫水晶、黄水晶、翡翠等宝石第一件捐博物馆或留作送礼，重复品可出售补现金。虫肉可做鱼饵，史莱姆和蝙蝠翅膀留给任务或制作。

早期最不建议卖的是煤炭。煤炭看似普通，但熔炼矿锭、小桶、保存罐和炸弹都会消耗大量煤炭。缺钱时卖鱼和高品质作物，比卖煤炭更稳。

## 推荐日程

晴天上午浇水，午前进矿洞，目标推进 5 至 10 层；雨天可全天下矿或升级喷壶；好运日优先冲电梯，普通日补矿石。每次返程后整理矿石箱，第二天早上统一熔炼，避免背包里长期堆材料。

春末前达到 40 层，就能为夏季优质洒水器和工具升级打基础。之后再考虑骷髅洞穴、火山和高级矿物，前 40 层的目标始终是稳定、低风险、持续推进。

如果连续几天没有推进，不要硬追深度。先补背包、食物和武器，再从已解锁电梯层重新出发。矿洞路线的收益来自长期材料积累，10 个铁锭和稳定煤炭库存，往往比一次卖掉几颗宝石更能改变夏季效率。`,
    coverImage: "/assets/game/32px-Mining_Skill_Icon.png",
    featured: 1,
    categories: ["新手入门", "进阶攻略"],
    chapterChecks: [
      "下矿前确认背包空格、食物、武器和返程时间。|好运日冲层，低运日补矿或整理农场。|每 5 层电梯是阶段目标，不强求清空整层。",
      "铜矿优先用于熔炉、工具和基础机器。|第一份矿物、晶体和怪物掉落先保存。|长地图和怪物层快速找梯子，避免体力被消耗在低收益战斗。",
      "武器伤害不足时先更新装备，再继续硬冲。|尽快到 40 层解锁稳定铁矿来源。|时间紧张时电梯优先，矿点收益其次。",
      "煤炭、矿石、石头和精炼材料优先保留。|宝石按博物馆、送礼和出售分箱。|虫肉留作鱼饵，怪物材料不要全部卖空。",
      "按晴天短下矿、雨天长下矿、好运冲层的节奏安排。|返程后立刻整理并熔炼，减少第二天找材料时间。|春末以 40 层和基础矿石库存作为验收目标。"
    ]
  },
  {
    title: "作物收益计算器使用指南",
    slug: "crop-profit-calculator-guide",
    summary: "说明如何用作物收益计算器比较净利润、启动成本、收获次数和日均收益，规划每季种植。",
    body: `# 作物收益计算器使用指南

作物收益不能只看单个售价。成熟天数、重复收获、种子成本、播种日期、季节剩余天数和加工路线都会改变实际利润。使用[作物收益计算器](/tools/crop-profit)前，建议先在[作物与种子资料库](/wiki/crops)确认作物季节和成熟时间，再把候选作物放进同一条件下比较。

## 先填对季节和起始日

同一种作物在不同播种日期下收益差异很大。春 1 种土豆和春 20 种土豆不是同一问题；春 13 晚上种草莓，也只能按剩余天数计算两次收获。计算器中的季节、开始日期和地块数量，是判断是否还能成熟的核心条件。

如果你正在规划节日前后作物，先把不可操作的节日和浇水时间考虑进去。工具给的是数学结果，玩家还要确认自己每天是否有体力和时间浇完。

## 看净利润，不只看总收入

总收入是卖出价值，净利润才是扣除种子成本后的结果。前期现金紧张时，启动成本尤其重要。某些作物最终利润高，但前期投入大，会挤压背包、工具和动物建筑预算。比较时至少同时看启动成本、净利润和日均利润。

例如草莓适合复活节后集中投资，但如果本金太少，土豆、甘蓝和钓鱼收入可能更稳。夏季蓝莓、甜瓜和啤酒花也不能只按单价判断，重复收获和加工设备容量都要一起看。

## 重复收获作物怎么理解

蓝莓、蔓越莓、咖啡豆、啤酒花和远古水果的优势在于多次收获。计算器会根据季节剩余天数推算收获次数，因此越早种越有利。晚种重复收获作物时，可能只收一次，收益会明显下降。

草莓的特殊点在于种子来自复活节，通常从春 13 晚上开始计算。第一年春季如果没有足够本金，不必强行追求满田草莓；把一部分资金留给夏季启动，整体进度反而更稳。

## 把工具结果转成种植计划

计算器告诉你哪个作物在当前条件下更赚钱，但种植计划还要兼顾献祭、任务、料理和送礼。每季至少保留一小块“功能作物区”，种植社区中心、任务和礼物需要的作物；其余区域再按利润排序选择现金作物。

如果使用洒水器，地块数量可以扩大；如果仍靠手浇，收益排名必须和体力成本一起看。每天浇水超过上午半天，会挤压矿洞和钓鱼时间，未必是最佳路线。

## 常见比较场景

春季：防风草用于低成本练级，土豆适合现金周转，花椰菜用于高单价和献祭，草莓用于复活节后爆发。夏季：蓝莓稳定，甜瓜兼顾高价值和献祭，啤酒花适合小桶路线。秋季：蔓越莓稳定，南瓜高单价，葡萄和茄子可补任务与料理。

后期温室和姜岛要单独比较。远古水果维护低，杨桃酒利润高但需要重复买种和播种。设备不足时，作物再赚钱也可能积压；先用计算器估算产量，再决定小桶和保存罐数量。`,
    coverImage: "/assets/game/36px-Gold.png",
    featured: 1,
    categories: ["农场经营", "新手入门"],
    chapterChecks: [
      "计算前确认季节、开始日期、地块数量和剩余天数。|节日、浇水和体力限制要人工纳入计划。|不同播种日期分开算，不把整季平均结果套用到月底。",
      "同时查看启动成本、总收入、净利润和日均利润。|前期现金少时，不选会压垮其他发展的高成本方案。|对比作物时统一地块数和播种日期。",
      "重复收获作物越早种越有利，晚种前先确认还能收几次。|草莓按复活节后实际播种日期计算。|本金不足时保留部分资金给夏季和工具升级。",
      "现金作物区和功能作物区分开规划。|洒水器数量决定实际可管理地块，不用手浇极限面积硬套利润。|献祭、任务和礼物作物至少各留一份。",
      "春夏秋分别比较本季主力作物，不跨季节混算。|温室、姜岛和加工设备容量单独评估。|设备不足时先扩加工链，再盲目扩大种植面积。"
    ]
  },
  {
    title: "第一年夏季赚钱路线",
    slug: "year-one-summer-money-route",
    summary: "面向完成第一年春季的新手，按夏 1 到夏 28 拆解种植、钓鱼、矿洞、洒水器和背包升级节奏。",
    body: `# 第一年夏季赚钱路线
夏季不是简单把春季地块换成蓝莓就结束。第一年夏天的核心目标，是把春季积累的本金转化成稳定现金流，同时为秋季、社区中心和矿洞材料打底。春季如果已经按[第一年春季赚钱路线](/guides/year-one-spring-money-route)完成草莓、矿洞和基础工具准备，夏 1 的重点就是快速下种、减少手浇压力，并用[作物收益计算器](/tools/crops)核对当前地块数是否真的适合继续扩张。

## 夏 1 到夏 5：先铺开稳定现金流
夏 1 不要把所有钱都压在单一作物上。蓝莓适合稳定多次收获，甜瓜适合高单价和社区中心，辣椒成熟快且可重复收获，啤酒花适合以后小桶加工。普通新手建议先把地块分成三块：一块蓝莓提供长期现金，一块甜瓜处理献祭和高单价，一小块辣椒或啤酒花用于任务、料理和加工路线。具体比例不用追求唯一最优，关键是每天能浇完。
如果背包还没有升级，夏初优先补第一档背包。夏季作物多、钓鱼和矿洞掉落也多，小背包会让你频繁回家，损失的时间经常比少种几块地更贵。洒水器不足时不要盲目扩田，先把能稳定照顾的地块种满，再考虑加地。

## 夏 6 到夏 14：矿洞和洒水器进入主线
夏季中段要开始把矿洞推进和农场扩张绑在一起。手浇地块越多，白天留给矿洞和钓鱼的时间越少；洒水器越早稳定，秋季就越轻松。普通洒水器覆盖少，适合过渡；优质洒水器需要矿洞材料，长期收益更高。具体矿石路线可以结合[洒水器解锁与矿石路线](/guides/sprinkler-unlock-and-ore-route)或[矿洞前 40 层准备与收益路线](/guides/mines-floor-40-preparation-route)规划。
这一阶段不要每天都下矿，也不要每天都钓鱼。晴天上午浇水，下午根据运气决定下矿或钓鱼；雨天可以整天下矿或补鱼。夏季钓鱼收益不错，但如果矿石短缺，洒水器延迟会拖慢整个秋季。现金短缺时钓鱼补钱，材料短缺时下矿补矿，这是更稳的节奏。

## 蓝莓、啤酒花、甜瓜和辣椒怎么选
蓝莓适合普通新手，因为多次收获、维护简单、现金流稳定。它不要求加工设备，也不需要复杂排程，适合把农场从春季小规模过渡到夏季中规模。缺点是启动成本较高，夏 1 没有足够本金时不要硬买满。
啤酒花单卖不突出，但如果你已经准备小桶路线，后续加工价值更高。问题是啤酒花需要棚架，布局会限制通行，新手不建议第一年夏天满田啤酒花。甜瓜成熟慢但单价高，还能用于社区中心和品质作物规划；辣椒成熟快，适合补现金、任务和少量料理。建议先查[作物与种子资料库](/wiki/crops)确认成熟天数，再用工具按剩余天数比较。

## 夏 15 到夏 21：补齐背包、工具和社区中心
夏季后半段不要只看账户余额。背包、铜斧、铜镐、洒水器、鸡舍或畜棚都是会影响后续效率的投资。若每天浇水超过半天，优先把钱和矿石转成洒水器；若下矿经常因为背包满而回家，优先升级背包；若社区中心茶水间卡住，就保留甜瓜、蓝莓、辣椒等献祭作物。
这个阶段也要开始为秋季留本金。很多新手夏末看到蓝莓收入后会把钱花光，结果秋 1 无法买足种子。建议夏 20 后把新增收入分成三份：秋季种子本金、工具和洒水器、日常开支。不要为了多种最后一批作物，把秋季启动资金全部压进去。

## 夏 22 到夏 28：收尾和秋季启动
夏末的重点是清仓、留种和准备秋季。还来得及成熟的作物可以补种，来不及成熟的不要买。多次收获作物如果只剩一次收获窗口，继续扩种意义很低。把多余作物按用途分开：社区中心留一份，任务和料理留少量，高价值作物再出售或加工。
最后几天可以集中下矿补铁矿、煤炭和石头，准备秋季洒水器和加工设备。也可以用雨天补鱼，避免社区中心鱼缸以后卡季节。夏季结束前，理想状态不是赚到最多钱，而是秋 1 有足够本金、田地布局清楚、洒水器数量上升、背包和工具不再拖慢节奏。`,
    coverImage: "/assets/game/36px-Blueberry.png",
    featured: 1,
    categories: ["新手入门", "农场经营"],
    chapterChecks: [
      "夏 1 先确认背包、种子本金和可浇地块，不把所有钱压在单一作物。|蓝莓、甜瓜、辣椒、啤酒花按用途分区种植。|用作物收益计算器按剩余天数核对是否值得扩田。",
      "每周安排矿洞日和钓鱼日，雨天优先处理长流程。|洒水器材料短缺时减少扩田，先补铜矿、铁矿和煤炭。|不要让手浇占掉整个上午。",
      "蓝莓负责稳定现金，甜瓜负责献祭和高单价。|啤酒花适合已有加工计划的玩家，不适合无脑满田。|辣椒用于短周期现金、任务和料理储备。",
      "夏中后期把收入分给背包、工具、洒水器和秋季本金。|社区中心作物至少留一份，不把高价值作物全部卖掉。|每天整理箱子，避免矿石和作物混放。",
      "夏 22 后只补种来得及成熟的作物。|夏末集中补矿石、煤炭和秋季启动资金。|目标是秋 1 顺利开局，不是夏末账户数字最高。"
    ]
  },
  {
    title: "洒水器解锁与矿石路线",
    slug: "sprinkler-unlock-and-ore-route",
    summary: "解释洒水器为什么决定农场扩张，并整理铜矿、铁矿、煤炭、熔炉和矿洞电梯节点的推进关系。",
    body: `# 洒水器解锁与矿石路线
洒水器是前期农场从手工经营变成稳定生产的关键。没有洒水器时，地越多，浇水越占时间和体力；有了洒水器后，玩家才有余力下矿、钓鱼、跑社区中心和送礼。洒水器路线本质上不是“做几个机器”，而是把矿洞推进、矿石储备、煤炭消耗和作物规模放在同一套节奏里。若你还没稳定到 40 层，可以先读[矿洞前 40 层准备与收益路线](/guides/mines-floor-40-preparation-route)。

## 为什么洒水器优先级这么高
第一年春夏最常见的错误，是看到作物赚钱就不断扩田，最后每天浇水到中午，矿洞和钓鱼都没时间做。这样短期看种了更多作物，长期却缺矿石、缺煤炭、缺工具升级，秋季反而发展慢。洒水器能把每天重复操作变成一次性材料投资，越早形成覆盖，后续收益越稳定。
不必一开始追求完美布局。普通洒水器可以过渡，优质洒水器才是中期扩张核心。地块布局要围绕可用洒水器数量，而不是先铺一大片田再被迫手浇。想比较“多种地”和“先做洒水器”的收益，可以配合[作物收益计算器](/tools/crops)估算可管理地块。

## 铜矿、铁矿和煤炭的关系
铜矿是熔炉、工具升级和基础设备的起点，铁矿则关系到优质洒水器和中期机器。煤炭经常被低估，但熔炼矿锭、制作保存设备和炸弹都会消耗煤炭。很多玩家矿石够了却发现煤炭不足，导致洒水器做不出来。因此下矿时不要只盯矿点，木箱、怪物掉落和煤车都值得顺手处理。
铜矿主要帮助你进入工具和设备循环，铁矿帮助你进入自动化循环。不要把矿石和矿锭随手卖掉，前期出售矿物的现金收益很难抵消后续卡材料的损失。需要查材料用途时，可先看[物品百科](/wiki/items)，确认是否和工具、献祭或设备有关。

## 熔炉和电梯节点怎么配合
熔炉越早做越好，因为矿石只有熔成锭才能真正变成工具升级和设备。下矿返家后，尽量立刻把当日矿石分批熔炼，不要把矿石长期堆在箱子里。第二天出门前再收锭，可以减少等待时间。电梯节点则决定你能否稳定刷目标矿层，每 5 层都是阶段目标。
前期不要强迫自己每天推进很多层。好天气、好运气、食物充足时冲电梯；体力紧张或时间少时回刷已解锁层补矿。电梯节点越多，获取材料越可控，洒水器进度也越稳定。矿洞路线的收益不是某一天暴富，而是每天稳定多一点矿石和煤炭。

## 洒水器制作节奏
普通洒水器能缓解最早期手浇压力，但覆盖较小，适合临时过渡或小面积功能作物区。优质洒水器覆盖更实用，适合作为夏末到秋季的主力目标。不要为了追求全农场自动化而拖延当季种植，正确做法是每周增加几台，逐步替换手浇区域。
布局上优先覆盖高收益或重复收获作物。社区中心作物、短周期练级作物和少量任务作物可以保留手浇。这样即使洒水器不足，也不会影响主要现金流。每次扩田前先问三个问题：我有足够种子吗？有足够洒水器吗？下矿和钓鱼时间会不会被挤掉？

## 和第一年夏秋节奏衔接
夏季是洒水器路线的关键窗口。春季矿洞打底后，夏季收入变高，正适合把现金和矿石转成自动化能力。秋季作物收益更稳定，如果秋 1 仍然大量手浇，就会错过矿洞、社区中心和加工设备的推进空间。
建议把洒水器目标写进每周计划：本周补多少铁矿、需要多少煤炭、能增加几块自动化田。只要每周有增长，就不必焦虑是否达到极限效率。普通新手的最佳路线，是在不牺牲社区中心和工具升级的前提下，让手浇面积逐步下降。`,
    coverImage: "/assets/game/36px-Copper_Ore.png",
    featured: 1,
    categories: ["农场经营", "进阶攻略"],
    chapterChecks: [
      "扩田前先确认每天浇水时间，不让手浇挤掉矿洞和钓鱼。|普通洒水器可过渡，优质洒水器作为中期主力。|用工具比较可管理地块，而不是盲目满田。",
      "铜矿、铁矿和煤炭分开统计，煤炭不足会直接卡熔炼。|矿石优先留给工具、熔炉和洒水器。|不确定用途时先查物品百科。",
      "熔炉做出后每天返家就开始熔炼。|以每 5 层电梯为阶段目标，不强求清空整层。|好运日冲层，普通日补矿。",
      "洒水器先覆盖高收益和重复收获作物。|功能作物和献祭作物可保留小面积手浇。|每周稳定增加自动化田，比一次性追求完美更稳。",
      "夏季把收入转成洒水器和工具效率。|秋 1 前准备足够自动化地块和本金。|每周记录矿石、煤炭、洒水器缺口。"
    ]
  },
  {
    title: "社区中心鱼缸收集路线",
    slug: "community-center-fish-tank-route",
    summary: "按季节、天气、时间和地点整理社区中心鱼缸收集思路，帮助新手避免错过雨天鱼、夜间鱼和季节限定鱼。",
    body: `# 社区中心鱼缸收集路线
鱼缸是社区中心里最容易被天气和季节卡住的房间。作物错过了还能等下一季，鱼类如果同时受季节、雨天、夜间和地点限制，错过一次可能要等很久。新手不要靠记忆硬背所有鱼，建议用[鱼类查询器](/tools/fish)按季节和天气筛选，再把缺口写进[社区中心前期优先完成路线](/guides/early-community-center-priority-route)的清单里。

## 先按季节建立鱼缸计划
春季先处理河流、湖泊和雨天窗口。雨天鱼要优先排进当天计划，因为晴天无法补。夏季鱼类分布更散，海洋、山区湖泊和河流都要跑；秋季要补春季没完成的部分，并留意夜间和雨天窗口。冬季虽然作物少，但鱼缸补漏空间更大，适合集中处理湖鱼和部分难鱼。
不要一天内频繁换地点。新手钓鱼等级低，跑图成本高，建议一天只盯一个目标组合，比如“春季雨天河流”或“夏季白天山区湖泊”。筛选时先选季节，再选天气和地点，最后看时间段，效率比从完整列表里逐条找高很多。

## 雨天鱼不要错过
雨天鱼是鱼缸进度最常见的卡点。春季雨天、秋季雨天和夏季雨天各有不同目标，不能只看季节。雨天当天如果还要浇水、下矿或跑任务，建议优先把鱼缸目标安排到上午或下午固定时段，剩余时间再处理其他事情。
低等级时遇到高难鱼不要硬耗整天。可以先钓普通鱼练级，准备鱼饵、料理或浮标后再补。第一条用于献祭的鱼尽量保留，不要因为高价就卖掉。需要确认具体鱼类条件时，直接查看[鱼类图鉴](/wiki/fish)或在工具里按雨天筛选。

## 夜间鱼和时间窗口
夜间鱼容易被忽略，因为很多玩家傍晚已经在整理农场或下矿返程。鱼缸里有些目标需要晚间或深夜出现，必须提前安排回程和体力。夜间钓鱼前，把背包清空、食物带好、传送或返程路线想清楚，避免钓到一半因为格子满或时间太晚中断。
夜间鱼不适合和长时间矿洞日安排在同一天。更稳的做法是白天处理农场和采购，傍晚直接去目标地点钓鱼。若当天是雨天且目标鱼也要求夜间，就把这个窗口视为优先级最高的任务，其他事情往后排。

## 地点选择和新手路线
鱼缸目标通常分布在河流、海洋、山区湖泊、森林和特殊地点。新手先完成容易到达、窗口宽的目标，再处理高难度或特殊条件目标。海洋适合集中钓多种鱼，山区湖泊适合补湖鱼，河流则常和雨天、季节绑定。
如果你还在第一年春夏，建议把钓鱼和赚钱结合。普通鱼可以出售补现金，鱼缸目标单独放进献祭箱。不要把所有鱼都塞箱子，也不要所有鱼都卖掉。保留规则很简单：第一次钓到、条件苛刻、社区中心可能需要的鱼先留一条。

## 用查询器减少漏项
鱼类查询器的价值不是替代攻略，而是减少漏项。每到新季节第一天，先筛选本季鱼；每逢雨天，再筛选雨天鱼；晚上准备钓鱼时，再筛选夜间鱼。这样鱼缸进度会自然推进，不需要一次性背完全部鱼类。
如果鱼缸长期只差一两条，不要盲目每天钓。先确认是否当前季节、天气、时间和地点都满足，再决定是否出门。很多“钓不到”的问题不是运气差，而是条件不对。把缺口记录在[社区中心进度清单](/tools/community-center)里，会比临时翻资料更可靠。`,
    coverImage: "/assets/game/36px-Fish.png",
    featured: 1,
    categories: ["钓鱼", "新手入门"],
    chapterChecks: [
      "每季第一天筛选当季鱼，先列出鱼缸缺口。|一天只盯一个地点和天气组合，减少跑图浪费。|第一条献祭鱼先保留。",
      "雨天鱼优先级高于普通赚钱钓鱼。|低等级钓不上高难鱼时先练级和准备料理。|雨天当天固定一段时间补鱼，不被杂事挤掉。",
      "夜间鱼提前清背包、带食物、规划返程。|不要把深矿日和夜间鱼安排在同一天。|雨夜限定窗口优先处理。",
      "河流、海洋、山区湖泊分日集中处理。|第一次钓到的稀有或条件苛刻鱼先留。|普通鱼出售补现金，目标鱼放献祭箱。",
      "按季节、雨天、夜间三类反复筛选。|长期缺一条时先核对条件再出门。|把缺口写进社区中心清单。"
    ]
  },
  {
    title: "春夏秋必留物品清单",
    slug: "seasonal-items-to-keep",
    summary: "按春、夏、秋整理新手前期应该保留的作物、鱼类、觅食物、矿物和社区中心常用物品，避免卖掉季节限定材料。",
    body: `# 春夏秋必留物品清单
新手前期最容易后悔的事，不是少赚了一点钱，而是把季节限定物品卖掉，等社区中心、任务或料理需要时只能再等一年。必留清单不是让你什么都不卖，而是先保留关键样本，再出售重复品。建议在农场或社区中心门口放一个献祭箱，配合[社区中心进度清单](/tools/community-center)标记缺口。

## 春季：先留基础作物和雨天鱼
春季作物至少保留防风草、土豆、花椰菜、青豆各一份。若准备品质作物包，金星防风草要从早期就开始留，不要全部卖掉。草莓主要用于赚钱，但第一年也可以留少量给后续种子生产或礼物。具体成熟时间可查[作物与种子资料库](/wiki/crops)。
春季觅食物包括野山葵、水仙花、韭葱和蒲公英，第一次集齐前不要乱卖。鱼类方面，春季雨天鱼尤其需要留意，河流和海洋目标最好先留一条。矿洞刚开启时，第一份矿物、晶球开出的新品、怪物掉落材料也建议先存箱。

## 夏季：别把甜瓜和鱼缸目标卖光
夏季作物里，甜瓜、蓝莓、辣椒、番茄等都可能和献祭、任务或料理有关。甜瓜常被当作现金作物直接卖掉，但第一份一定要保留；蓝莓可以稳定出售，但也建议留少量备用。啤酒花如果走加工路线，可以先留一批，不要只看单卖价格。
夏季鱼类地点分散，海洋、河流、山区湖泊都有目标。雨天鱼、午间鱼和部分高难鱼不要钓到就卖，先查[鱼类图鉴](/wiki/fish)或用[鱼类查询器](/tools/fish)确认是否和鱼缸相关。海滩觅食物、蟹笼物品和矿洞材料也要按房间分箱保存。

## 秋季：高价值作物也要留样本
秋季作物收益高，很多玩家会把南瓜、蔓越莓、葡萄、山药和茄子全部出售。更稳的做法是每种先留一份，南瓜和高品质作物再额外留样本。玉米横跨夏秋，如果夏季已经种下，秋季可以继续收获并补足献祭需求。
秋季觅食物和鱼类同样会卡进度。雨天、夜间和特定地点的鱼必须提前安排，不要等月末再补。高价值矿物如五彩碎片、铱锭、稀有宝石，第一份不要急着卖或送礼，先确认是否用于解锁、博物馆、设备或任务。

## 哪些东西可以放心出售
重复的普通品质作物、明确不用于当前路线的普通鱼、已经献祭和捐赠过的常见矿物，可以作为现金来源。出售前只要问三件事：是否本季限定？是否社区中心还缺？是否近期任务或工具升级会用？三个答案都是否，才适合卖。
前期缺钱很正常，但不要用卖关键材料解决所有现金问题。钓鱼、短周期作物和重复矿物更适合补钱。季节限定物品一旦错过，时间成本往往比出售价格高得多。把“第一份先留”当成默认规则，能避免大多数卡进度问题。

## 存箱和检查节奏
建议按用途分箱：社区中心、作物样本、鱼类、矿物、料理和送礼。每月 1 日检查本季必留物品，每个雨天检查鱼类缺口，每月 25 日后停止购买来不及成熟的种子。这样既不会把仓库塞满无用物，也能避免关键物品消失。
如果不确定物品用途，先查对应图鉴或工具，不要凭直觉卖。真正成熟的前期节奏，是“重复品换现金，唯一品保进度”。当你能稳定保留关键样本，社区中心、任务、料理和送礼都会顺很多。`,
    coverImage: "/assets/game/36px-Bundle_Blue.png",
    featured: 1,
    categories: ["新手入门", "农场经营"],
    chapterChecks: [
      "春季四种基础作物和四种觅食物先留一份。|金星防风草提前准备。|春季雨天鱼和矿洞新品先存箱。",
      "夏季甜瓜、蓝莓、辣椒等先留样本。|鱼类先查鱼缸需求，再决定出售。|蟹笼、海滩和矿洞材料按房间分箱。",
      "秋季高价值作物也先留一份。|雨天、夜间和地点限定鱼提前补。|稀有矿物第一份先确认用途。",
      "重复普通物品可以出售，唯一品先保留。|出售前检查季节、社区中心和近期任务。|缺钱优先卖重复鱼和作物，不卖关键材料。",
      "按社区中心、作物、鱼类、矿物、料理分箱。|每月 1 日和 25 日各检查一次缺口。|不确定用途时先查图鉴或工具。"
    ]
  },
  {
    title: "新手背包升级与体力管理路线",
    slug: "beginner-backpack-and-energy-route",
    summary: "围绕第一年春夏节奏，讲清背包升级、体力、时间、种地、钓鱼和下矿之间的取舍。",
    body: `# 新手背包升级与体力管理路线
第一年春夏的效率，经常不是由单个高收益作物决定，而是由背包、体力和时间共同决定。背包太小会频繁回家，体力不足会打断浇水、下矿和钓鱼，时间规划混乱会让雨天、节日和矿洞窗口被浪费。刚开始可以先参考[第一年春季赚钱路线](/guides/year-one-spring-money-route)，再把本篇作为日常取舍规则。

## 背包什么时候升级
第一档背包升级通常越早越舒服，但不要为了升级背包把种子本金全部掏空。判断标准很简单：如果你每天钓鱼或下矿都会因为格子满提前回家，背包升级就是高优先级；如果你主要在小农田种防风草，暂时还能忍受。背包不是直接赚钱，但能减少中断和往返。
春季复活节前后是常见决策点。若你准备买草莓，需要保留足够本金；若你已经频繁下矿、钓鱼和捡觅食物，背包升级会立刻提升效率。不要把背包升级当作奢侈品，它是让矿洞和钓鱼收益稳定转化的基础。

## 体力优先花在哪里
体力最值得花在能推进长期效率的事情上：浇必要的作物、下矿拿矿石、钓鱼补现金和练等级。前期砍树、清石头和大面积翻地虽然重要，但不要每天把体力耗在无即时目标的清理上。农场不用第一周就清得很干净，先清出种植区、通行线和放箱子的位置即可。
如果当天要下矿，上午浇水地块要控制规模；如果当天要钓鱼，带一点食物并留出返程时间。用[作物收益计算器](/tools/crops)估算可管理地块，比凭感觉扩田更可靠。种得太多但没体力做其他事，会拖慢整体进度。

## 下矿、钓鱼和种地怎么取舍
晴天适合“短浇水 + 下矿或钓鱼”，雨天适合长时间下矿或补鱼。好运日优先下矿冲电梯，普通日可以钓鱼补钱或整理农场。缺矿石时，不要继续扩大农田；缺现金时，不要整周只下矿。前期路线要在现金和材料之间来回平衡。
如果你的目标是洒水器和工具升级，就把矿洞排进每周固定日程。具体矿洞推进可以接[矿洞前 40 层准备与收益路线](/guides/mines-floor-40-preparation-route)。如果目标是社区中心鱼缸或短期现金，就把雨天和晚上留给钓鱼。不要把所有事情压到同一天。

## 食物和恢复怎么准备
前期食物不必追求高级料理。春季觅食物、田间小食、低价鱼、洞穴胡萝卜都能临时补体力。关键是出门前就决定今天是否需要食物：下矿日和长钓鱼日必须带，普通浇水日可以不带。不要等体力见底才临时回家找东西。
恢复品也要分层使用。低价值食物用于补浇水和砍树，高恢复食物留给下矿危险层或高价值钓鱼窗口。体力管理不是把每天都榨干，而是让关键活动不中断。晚上体力还有剩时，可以砍几棵树、整理箱子或补少量钓鱼，不必强行下矿。

## 第一年春夏的推荐节奏
春季前半段小农田、钓鱼补钱、逐步开矿洞；春季中后段根据草莓和矿洞进度决定背包升级；夏季开始后，用洒水器减少手浇，把更多时间转向矿洞、社区中心和加工材料。每次扩田前都确认背包、体力和洒水器是否跟得上。
普通新手不需要每天满效率。更可靠的目标是：上午不被浇水拖死，下午有明确任务，晚上不因为背包满和体力空浪费窗口。背包解决往返，食物解决中断，洒水器解决重复劳动。三者配合起来，第一年春夏会顺很多。`,
    coverImage: "/assets/game/36px-Energy.png",
    featured: 1,
    categories: ["新手入门", "农场经营"],
    chapterChecks: [
      "背包升级前确认不会掏空关键种子本金。|频繁钓鱼或下矿导致满包时，背包优先级提高。|复活节前后根据草莓本金决定升级窗口。",
      "体力优先用于必要浇水、矿石、钓鱼和等级。|农场清理只做种植区、通行线和箱子位。|扩田前确认体力和时间能承受。",
      "好运日下矿冲电梯，普通日补钱或整理。|缺矿不扩田，缺钱不连续空挖。|雨天用于下矿或补鱼。",
      "下矿和长钓鱼日提前带食物。|低价值食物用于日常，高恢复食物留给关键窗口。|晚上剩余体力做短任务，不硬塞长流程。",
      "春季小农田起步，夏季用洒水器释放时间。|每次扩田先看背包、体力、洒水器。|目标是稳定推进，不是每天榨干。"
    ]
  },
  {
    title: "第一年秋季赚钱路线",
    slug: "year-one-fall-money-route",
    summary: "面向已经度过春夏的新手，整理秋 1 到秋 28 的种植、加工、社区中心、矿洞和第二年准备节奏。",
    body: `# 第一年秋季赚钱路线
秋季是第一年最容易拉开差距的季节。春季解决起步，夏季解决现金流和洒水器，秋季则要把农场从“能赚钱”推进到“能稳定运转”。如果你已经完成[第一年夏季赚钱路线](/guides/year-one-summer-money-route)里的基础目标，秋 1 的重点不是单纯买最贵种子，而是同时考虑现金、献祭、加工、矿洞材料和第二年准备。作物选择可以先用[作物收益计算器](/tools/crops)按剩余天数核对，再查[作物与种子资料库](/wiki/crops)确认成熟时间。

## 秋 1 到秋 7：先把地块和本金分清
秋 1 最常见的错误，是把夏末全部收入一口气买成单一作物。蔓越莓现金流稳定，南瓜单价高且常用于社区中心和任务，茄子、山药、玉米、葡萄等作物则适合补献祭和料理。普通新手建议先把农田分成三类：主力赚钱区、社区中心样本区、短周期补现金区。这样即使资金不够，也不会因为只种一种作物而卡住多个目标。
如果优质洒水器数量已经上来，秋季可以适度扩大农田；如果仍靠手浇，就不要硬追大田。秋季白天还要跑矿洞、采集、送礼和社区中心，浇水时间过长会挤掉其他进度。秋初先保留一笔工具升级和动物建筑预算，不要让账户归零。

## 蔓越莓、南瓜和功能作物怎么选
蔓越莓适合稳定现金流，越早种越能体现重复收获价值。它适合有洒水器、有稳定本金的新手。南瓜成熟慢，但单次价值高，也能承担献祭、任务和加工储备。若你正在补品质作物或社区中心茶水间，南瓜必须至少保留样本。茄子启动成本低、重复收获，适合小面积功能区；山药、白菜、葡萄等则用于补清单和料理。
不要把“收益最高”理解为“全部种这一种”。如果你缺矿石，少种一点、腾出时间下矿更重要；如果你缺社区中心物品，功能作物比现金作物更优先；如果你已经准备小桶和罐头瓶，部分高价值作物可以留下来加工，而不是当天全部出售。

## 秋季中段：加工和矿洞不能停
秋 8 到秋 18 是农场节奏最稳定的阶段。主力作物开始回款后，优先补加工设备、工具升级和矿洞材料。罐头瓶适合处理大量中低价作物，小桶适合高价值作物和长期路线。设备数量不足时，不要囤满一箱作物等加工；现金紧张时先卖一部分，留出可加工样本即可。
矿洞方面，秋季仍然需要铁矿、煤炭、金矿、石头和怪物掉落。洒水器数量越多，越应该把空出来的上午或下午投入矿洞。可以继续参考[洒水器解锁与矿石路线](/guides/sprinkler-unlock-and-ore-route)，把矿石缺口和农田扩张绑定在一起。

## 秋末：别忘了冬季和第二年
秋 20 以后，不要只盯最后一批作物是否赚钱。要开始准备冬季任务、矿洞推进、工具升级、动物建筑和第二年种子资金。来不及成熟的作物不要买，能赶上一次收获的重复作物也要谨慎。秋末收入最好分成几份：第二年春季本金、工具和建筑、加工设备、社区中心补漏。
秋季觅食物、鱼类和作物样本都要整理进箱子。若还没完成社区中心关键房间，秋末要用[社区中心进度清单](/tools/community-center)核对缺口。冬季不能正常种植户外作物，秋末少留一个南瓜、玉米或山药，后面可能要等很久。

## 普通新手的稳妥目标
第一年秋季的验收标准，不是账户上有最多金币，而是第二年不会重新从零开始。比较理想的状态是：主力地块大部分自动浇水，工具至少完成关键升级，矿洞能稳定获取中后期材料，社区中心季节限定物品不缺，冬季有明确计划。
如果你秋季发展偏慢，也不必硬追极限路线。先保证每种关键作物留样本，再用重复作物和钓鱼补现金。普通新手真正需要的是稳定推进，而不是复制极限收益表。秋季做得稳，冬季就能专心下矿、整理农场和准备第二年。`,
    coverImage: "/assets/game/36px-Cranberries.png",
    featured: 1,
    categories: ["新手入门", "农场经营"],
    chapterChecks: [
      "秋 1 先分主力赚钱区、献祭样本区和短周期补现金区。|保留工具升级、动物建筑和加工设备预算，不让账户归零。|洒水器不足时不要盲目扩大手浇地块。",
      "蔓越莓负责稳定现金，南瓜负责高单价和献祭样本。|功能作物按社区中心、料理和任务需求少量种植。|不要把收益最高误解为全部种一种。",
      "秋中段把收入转成加工设备、矿洞材料和工具升级。|设备不足时部分出售、部分留加工。|继续补铁矿、煤炭、金矿和石头。",
      "秋 20 后只补种来得及成熟的作物。|收入分给第二年春季本金、建筑、工具和加工设备。|用社区中心清单核对秋季限定缺口。",
      "秋季目标是第二年顺利开局，不是单日金币最高。|每种关键作物至少留样本。|冬季前整理箱子和下一阶段计划。"
    ]
  },
  {
    title: "鸡舍畜棚与动物产品路线",
    slug: "coop-barn-animal-products-route",
    summary: "整理第一年鸡舍、畜棚、干草、动物产品和社区中心的推进顺序，帮助新手避免过早扩建导致现金断档。",
    body: `# 鸡舍畜棚与动物产品路线
动物路线能提供稳定产品、社区中心材料和后续加工收益，但它不是越早越好。鸡舍、畜棚、动物、干草、筒仓和加工设备都会占用现金与资源，如果没有规划，很容易出现“买了动物却没钱买种子”的断档。建议先用[社区中心进度清单](/tools/community-center)确认动物产品缺口，再结合[春夏秋必留物品清单](/guides/seasonal-items-to-keep)决定哪些产品要先保留。

## 先建筒仓还是先建鸡舍
普通新手更稳的做法是先准备筒仓，再考虑鸡舍。筒仓能把割草转成干草，减少冬季和雨天的饲料压力。没有筒仓就急着养动物，会让饲料全部依赖购买，前期现金压力很明显。鸡舍本身能开启鸡蛋、蛋黄酱、鸭蛋等路线，但只有在每天能稳定喂养和收产品时才算真正赚钱。
如果春夏现金很紧，可以先把动物路线推迟到夏末或秋初。作物和钓鱼负责启动资金，矿洞负责材料，动物负责长期稳定产出。不要因为看到社区中心需要动物产品，就立刻把全部现金投进建筑。

## 鸡舍路线：鸡蛋、鸭蛋和蛋黄酱
鸡舍路线适合先从鸡开始。鸡蛋每天稳定，蛋黄酱机能把产品转成更实用的现金流。大鸡蛋、鸭蛋、鸭毛等产品可以用于社区中心、礼物或出售。第一次获得的新动物产品建议先保留一份，确认献祭、任务和送礼需求后，再把重复品加工或出售。
升级鸡舍前要看两个条件：是否有足够饲料，是否有稳定现金补种子。若秋季还在为作物本金发愁，不要硬升大鸡舍。动物建筑会带来长期收益，但短期现金回流不如成熟作物直接，节奏要放在农场总计划里看。

## 畜棚路线：牛奶、奶酪和后续扩展
畜棚通常比鸡舍更贵，也更容易压缩前期预算。牛奶和奶酪很实用，可以作为恢复品、礼物、社区中心材料和稳定收入来源。第一头牛不必太早买，最好等农田、洒水器和基础工具稳定后再推进。若你已经进入秋季并有多余现金，畜棚是不错的长期投资。
山羊、绵羊、猪等后续动物不适合新手一次性全上。每增加一种动物，都意味着更多建筑升级、更多饲料和更多日常管理。普通路线建议先稳定鸡和牛，再决定是否扩展。需要查动物产品是否属于物品用途，可以看[物品百科](/wiki/items)。

## 干草、雨天和冬季准备
动物路线最大的隐性成本是饲料。春夏秋割草前，先确认筒仓是否有空间；冬季前，检查干草是否足够。雨天动物不会外出吃草，也需要室内饲料。若长期忘记喂养，动物心情下降，产品质量和产出都会受影响。
不要把农场所有草都提前清干净。留出草地扩散区，可以减少购买干草的压力。冬季前如果干草不足，宁愿提前补买，也不要让动物断粮。动物产品路线追求稳定，不是靠某一天爆发收益。

## 和社区中心、送礼、料理的关系
动物产品经常连接多个系统：社区中心需要，部分村民喜欢，料理和恢复也能用。第一份新产品先留，重复品再加工出售。蛋黄酱、奶酪、布料、鸭毛等物品都可能在不同阶段派上用场。若你正在做公告板收集包，动物产品优先级会更高。
动物路线适合愿意每天固定巡场的玩家。如果你更喜欢下矿和钓鱼，可以晚一点推进，只保留社区中心所需产品。合理的目标不是第一年养满所有动物，而是在不影响种植本金的情况下，让鸡舍和畜棚逐步提供稳定补充收入。`,
    coverImage: "/assets/game/36px-Large_Milk.png",
    featured: 1,
    categories: ["农场经营", "新手入门"],
    chapterChecks: [
      "先用社区中心清单确认动物产品缺口。|现金紧张时不要为了建筑牺牲种子本金。|动物路线看长期稳定，不看短期暴利。",
      "优先准备筒仓，减少饲料购买压力。|鸡舍适合从鸡开始，不急着一次性升级满。|第一份新动物产品先留。",
      "蛋黄酱机提高鸡蛋现金流。|大鸡蛋、鸭蛋和鸭毛先确认献祭与任务需求。|升级鸡舍前确认饲料和现金都够。",
      "畜棚适合农田和工具稳定后推进。|牛奶和奶酪兼顾恢复、礼物和收入。|后续动物逐步扩展，不一次性全买。",
      "冬季前检查干草库存。|雨天也要喂养动物。|保留草地扩散区，减少长期饲料成本。"
    ]
  },
  {
    title: "温室作物与加工收益路线",
    slug: "greenhouse-crops-processing-route",
    summary: "讲清温室解锁后如何选择远古水果、杨桃、啤酒花和果树，并把作物收益与小桶、罐头瓶容量结合起来规划。",
    body: `# 温室作物与加工收益路线
温室解锁后，农场会进入完全不同的阶段。户外作物受季节限制，温室则能全年种植，因此最重要的问题不再是“当季种什么”，而是“有限地块长期种什么”。温室不是越快塞满越好，要结合种子来源、加工设备数量、现金需求和社区中心进度判断。规划前可以先看[作物收益计算器使用指南](/guides/crop-profit-calculator-guide)，再用[作物收益计算器](/tools/crops)比较候选作物。

## 温室初期不要空等完美作物
很多新手拿到温室后，只想等远古水果或杨桃，结果温室长期空着。更稳的做法是先用可获得的高价值作物填充一部分地块，同时保留空间给长期作物。若你暂时没有足够远古种子，可以先种草莓、蓝莓、蔓越莓或其他重复收获作物过渡。温室空置一天就是一天损失。
初期目标是让温室产生稳定现金，而不是一步到位。等种子生产机、远古种子、小桶和资金都跟上，再逐步替换过渡作物。温室布局可以按洒水器覆盖先固定，不要频繁大改。

## 远古水果和杨桃怎么取舍
远古水果适合长期稳定路线，一旦成熟后持续收获，适合配合小桶做长期加工。它的优势是省心、稳定、适合全年循环；限制是种子扩张需要时间。杨桃单次价值高，适合已有资金、能稳定购买种子或已经解锁对应来源的玩家；限制是需要反复播种，现金占用更明显。
普通玩家不必在两者之间做绝对选择。温室可以一部分远古水果做长期底盘，一部分杨桃或其他高价值作物做短期现金。真正影响收益的不是单个作物售价，而是加工设备是否跟得上。若小桶不足，大量高价值作物堆箱子，实际回款会被拖慢。

## 小桶和罐头瓶容量决定真实收益
温室作物常常需要加工才能体现价值。小桶适合高价值水果和部分作物，罐头瓶适合处理中低价或大量作物。设备数量不足时，不能只看加工后理论收益，还要看等待队列。若温室每周产出远超设备容量，部分作物直接出售反而更利于现金流。
建议把温室规划和木材、煤炭、矿石储备放在一起看。加工设备不是凭空出现的，材料本身也需要时间获取。若你发现作物一直堆仓库，可以减少短期作物面积，增加设备投资，或者把一部分产品直接卖掉。

## 果树和边缘空间
温室果树可以提供全年水果，适合补社区中心、送礼、料理和稳定小额收入。果树占用前期资金，但一旦成熟就不需要重复购买种子。不要把所有钱都砸进果树，也不要完全忽视它们。苹果、石榴等常和收集目标相关，越早规划越不容易卡进度。
温室边缘空间要提前考虑通行和摆放，不要把树和设备放得影响采收。新手可以先少量种树，等现金稳定后再补全。需要查作物和水果用途时，优先看[作物与种子资料库](/wiki/crops)和[物品百科](/wiki/items)。

## 普通玩家的温室路线
稳妥路线是：先用现有重复收获作物填温室，逐步用远古水果替换；有稳定资金后加入杨桃或其他高价值作物；同时按周补小桶和罐头瓶。不要因为追求最终布局，让温室空置很久。也不要因为理论收益高，就种下设备完全处理不了的数量。
温室的意义，是让农场有一个不受季节影响的现金核心。只要它能稳定产出、设备能逐步消化、箱子里不堆满卖不掉的作物，这条路线就是健康的。后续再考虑姜岛、酿酒屋和大规模加工，也会更容易。`,
    coverImage: "/assets/game/36px-Starfruit.png",
    featured: 1,
    categories: ["农场经营", "进阶攻略"],
    chapterChecks: [
      "温室解锁后先让地块产生收入，不长期空等完美作物。|过渡作物可以先种，后续逐步替换。|布局先围绕洒水器固定。",
      "远古水果负责长期稳定，杨桃负责高单次价值。|不要把两者看成唯一选择。|加工设备跟不上时，理论收益会被拖慢。",
      "小桶适合高价值作物，罐头瓶适合大量中低价作物。|设备队列太长时，部分作物直接出售。|加工设备材料也要纳入计划。",
      "果树提供全年水果，用于献祭、送礼和料理。|边缘空间要留通行，不影响采收。|苹果、石榴等目标水果越早规划越稳。",
      "普通路线是过渡作物起步，远古水果替换，设备逐步补齐。|不空置温室，也不让作物长期堆仓库。|温室先做稳定现金核心。"
    ]
  },
  {
    title: "任务公告板与特别订单路线",
    slug: "quest-board-special-orders-route",
    summary: "整理新手如何判断日常任务、公告板请求和特别订单的优先级，避免为了低收益任务打乱农场主线。",
    body: `# 任务公告板与特别订单路线
星露谷的任务很多，但不是每个任务都值得立刻做。新手常见问题是看到公告板就接，结果为了一个低价值请求跑完整张地图，耽误种地、钓鱼和下矿。任务系统的正确用法，是把它当作补充收益、好感度和路线引导，而不是每天的主线。可以先查[任务指南](/wiki/quests)确认类型，再按当前季节和资源决定是否接。

## 日常公告板任务怎么筛选
普通公告板请求通常要求交付某个物品或击杀少量怪物。判断是否值得做，先看三点：物品是否已经有库存，目标地点是否顺路，奖励是否能顺带提升好感或补现金。如果物品需要跨地图临时获取，或者会消耗社区中心关键样本，就不建议为了任务硬做。
例如已经有多余鱼类、作物或矿物时，交付任务很划算；如果对方要你唯一的一份季节限定作物，就应先保留。任务奖励的金币有时不高，但好感度和路线顺路价值可以弥补。核心原则是顺手做，不打断主线做。

## 特别订单不要只看奖励
特别订单通常时间更长、要求更多，但奖励也更有价值。接之前要确认是否有足够季节天数、是否能稳定获取材料、是否会影响当前农场计划。需要大量作物的订单，要先确认成熟时间和地块；需要矿洞材料的订单，要确认武器、食物和电梯进度。
不要因为奖励看起来好，就接一个当前阶段无法完成的订单。失败不会毁档，但会浪费时间和资源。普通新手可以优先接和自己当前路线一致的订单：正在钓鱼就接鱼类相关，正在下矿就接矿洞相关，正在扩农场就接作物相关。

## 任务和社区中心的冲突
任务经常会和社区中心争夺同一类物品。第一份季节限定作物、鱼类、动物产品和矿物，应先看社区中心是否需要。若社区中心还缺，就不要为了短期金币交掉。你可以用[社区中心进度清单](/tools/community-center)先查缺口，再决定是否交任务。
如果任务要求的是重复品，或者当前季节还能轻松再获得，就可以接。比如重复收获作物、多余普通鱼、常见矿物，通常适合用来完成任务。关键不是“不做任务”，而是不要用稀缺物换短期奖励。

## 把任务放进每日路线
任务最好和已有路线合并。去镇上买种子时顺路交给村民，去矿洞时顺手击杀目标，去海边钓鱼时顺手交付鱼类。不要为了一个任务专门跑一趟，除非奖励非常关键或对方生日即将到来。若你正在规划好感，可以配合[村民关系资料库](/wiki/villagers)查看对象和住处。
公告板任务也能帮助你认识地图和 NPC，但前期时间很紧。每天出门前先确定主任务：种地、钓鱼、下矿、社区中心或送礼。公告板只作为附加目标。这样既能拿到奖励，又不会让农场节奏被打乱。

## 什么时候可以放弃任务
放弃低价值任务不是损失，而是资源管理。当天雨天鱼窗口、节日、矿洞好运日、作物收获日，都可能比任务更重要。如果任务需要你卖掉或交出唯一物品，也应优先放弃。特别订单如果中途发现无法完成，不要继续投入更多关键材料。
成熟的任务路线，是用任务强化当前目标。缺钱时接顺路交付，缺好感时接目标 NPC，缺材料时接和矿洞相关的订单。任务不是主线的替代品，而是让主线更顺的辅助系统。`,
    coverImage: "/assets/game/36px-Secret_Gift.png",
    featured: 1,
    categories: ["任务指南", "新手入门"],
    chapterChecks: [
      "接任务前看库存、顺路程度和奖励价值。|唯一季节限定物品先不交任务。|顺手完成优先，专门跑图谨慎。",
      "特别订单先确认季节天数、材料来源和当前能力。|作物订单看成熟时间，矿洞订单看装备和电梯。|优先接与当前路线一致的订单。",
      "任务物品和社区中心冲突时，先查社区中心缺口。|重复品适合交任务，唯一品先保留。|短期金币不能替代长期进度。",
      "把交付、击杀和采集任务合并进日常路线。|去镇上、矿洞、海边时顺路完成。|公告板作为附加目标，不替代当天主线。",
      "低价值任务可以放弃。|雨天鱼、好运矿洞日、节日和收获日优先。|任务用于强化当前目标，而不是打乱节奏。"
    ]
  },
  {
    title: "冬季整理与第二年准备路线",
    slug: "winter-prep-year-two-route",
    summary: "说明第一年冬季如何安排矿洞、工具升级、农场布局、社区中心补漏和第二年春季启动资金。",
    body: `# 冬季整理与第二年准备路线
冬季没有常规户外作物，很多新手会觉得收入突然断掉。实际上冬季是整理农场、推进矿洞、升级工具、补社区中心和准备第二年的关键窗口。秋季如果已经按[第一年秋季赚钱路线](/guides/year-one-fall-money-route)留下本金和材料，冬季就不该闲置，而是把平时被浇水占掉的时间全部转成长期效率。

## 冬季第一周：整理箱子和农场布局
冬 1 到冬 7 适合先整理农场。把作物样本、鱼类、矿物、动物产品、料理和送礼物品分箱，清掉无用杂物，规划第二年春季地块。冬季不用每天浇大量作物，正好重铺道路、移动箱子、规划洒水器覆盖区和动物活动区。
不要一上来就把所有资源花光。第二年春 1 需要大量种子本金，冬季工具升级和建筑扩展也要钱。先列出必须做的事：升级哪件工具、补哪些洒水器、建不建畜棚、社区中心缺哪些季节物品。没有清单，很容易冬季中途现金断档。

## 工具升级和矿洞推进
冬季是升级喷壶、锄头、斧头和镐子的好时间。因为没有大面积户外作物，喷壶升级风险低；锄头升级能提升春季开田效率；斧头和镐子则帮助清理农场与推进矿洞。升级前先确认矿锭和金币，不要把关键工具送去升级后发现第二天必须用。
矿洞方面，冬季可以集中补铁矿、金矿、煤炭、石头和怪物材料。若还没稳定到中后段矿层，冬季是补电梯节点的好机会。矿洞材料会直接影响第二年洒水器、加工设备和建筑推进。可以继续参考[矿洞前 40 层准备与收益路线](/guides/mines-floor-40-preparation-route)或[洒水器解锁与矿石路线](/guides/sprinkler-unlock-and-ore-route)。

## 冬季收入来源怎么安排
冬季仍然能赚钱，只是方式变化。钓鱼、矿洞、动物产品、加工品、觅食物和任务都能提供现金。若你已经有鸡舍或畜棚，动物产品是稳定收入；若温室已解锁，温室作物是核心现金流；若两者都没有，就用钓鱼和矿洞补钱。
不要为了冬季收入卖掉所有材料。煤炭、矿锭、木材、石头和高价值矿物，经常比一次性出售更重要。现金紧张时优先出售重复鱼类、重复矿物和可再获得的加工品，关键材料要留给第二年设备和建筑。

## 社区中心补漏
冬季适合核对社区中心缺口。冬季鱼类、冬季觅食、矿物和动物产品都可以集中处理；春夏秋错过的季节限定物品，则要记录到第二年。用[社区中心进度清单](/tools/community-center)检查房间和收集包，不要只凭记忆。
如果缺的是鱼类，先用[鱼类查询器](/tools/fish)确认冬季还能不能补；如果缺的是作物，就记录第二年播种日；如果缺的是动物产品，就评估是否需要升级鸡舍或畜棚。冬季的价值在于把缺口变成计划，而不是临时乱跑。

## 第二年春季启动准备
冬末要为第二年春 1 做准备：留足种子本金，准备洒水器和肥料，规划地块，确认工具不在升级中，清理通路和箱子。第二年春季可以比第一年大很多，但前提是自动化、资金和体力跟得上。不要因为冬季有空就把农场铺满，春季当天才发现浇水压力过大。
理想状态是：春 1 能快速买种、下种、浇水，第二天开始恢复正常节奏。若你准备扩大种植，可以先用[作物收益计算器](/tools/crops)估算地块规模。冬季准备得越清楚，第二年春季越不会乱。`,
    coverImage: "/assets/game/36px-Winter.png",
    featured: 1,
    categories: ["新手入门", "进阶攻略"],
    chapterChecks: [
      "冬季第一周先整理箱子、道路、洒水器区和动物区。|列出工具、建筑、社区中心和第二年本金清单。|不要一开始把现金花光。",
      "冬季适合升级喷壶、锄头、斧头和镐子。|升级前确认金币、矿锭和第二天需求。|集中补矿洞电梯、矿石和煤炭。",
      "冬季收入来自钓鱼、矿洞、动物产品、加工品和任务。|重复品可卖，关键材料先留。|温室或动物路线稳定后再扩大支出。",
      "用社区中心清单核对冬季可补项目。|缺鱼查鱼类查询器，缺作物记录第二年播种日。|动物产品缺口决定是否升级建筑。",
      "冬末准备第二年种子本金、肥料、洒水器和工具状态。|不要让春 1 卡在工具升级或箱子混乱。|扩田前先确认自动化和体力能跟上。"
    ]
  },
  {
    title: "村民礼物推荐与生日送礼路线",
    slug: "villager-gift-birthday-recommendation",
    summary: "按生日、住址和低成本礼物规划村民好感，先解决送礼试错，再逐步补最爱礼物。",
    body: `# 村民礼物推荐与生日送礼路线

村民送礼最怕两件事：一是把稀有材料送错人，二是为了追求最爱礼物打乱第一年的赚钱和社区中心节奏。更稳的做法是先建立“不会送错”的低成本礼物池，再把生日当天留给更高价值礼物。本站的[村民关系资料库](/wiki/villagers)可以查生日、住址和最爱礼物，本篇负责把这些信息整理成新手能执行的路线。

如果你还在第一年春夏，送礼不应该压过种地、钓鱼和下矿。可以先参考[第一年新手路线总览](/guides/beginner-year-one-route-overview)安排每天主目标，再把送礼塞进行程路线上。礼物是长期收益，不是每天必须清空背包的任务。

## 先建立低风险礼物池

新手第一步不是背所有最爱，而是准备一批不会轻易卡主线的礼物。花卉、部分作物、常见料理、矿洞宝石和容易取得的采集物，都可以按村民喜好分组。关键是不要把社区中心需要的第一份作物、鱼类、动物产品和稀有矿物直接送掉。

春季可以从防风草、土豆、采集物和矿洞宝石开始筛选；夏季再加入辣椒、向日葵、甜瓜、河豚等季节物；秋季重点留意南瓜、蔓越莓、葡萄和矿洞补给。送礼前先看资料库，不确定时宁可先放进箱子。礼物路线不是越贵越好，稳定、可重复、不会影响其他目标才是第一年最重要的标准。

## 生日当天优先级最高

生日礼物的好感收益明显高于普通日，因此每个季节开始时先看本季生日表。不要等当天早上才翻箱子，最好提前 2 到 3 天把礼物放在门口箱或随身箱。春季早期资源少，可以先给喜欢礼物；夏秋资金和产物稳定后，再补最爱礼物。

如果生日和节日、雨天鱼、矿洞幸运日冲突，优先选择“顺路送礼”。例如去海边钓鱼时顺路找威利，去山湖或矿洞时顺路处理罗宾、德米特里厄斯、塞巴斯蒂安相关礼物。这样不会为了一个礼物浪费半天路程。

## 前期常见村民路线

阿比盖尔适合和矿洞宝石、南瓜、河豚路线绑定；海莉适合和椰子、向日葵、季节作物路线绑定；谢恩适合和辣椒、披萨、啤酒等稳定来源绑定；莉亚适合与采集、沙拉和后期加工路线绑定。不同村民不是孤立目标，最好和你本来要做的作物、钓鱼、下矿安排合并。

如果你正在推进[社区中心前期优先完成路线](/guides/early-community-center-priority-route)，第一份季节限定物品优先献祭或保留，第二份再考虑送礼。比如河豚、南瓜、动物产品、稀有矿物都可能同时有送礼、献祭、任务或解锁用途，不要只看好感收益。

## 和日程、背包一起规划

背包小的时候，送礼路线要短。早上浇水后先处理农场附近和镇中心，下午去矿洞或海边时再带对应礼物。不要把 8 个礼物塞进小背包导致钓鱼、采矿和采集空间不足。若你经常因为背包满而错过资源，可以先看[新手背包升级与体力管理路线](/guides/beginner-backpack-and-energy-route)。

礼物箱建议按“本季生日”“常用喜欢礼物”“稀有保留物”分三类。常用喜欢礼物可以放心周常使用；稀有保留物只在生日或明确最爱时使用；社区中心和关键任务物品单独存放，避免手滑送掉。
`,
    coverImage: "/assets/game/36px-Diamond.png",
    featured: 1,
    categories: ["人物关系", "新手入门"],
    chapterChecks: [
      "先查村民关系资料库，确认生日、住址和最爱礼物。|第一份社区中心、任务或稀有材料先保留，不确定不要送。|准备一批低成本、可重复获取的喜欢礼物。",
      "每季第一天检查生日，把礼物提前放进箱子。|生日当天优先送更高价值礼物，普通日用稳定礼物过渡。|遇到节日、雨天鱼或幸运日时，优先顺路送礼。",
      "把阿比盖尔、海莉、谢恩、莉亚等常见路线和作物、钓鱼、矿洞计划合并。|季节限定物品先确认献祭和任务需求。|不要为了好感度牺牲第一年的现金流和社区中心进度。",
      "按本季生日、常用礼物、稀有保留物整理箱子。|小背包阶段减少跨地图送礼，优先处理顺路目标。|每周固定两天送礼即可，不必每天强行跑满。"
    ]
  },
  {
    title: "矿洞楼层资源与掉落路线",
    slug: "mines-drops-and-floor-resource-route",
    summary: "按矿洞阶段整理铜矿、铁矿、煤炭、晶球、怪物材料和电梯节点，帮助新手明确下矿收益。",
    body: `# 矿洞楼层资源与掉落路线

矿洞不是单纯刷层数的地方，它同时承担矿石、煤炭、怪物材料、晶球、战斗经验和工具升级材料的来源。新手常见问题是只盯着下一层，结果回家后发现铜矿、铁矿、煤炭或石头仍然不够。更稳的方式，是把矿洞按阶段拆开：什么时候推电梯，什么时候刷材料，什么时候该收手回家。

如果你还没稳定到 40 层，可以先看[矿洞前 40 层准备与收益路线](/guides/mines-floor-40-preparation-route)。如果目标是洒水器和工具升级，再结合[洒水器解锁与矿石路线](/guides/sprinkler-unlock-and-ore-route)安排铜矿、铁矿和煤炭缺口。

## 前段矿层：铜矿、石头和基础材料

矿洞前段主要价值在铜矿、石头、晶球和基础怪物材料。这个阶段不要急着把背包塞满低价值杂物，优先带走矿石、煤炭、晶球、怪物掉落和食物。石头看起来普通，但楼梯、建筑、设备和后续制作都会大量消耗，前期顺手积累非常重要。

前段下矿的目标是快速建立电梯节点。每 5 层保存一次进度，不要为了清空整层拖到深夜。如果当天幸运好、楼梯出现快，就继续推进；如果地图大、怪物密、体力低，就把矿石和晶球带走回家。效率来自持续推进，而不是某一天硬打到底。

## 中段矿层：铁矿、煤炭和装备过渡

进入冰层和更深区域后，铁矿、煤炭和新的怪物材料开始变重要。铁矿直接关系到工具升级、优质洒水器和中期设备。煤炭则是所有矿锭的燃料，很多玩家矿石够了却卡在没煤，这会让洒水器和工具升级一起延后。

中段路线建议把目标分成两类：推电梯日和刷材料日。推电梯日少恋战，带食物、剑和足够空间，看到楼梯就走；刷材料日则可以在资源密集层反复补矿石、煤炭和晶球。背包空间不够时，优先丢弃低价纤维、树液或容易再拿的杂物，保留矿石和材料。

## 怪物掉落和晶球处理

怪物掉落不要只看单次售价。史莱姆、虫肉、蝙蝠翅膀、太阳精华、虚空精华等材料会服务戒指、鱼饵、任务、制作和后续路线。第一批建议先留，不要一回家就全部卖掉。晶球也是早期博物馆、矿物和材料循环的重要来源，最好集中带给铁匠处理。

如果目标是赚钱，矿洞收益不一定来自直接卖矿石。矿石变成工具、洒水器和设备后，会让农场每天节省大量时间。这个长期收益通常高于短期卖矿。矿洞材料还会影响[作物收益计算器](/tools/crops)里的地块规模，因为自动化越早，能稳定照顾的作物越多。

## 每次下矿的收尾规则

晚上 22:00 后就要开始判断是否返程。背包满、血量低、食物不足、楼梯难找时，不要继续赌。死亡损失金钱和物品，会抵消当天收益。回家后把矿石、煤炭、晶球、怪物材料、宝石分箱存放，第二天再决定熔炼或捐赠。

最稳的节奏是：晴天手浇压力小时下矿，雨天优先升级工具或钓雨天鱼，好运日冲电梯，普通日刷矿石。矿洞路线要服务农场目标，不要为了清层数把作物、社区中心和背包升级全部拖慢。
`,
    coverImage: "/assets/game/36px-Iron_Ore.png",
    featured: 1,
    categories: ["进阶攻略", "新手入门"],
    chapterChecks: [
      "前段优先铜矿、石头、煤炭、晶球和怪物材料。|每 5 层以电梯节点为目标，不追求清空整层。|背包满时保留矿石和材料，低价杂物优先丢弃。",
      "区分推电梯日和刷材料日。|铁矿和煤炭优先服务工具、洒水器和中期设备。|缺煤时不要只挖矿，也要考虑怪物、矿车和木炭窑来源。",
      "第一批怪物材料和晶球先保留。|晶球集中交给铁匠处理，优先补博物馆和矿物资料。|矿石短期可卖，但更推荐转化为工具和自动化收益。",
      "22:00 后评估返程，不赌低血量和空背包。|回家后按矿石、煤炭、晶球、怪物材料分箱。|好运日冲电梯，普通日刷材料，雨天配合工具升级。"
    ]
  },
  {
    title: "第一年新手路线总览",
    slug: "beginner-year-one-route-overview",
    summary: "把春夏秋冬、作物、钓鱼、矿洞、背包、社区中心和送礼串成一条适合普通新手的全年路线。",
    body: `# 第一年新手路线总览

第一年最重要的不是某一天做到极限，而是让每个系统都不掉队：作物提供现金，钓鱼补启动资金和社区中心，矿洞提供工具和洒水器材料，背包与体力决定每天能做多少事，送礼和任务则作为长期积累。本站已经有分主题攻略，本篇负责把它们串成一条清晰路线。

如果你刚开档，先看[第一年春季赚钱路线](/guides/year-one-spring-money-route)；进入夏季后接[第一年夏季赚钱路线](/guides/year-one-summer-money-route)；不确定作物规模时用[作物收益计算器](/tools/crops)核对。总览页的作用，是帮助你决定“今天优先做什么”。

## 春季：建立现金流和基础节奏

春季目标是熟悉每日循环，并完成最基础的现金、矿洞和社区中心准备。前几天以防风草、钓鱼和采集为主，不要一开始就把钱全部买种子。矿洞开放后，每次以电梯节点为阶段目标，同时留煤炭、铜矿、石头和晶球。复活节前准备草莓本金，但草莓数量要以每天能浇完为上限。

春季还要开始养成保留样本的习惯。普通品质作物、春季采集物、雨天鱼、矿洞材料都不要第一时间清仓。社区中心路线玩家尤其要看[社区中心前期优先完成路线](/guides/early-community-center-priority-route)，避免因为卖掉限定物品拖到下一年。

## 夏季：扩大现金流并减少手浇压力

夏季是第一年最容易拉开差距的季节。蓝莓适合稳定现金流，甜瓜适合高价值和社区中心，啤酒花适合后续加工，辣椒适合少量补礼物和料理路线。普通新手不需要追求唯一最优，而要根据洒水器、体力、背包和当天目标决定种植规模。

从夏季开始，矿洞和洒水器的重要性会上升。地块越多，手浇越占时间；自动化越早，越能空出时间钓鱼、下矿和跑任务。若你发现每天上午都被浇水吃掉，就该停下扩田，改去补矿石、煤炭和工具升级。具体材料路线可看[矿洞楼层资源与掉落路线](/guides/mines-drops-and-floor-resource-route)。

## 秋季：把农场转向稳定运营

秋季不是单纯买最贵种子。南瓜、蔓越莓、玉米、山药、茄子和采集物都可能关系到社区中心、料理、送礼和第二年准备。秋季资金相对宽裕，但也更容易乱花。建议把预算分成种子、建筑、工具、动物和加工设备几类，不要把所有现金压在一种作物上。

如果前两季已经有基础洒水器和稳定矿洞材料，秋季可以开始补鸡舍、畜棚、加工设备和温室前置。送礼也可以在秋季进入更稳定的阶段，先看[村民礼物推荐与生日送礼路线](/guides/villager-gift-birthday-recommendation)，把季节作物和生日礼物结合起来，不要临时乱找礼物。

## 冬季：整理、补进度和准备第二年

冬季没有常规户外作物，反而适合集中整理长期目标。优先补矿洞电梯、升级工具、整理箱子、补社区中心缺口、做冬季采集、规划第二年地块和洒水器。不要把冬季当成空窗期，很多第二年效率都取决于冬季是否把材料和布局准备好。

冬季还适合回头检查图鉴、鱼类、村民好感和任务公告板。缺鱼就用[鱼类查询器](/tools/fish)按季节和天气筛选；缺作物就查[作物与种子资料库](/wiki/crops)确认下一年要种什么；缺材料就回矿洞补煤炭、铁矿、金矿和怪物掉落。
`,
    coverImage: "/assets/game/36px-Spring.png",
    featured: 1,
    categories: ["新手入门", "农场经营"],
    chapterChecks: [
      "春季先建立钓鱼、种地、采集和下矿循环。|复活节草莓数量以能浇完为上限。|第一份作物、鱼类、采集物和矿洞材料先保留。",
      "夏季扩大现金流，但不要让手浇占满上午。|蓝莓、甜瓜、啤酒花和辣椒按目标搭配。|发现时间不够时，优先补洒水器和矿洞材料。",
      "秋季按种子、建筑、工具、动物和加工设备分配预算。|南瓜、蔓越莓和社区中心物品先留样本。|送礼开始进入固定路线，但不牺牲主线进度。",
      "冬季集中整理工具、箱子、矿洞和第二年布局。|补社区中心、鱼类、村民好感和任务公告板缺口。|第二年春 1 前准备种子本金、洒水器和工具状态。"
    ]
  },
  {
    title: "作物图鉴与收益计算器联动规划",
    slug: "crop-wiki-and-profit-tool-planning",
    summary: "把作物图鉴、作物收益计算器和季节路线结合起来，避免只看售价种地，适合想稳定扩张农场的新手。",
    body: `# 作物图鉴与收益计算器联动规划

作物选择不能只看单次售价。很多新手看到某个作物卖价高，就把全部本金压进去，结果遇到生长天数太长、剩余季节不够、手浇压力太大或社区中心缺样本，实际收益反而不稳定。更稳的做法是先在[作物与种子图鉴](/wiki/crops)确认季节、成熟时间、是否重复收获和基础用途，再用[作物收益计算器](/tools/crops)核对剩余天数、种子成本和日均利润。

这篇攻略不是给出唯一答案，而是教你建立一套可重复使用的判断顺序。春季、防风草和草莓适合承担启动资金；夏季蓝莓、甜瓜、啤酒花和辣椒各有用途；秋季南瓜、蔓越莓和玉米适合根据本金、洒水器与加工路线调整。已经看过[作物收益计算器使用指南](/guides/crop-profit-calculator-guide)的玩家，可以把本文当作图鉴和工具之间的日常决策流程。

## 先用图鉴确认作物定位

进入一个新季节前，先打开图鉴看三件事：它在哪个季节能种、成熟需要多少天、是否会重复收获。一次性收获作物通常更适合做社区中心样本、高价值出货或料理材料；重复收获作物更适合建立稳定现金流，但前期投入和回本时间也更长。不要只看“看起来贵不贵”，要看它是否能在当前季节剩余天数里完成收获。

图鉴还适合判断作物的“非卖钱价值”。草莓适合复活节后现金流，防风草适合春季基础任务和品质作物准备，甜瓜可能关联社区中心和巨大作物，啤酒花更偏后续加工，辣椒则经常用于料理或礼物。若你正在推进[第一年夏季赚钱路线](/guides/year-one-summer-money-route)，这些差异会直接影响夏 1 的购买清单。

## 再用计算器核对真实收益

图鉴给你方向，计算器负责验证。输入当前季节剩余天数、种植数量和是否重复收获后，优先看日均利润，而不是只看总收入。总收入高的作物如果占用太多本金和时间，可能会影响背包升级、工具升级、鸡舍或矿洞准备。普通新手更需要现金流稳定，而不是某一批作物卖出时账面数字好看。

计算器还可以帮你判断“还能不能补种”。例如季中临时有一笔钱，不一定要追最高价作物，而要看从今天种下是否还能成熟、是否会挤占手浇时间、是否影响明天钓鱼或下矿。手浇面积已经过大时，不如减少新增地块，把资源转向洒水器、矿石和工具升级。种得少但能每天按时浇完，往往比种得多却漏浇更稳。

## 把社区中心和加工一起考虑

第一份关键作物不要急着卖。社区中心、料理、任务、送礼和加工都可能需要作物样本。图鉴详情页会展示获取方式、用途、售价、新手建议和关联规划，遇到不确定的作物先点进详情看用途，再决定出货数量。尤其是季节限定作物，错过后通常要等到下一年，卖掉一份样本可能比少赚一笔钱更伤节奏。

加工路线也会改变作物评价。啤酒花、远古水果、杨桃等作物的后续价值往往不只来自直接出货，但这需要木桶、罐头瓶、温室或稳定种植规模支撑。第一年不要过早把所有作物选择都押在后期加工上，先保证社区中心和现金流，再逐步过渡。需要长期规划时，可以结合[温室作物与加工路线](/guides/greenhouse-crops-processing-route)判断是否提前保留种子和样本。

## 建立每季复盘清单

每个季节结束前，花一天复盘图鉴和计算器结果。检查哪些作物实际赚钱，哪些只是占用了浇水时间；哪些样本已经保留，哪些还缺社区中心或料理用途；下个季节是否需要增加洒水器、减少手浇地块或改变作物比例。这个复盘比盲目抄作物清单更重要，因为你的本金、工具、矿洞进度和游戏习惯都会影响最终选择。

最实用的流程是：先在图鉴筛出本季作物，选出社区中心和任务需要保留的样本，再用收益计算器比较剩余地块的现金流。只要保持这个顺序，作物规划就会从“凭感觉买种子”变成“按目标分配土地”，前期扩张也会稳定很多。
`,
    coverImage: "/assets/game/36px-Farming_Skill_Icon.png",
    featured: 1,
    categories: ["实用工具", "作物图鉴"],
    chapterChecks: [
      "先在作物图鉴确认季节、成熟天数和是否重复收获。|把社区中心、料理、送礼和任务需要的样本先标记出来。|高售价作物先看剩余季节天数，不够成熟就不要补种。",
      "用作物收益计算器核对种子成本、剩余天数和日均利润。|手浇压力过大时，优先减少新增地块而不是继续扩田。|临时补种只选择能在季末前稳定成熟的作物。",
      "第一份关键作物先保留，不确定时查看图鉴详情页用途。|加工路线要结合设备和温室进度，不要第一年过早重押后期收益。|社区中心样本、任务物品和现金流分开规划。",
      "季末复盘实际收益、漏浇情况和样本缺口。|下季开始前先决定洒水器、工具升级和种子预算。|把图鉴筛选和收益计算器作为每季固定流程。"
    ]
  },
  {
    title: "鱼类图鉴与查询器联动路线",
    slug: "fish-wiki-and-query-tool-route",
    summary: "用鱼类图鉴确认用途，再用鱼类查询器按季节、天气、时间和地点筛选，减少错过雨天鱼和夜间鱼。",
    body: `# 鱼类图鉴与查询器联动路线

钓鱼最容易让新手困惑的地方，是条件太多。鱼类不仅受季节影响，还会被天气、时间、地点、钓鱼等级和特殊区域限制。只靠记忆很容易错过雨天鱼、夜间鱼或社区中心鱼缸需要的目标。更稳的路线是先看[鱼类图鉴](/wiki/fish)了解鱼的定位，再用[鱼类条件查询器](/tools/fish)把当前能钓到的目标筛出来。

这篇攻略的重点不是列出所有鱼，而是教你把图鉴和工具连起来使用。已经看过[新手钓鱼入门与鱼类查询使用指南](/guides/beginner-fishing-guide-and-fish-search)的玩家，可以把本文当作进阶版日程安排：什么时候查鱼，什么时候钓鱼，什么时候把鱼留给社区中心或料理，什么时候直接出售。

## 先按目标筛鱼，而不是乱钓

每天出门前先问自己今天钓鱼是为了什么。若目标是赚钱，就优先找当前季节、当前时间段容易出现且基础售价不错的鱼；若目标是社区中心，就先看鱼缸缺口；若目标是练级，就选择路线短、上钩稳定的地点。不同目标会改变你要去的地图和出门时间，不要一整天在同一个水域碰运气。

图鉴详情页能帮你判断鱼的主要用途。有些鱼适合社区中心，有些适合料理或任务，有些更适合直接出售。遇到鲶鱼、鳗鱼、鲟鱼这类条件明显的目标时，不要只看卡片简介，要点进详情看获取方式、用途、售价、新手建议和关联规划。这样你能判断它是“今天必须钓”，还是“以后有空再补”。

## 用查询器处理天气和时间

鱼类查询器最适合解决“现在能钓什么”这个问题。输入季节、天气、地点和时间后，工具会把不符合条件的鱼排除，避免你在错误时间等待。雨天尤其重要，很多社区中心或高价值鱼都和雨天绑定；夜间鱼也容易被新手错过，因为白天忙完农场后常常忘记再去钓一轮。

推荐做法是每个季节第一天先查本季鱼，再把雨天和夜间目标单独记下来。遇到雨天，不要临时翻攻略，而是直接打开筛选器确认当前地点和时间。若你正在推进[社区中心鱼缸收集路线](/guides/community-center-fish-tank-route)，雨天鱼和季节限定鱼的优先级通常高于普通赚钱鱼。

## 保留样本和出售节奏

第一条不熟悉的鱼不要急着卖。先确认它是否属于社区中心、料理、任务或送礼需求。普通鱼可以出售补现金流，但条件苛刻或季节限定的鱼建议至少保留一条。这样做会占用箱子空间，但能减少下一年补鱼的成本。尤其是只在特定天气或时间出现的鱼，错过后补起来很麻烦。

卖鱼时可以按“常见鱼直接卖、限定鱼先留、社区中心鱼锁定”的原则。图鉴详情里如果显示用途较少、获取条件宽松，就可以更放心出货；如果用途和关联规划较多，先留样本更稳。背包空间紧张时，优先保留条件复杂的鱼，普通地点常见鱼可以换成现金。

## 把钓鱼排进每日路线

钓鱼不应该和种地、下矿互相抢时间。晴天可以上午浇水、下午钓常规鱼；雨天可以省掉浇水，把时间留给雨天鱼、工具升级或矿洞；夜间目标则安排在白天任务完成后。不要为了某条鱼把一天全部塞满，如果时间窗口很窄，就提前带好鱼饵、食物和足够背包空间。

一条稳定路线是：季初查本季鱼，雨天查特殊鱼，睡前查夜间鱼，季末补缺口。这样鱼类图鉴负责解释用途，查询器负责判断能不能钓，社区中心路线负责决定优先级。三者配合后，钓鱼就不会变成随机碰运气。
`,
    coverImage: "/assets/game/36px-Fishing_Skill_Icon.png",
    featured: 1,
    categories: ["实用工具", "鱼类图鉴"],
    chapterChecks: [
      "出门前确认今天钓鱼目标：赚钱、社区中心、练级或任务。|先查看鱼类图鉴详情，再决定保留还是出售。|条件复杂的鱼优先标记，常见鱼作为现金流。",
      "用鱼类查询器按季节、天气、时间和地点筛选。|每季第一天记录雨天鱼和夜间鱼。|雨天优先处理限定鱼，不要临时碰运气。",
      "第一条陌生鱼先保留，确认社区中心和料理用途后再出售。|常见鱼可以卖，限定鱼至少留一条。|背包紧张时优先保留获取条件复杂的鱼。",
      "晴天钓常规鱼，雨天钓限定鱼或安排工具升级。|夜间鱼放在白天任务完成后处理。|季末用图鉴和查询器核对鱼类缺口。"
    ]
  },
  {
    title: "社区中心清单与图鉴核对路线",
    slug: "community-center-checklist-and-wiki-route",
    summary: "把社区中心进度清单和作物、鱼类、物品图鉴结合起来，减少季节限定物品漏交和误卖。",
    body: `# 社区中心清单与图鉴核对路线

社区中心最怕的不是缺钱，而是把季节限定物品卖掉以后才发现需要献祭。新手常见情况是春季卖掉某个作物，夏季错过雨天鱼，秋季忘记保留南瓜，最后整条路线被拖到下一年。解决办法不是背下所有清单，而是固定使用[社区中心进度清单](/tools/community-center)，再结合[作物图鉴](/wiki/crops)、[鱼类图鉴](/wiki/fish)和[物品百科](/wiki/items)核对用途。

本文适合已经开始推进社区中心，但还没有形成固定检查习惯的玩家。你不需要一次性完成所有收集包，只要知道当前季节能做什么、哪些物品不能卖、哪些可以晚点补，就能把压力降下来。可以先阅读[社区中心前期优先完成路线](/guides/early-community-center-priority-route)，再用本文建立日常执行流程。

## 先按季节锁定可完成目标

打开清单后，不要从所有房间一起看，先按当前季节筛选。春季能解决春季作物、春季采集和部分鱼类；夏季补夏季作物、雨天鱼和高价值作物；秋季处理南瓜、蔓越莓、玉米和更多采集目标。季节限定物品优先级最高，因为错过以后通常要等一年。

图鉴的作用是解释“为什么要留”。作物详情会告诉你获取方式、用途和新手建议；鱼类详情会提示天气、地点和时间；物品详情能提醒矿洞材料、工匠品和常见用途。遇到不确定物品，先点进图鉴详情看用途，再决定是否出售。这样做比靠记忆更稳定。

## 房间目标要分阶段推进

社区中心每个房间的压力不同。工艺室通常依赖采集和季节物；茶水间依赖作物；鱼缸依赖时间、天气和地点；锅炉房依赖矿洞；布告栏和金库则更偏中后期。新手不要把所有房间当作同一天的目标，而是按当前能力拆分。今天下矿就顺便补锅炉房，今天下雨就优先补鱼缸。

清单工具适合记录“已经交了什么”和“还差什么”。如果你只看攻略文字，很容易忘记自己已经完成的部分；如果只看清单，又可能不知道缺口怎么获得。最稳的方式是清单确认缺口，图鉴确认获取方式，再决定当天路线。比如缺鱼就去[鱼类查询器](/tools/fish)筛选，缺作物就去作物图鉴核对季节。

## 不要乱卖第一份样本

社区中心路线中，第一份陌生物品最好先放箱子。春夏秋常见作物、季节采集物、雨天鱼、矿洞材料和动物产品，都可能在不同房间出现。卖掉以后再补不仅浪费时间，有些还会被季节锁住。即使当前缺钱，也建议先确认清单和图鉴，确定没有献祭、任务或料理用途后再出货。

箱子整理可以按“作物样本、鱼类样本、矿洞材料、工匠品、动物产品”分开。每次回家后把新增物品先放入对应箱子，睡前再统一出售确定无用的重复品。这个习惯能减少误卖，也方便后续一次性去社区中心提交。对于新手来说，箱子管理比追求单日最大收益更重要。

## 用工具安排每周复盘

每周固定一天打开社区中心清单，检查当前季节还剩哪些物品。若缺鱼，立刻用鱼类查询器看天气和时间；若缺作物，查看图鉴并用[作物收益计算器](/tools/crops)判断是否还来得及补种；若缺矿洞材料，安排一个幸运日下矿。不要等季末最后一天才发现缺口，那时很多物品已经无法补救。

复盘时也要判断哪些目标可以推迟。金库、部分动物产品和工匠品不一定需要第一时间完成；季节限定作物和鱼类则应该尽早处理。按这个优先级执行，社区中心会从一堆复杂清单变成每周几个明确任务。
`,
    coverImage: "/assets/game/36px-Bundle_Green.png",
    featured: 1,
    categories: ["社区中心", "图鉴规划"],
    chapterChecks: [
      "清单先按当前季节筛选，不从全部房间同时开始。|季节限定作物、采集物和鱼类优先保留。|不确定用途时先打开对应图鉴详情。",
      "按房间拆分目标：采集、作物、鱼类、矿洞和后期资源分开推进。|当天路线和房间目标绑定，不要所有缺口一起追。|缺鱼查鱼类查询器，缺作物查作物图鉴。",
      "第一份陌生物品先放箱子，不急着卖。|按作物、鱼类、矿洞材料、工匠品和动物产品分类整理。|睡前统一出售确认无用的重复品。",
      "每周固定复盘社区中心缺口。|缺作物时用收益计算器判断是否来得及补种。|能推迟的后期目标先放下，季节限定目标优先完成。"
    ]
  },
  {
    title: "图鉴详情页阅读与保留判断指南",
    slug: "wiki-item-detail-reading-guide",
    summary: "讲清楚图鉴详情页的获取方式、用途、售价、新手建议和关联规划怎么读，帮助判断物品该卖还是该留。",
    body: `# 图鉴详情页阅读与保留判断指南

很多物品看起来只是普通出货物，但在星露谷里可能同时关联社区中心、料理、送礼、任务、加工、矿洞或后期装备。新手最大的问题不是不知道物品名字，而是不知道它在当前阶段该卖、该留还是该加工。图鉴详情页的作用，就是把这些判断集中到一个位置：获取方式、用途、售价、新手建议和关联规划。

本文适合所有刚开始使用资料库的玩家。你可以从[完整图鉴索引](/wiki)进入分类，也可以直接查看[物品百科](/wiki/items)、[作物与种子](/wiki/crops)、[鱼类图鉴](/wiki/fish)和[村民关系](/wiki/villagers)。看详情页时不要只看简介，重点是把它放进你的当前目标里判断。

## 获取方式决定补救成本

第一步看获取方式。容易重复获得的物品，可以更放心出售；季节限定、天气限定、矿洞层数限定、节日限定或需要加工链的物品，补救成本更高。比如某些鱼需要特定季节和天气，某些作物错过季节就要等下一年，某些矿洞材料需要重新下矿刷取。获取条件越复杂，越建议先保留样本。

获取方式还会影响每日路线。如果物品来自矿洞，就可以和下矿日程绑定；来自作物，就要看季节剩余天数；来自鱼类，就要看时间和天气；来自村民礼物路线，就要考虑生日和住址。详情页不是孤立资料，而是帮你决定“什么时候顺路拿到它”。

## 用途决定优先保留级别

第二步看用途。只用于出售的物品可以更快变现；同时用于社区中心、料理、任务、送礼或制作的物品要谨慎。用途越多，越不适合第一时间卖光。特别是图鉴中出现社区中心、任务、加工或新手建议的条目，通常至少保留一份普通品质样本，等确认路线后再处理重复品。

用途也要结合阶段。第一年春夏，现金流重要，但社区中心样本和工具材料也很重要；中期开始，工匠品、动物产品和矿洞材料的长期价值会上升；后期则更看重加工、送礼和稀有收藏。不要用同一个标准处理所有物品，详情页的“关联规划”会提示它更适合哪类路线。

## 售价不是唯一标准

售价信息适合判断出货价值，但不能单独决定是否出售。高售价物品如果用途稀有，可能应该先留；低售价物品如果是社区中心或任务材料，也不该随手卖。对于作物和鱼类，可以把详情页售价与[作物收益计算器](/tools/crops)或[鱼类查询器](/tools/fish)结合，判断它是现金流目标还是收集目标。

遇到“不可出售或暂无售价”的物品，也不要直接认为没价值。很多矿洞材料、特殊物品或任务相关物品不靠直接出货赚钱，而是服务制作、升级、解锁或收集。详情页如果显示售价不足，更应该看用途和关联规划，而不是只盯金币数字。

## 新手建议和关联规划怎么用

新手建议是给当前阶段的处理意见，通常会告诉你是否建议保留、是否适合早期投入、是否容易补回。关联规划则把物品连接到更大的路线，比如社区中心、矿洞、作物收益、鱼类收集或村民送礼。看完这两项后，你应该能得到一个明确动作：保留一份、直接出售、用于加工、安排某天补获取，或加入某条攻略路线。

最稳的处理流程是：先看获取方式判断补救成本，再看用途判断保留级别，最后看售价决定重复品是否出售。如果仍然不确定，就先放箱子。等你每周复盘社区中心、作物计划和矿洞材料时，再统一处理重复品。这个习惯能明显减少误卖和返工。
`,
    coverImage: "/assets/game/36px-Omni_Geode.png",
    featured: 1,
    categories: ["图鉴大全", "新手入门"],
    chapterChecks: [
      "先看获取方式，判断物品是否容易补回。|季节、天气、矿洞层数和节日限定物品优先保留。|把获取条件绑定到每日路线，尽量顺路处理。",
      "用途越多，越不适合第一时间卖光。|社区中心、任务、料理、送礼和制作物品至少留一份。|按当前阶段判断用途优先级，不用同一标准处理全部物品。",
      "售价只决定重复品出货，不决定第一份样本去留。|不可出售物品也可能有制作、任务或解锁价值。|作物和鱼类售价要结合对应工具判断。",
      "按获取方式、用途、售价、新手建议、关联规划的顺序阅读。|不确定时先放箱子，每周复盘再处理。|把详情页结论连接到社区中心、矿洞、作物或送礼路线。"
    ]
  },
  {
    title: "新手工具优先使用路线",
    slug: "tool-first-new-player-workflow",
    summary: "把作物收益、鱼类查询、社区中心清单和图鉴详情串成每日流程，让新手知道什么时候该查哪个工具。",
    body: `# 新手工具优先使用路线

工具太多时，新手反而不知道该先点哪个。作物收益计算器、鱼类查询器、社区中心清单和图鉴详情页各自解决的问题不同：作物工具决定土地怎么种，鱼类工具决定今天去哪钓，社区中心清单决定哪些物品不能卖，图鉴详情决定物品的获取和用途。把它们按每天的顺序串起来，效率会比临时搜索高很多。

这篇攻略适合第一年春夏玩家，也适合已经读过[第一年新手路线总览](/guides/beginner-year-one-route-overview)但还没有固定查询习惯的人。目标不是让你每分钟都查资料，而是在关键节点用对工具，避免误卖、漏钓、乱种和下矿没有目标。

## 早上先查当天限制条件

每天起床后先看天气、季节和当前任务。晴天要考虑浇水和常规钓鱼，雨天可以把浇水时间转给工具升级、雨天鱼或矿洞，节日和生日则要调整路线。若当天是雨天，优先打开[鱼类查询器](/tools/fish)筛选雨天鱼；若季节刚开始，优先查看[作物收益计算器](/tools/crops)和作物图鉴，决定本季土地怎么分配。

早上查询不要太复杂，只做一个判断：今天的核心目标是什么。目标可以是补社区中心、赚钱、下矿、钓鱼、升级工具或送礼。确定目标后，再去对应工具查细节。这样不会在资料库里来回跳，也不会因为信息太多忘记出门。

## 种地前先用作物工具

买种子前先用作物工具，不要买完再算。输入季节剩余天数、预算和大致种植规模，确认哪些作物能成熟、哪些适合重复收获、哪些会让手浇压力过大。然后再去[作物与种子图鉴](/wiki/crops)查看用途，保留社区中心、料理或任务需要的样本。

如果你正在执行[作物图鉴与收益计算器联动规划](/guides/crop-wiki-and-profit-tool-planning)，每季第一天建议先做一次完整规划，中途只做补种判断。普通新手不用追求表格中的最高收益，把能稳定浇完、能留样本、能支撑背包和工具升级的方案定下来即可。

## 出门后按目标使用查询器和清单

如果目标是钓鱼，出门前打开鱼类查询器筛出当前季节、天气、时间和地点可钓鱼；如果目标是社区中心，先打开[社区中心进度清单](/tools/community-center)看当前缺口；如果目标是下矿，先确认缺的是铜矿、铁矿、煤炭、晶球还是怪物材料。工具的顺序应该跟当天目标一致，而不是所有页面都看一遍。

在外面获得新物品后，不确定就先留。回家后点开图鉴详情看获取方式、用途、售价、新手建议和关联规划。这个动作尤其适合鱼、矿物、怪物掉落和季节作物。很多物品单看简介很普通，但详情里会提示它和社区中心、任务、加工或送礼的关系。

## 睡前做一次轻量复盘

睡前不要只把背包清空。先看今天获得的物品里有没有新图鉴条目、社区中心缺口或需要留样本的东西，再决定出售。每隔几天打开社区中心清单复盘缺口；每个季节中段打开作物工具判断是否还能补种；遇到雨天前后检查鱼类查询器，避免错过限定鱼。

工具路线的核心是减少返工。你不需要每天阅读长篇攻略，但需要在“买种子、出门钓鱼、提交社区中心、出售陌生物品”这几个动作前检查一次。长期坚持后，网站会从资料堆变成你的农场决策台。
`,
    coverImage: "/assets/game/36px-Bundle_Teal.png",
    featured: 1,
    categories: ["实用工具", "新手入门"],
    chapterChecks: [
      "早上先看天气、季节、生日和当前任务。|雨天优先查鱼类查询器，季初优先查作物工具。|每天只确定一个核心目标，避免资料查询过载。",
      "买种子前先算收益和剩余天数。|再用作物图鉴确认社区中心、料理和任务用途。|普通新手优先选择能稳定浇完的种植规模。",
      "钓鱼查鱼类查询器，社区中心查进度清单，下矿查缺口材料。|在外获得陌生物品先留，不急着出售。|回家后用图鉴详情判断获取方式和用途。",
      "睡前检查新物品、社区中心缺口和样本保留情况。|季中判断是否还能补种，雨天前后检查限定鱼。|把工具用在关键动作前，而不是无目的翻页面。"
    ]
  }
];

function enrichArticle(article) {
  const chunks = article.body.split(/(?=\n## )/);
  const [intro, ...chapters] = chunks;
  const enrichedChapters = chapters.map((chapter, index) => {
    const checks = article.chapterChecks[index]?.split("|") || [];
    if (!checks.length) return chapter;
    return `${chapter.trimEnd()}\n\n### 本节执行清单\n\n${checks.map((check) => `- ${check}`).join("\n")}`;
  });
  const { chapterChecks, ...result } = article;
  return { ...result, body: [intro.trimEnd(), ...enrichedChapters].join("\n\n") };
}

export const articles = baseArticles.map(enrichArticle);
