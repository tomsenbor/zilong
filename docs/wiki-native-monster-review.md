# 原版怪物数值交叉核对

目标为用户提供的原版 1.6.15.24356。只读取文件及 IL 元数据，未启动、修改游戏或存档。

- `Stardew Valley.dll` SHA-256：`7F1E5B8E58D2758B78570BA771BBEB03D33522F62188BF6C32EDF0CF626DEAEE`
- `Content/Data/Monsters.xnb` SHA-256：`0DC0AFA9C7AF584291EF2FD1F81D49997BA7F5DAAAC2FE97DF4F2D0F154A7AFB`

## 已确认的来源冲突

1. 熔岩大头：`Data/Monsters[Hot Head]` 初始生命250。`HotHead..ctor(Vector2)` 调用 `MetalHead..ctor(string, Vector2)`，后者调用 `Monster..ctor`；`Monster.parseMonsterInfo` 从第0字段读取生命。该调用链中没有降至215的赋值，HotHead构造只将滑动参数翻倍。因此采用**基础生命250**，不采用中英文Wiki表格的215；危险难度或其他修正与基础值分开。
2. 大型绿色史莱姆：`Data/Monsters[Big Slime]` 初始伤害5。`BigSlime..ctor` 的普通绿色分支没有增加伤害；蓝色保留、红色乘2、紫色乘3。因此采用**基础伤害5**，不采用Wiki表格的6。
3. 普通与熔岩蝙蝠的炸弹：原版掉落字段 `287 .02`，即独立判定2%，不是部分中文表格的20%。多份翅膀掉落分别判定，不把单次概率误当总概率。
4. 深层红色铱蝠：`Bat..ctor` 在内部楼层参数大于999时增加速度并将生命翻倍，对应骷髅洞穴880层起。说明放在铱蝠条目中；没有声称已有独立红色图像。

## 仍未完成

- 本记录不是所有怪物运行时机制的完整反编译或实机验证。
- 史莱姆任意繁殖颜色不能枚举成无限独立条目；金币史莱姆的独立原版图像仍待核对。
- 危险难度、雄性、特殊状态和任务掉落须保留各自条件，不能只使用原始数据表覆盖所有运行时变化。

资料对照：`https://stardewvalleywiki.com/Hot_Head`、`https://stardewvalleywiki.com/Slimes`、`https://stardewvalleywiki.com/Bats`；版本和快照哈希见各 inventory/evidence 文件。
