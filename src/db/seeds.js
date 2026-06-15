const split = (value) => value.split("|").map((part) => part.trim());
const rows = (dataset, text) =>
  text.trim().split("\n").map((line) => {
    const [name, summary, image, attributes = ""] = line.split(";");
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
防风草;春季基础作物，成熟快;36px-Parsnip.png;season=春季,days=4,sellPrice=35金,source=皮埃尔杂货店
土豆;有概率一次收获多个;36px-Potato.png;season=春季,days=6,sellPrice=80金,source=皮埃尔杂货店
花椰菜;春季高价值作物，可形成巨大作物;36px-Cauliflower.png;season=春季,days=12,sellPrice=175金,source=皮埃尔杂货店
草莓;复活节购买的多次收获作物;36px-Strawberry.png;season=春季,days=8,sellPrice=120金,source=复活节
大黄;沙漠商店出售的高价值春季作物;36px-Rhubarb.png;season=春季,days=13,sellPrice=220金,source=绿洲
青豆;藤架作物，可重复收获;36px-Green_Bean.png;season=春季,days=10,sellPrice=40金,source=皮埃尔杂货店
甘蓝菜;短周期高收益蔬菜;36px-Kale.png;season=春季,days=6,sellPrice=110金,source=皮埃尔杂货店
咖啡豆;春夏两季生长并可重复收获;36px-Coffee_Bean.png;season=春季|夏季,days=10,sellPrice=15金,source=旅行货车
蓝莓;夏季经典高收益多次收获作物;36px-Blueberry.png;season=夏季,days=13,sellPrice=50金,source=皮埃尔杂货店
甜瓜;高价值夏季作物，可形成巨大作物;36px-Melon.png;season=夏季,days=12,sellPrice=250金,source=皮埃尔杂货店
啤酒花;每日重复收获，适合酿酒;36px-Hops.png;season=夏季,days=11,sellPrice=25金,source=皮埃尔杂货店
杨桃;高价值酿酒作物;36px-Starfruit.png;season=夏季,days=13,sellPrice=750金,source=绿洲
辣椒;短周期重复收获;36px-Hot_Pepper.png;season=夏季,days=5,sellPrice=40金,source=皮埃尔杂货店
番茄;可重复收获的蔬菜;36px-Tomato.png;season=夏季,days=11,sellPrice=60金,source=皮埃尔杂货店
玉米;横跨夏秋两季;36px-Corn.png;season=夏季|秋季,days=14,sellPrice=50金,source=皮埃尔杂货店
红叶卷心菜;社区中心染料包所需;36px-Red_Cabbage.png;season=夏季,days=9,sellPrice=260金,source=皮埃尔杂货店
蔓越莓;秋季稳定多次收获作物;36px-Cranberries.png;season=秋季,days=7,sellPrice=75金,source=皮埃尔杂货店
南瓜;秋季高价值作物，可形成巨大作物;36px-Pumpkin.png;season=秋季,days=13,sellPrice=320金,source=皮埃尔杂货店
葡萄;秋季藤架重复收获作物;36px-Grape.png;season=秋季,days=10,sellPrice=80金,source=皮埃尔杂货店
茄子;低成本重复收获作物;36px-Eggplant.png;season=秋季,days=5,sellPrice=60金,source=皮埃尔杂货店
山药;秋季献祭常用作物;36px-Yam.png;season=秋季,days=10,sellPrice=160金,source=皮埃尔杂货店
苋菜;玛妮任务所需作物;36px-Amaranth.png;season=秋季,days=7,sellPrice=150金,source=皮埃尔杂货店
朝鲜蓟;第二年解锁的秋季蔬菜;36px-Artichoke.png;season=秋季,days=8,sellPrice=160金,source=皮埃尔杂货店
甜菜;沙漠种子，可用于制糖;36px-Beet.png;season=秋季,days=6,sellPrice=100金,source=绿洲
小麦;夏秋两季快速成熟;36px-Wheat.png;season=夏季|秋季,days=4,sellPrice=25金,source=皮埃尔杂货店
远古水果;温室与姜岛的长期收益核心;36px-Ancient_Fruit.png;season=春季|夏季|秋季,days=28,sellPrice=550金,source=远古种子
菠萝;姜岛可重复收获作物;36px-Pineapple.png;season=夏季,days=14,sellPrice=300金,source=姜岛
芋头;靠近水源时成长更快;36px-Taro_Root.png;season=夏季,days=10,sellPrice=100金,source=姜岛
齐瓜;齐先生特别订单限时作物;36px-Qi_Fruit.png;season=全部,days=4,sellPrice=1金,source=齐先生任务
霜瓜;1.6 新增冬季作物;36px-Powdermelon.png;season=冬季,days=7,sellPrice=60金,source=冬季挖掘
胡萝卜;1.6 新增春季短周期作物;36px-Carrot.png;season=春季,days=3,sellPrice=35金,source=种子点
西兰花;1.6 新增秋季重复收获作物;36px-Broccoli.png;season=秋季,days=8,sellPrice=70金,source=种子点
夏南瓜;1.6 新增夏季重复收获作物;36px-Summer_Squash.png;season=夏季,days=6,sellPrice=45金,source=种子点
`),
  ...rows("fish", `
河豚;晴天中午出没的夏季鱼;36px-Pufferfish.png;season=夏季,location=海洋,weather=晴天,time=12:00-16:00
鲶鱼;雨天高难度河流鱼;36px-Catfish.png;season=春季|秋季,location=河流,weather=雨天,time=06:00-24:00
鲟鱼;鱼籽可制成鱼子酱;36px-Sturgeon.png;season=夏季|冬季,location=山区湖泊,weather=任意,time=06:00-19:00
大嘴鲈鱼;山区湖泊常见鱼;36px-Largemouth_Bass.png;season=全部,location=山区湖泊,weather=任意,time=06:00-19:00
沙丁鱼;海洋常见鱼;36px-Sardine.png;season=春季|秋季|冬季,location=海洋,weather=任意,time=06:00-19:00
金枪鱼;夏冬两季海鱼;36px-Tuna.png;season=夏季|冬季,location=海洋,weather=任意,time=06:00-19:00
红鲷鱼;雨天海鱼;36px-Red_Snapper.png;season=夏季|秋季,location=海洋,weather=雨天,time=06:00-19:00
鳗鱼;雨夜海鱼，料理常用;36px-Eel.png;season=春季|秋季,location=海洋,weather=雨天,time=16:00-02:00
章鱼;高难度夏季海鱼;36px-Octopus.png;season=夏季,location=海洋,weather=任意,time=06:00-13:00
大海参;夜间高价值海鱼;36px-Super_Cucumber.png;season=夏季|秋季,location=海洋,weather=任意,time=18:00-02:00
幽灵鱼;矿井水域鱼类;36px-Ghostfish.png;season=全部,location=矿井,weather=任意,time=全天
冰柱鱼;矿井 60 层鱼类;36px-Ice_Pip.png;season=全部,location=矿井60层,weather=任意,time=全天
岩浆鳗鱼;高价值高难度鱼;36px-Lava_Eel.png;season=全部,location=矿井100层|火山,weather=任意,time=全天
木跃鱼;秘密森林特有鱼;36px-Woodskip.png;season=全部,location=秘密森林,weather=任意,time=全天
沙鱼;沙漠池塘鱼类;36px-Sandfish.png;season=全部,location=沙漠,weather=任意,time=06:00-20:00
蝎鲤鱼;沙漠高难度鱼;36px-Scorpion_Carp.png;season=全部,location=沙漠,weather=任意,time=06:00-20:00
狮子鱼;姜岛海域鱼类;36px-Lionfish.png;season=全部,location=姜岛海洋,weather=任意,time=全天
黄貂鱼;姜岛海盗湾鱼类;36px-Stingray.png;season=全部,location=海盗湾,weather=任意,time=全天
蓝铁饼鱼;姜岛河流鱼类;36px-Blue_Discus.png;season=全部,location=姜岛河流,weather=任意,time=全天
传说之鱼;春季雨天传奇鱼;36px-Legend.png;season=春季,location=山区湖泊,weather=雨天,time=全天
绯红鱼;夏季传奇鱼;36px-Crimsonfish.png;season=夏季,location=东码头,weather=任意,time=全天
鮟鱇鱼;秋季传奇鱼;36px-Angler.png;season=秋季,location=木板桥北侧,weather=任意,time=全天
冰川鱼;冬季传奇鱼;36px-Glacierfish.png;season=冬季,location=箭头岛,weather=任意,time=全天
变种鲤鱼;下水道传奇鱼;36px-Mutant_Carp.png;season=全部,location=下水道,weather=任意,time=全天
虾虎鱼;1.6 新增瀑布鱼类;36px-Goby.png;season=全部,location=煤矿森林瀑布,weather=任意,time=全天
`),
  ...rows("villagers", `
阿比盖尔;喜欢冒险的杂货店女儿;36px-Abigail_Icon.png;birthday=秋季13日,address=皮埃尔杂货店,loves=紫水晶|南瓜|河豚
亚历克斯;热爱运动的镇民;36px-Alex_Icon.png;birthday=夏季13日,address=河间大道1号,loves=完整早餐|鲑鱼晚餐
艾米丽;星之果实餐吧服务员;36px-Emily_Icon.png;birthday=春季27日,address=柳巷2号,loves=布料|羊毛|宝石
艾利欧特;住在海滩小屋的作家;36px-Elliott_Icon.png;birthday=秋季5日,address=海滩小屋,loves=鸭毛|龙虾|石榴
哈维;鹈鹕镇医生;36px-Harvey_Icon.png;birthday=冬季14日,address=诊所楼上,loves=咖啡|松露油|腌菜
海莉;热爱摄影和时尚;36px-Haley_Icon.png;birthday=春季14日,address=柳巷2号,loves=椰子|向日葵|水果沙拉
莉亚;住在森林中的艺术家;36px-Leah_Icon.png;birthday=冬季23日,address=莉亚的小屋,loves=沙拉|松露|葡萄酒
玛鲁;热爱科学与发明;36px-Maru_Icon.png;birthday=夏季10日,address=木匠的商店,loves=电池组|草莓|铱锭
潘妮;在博物馆辅导孩子;36px-Penny_Icon.png;birthday=秋季2日,address=拖车,loves=钻石|绿宝石|甜瓜
塞巴斯蒂安;住在地下室的程序员;36px-Sebastian_Icon.png;birthday=冬季10日,address=木匠的商店,loves=黑曜石|生鱼片|虚空蛋
山姆;热爱音乐与滑板;36px-Sam_Icon.png;birthday=夏季17日,address=柳巷1号,loves=披萨|虎眼石|仙人掌果子
谢恩;在 Joja 超市工作;36px-Shane_Icon.png;birthday=春季20日,address=玛妮的牧场,loves=啤酒|辣椒|披萨
卡洛琳;皮埃尔的妻子;36px-Caroline_Icon.png;birthday=冬季7日,address=皮埃尔杂货店,loves=鱼肉卷|绿茶|夏季亮片
克林特;镇上的铁匠;36px-Clint_Icon.png;birthday=冬季26日,address=铁匠铺,loves=宝石|金锭|铱锭
德米特里厄斯;研究山谷生态的科学家;36px-Demetrius_Icon.png;birthday=夏季19日,address=木匠的商店,loves=草莓|豆类火锅|冰淇淋
矮人;居住在矿井入口的商人;36px-Dwarf_Icon.png;birthday=夏季22日,address=矿井,loves=紫水晶|翡翠|熔岩鳗鱼
艾芙琳;住在镇中心的慈祥老人;36px-Evelyn_Icon.png;birthday=冬季20日,address=河间大道1号,loves=甜菜|巧克力蛋糕|郁金香
乔治;需要轮椅出行的镇民;36px-George_Icon.png;birthday=秋季24日,address=河间大道1号,loves=韭葱|炒蘑菇
格斯;星之果实餐吧老板;36px-Gus_Icon.png;birthday=夏季8日,address=星之果实餐吧,loves=钻石|鱼肉卷|橙子
贾斯;住在玛妮牧场的孩子;36px-Jas_Icon.png;birthday=夏季4日,address=玛妮的牧场,loves=仙女玫瑰|粉红蛋糕|葡萄干布丁
乔迪;山姆和文森特的母亲;36px-Jodi_Icon.png;birthday=秋季11日,address=柳巷1号,loves=钻石|薄煎饼|蔬菜杂烩
肯特;第二年回家的军人;36px-Kent_Icon.png;birthday=春季4日,address=柳巷1号,loves=烤榛子|意式蕨菜炖饭
科罗布斯;下水道中的暗影人;36px-Krobus_Icon.png;birthday=冬季1日,address=下水道,loves=南瓜|虚空蛋|虚空蛋黄酱
刘易斯;鹈鹕镇镇长;36px-Lewis_Icon.png;birthday=春季7日,address=镇长庄园,loves=秋日恩赐|绿茶|辣椒
莱纳斯;住在山区帐篷;36px-Linus_Icon.png;birthday=冬季3日,address=帐篷,loves=椰子|仙人掌果子|山药
玛妮;经营牧场用品店;36px-Marnie_Icon.png;birthday=秋季18日,address=玛妮的牧场,loves=钻石|粉红蛋糕|南瓜派
帕姆;住在拖车并驾驶巴士;36px-Pam_Icon.png;birthday=春季18日,address=拖车,loves=啤酒|防风草|仙人掌果子
皮埃尔;经营杂货店;36px-Pierre_Icon.png;birthday=春季26日,address=皮埃尔杂货店,loves=炸鱿鱼
罗宾;镇上的木匠;36px-Robin_Icon.png;birthday=秋季21日,address=木匠的商店,loves=山羊奶酪|桃子|意大利面
桑迪;经营沙漠绿洲;36px-Sandy_Icon.png;birthday=秋季15日,address=绿洲,loves=水仙花|芒果糯米饭|番红花
威利;海滩渔夫与商店老板;36px-Willy_Icon.png;birthday=夏季24日,address=鱼店,loves=鲶鱼|南瓜|海参
法师;研究神秘力量;36px-Wizard_Icon.png;birthday=冬季17日,address=法师塔,loves=紫蘑菇|太阳精华|虚空精华
雷欧;来自姜岛的孩子;36px-Leo_Icon.png;birthday=夏季26日,address=姜岛树屋,loves=鸭毛|芒果|鸵鸟蛋
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
铱锭;高级工具和设备材料;36px-Iridium_Bar.png;type=矿物,source=熔炉|完美雕像,sellPrice=1000金
电池组;避雷针和太阳能板产物;36px-Battery_Pack.png;type=资源,source=避雷针|太阳能板,sellPrice=500金
五彩碎片;稀有矿物和万能最爱礼物;36px-Prismatic_Shard.png;type=矿物,source=神秘石|铱矿点,sellPrice=2000金
恐龙蛋;可孵化恐龙或捐赠;36px-Dinosaur_Egg.png;type=文物,source=山区挖掘|霸王喷火龙,sellPrice=350金
兔子的脚;稀有畜产品;36px-Rabbit's_Foot.png;type=畜产品,source=兔子|飞蛇,sellPrice=565金
松露;猪在户外发现的产品;36px-Truffle.png;type=采集,source=猪,sellPrice=625金
上古水果酒;高收益工匠品;36px-Wine.png;type=工匠品,source=小桶,sellPrice=基础水果价×3
鱼子酱;鲟鱼籽加工品;36px-Caviar.png;type=工匠品,source=腌菜缸,sellPrice=500金
自动抚摸机;自动维持动物心情;36px-Auto-Petter.png;type=设备,source=Joja|骷髅洞穴,sellPrice=不可出售
祝福雕像;1.6 新增每日祝福设备;36px-Statue_Of_Blessings.png;type=设备,source=耕种精通,sellPrice=不可出售
矮人王雕像;1.6 新增采矿增益设备;36px-Statue_Of_The_Dwarf_King.png;type=设备,source=采矿精通,sellPrice=不可出售
铱镰刀;可收获作物的高级镰刀;36px-Iridium_Scythe.png;type=工具,source=精通洞窟,sellPrice=不可出售
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
