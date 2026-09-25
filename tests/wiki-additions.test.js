import { afterEach, expect, test } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { seedDatabase } from "../src/db/seed.js";
import { createTestContext } from "./helpers/context.js";
import { entries } from "../src/db/seeds.js";
import { makeEntrySlug } from "../src/utils/entry-slug.js";

let context;
afterEach(() => context?.close());

const additions = [
  ["villagers", "vincent", "文森特", "春季10日"],
  ["fish", "spook-fish", "幽灵鱼", "魔法鱼饵"],
  ["items", "mayonnaise", "蛋黄酱", "190金"],
  ["items", "cheese", "奶酪", "230金"],
  ["items", "truffle-oil", "松露油", "1065金"],
  ["locations", "carpenters-shop", "木匠的商店", "周二"],
  ["locations", "fish-shop", "鱼店", "周六"],
  ["locations", "skull-cavern", "骷髅洞穴", "头骨钥匙"]
];

const cropAdditions = [
  ["blue-jazz", "蓝爵", "7天", "50金", "Blue_Jazz", "30金"],
  ["garlic", "大蒜", "4天", "60金", "Garlic", "第二年"],
  ["tulip", "郁金香", "6天", "30金", "Tulip", "20金"],
  ["unmilled-rice", "未碾米", "8天（邻水6天）", "30金", "Unmilled_Rice", "水井和鱼塘不算"],
  ["poppy", "虞美人", "7天", "140金", "Poppy", "潘妮"],
  ["radish", "萝卜", "6天", "90金", "Radish", "40金"],
  ["summer-spangle", "夏季亮片", "8天", "90金", "Summer_Spangle", "卡罗琳"],
  ["sunflower", "向日葵", "8天", "80金", "Sunflower", "0至2颗"],
  ["bok-choy", "小白菜", "4天", "80金", "Bok_Choy", "50金"],
  ["fairy-rose", "玫瑰仙子", "12天", "290金", "Fairy_Rose", "680金"],
  ["cactus-fruit", "仙人掌果子", "12天；之后每3天", "75金", "Cactus_Fruit", "不能种在主农场室外"],
  ["fiber", "纤维", "7天", "1金", "Fiber", "4至7份"],
  ["tea-leaves", "茶叶", "20天成熟；仅采收窗口每日产出", "50金", "Tea_Leaves", "22日至28日"],
  ["sweet-gem-berry", "甜宝石浆果", "24天", "3000金", "Sweet_Gem_Berry", "不能放入小桶、罐头瓶或脱水机"]
];

test.each(cropAdditions)("adds verified crop %s without changing existing crop mechanics", async (slug, name, days, price, asset, restriction) => {
  const matches = entries.filter((entry) => entry.dataset === "crops" && makeEntrySlug(entry) === slug);
  expect(matches).toHaveLength(1);
  const entry = matches[0];
  expect(entry.name).toBe(name);
  expect(entry.attributes.days).toBe(days);
  expect(entry.attributes.sellPrice).toBe(price);
  expect(entry.image).toBe(`/assets/game/36px-${asset}.png`);
  expect(entry.attributes["资料来源"]).toMatch(/^https:\/\/stardewvalleywiki.com\//);
  expect(JSON.stringify(entry.attributes)).toContain(restriction);
  for (const field of ["获取方式", "主要用途", "新手建议", "关联规划"]) expect(entry.attributes[field].length).toBeGreaterThan(18);
  context = createTestContext();
  await initialize(context);
  const app = createApp(context);
  const page = await request(app).get(`/wiki/crops/${slug}`);
  expect(page.status).toBe(200);
  expect(page.text).toContain(name);
  expect(page.text).toContain(restriction);
  expect((await request(app).get(entry.image)).status).toBe(200);
  for (const href of entry.attributes.links) expect((await request(app).get(href)).status, href).toBe(200);
  const before = context.db.prepare("SELECT e.id FROM dataset_entries e JOIN datasets d ON d.id=e.dataset_id WHERE d.slug='crops' AND e.slug=?").all(slug);
  seedDatabase(context.db);
  const after = context.db.prepare("SELECT e.id FROM dataset_entries e JOIN datasets d ON d.id=e.dataset_id WHERE d.slug='crops' AND e.slug=?").all(slug);
  expect(before).toHaveLength(1);
  expect(after).toEqual(before);
});

test("distinguishes Ghostfish from Spook Fish without changing the existing Ghostfish URL or id", async () => {
  context = createTestContext();
  await initialize(context);
  const ghost = context.db.prepare("SELECT e.* FROM dataset_entries e JOIN datasets d ON d.id=e.dataset_id WHERE d.slug='fish' AND e.slug='ghostfish'").get();
  expect(ghost).toBeDefined();
  context.db.prepare("UPDATE dataset_entries SET name='幽灵鱼' WHERE id=?").run(ghost.id);
  seedDatabase(context.db);
  const restored = context.db.prepare("SELECT * FROM dataset_entries WHERE id=?").get(ghost.id);
  expect(restored.name).toBe("鬼鱼");
  expect(restored.slug).toBe("ghostfish");
  const spook = context.db.prepare("SELECT * FROM dataset_entries WHERE dataset_id=? AND slug='spook-fish'").get(ghost.dataset_id);
  expect(spook.name).toBe("幽灵鱼");
  expect(spook.id).not.toBe(ghost.id);
});

test.each(additions)("serves verified %s/%s with guidance, real assets and valid related links", async (dataset, slug, name, fact) => {
  context = createTestContext();
  await initialize(context);
  const app = createApp(context);
  const page = await request(app).get(`/wiki/${dataset}/${slug}`);
  expect(page.status).toBe(200);
  expect(page.text).toContain(name);
  expect(page.text).toContain(fact);
  const row = context.db.prepare("SELECT e.* FROM dataset_entries e JOIN datasets d ON d.id=e.dataset_id WHERE d.slug=? AND e.slug=?").get(dataset, slug);
  const attributes = JSON.parse(row.attributes_json);
  expect(attributes["资料来源"]).toMatch(/^https:\/\/stardewvalleywiki.com\//);
  expect((await request(app).get(row.image)).status).toBe(200);
  for (const href of attributes.links) expect((await request(app).get(href)).status, href).toBe(200);
  seedDatabase(context.db);
  const count = context.db.prepare("SELECT COUNT(*) AS n FROM dataset_entries WHERE dataset_id=? AND slug=?").get(row.dataset_id, slug);
  expect(count.n).toBe(1);
});
