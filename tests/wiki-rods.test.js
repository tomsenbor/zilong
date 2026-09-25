import { expect, test } from "vitest";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { createTestContext } from "./helpers/context.js";

const rods = [
  ["training-rod", "训练用鱼竿", 25, 0, 0, "Training_Rod"],
  ["bamboo-pole", "竹鱼竿", 500, 0, 0, "Bamboo_Pole"],
  ["fiberglass-rod", "玻璃纤维鱼竿", 1800, 1, 0, "Fiberglass_Rod"],
  ["iridium-rod", "铱金鱼竿", 7500, 1, 1, "Iridium_Rod"],
  ["advanced-iridium-rod", "高级铱金鱼竿", 25000, 1, 2, "Advanced_Iridium_Rod"]
];
const get = slug => {
  const item = entries.find(e => e.dataset === "items" && e.slug === slug);
  expect(item, slug).toBeDefined();
  return item;
};

test("five source-listed rods have distinct identities and correct purchase prices and slots", () => {
  for (const [slug, name, price, bait, tackle] of rods) {
    const matches = entries.filter(e => e.dataset === "items" && e.slug === slug);
    expect(matches, name).toHaveLength(1);
    expect(matches[0].name).toBe(name);
    expect(matches[0].attributes).toMatchObject({ type: "鱼竿", 购买价格: `${price}金`, 鱼饵插槽: bait, 钓具插槽: tackle });
  }
});

test("rod acquisition and training restrictions are not confused with normal fishing", () => {
  expect(get("training-rod").attributes.使用限制).toContain("低于50");
  expect(get("training-rod").attributes.使用限制).toContain("普通品质");
  expect(get("training-rod").attributes.使用限制).toContain("矿井");
  expect(get("fiberglass-rod").attributes.解锁条件).toBe("钓鱼2级");
  expect(get("iridium-rod").attributes.解锁条件).toBe("钓鱼6级");
  expect(get("advanced-iridium-rod").attributes.解锁条件).toContain("领取钓鱼精通");
  expect(get("advanced-iridium-rod").attributes.使用限制).toContain("声纳浮漂");
  expect(get("advanced-iridium-rod").attributes.使用限制).toContain("珍稀诱钩");
});

test("rod pages expose exact icons and acquisition data through the real API and SSR", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    for (const [slug, name, , , , icon] of rods) {
      const api = await request(app).get(`/api/datasets/items/entries/${slug}`);
      expect(api.status, name).toBe(200);
      expect(api.body.item.image).toBe(`/assets/game/${icon}.png`);
      expect((await request(app).get(api.body.item.image)).status).toBe(200);
      const html = await request(app).get(`/wiki/items/${slug}`);
      expect(html.status).toBe(200);
      expect(html.text).toContain(get(slug).attributes.获取方式);
      for (const link of get(slug).attributes.links) expect((await request(app).get(link)).status, link).toBe(200);
    }
  } finally { context.close(); }
}, 15000);
