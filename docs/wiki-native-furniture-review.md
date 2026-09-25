# 原版家具特殊来源核对

本记录是局部核对证据，不代表全图鉴完成。

- 游戏：本机 Steam 原版 1.6.15.24356，只读读取，没有启动或修改游戏。
- `Stardew Valley.dll` SHA-256：`7F1E5B8E58D2758B78570BA771BBEB03D33522F62188BF6C32EDF0CF626DEAEE`。
- 数据身份来自原版 `Data/Furniture`，图片按该记录的贴图、索引和尺寸提取；图片来源记录保留原始贴图哈希。

## 精致盆栽和家居植物

[Fancy House Plant](https://stardewvalleywiki.com/Fancy_House_Plant) 区分三款精致盆栽、五款家居植物，不能按中文同名合并。

直接检查原版程序集方法的 IL 字符串：

- `StardewValley.Menus.PrizeTicketMenu.getPrizeItem` 在 `01D4/01D9/01DE` 和 `0344/0349/034E` 引用 `(F)FancyHousePlant1/2/3`，与资料页的兑奖机来源一致。
- 抓娃娃机 `GameLogic..ctor` 在 `0786` 与 `079A` 引用 `(F)FancyHousePlant5`、`(F)FancyHousePlant4`，与资料页的抓娃娃机来源一致。
- 五款小盆栽的原版索引分别为 263、264、262、269、270，不能按索引升序猜测款式序号。
- Wiki 图片与原版图像缩放后比较，款式1和2完全匹配；其余有像素差异，不将近似匹配当成严格相同。站点使用原版索引图，不覆盖旧素材。

## 仍待判定的特殊记录

- `CCFishTank`：已作为社区中心固定设施纳入。`CommunityCenter.addFishTank`、`CommunityCenter.draw`、`FishTankFurniture.GetTankBounds` 与 Fish Tank 资料相互印证：完成鱼缸收集包后恢复，不能拾取或搬走，底栖与游泳各5只。不根据原始价格字段说成可购买家具；原版名称未翻译，使用说明性中文名并保留编号。
- `FoodPetBowl`、`WaterPetBowl`：本次程序集字符串扫描未发现引用。但没有引用不是充分的不可获取证据，暂不补入、不伪造获取方式；也不能与木匠出售的宠物碗建筑混为一谈。
- `FreeCactus`：`DesertFestival.CactusGuyRevealCactus` 与 `answerDialogueAction` 使用的随机仙人掌，与沙漠节资料描述相符。已补入一个编号条目，原图展示多种外观，并在用途中明确说明。随机外观组合不另算成多件固定物品。
