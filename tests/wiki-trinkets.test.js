import { expect, test } from "vitest";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { seedDatabase } from "../src/db/seed.js";
import { createTestContext } from "./helpers/context.js";

const names = {
  "basilisk-paw": "蜥怪的爪子", "fairy-box": "仙女盒", "frog-egg": "青蛙蛋",
  "golden-spur": "黄金马刺", "ice-rod": "寒冰法杖", "magic-hair-gel": "魔法发胶",
  "magic-quiver": "魔法箭筒", "parrot-egg": "鹦鹉蛋"
};

test("all eight base trinkets have distinct curated pages and acquisition restrictions", () => {
  for (const [slug, name] of Object.entries(names)) {
    const found = entries.filter(entry => entry.dataset === "items" && entry.slug === slug);
    expect(found, name).toHaveLength(1);
    expect(found[0].name).toBe(name);
    expect(found[0].attributes.type).toBe("饰品");
    expect(found[0].attributes.装备条件).toContain("战斗精通");
    expect(found[0].attributes.sellPrice).toBe("1000金（探险家公会）");
  }
});

test("trinket exceptions are not replaced with the generic drop and reroll rules", () => {
  const item = slug => {
    const found = entries.find(entry => entry.dataset === "items" && entry.slug === slug);
    expect(found, `missing trinket ${slug}`).toBeDefined();
    return found.attributes;
  };
  expect(item("frog-egg")?.使用限制).toContain("不计入");
  expect(item("frog-egg")?.使用限制).toContain("不掉落");
  expect(item("magic-hair-gel")?.获取方式).toContain("100枚卡利科三花蛋");
  expect(item("magic-hair-gel")?.重铸).toBe("不可重铸");
  expect(item("basilisk-paw")?.重铸).toBe("不可重铸");
  expect(item("parrot-egg")?.重铸).toContain("750000");
  expect(item("fairy-box")?.属性).toContain("最高5级");
  expect(item("ice-rod")?.属性).toContain("3秒");
  expect(item("magic-quiver")?.使用限制).toContain("计入");
});

test("trinket SSR, API, real icons and links work without changing existing IDs on repeat import", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    for (const [slug, name] of Object.entries(names)) {
      const response = await request(app).get(`/api/datasets/items/entries/${slug}`);
      expect(response.status, name).toBe(200);
      expect(response.body.item.name).toBe(name);
      expect(response.body.item.image).not.toContain("Prismatic_Shard");
      expect((await request(app).get(response.body.item.image)).status).toBe(200);
      const page = await request(app).get(`/wiki/items/${slug}`);
      expect(page.status).toBe(200);
      expect(page.text).toContain("战斗精通");
      for (const link of entries.find(entry => entry.slug === slug).attributes.links) {
        expect((await request(app).get(link)).status, link).toBe(200);
      }
    }
    const sql = "SELECT id,dataset_id,slug,name,attributes_json FROM dataset_entries ORDER BY id";
    const before = context.db.prepare(sql).all();
    seedDatabase(context.db);
    expect(context.db.prepare(sql).all()).toEqual(before);
  } finally { context.close(); }
}, 15000);
