import { expect, test } from "vitest";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { createTestContext } from "./helpers/context.js";
import { makeEntrySlug } from "../src/utils/entry-slug.js";

const resources = ["电池组", "骨头碎片", "火山晶石", "黏土", "煤炭", "铜锭", "铜矿石", "纤维", "金锭", "金矿石", "硬木", "铱锭", "铱矿石", "铁锭", "铁矿石", "苔藓", "放射性矿锭", "放射性矿石", "精炼石英", "石头", "木材"];

test("all 21 resource-category items have a unique curated entry", () => {
  for (const name of resources) expect(entries.filter(e => e.dataset === "items" && e.name === name), name).toHaveLength(1);
});

test("new resource acquisition details and icons survive the API and SSR", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    for (const name of ["骨头碎片", "火山晶石", "黏土", "纤维", "苔藓", "放射性矿锭", "放射性矿石", "精炼石英", "石头", "木材"]) {
      const entry = entries.find(e => e.dataset === "items" && e.name === name);
      expect(entry, name).toBeDefined();
      const slug = makeEntrySlug(entry);
      const page = await request(app).get(`/wiki/items/${slug}`);
      expect(page.status, name).toBe(200);
      expect(page.text).toContain(entry.attributes.获取方式);
      const detail = await request(app).get(`/api/datasets/items/entries/${slug}`);
      expect(detail.body.item.image).toBe(entry.image);
      expect((await request(app).get(entry.image)).status, name).toBe(200);
    }
    const refined = entries.find(e => e.name === "精炼石英");
    expect(refined.attributes.获取方式).toContain("3份");
    expect(entries.find(e => e.name === "放射性矿石").attributes.获取方式).toContain("危险");
  } finally { context.close(); }
});
