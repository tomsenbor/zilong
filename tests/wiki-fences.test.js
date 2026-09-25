import { expect, test } from "vitest";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { seedDatabase } from "../src/db/seed.js";
import { createTestContext } from "./helpers/context.js";

const fixtures = [
  ["wood-fence", "木围栏", "Wood_Fence", "木材×2", 1, "48–52天", "初始配方"],
  ["stone-fence", "石围栏", "Stone_Fence", "石头×2", 1, "106–109天", "耕种2级"],
  ["iron-fence", "铁围栏", "Iron_Fence", "铁锭×1", 10, "223–226天", "耕种4级"],
  ["hardwood-fence", "硬木围栏", "Hardwood_Fence", "硬木×1", 1, "502–505天", "耕种6级"],
  ["gate", "大门", "Gate", "木材×10", 1, "360天", "初始配方"]
];

test("fences preserve distinct recipes, output quantities and lifespans", () => {
  for (const [slug, name, , recipe, quantity, lifespan, unlock] of fixtures) {
    const item = entries.find(entry => entry.dataset === "items" && entry.slug === slug);
    expect(item, slug).toBeDefined();
    expect(item.name).toBe(name);
    expect(item.attributes.制作配方).toBe(recipe);
    expect(item.attributes.制作产量).toBe(quantity);
    expect(item.attributes.耐久时间).toBe(lifespan);
    expect(item.attributes.获取方式).toContain(unlock);
  }
});

test("fence pages, icons and related links exist and reseeding preserves identity", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    for (const [slug, name, icon] of fixtures) {
      const response = await request(app).get(`/api/datasets/items/entries/${slug}`);
      expect(response.status, slug).toBe(200);
      const item = response.body.item;
      expect(item.name).toBe(name);
      expect(item.image).toBe(`/assets/game/${icon}.png`);
      expect((await request(app).get(item.image)).status).toBe(200);
      const page = await request(app).get(`/wiki/items/${slug}`);
      expect(page.status).toBe(200);
      expect(page.text).toContain(item.attributes.耐久时间);
      for (const link of item.attributes.links) expect((await request(app).get(link)).status).toBe(200);
    }
    const snapshot = () => context.db.prepare("SELECT id,dataset_id,slug,name,attributes_json FROM dataset_entries ORDER BY id").all();
    const before = snapshot();
    seedDatabase(context.db);
    expect(snapshot()).toEqual(before);
  } finally { context.close(); }
}, 15000);
