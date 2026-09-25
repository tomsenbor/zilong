import { expect, test } from "vitest";
import { entries } from "../src/db/seeds.js";
import { readdirSync } from "node:fs";
import request from "supertest";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { seedDatabase } from "../src/db/seed.js";
import { createTestContext } from "./helpers/context.js";
import { makeEntrySlug } from "../src/utils/entry-slug.js";
import { buildAssetIndex, resolveGameAssetUrl } from "../src/db/assets.js";

test("all cooking pages and real icons exist; repeat imports preserve IDs", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    const index = buildAssetIndex(readdirSync(new URL("../public/assets/game/", import.meta.url)));
    const recipes = entries.filter(entry => entry.dataset === "cooking");
    expect(new Set(recipes.map(makeEntrySlug)).size).toBe(81);
    for (const recipe of recipes) {
      const image = resolveGameAssetUrl(recipe.image, index);
      const page = await request(app).get("/wiki/cooking/" + makeEntrySlug({ ...recipe, image }));
      expect(page.status, recipe.name).toBe(200);
      expect(page.text).toContain(recipe.name);
      expect(image, recipe.name).not.toContain("Prismatic_Shard");
      expect((await request(app).get(image)).status, image).toBe(200);
    }
    const sql = "SELECT e.id,e.slug,e.name FROM dataset_entries e JOIN datasets d ON d.id=e.dataset_id WHERE d.slug='cooking' ORDER BY e.id";
    const before = context.db.prepare(sql).all();
    expect(before).toHaveLength(81);
    seedDatabase(context.db);
    expect(context.db.prepare(sql).all()).toEqual(before);
  } finally {
    context.close();
  }
}, 30000); // 81 SSR pages, images and a repeat import, including parallel-suite load.

const expectedNames = ["煎蛋","煎蛋卷","沙拉","乳酪花椰菜","烤鱼","防风草汤","蔬菜杂烩","完美早餐","炸鱿鱼","奇怪的小面包","幸运午餐","炒蘑菇","披萨","豆类火锅","琉璃山药","惊喜鲤鱼","薯饼","薄煎饼","鲑鱼晚餐","鱼肉卷","香酥鲈鱼","爆炒青椒","面包","椰汁汤","鳟鱼汤","巧克力蛋糕","粉红蛋糕","大黄派","饼干","意大利面","炒鳗鱼","香辣鳗鱼","生鱼片","寿司卷","墨西哥薄饼","红之盛宴","帕尔玛奶酪茄子","大米布丁","冰淇淋","蓝莓千层酥","秋日恩赐","南瓜汤","巨无霸餐","红莓酱","塞料面包","农夫午餐","救生汉堡","海之菜肴","矿工特供","块茎拼盘","三倍浓缩咖啡","海泡布丁","海藻汤","清汤","葡萄干布丁","水煮洋蓟","蔬菜什锦盖饭","烤榛子","南瓜派","萝卜沙拉","水果沙拉","黑莓脆皮饼","蔓越莓糖果","意式烤面包","卷心菜沙拉","意式蕨菜炖饭","虞美人籽松糕","海鲜杂烩汤","龙虾浓汤","法式田螺","烩鱼汤","枫糖棒","蟹黄糕","虾鸡尾酒","姜汁汽水","香蕉布丁","芒果糯米饭","夏威夷芋泥","热带咖喱","墨汁意大利饺","苔藓汤"];

test("cooking includes every verified 1.6 recipe exactly once", () => {
  const recipes = entries.filter(entry => entry.dataset === "cooking");
  expect(recipes.map(entry => entry.name).sort()).toEqual([...expectedNames].sort());
  expect(new Set(recipes.map(entry => entry.name)).size).toBe(81);
});

test("cooking records verified ingredients, recovery, buffs and recipe sources", () => {
  const recipes = entries.filter(entry => entry.dataset === "cooking");
  for (const recipe of recipes) {
    for (const field of ["ingredients", "source", "energy", "health", "buff", "duration", "sellPrice", "资料来源"]) {
      expect(recipe.attributes[field], `${recipe.name}: ${field}`).toBeTruthy();
    }
  }
  expect(recipes.find(entry => entry.name === "炒鳗鱼").attributes.source).toContain("乔治");
  expect(recipes.find(entry => entry.name === "饼干").attributes.source).toContain("4心事件");
  expect(recipes.find(entry => entry.name === "苔藓汤").attributes.ingredients).toContain("20");
});
