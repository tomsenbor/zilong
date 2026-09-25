import { expect, test } from "vitest";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { createTestContext } from "./helpers/context.js";
const identities = [
  ["crab-pot", "蟹笼", "Crab_Pot"], ["milk-pail", "挤奶桶", "Milk_Pail"],
  ["shears", "剪刀", "Shears"], ["heater", "加热器", "Heater"],
  ["auto-grabber", "自动采集器", "Auto-Grabber"], ["hay-hopper", "喂料斗", "Hay_Hopper"],
  ["incubator", "孵化器", "Incubator"], ["ostrich-incubator", "鸵鸟孵化器", "Ostrich_Incubator"]
];
function attributes(slug) {
  const item = entries.find(e => e.dataset === "items" && e.slug === slug);
  expect(item, slug).toBeDefined();
  return item.attributes;
}
test("animal equipment and crab pot identities are present without duplicate names", () => {
  for (const [slug, name] of identities) {
    expect(entries.filter(e => e.dataset === "items" && e.name === name), name).toHaveLength(1);
    expect(entries.find(e => e.dataset === "items" && e.slug === slug)?.name).toBe(name);
  }
});
test("manual harvesting and automatic collection do not promise the same experience", () => {
  expect(attributes("milk-pail").购买价格).toBe("1000金");
  expect(attributes("shears").购买价格).toBe("1000金");
  expect(attributes("milk-pail").主要用途).toContain("5点耕种经验");
  expect(attributes("auto-grabber").购买价格).toBe("25000金");
  expect(attributes("auto-grabber").使用限制).toContain("不获得耕种经验");
  expect(attributes("auto-grabber").使用限制).toContain("松露");
  expect(attributes("heater").使用限制).toContain("不叠加");
});
test("incubators and feeding fixtures preserve capacity and location restrictions", () => {
  expect(attributes("hay-hopper").制作配方).toBe("建筑自带，不能制作或搬动");
  expect(attributes("incubator").加工时间).toContain("9000");
  expect(attributes("incubator").加工时间).toContain("18000");
  expect(attributes("incubator").使用限制).toContain("满员");
  expect(attributes("ostrich-incubator").制作配方).toBe("骨头碎片×50、硬木×50、火山晶石×20");
  expect(attributes("ostrich-incubator").加工时间).toContain("15000");
  expect(attributes("ostrich-incubator").使用限制).toContain("畜棚");
  expect(attributes("crab-pot").制作配方).toContain("木材×40、铁锭×3");
  expect(attributes("crab-pot").制作配方).toContain("木材×25、铜锭×2");
});
test("equipment pages and exact dedicated assets resolve through an isolated app", async () => {
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
      expect(page.text).toContain(attributes(slug).获取方式);
      for (const link of attributes(slug).links) expect((await request(app).get(link)).status, link).toBe(200);
    }
  } finally { context.close(); }
}, 15000);
