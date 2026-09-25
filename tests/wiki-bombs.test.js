import { expect, test } from "vitest";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { createTestContext } from "./helpers/context.js";

const fixtures = [
  ["bomb", "炸弹", "Bomb", "铁矿石×4、煤炭×1", "采矿6级"],
  ["cherry-bomb", "樱桃炸弹", "Cherry_Bomb", "铜矿石×4、煤炭×1", "采矿1级"],
  ["mega-bomb", "超级炸弹", "Mega_Bomb", "金矿石×4、太阳精华×1、虚空精华×1", "采矿8级"]
];

const get = slug => {
  const item = entries.find(e => e.dataset === "items" && e.slug === slug);
  expect(item, slug).toBeDefined();
  return item.attributes;
};

test("bomb entries preserve recipes, radii and safety restrictions", () => {
  for (const [slug, name, icon, recipe, unlock] of fixtures) {
    expect(entries.filter(e => e.dataset === "items" && e.name === name)).toHaveLength(1);
    expect(get(slug).制作配方).toBe(recipe);
    expect(get(slug).解锁条件).toBe(unlock);
    expect(get(slug).资料来源).toBe(`https://stardewvalleywiki.com/${icon}`);
    expect(get(slug).使用限制).toContain("一次性");
    expect(get(slug).使用限制).toContain("设备");
  }
  expect(get("bomb").爆炸半径).toBe("5格（直径11格）");
  expect(get("cherry-bomb").爆炸半径).toBe("3格（直径7格）");
  expect(get("mega-bomb").爆炸半径).toBe("6至8格（直径13至17格）");
});

test("bomb pages, icons and related routes render in temporary database", async () => {
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
