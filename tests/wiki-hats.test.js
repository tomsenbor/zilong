import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { seedDatabase } from "../src/db/seed.js";
import { createTestContext } from "./helpers/context.js";

test("all 122 source-listed hat identities have separate usable curated records", () => {
  const hats = entries.filter(e => e.dataset === "items" && e.attributes.type === "帽子");
  expect(hats).toHaveLength(122);
  expect(new Set(hats.map(e => e.slug)).size).toBe(122);
  expect(new Set(hats.map(e => e.name)).size).toBe(122);
  for (const item of hats) {
    expect(item.attributes.基础售价).toBe("不可出售");
    expect(item.attributes.获取方式.length).toBeGreaterThan(10);
    expect(item.attributes.资料来源).toMatch(/^https:\/\/stardewvalleywiki\.com\//);
    expect(item.image).toMatch(/^\/assets\/game\/Hat_/);
    expect(readFileSync(`public${item.image}`).subarray(1, 4).toString()).toBe("PNG");
  }
});

test("hat acquisition separates currency, platforms, recipes and fixed color variants", () => {
  const get = slug => {
    const item = entries.find(e => e.dataset === "items" && e.slug === slug);
    expect(item, slug).toBeDefined();
    return item.attributes;
  };
  expect(get("cowboy-hat").获取方式).toContain("10,000");
  expect(get("top-hat").获取方式).toContain("齐币");
  expect(get("panda-hat").使用限制).toContain("WeGame");
  expect(get("dinosaur-hat").制作配方).toContain("恐龙蛋");
  expect(get("party-hat-red").制作配方).toContain("披萨");
  expect(get("party-hat-blue").制作配方).toContain("巧克力蛋糕");
  expect(get("party-hat-green").制作配方).toContain("鱼肉卷");
  expect(get("copper-pan-hat").使用限制).toContain("淘盘");
  expect(get("perfection-mystery-hat").获取方式).toContain("100%");
});

test("every hat API and SSR page preserves images and identity after a second import", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    const hats = entries.filter(e => e.dataset === "items" && e.attributes.type === "帽子");
    expect(hats).toHaveLength(122);
    for (const item of hats) {
      const response = await request(app).get(`/api/datasets/items/entries/${item.slug}`);
      expect(response.status, item.slug).toBe(200);
      expect(response.body.item.name).toBe(item.name);
      expect(response.body.item.image).toBe(item.image);
      expect((await request(app).get(item.image)).status).toBe(200);
      const page = await request(app).get(`/wiki/items/${item.slug}`);
      expect(page.status).toBe(200);
      expect(page.text).toContain(item.name);
    }
    const snapshot = () => context.db.prepare("SELECT id,dataset_id,slug,name,attributes_json FROM dataset_entries ORDER BY id").all();
    const before = snapshot();
    seedDatabase(context.db);
    expect(snapshot()).toEqual(before);
  } finally { context.close(); }
}, 30000);
