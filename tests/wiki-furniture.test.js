import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { entries } from "../src/db/seeds.js";
import { makeEntrySlug } from "../src/utils/entry-slug.js";

const find = id => entries.find(e => e.attributes.游戏物品编号 === `(F)${id}`);
test("furniture uses original data identities and actual acquisition conditions", () => {
  expect(find("0"), "Oak Chair native identity").toBeDefined();
  expect(find("0").name).toBe("橡木椅子");
  expect(find("0").attributes.获取方式).toContain("350金");
  expect(find("0").attributes.获取方式).toContain("目录本身");
  expect(find("3").name).toBe("胡桃木椅子");
});
test("furniture retains Chinese localization, no resale, and distinct stable URLs", () => {
  const inventory = JSON.parse(readFileSync(new URL("../docs/wiki-furniture-inventory.json", import.meta.url)));
  expect(inventory.records.length).toBeGreaterThan(0);
  const urls = new Set();
  for (const record of inventory.records) {
    const e = find(record.id);
    expect(e, record.key).toBeDefined();
    expect(e.name).toBe(record.displayName);
    expect(makeEntrySlug(e)).toBe(record.slug);
    expect(e.attributes.出售限制).toBe("不可出售，也不能赠送村民");
    expect(e.attributes.资料来源).toBe(record.page.url);
    expect(urls.has(e.slug)).toBe(false);
    urls.add(e.slug);
  }
});
test("bookcases and dressers do not invent interchangeable storage functionality", () => {
  const bookshelf = entries.find(e => e.attributes.游戏物品编号 && e.attributes.家具类型 === "书柜");
  const dresser = entries.find(e => e.attributes.游戏物品编号 && e.attributes.家具类型 === "梳妆台");
  expect(bookshelf).toBeDefined();
  expect(dresser).toBeDefined();
  expect(bookshelf.attributes.主要用途).toContain("不是储物箱");
  expect(dresser.attributes.主要用途).toContain("服饰");
});

test("spouse portraits retain the shop source in addition to the heart-event prerequisite", () => {
  for (const id of ["AbigailPortrait", "EmilyPortrait", "HaleyPortrait", "LeahPortrait", "MaruPortrait", "PennyPortrait", "AlexPortrait", "ElliottPortrait", "HarveyPortrait", "SamPortrait", "SebastianPortrait", "ShanePortrait", "KrobusPortrait"]) {
    expect(find(id)?.attributes.获取方式, id).toContain("旅行货车");
    expect(find(id)?.attributes.获取方式, id).toContain("14心");
  }
});

test("night-market art preserves its day, three-year rotation and actual price", () => {
  for (let i = 0; i < 9; i++) {
    const acquisition = find(String(1838 + i * 2))?.attributes.获取方式;
    expect(acquisition).toContain(`冬${15 + i % 3}日`);
    expect(acquisition).toContain(`第${1 + Math.floor(i / 3)}年`);
    expect(acquisition).toContain("每3年");
    expect(acquisition).toContain("1,200金");
    expect(acquisition).toContain("夜市");
  }
});

test("furniture torches distinguish item exchange from gold and catalogue access", () => {
  expect(find("2331")?.attributes.获取方式).toContain("姜岛商人：火山晶石×5");
  expect(find("2331")?.attributes.获取方式).not.toContain("5金");
  expect(find("2397")?.attributes.获取方式).toContain("夏威夷宴会：700金");
  expect(find("2397")?.attributes.获取方式).toContain("夜市：800金");
  expect(find("2397")?.attributes.获取方式).toContain("家具目录：0金");
  expect(find("2398")?.attributes.获取方式).toContain("夜市：800金");
});

test("exchange furniture keeps native currencies, actual prices and limited availability", () => {
  expect(find("134")?.attributes.获取方式).toContain("双数日：狮子鱼×1");
  expect(find("2192")?.attributes.获取方式).toContain("齐币×8,000");
  expect(find("2496")?.attributes.获取方式).toContain("火山晶石×100");
  expect(find("1228")?.attributes.获取方式).toContain("1,250金");
  expect(find("ShortBookcase")?.attributes.获取方式).toContain("卡利科三花蛋×40");
  expect(find("DesertChair")?.attributes.获取方式).toContain("仅春16日");
  expect(find("2488")?.attributes.获取方式).toContain("星星币×500");
  expect(find("JungleTank")?.attributes.获取方式).toContain("第5个请求");
  expect(find("JungleTank")?.attributes.获取方式).toContain("破损的眼镜×5");
});

test("catalogue describes furniture access, not just a generic display table", () => {
  expect(find("1226")?.attributes.主要用途).toContain("无限取用");
  expect(find("1226")?.attributes.获取方式).toContain("农舍至少升级一次");
  expect(find("1226")?.attributes.获取方式).toContain("200,000金");
});

test("interactive decorations and display props do not invent production or storage effects", () => {
  expect(find("JojaColaFridge")?.attributes.主要用途).toContain("不具备食材储存");
  expect(find("PurpleBook")?.attributes.主要用途).toContain("不是可阅读的技能书");
  expect(find("LargeJunimoHut")?.attributes.主要用途).toContain("不会自动收获");
  expect(find("Cauldron")?.attributes.主要用途).toContain("绿色烟雾");
  expect(find("BirdHouse")?.attributes.主要用途).toContain("仅能放在室外");
  expect(find("Doghouse")?.attributes.主要用途).toContain("动物不会与它互动");
  expect(find("BrokenTelevision")?.attributes.主要用途).toContain("不能作为");
  expect(find("1733")?.attributes.获取方式).toContain("28日中午12:00整");
  expect(find("1747")?.attributes.获取方式).toContain("500金");
  expect(find("TrashCatalogue")?.attributes.获取方式).toContain("至少50次");
  expect(find("TrashCatalogue")?.attributes.获取方式).toContain("0.2%");
  expect(find("984")?.attributes.获取方式).toContain("不保证抓中");
});

test("fixed variants retain distinct native IDs and do not inherit the first variant's price", () => {
  for(let id=1376;id<=1390;id++)expect(find(String(id)), String(id)).toBeDefined();
  for(let id=2637;id<=2652;id++)expect(find(String(id))?.attributes.主要用途).toContain("不能让同一房间");
  expect(find("2635")?.attributes.获取方式).toContain("500金");
  expect(find("2636")?.attributes.获取方式).toContain("700金");
  expect(find("2750")?.attributes.获取方式).toContain("冰雪节");
  expect(find("2738")?.attributes.获取方式).toContain("500金");
  expect(find("2048")?.attributes.获取方式).toContain("500金");
  expect(find("2048")?.attributes.获取方式).not.toContain("5,000金");
  expect(find("1304")?.attributes.获取方式).toContain("15件古物");
  expect(find("CatStatue")?.attributes.获取方式).toContain("春17日需卡利科三花蛋×35");
});

test("fancy plants distinguish ticket prizes from crane-only variants", () => {
  for (let i=1;i<=3;i++) {
    expect(find(`FancyTree${i}`)?.attributes.获取方式).toContain("兑奖机");
    expect(find(`FancyHousePlant${i}`)?.attributes.获取方式).toContain("兑奖机");
  }
  for (let i=4;i<=5;i++) {
    expect(find(`FancyHousePlant${i}`)?.attributes.获取方式).toContain("抓娃娃机");
    expect(find(`FancyHousePlant${i}`)?.attributes.获取方式).toContain("不保证抓中");
    expect(find(`FancyHousePlant${i}`)?.attributes.获取方式).not.toContain("兑奖机");
  }
});

test("festival cactus is one randomized furniture identity rather than a harvestable crop", () => {
  const cactus=find("FreeCactus");
  expect(cactus?.attributes.获取方式).toContain("每届节日只能领取一次");
  expect(cactus?.attributes.获取方式).toContain("背包空位");
  expect(cactus?.attributes.主要用途).toContain("不会产出仙人掌果子");
  expect(cactus?.attributes.主要用途).toContain("随机");
});

test("community-center fish tank is a fixed scene facility, not a purchasable furniture item",()=>{
 const tank=find('CCFishTank');
 expect(tank?.name).toBe('社区中心鱼缸');
 expect(tank?.attributes.获取方式).toContain('鱼缸收集包');
 expect(tank?.attributes.主要用途).toContain('不能拾取或搬走');
 expect(tank?.attributes.主要用途).toContain('底栖生物5只');
 expect(tank?.attributes.主要用途).toContain('游泳生物5只');
 expect(tank?.attributes.获取方式).not.toContain('5,000金');
});
