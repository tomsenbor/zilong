import { expect, test } from "vitest";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { seedDatabase } from "../src/db/seed.js";
import { createTestContext } from "./helpers/context.js";

const fixtures = [
  ["basic-fertilizer", "初级肥料", "Basic_Fertilizer", "树液×2", 1, 2],
  ["quality-fertilizer", "高级肥料", "Quality_Fertilizer", "树液×4、任意鱼×1", 2, 10],
  ["deluxe-fertilizer", "顶级肥料", "Deluxe_Fertilizer", "铱锭×1、树液×40", 5, 70],
  ["basic-retaining-soil", "初级保湿土壤", "Basic_Retaining_Soil", "石头×2", 1, 4],
  ["quality-retaining-soil", "高级保湿土壤", "Quality_Retaining_Soil", "石头×3、黏土×1", 2, 5],
  ["deluxe-retaining-soil", "顶级保湿土壤", "Deluxe_Retaining_Soil", "石头×5、纤维×3、黏土×1", 1, 30],
  ["speed-gro", "生长激素", "Speed-Gro", "松焦油×1、苔藓×5", 5, 20],
  ["deluxe-speed-gro", "高级生长激素", "Deluxe_Speed-Gro", "橡树树脂×1、骨头碎片×5", 5, 40],
  ["hyper-speed-gro", "顶级生长激素", "Hyper_Speed-Gro", "放射性矿石×1、骨头碎片×3、太阳精华×1", 1, 70],
  ["tree-fertilizer", "树肥", "Tree_Fertilizer", "纤维×5、石头×5", 1, 10]
];
const get = slug => {
  const item = entries.find(e => e.dataset === "items" && e.slug === slug);
  expect(item, slug).toBeDefined();
  return item.attributes;
};

test("ten fertilizers preserve 1.6 recipes, batch yields and selling prices", () => {
  for (const [slug, name, icon, recipe, yieldCount, price] of fixtures) {
    expect(entries.filter(e => e.dataset === "items" && e.name === name)).toHaveLength(1);
    expect(get(slug).制作配方).toBe(recipe);
    expect(get(slug).每次制作数量).toBe(yieldCount);
    expect(get(slug).基础售价).toBe(price);
    expect(get(slug).资料来源).toBe(`https://stardewvalleywiki.com/${icon}`);
  }
});

test("fertilizer constraints distinguish regrowth, moisture and tree exceptions", () => {
  for (const slug of ["speed-gro", "deluxe-speed-gro", "hyper-speed-gro"]) {
    expect(get(slug).使用限制).toContain("不缩短再生间隔");
    expect(get(slug).使用限制).toContain("已经过去");
  }
  expect(get("basic-fertilizer").使用时机).toBe("种子发芽前");
  expect(get("quality-fertilizer").使用时机).toBe("种子发芽前");
  expect(get("deluxe-fertilizer").使用时机).toBe("播种前后及作物生长期间均可");
  expect(get("deluxe-retaining-soil").使用限制).toContain("先浇水一次");
  expect(get("tree-fertilizer").使用限制).toContain("果树");
  expect(get("tree-fertilizer").使用限制).toContain("茶树");
  expect(get("tree-fertilizer").主要用途).toContain("60%");
  expect(get("tree-fertilizer").主要用途).toContain("30%");
});

test("unlock costs are not confused with retail quantities or year-one availability", () => {
  expect(get("basic-fertilizer").获取方式).toContain("第一年春15日");
  expect(get("quality-fertilizer").获取方式).toContain("第二年");
  expect(get("deluxe-fertilizer").获取方式).toContain("20齐钻");
  expect(get("hyper-speed-gro").获取方式).toContain("30齐钻");
  expect(get("deluxe-retaining-soil").获取方式).toContain("50个火山晶石");
  expect(get("deluxe-speed-gro").获取方式).toContain("周四80g");
});

test("fertilizer pages and dedicated assets work and reseeding preserves IDs", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    for (const [slug, name, icon, recipe] of fixtures) {
      const api = await request(app).get(`/api/datasets/items/entries/${slug}`);
      expect(api.status, name).toBe(200);
      expect(api.body.item.image).toBe(`/assets/game/${icon}.png`);
      expect(api.body.item.attributes.制作配方).toBe(recipe);
      expect((await request(app).get(api.body.item.image)).status).toBe(200);
      const page = await request(app).get(`/wiki/items/${slug}`);
      expect(page.status).toBe(200);
      expect(page.text).toContain(recipe);
      for (const link of api.body.item.attributes.links) expect((await request(app).get(link)).status, link).toBe(200);
    }
    const snapshot = () => context.db.prepare("SELECT id,dataset_id,slug,name,attributes_json FROM dataset_entries ORDER BY id").all();
    const before = snapshot();
    seedDatabase(context.db);
    expect(snapshot()).toEqual(before);
  } finally { context.close(); }
}, 15000);
