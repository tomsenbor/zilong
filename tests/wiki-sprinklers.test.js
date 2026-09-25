import { expect, test } from "vitest";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { createTestContext } from "./helpers/context.js";

const identities = [
  ["sprinkler", "洒水器", "Sprinkler", 4, 2],
  ["quality-sprinkler", "优质洒水器", "Quality_Sprinkler", 8, 6],
  ["iridium-sprinkler", "铱制洒水器", "Iridium_Sprinkler", 24, 9]
];

test("all three sprinkler tiers retain exact coverage and unlock levels", () => {
  for (const [slug, name, source, count, level] of identities) {
    const matches = entries.filter(e => e.dataset === "items" && e.slug === slug);
    expect(matches, slug).toHaveLength(1);
    const item = matches[0];
    expect(item.name).toBe(name);
    expect(item.attributes.浇水格数).toBe(count);
    expect(item.attributes.解锁条件).toBe(`耕种${level}级`);
    expect(item.attributes.资料来源).toBe(`https://stardewvalleywiki.com/${source}`);
    expect(item.attributes.使用限制).toContain("花盆");
    expect(item.attributes.使用限制).toContain("沙地");
    expect(item.attributes.升级附件).toContain("一种");
  }
});

test("sprinkler prices distinguish selling from Krobus weekly purchase", () => {
  const item = entries.find(e => e.slug === "iridium-sprinkler");
  expect(item).toBeDefined();
  expect(item.attributes.基础售价).toBe(1000);
  expect(item.attributes.获取方式).toContain("每周五");
  expect(item.attributes.获取方式).toContain("10000g");
  expect(item.attributes.获取方式).toContain("1台");
  expect(item.attributes.制作配方).toBe("金锭×1、铱锭×1、电池组×1");
});

test("sprinkler pages, exact icons and related routes render in a temporary database", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    for (const [slug, name, icon] of identities) {
      const api = await request(app).get(`/api/datasets/items/entries/${slug}`);
      expect(api.status, name).toBe(200);
      expect(api.body.item.image).toBe(`/assets/game/${icon}.png`);
      expect((await request(app).get(api.body.item.image)).status).toBe(200);
      const page = await request(app).get(`/wiki/items/${slug}`);
      expect(page.status).toBe(200);
      expect(page.text).toContain(name);
      for (const link of api.body.item.attributes.links) {
        expect((await request(app).get(link)).status, link).toBe(200);
      }
    }
  } finally { context.close(); }
});
