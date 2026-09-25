import { expect, test } from "vitest";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { createTestContext } from "./helpers/context.js";

const fixtures = [
  ["scarecrow", "稻草人", "Scarecrow", "木材×50、煤炭×1、纤维×20"],
  ["deluxe-scarecrow", "豪华稻草人", "Deluxe_Scarecrow", "木材×50、铱矿石×1、纤维×40"],
  ["garden-pot", "花盆", "Garden_Pot", "黏土×1、石头×10、精炼石英×1"]
];
const get = slug => {
  const item = entries.find(e => e.dataset === "items" && e.slug === slug);
  expect(item, slug).toBeDefined();
  return item.attributes;
};

test("crop protection and garden pot entries preserve distinct mechanics", () => {
  for (const [slug, name, icon, recipe] of fixtures) {
    expect(entries.filter(e => e.dataset === "items" && e.name === name)).toHaveLength(1);
    expect(get(slug).制作配方).toBe(recipe);
    expect(get(slug).资料来源).toBe(`https://stardewvalleywiki.com/${icon}`);
  }
  expect(get("scarecrow").覆盖范围).toBe("249格，中心向四方8格，斜向6格");
  expect(get("scarecrow").使用限制).toContain("姜岛没有乌鸦");
  expect(get("deluxe-scarecrow").覆盖范围).toBe("888格，半径16格");
  expect(get("deluxe-scarecrow").获取方式).toContain("8个稀有稻草人");
  expect(get("garden-pot").使用限制).toContain("洒水器不能浇花盆");
  expect(get("garden-pot").使用限制).toContain("季节");
});

test("farm protection pages, icons and related routes render in temporary database", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    for (const [slug, name, icon, recipe] of fixtures) {
      const api = await request(app).get(`/api/datasets/items/entries/${slug}`);
      expect(api.status, name).toBe(200);
      expect(api.body.item.image).toBe(`/assets/game/${icon}.png`);
      expect((await request(app).get(api.body.item.image)).status).toBe(200);
      expect((await request(app).get(`/wiki/items/${slug}`)).status).toBe(200);
      expect((await request(app).get(`/wiki/items/${slug}`)).text).toContain(recipe);
      for (const link of api.body.item.attributes.links) expect((await request(app).get(link)).status, link).toBe(200);
    }
  } finally { context.close(); }
});
