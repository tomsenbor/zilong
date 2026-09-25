import { expect, test } from "vitest";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { seedDatabase } from "../src/db/seed.js";
import { initialize } from "../src/db/initialize.js";
import { createApp } from "../src/app.js";
import { createTestContext } from "./helpers/context.js";

const expected = {
  items: [
    ["bee-house", "蜂房"], ["keg", "小桶"], ["preserves-jar", "罐头瓶"],
    ["mayonnaise-machine", "蛋黄酱机"], ["cheese-press", "压酪机"], ["loom", "织布机"],
    ["oil-maker", "产油机"], ["cask", "木桶"], ["dehydrator", "脱水机"], ["fish-smoker", "熏鱼机"],
    ["galaxy-sword", "银河剑"], ["iridium-band", "铱环"], ["space-boots", "太空之靴"], ["slime-charmer-ring", "史莱姆克星戒指"]
  ],
  quests: [
    ["introductions", "介绍"], ["how-to-win-friends", "交友指南"], ["getting-started", "开始"],
    ["advancement", "进阶"], ["explore-the-mine", "探索矿场"], ["deeper-in-the-mine", "矿场深处"],
    ["initiation", "入门"], ["archaeology", "考古发现"]
  ],
  locations: [
    ["adventurers-guild", "探险家公会"], ["oasis", "绿洲"], ["traveling-cart", "旅行货车"],
    ["wizards-tower", "法师塔"], ["railroad", "铁路"], ["spa", "温泉"]
  ]
};

test("new curated machines, equipment, story quests and places are not replaced by catalog placeholders", () => {
  for (const [dataset, list] of Object.entries(expected)) {
    for (const [slug, name] of list) {
      const matches = entries.filter(e => e.dataset === dataset && e.slug === slug);
      expect(matches, `${dataset}/${slug}`).toHaveLength(1);
      expect(matches[0].name).toBe(name);
    }
  }
});

test("machine restrictions and equipment unlocks reach public API consumers", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    for (const [slug, field, detail] of [
      ["keg", "制作材料", "橡树树脂×1"],
      ["cask", "使用限制", "仅地窖"],
      ["dehydrator", "使用限制", "同种、同品质"],
      ["fish-smoker", "加工方式", "煤炭×1"],
      ["iridium-band", "属性", "伤害+10%"],
      ["galaxy-sword", "属性", "60–80"],
      ["space-boots", "获取方式", "110层"],
      ["slime-charmer-ring", "使用限制", "弹射物"]
    ]) {
      const result = await request(app).get(`/api/datasets/items/entries/${slug}`);
      expect(result.status, slug).toBe(200);
      expect(result.body.item.attributes[field], slug).toContain(detail);
    }
    const start = await request(app).get("/api/datasets/quests/entries/getting-started");
    expect(start.status).toBe(200);
    expect(start.body.item.attributes.完成步骤).toContain("草原农场");
    expect(start.body.item.attributes.完成步骤).toContain("鸡蛋");
    const guild = await request(app).get("/api/datasets/locations/entries/adventurers-guild");
    expect(guild.body.item.attributes.open).toBe("14:00–次日02:00；节日另有例外");
  } finally { context.close(); }
});

test("all added pages expose real detail, working assets and links and reseed without changing ids", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    const records = () => context.db.prepare("SELECT id, dataset_id, slug, name, attributes_json FROM dataset_entries ORDER BY id").all();
    const before = records();
    for (const [dataset, list] of Object.entries(expected)) {
      for (const [slug, name] of list) {
        const detail = await request(app).get(`/api/datasets/${dataset}/entries/${slug}`);
        expect(detail.status, slug).toBe(200);
        expect(detail.body.item.name).toBe(name);
        const original = entries.find(e => e.dataset === dataset && e.slug === slug);
        expect(detail.body.item.image).toBe(original.image);
        expect((await request(app).get(original.image)).status).toBe(200);
        const page = await request(app).get(`/wiki/${dataset}/${slug}`);
        expect(page.status).toBe(200);
        expect(page.text).toContain(original.attributes.获取方式);
        for (const link of original.attributes.links) expect((await request(app).get(link)).status, link).toBe(200);
      }
    }
    seedDatabase(context.db);
    expect(records()).toEqual(before);
  } finally { context.close(); }
}, 30000); // Full page/image/link traversal and repeat import, not one HTTP request.
