import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { entries } from "../src/db/seeds.js";
import request from "supertest";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { seedDatabase } from "../src/db/seed.js";
import { createTestContext } from "./helpers/context.js";

test("normal weapon identities cover 28 swords, 16 daggers, 16 clubs and two slingshots", () => {
  const weapons = entries.filter(e => e.dataset === "items" && e.attributes.type === "武器");
  expect(weapons).toHaveLength(62);
  expect(new Set(weapons.map(e => e.slug)).size).toBe(62);
  expect(weapons.some(e => e.slug === "rapier" || e.slug === "galaxy-slingshot")).toBe(false);
  const added = weapons.filter(e => e.slug !== "galaxy-sword");
  for (const item of added) {
    expect(item.attributes.获取方式.length).toBeGreaterThan(15);
    expect(item.attributes.基础伤害).toBeTruthy();
    expect(item.attributes.资料来源).toMatch(/^https:\/\/stardewvalleywiki\.com\//);
    expect(readFileSync(`public${item.image}`).subarray(1, 4).toString()).toBe("PNG");
  }
  expect(added.filter(e => e.attributes.武器类型 === "剑")).toHaveLength(27);
  expect(added.filter(e => e.attributes.武器类型 === "匕首")).toHaveLength(16);
  expect(added.filter(e => e.attributes.武器类型 === "棍棒")).toHaveLength(16);
  expect(added.filter(e => e.attributes.武器类型 === "弹弓")).toHaveLength(2);
});

test("weapon facts preserve base damage, forging cost, festival currency and ammo dependence", () => {
  const get = slug => {
    const item = entries.find(e => e.dataset === "items" && e.slug === slug);
    expect(item, slug).toBeDefined();
    return item.attributes;
  };
  expect(get("rusty-sword").基础伤害).toBe("2-5");
  expect(get("carving-knife").基础伤害).toBe("1-3");
  expect(get("infinity-blade").基础伤害).toBe("80-100");
  expect(get("infinity-blade").获取方式).toMatch(/银河之魂.*3.*火山晶石.*60/);
  expect(get("haleys-iron").购买价格).toContain("卡利科三花蛋");
  expect(get("slingshot").基础伤害).toContain("弹药");
  expect(get("master-slingshot").基础售价).toBe("不可出售");
});

test("weapon pages and assets survive an idempotent temporary import", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    for (const item of entries.filter(e => e.dataset === "items" && e.attributes.type === "武器")) {
      const api = await request(app).get(`/api/datasets/items/entries/${item.slug}`);
      expect(api.status, item.slug).toBe(200);
      expect(api.body.item.name).toBe(item.name);
      const page = await request(app).get(`/wiki/items/${item.slug}`);
      expect(page.status, item.slug).toBe(200);
      expect(page.text).toContain(item.name);
      expect((await request(app).get(item.image)).status).toBe(200);
    }
    const snapshot = () => context.db.prepare("SELECT id,dataset_id,slug,name,attributes_json FROM dataset_entries ORDER BY id").all();
    const before = snapshot();
    seedDatabase(context.db);
    expect(snapshot()).toEqual(before);
  } finally { context.close(); }
}, 30000);
