import { expect, test } from "vitest";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { createTestContext } from "./helpers/context.js";
import { makeEntrySlug } from "../src/utils/entry-slug.js";

const names = ["蜂蜜", "啤酒", "淡啤酒", "蜂蜜酒", "咖啡", "绿茶", "果汁", "果酒", "布料", "山羊奶酪", "鸭蛋黄酱", "虚空蛋黄酱", "恐龙蛋黄酱", "油", "果酱", "腌菜", "腌鱼籽", "水果干", "蘑菇干", "葡萄干", "熏鱼", "醋", "枫糖浆", "橡树树脂", "松焦油", "神秘糖浆"];
const item = name => entries.find(e => e.dataset === "items" && e.name === name);

test("missing artisan product families have distinct curated records", () => {
  for (const name of names) expect(entries.filter(e => e.dataset === "items" && e.name === name), name).toHaveLength(1);
  expect(makeEntrySlug(item("果酒"))).not.toBe(makeEntrySlug(item("上古水果酒")));
});

test("production caveats distinguish batches, input quality and profession exceptions", () => {
  expect(item("水果干").attributes.加工原料).toContain("5");
  expect(item("水果干").attributes.新手建议).toContain("一批");
  expect(item("熏鱼").attributes.加工原料).toContain("煤炭");
  expect(item("熏鱼").attributes.新手建议).toContain("品质");
  expect(item("醋").attributes.加工原料).toContain("2瓶");
  expect(item("咖啡").attributes.新手建议).toContain("不享受工匠");
  expect(item("枫糖浆").attributes.新手建议).toContain("不享受工匠");
});

test("artisan SSR, API and image URLs all work without fallback images", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    for (const name of names) {
      const entry = item(name);
      expect(entry, name).toBeDefined();
      const slug = makeEntrySlug(entry);
      const page = await request(app).get(`/wiki/items/${slug}`);
      expect(page.status, name).toBe(200);
      expect(page.text).toContain(entry.attributes.加工原料);
      expect(page.text).toContain(entry.attributes.加工时间);
      const detail = await request(app).get(`/api/datasets/items/entries/${slug}`);
      expect(detail.body.item.image, name).toBe(entry.image);
      expect((await request(app).get(entry.image)).status, name).toBe(200);
    }
  } finally { context.close(); }
}, 15000);
