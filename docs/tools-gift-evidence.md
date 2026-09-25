# 生日与最爱礼物查询：第一版证据

核对日期：2026-09-25。版本：本机原版 Stardew Valley 1.6.15（GameData 程序集 1.6.15.24356）。

## 覆盖与边界

- 34 位站内已发布、游戏 Characters 数据允许赠礼的村民。
- 138 种具体 Object 物品，197 条明确个人最爱关系。
- 生日来自 Characters 的 Birthday_Season / Birthday_Day；姓名和物品名使用原版中文字符串。站内“帕姆”保留既有名称。
- 住址沿用站内现有资料；不是实时行程，也不表示婚后或剧情后的唯一住所。
- 查询只列 NPCGiftTastes 中个人 love 字段的具体、允许赠送的 Object ID，不展开 Universal_Love，因此不会用通用规则覆盖个人例外。
- 每条关系的路径、游戏版本、核对日期在 `src/features/tools/data/gifts.js` 的 evidence 中保留。村民入口使用已有数据库 slug，不从图片名生成新网址。

## 暂不纳入

通用最爱、类别标签、饰品和动态规则不做推断。明确排除的原始记录为：Emily/ParrotEgg；Jas/doll_item、toy_item、FairyBox；Penny/book_item；Sebastian/FrogEgg；Vincent/FrogEgg；Leo/ParrotEgg。

这些是本版未展开范围，不是游戏中不能送或不喜欢的判断。UI 固定提醒“仅展示已核实并收录的最爱礼物，不是完整喜恶表。未查到不代表该村民不喜欢。”不计算好感点、品质或生日倍率。

## 原始文件指纹（SHA-256）

相对原版游戏目录：

| 文件 | SHA-256 |
|---|---|
| Content/Data/NPCGiftTastes.xnb | 9037d4f806b9d7b4f7efee0ba19b54eff50f589cf33884dad10d06d8a37e512b |
| Content/Data/Characters.xnb | 3b9519bf4887b557fb73c68834871c16755616a7ef26d84dc0bdbd95447f64a8 |
| Content/Data/Objects.xnb | f29fcd49bc979537645ea0dd8735c53acb39e3b8299d9ee8258ad33c4822ff30 |
| Content/Strings/Objects.zh-CN.xnb | 6d9b6e8215d203680fb9556558b118a935df7399828e4d6cbbdb766d850933e6 |
| Content/Strings/NPCNames.zh-CN.xnb | f0a3d6303783120e674283a9d374f42afa37a5c9233c0310a66606760093a1df |

在本次独立临时目录解码，只读原游戏文件，不向项目增加 XNB 解码运行依赖。具体推荐由原始关系与物品表交集生成，类别不自动扩展。所有礼物链接在请求时只匹配已发布资料；重名或未唯一匹配时降级到站内搜索。
