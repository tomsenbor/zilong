import { expect, test } from "vitest";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { seedDatabase } from "../src/db/seed.js";
import { createTestContext } from "./helpers/context.js";

const fixtures = [
  ["chest", "宝箱", "Chest", 36, "木材×50"],
  ["stone-chest", "石箱", "Stone_Chest", 36, "石头×50"],
  ["big-chest", "大箱子", "Big_Chest", 70, "木材×120、铜锭×2"],
  ["big-stone-chest", "石制大箱子", "Big_Stone_Chest", 70, "石头×250"],
  ["junimo-chest", "祝尼魔箱", "Junimo_Chest", 9, "不可制作"],
  ["mini-fridge", "迷你冰箱", "Mini-Fridge", 36, "不可制作"]
];
test("storage API and SSR distinguish capacity, crafting and purchase requirements", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    for (const [slug, name, icon, slots, recipe] of fixtures) {
      const response = await request(app).get(`/api/datasets/items/entries/${slug}`);
      expect(response.status, slug).toBe(200);
      const item = response.body.item;
      expect(item.name).toBe(name);
      expect(item.attributes.储物格数).toBe(slots);
      expect(item.attributes.制作配方).toBe(recipe);
      expect(item.attributes.基础售价).toBe("不可出售");
      expect(item.image).toBe(`/assets/game/${icon}.png`);
      expect((await request(app).get(item.image)).status).toBe(200);
      const page = await request(app).get(`/wiki/items/${slug}`);
      expect(page.status).toBe(200);
      expect(page.text).toContain(item.attributes.获取方式);
      for (const link of item.attributes.links) expect((await request(app).get(link)).status, link).toBe(200);
    }
    const snapshot = () => context.db.prepare("SELECT id,dataset_id,slug,name,attributes_json FROM dataset_entries ORDER BY id").all();
    const before = snapshot();
    seedDatabase(context.db);
    expect(snapshot()).toEqual(before);
  } finally { context.close(); }
}, 15000);

test("shared inventory and kitchen restrictions are explicit instead of ordinary chest rules", () => {
  const get = slug => {
    const item = entries.find(e => e.dataset === "items" && e.slug === slug);
    expect(item, slug).toBeDefined();
    return item.attributes;
  };
  expect(get("junimo-chest").库存规则).toContain("共享9格");
  expect(get("junimo-chest").使用限制).toContain("工作台");
  expect(get("junimo-chest").获取方式).toContain("30齐钻");
  expect(get("junimo-chest").获取方式).toContain("15齐钻");
  expect(get("big-stone-chest").获取方式).toContain("罗宾的资源大作战");
  expect(get("big-stone-chest").获取方式).toContain("5000g");
  expect(get("mini-fridge").使用限制).toContain("地窖");
  expect(get("mini-fridge").库存规则).toContain("烹饪");
});
