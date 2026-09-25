# 原版剧情道具与腐烂产物核对

本记录是局部证据，不代表全图鉴已完成。仅只读读取本机原版1.6.15.24356，没有运行游戏或修改存档。

原版 `Stardew Valley.dll` SHA-256：`7F1E5B8E58D2758B78570BA771BBEB03D33522F62188BF6C32EDF0CF626DEAEE`。

## 海莉遗失的手镯

- `Data/Objects` 的742为任务类型 `Haley's Lost Bracelet`，原图索引742。它不是戒指装备。
- `Data/Events/Beach` 的事件条件为 `13/f Haley 1500/z winter/t 1000 1600`：六心、非冬季、10:00—16:00。
- 海莉事件的玩家控制逻辑创建 `(O)742`，因此不能因为它是临时剧情物品就按调试内容排除。
- [Haley 六心事件](https://stardewvalleywiki.com/Haley#Six_Hearts)，修订194257，说明手镯在艾利欧特小屋右侧灌木后，找到后交还海莉。原始价格0不被解释成商店售价。

## 腐烂的植物两种固定款式

- `Data/Objects` 的747和748有相同名称、垃圾分类和价格0，图片索引各不相同。
- `Object.rot` 原始IL偏移0036与003B分别加载747和748，经选择后更改物品身份；0063设置名称 `Rotten Plant`。这两种固定款式均来自正常腐烂逻辑，不凭图片自行捏造。
- `Object.DayUpdate` 中，南瓜灯746的入冬条件和纯金刘易斯雕像对应路径调用同一 `Object.rot` 方法；不虚构“某一来源只能得到某一种款式”。
- [Rotten Plant](https://stardewvalleywiki.com/Rotten_Plant)，修订181810：放置南瓜灯冬1日腐烂；背包或箱子中保存可避免。纯金刘易斯雕像在镇上未被村民踩毁时次日被替换。不能回收，可用于橙色染色与齐先生五彩农场。

## 尚不能据此排除的条目

衣物 `(P)14` 与家具 `FoodPetBowl/WaterPetBowl` 仍需获取或场景证据。正常随机装饰掉落方法 `Utility.getRandomCosmeticItem` 只枚举部分家具、帽子与衬衫；它不支持把“数据存在”直接写成随机掉落来源。也不能仅因本次没有查到来源就宣布这些记录废弃。
