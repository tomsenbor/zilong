import { expect, test } from "vitest";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { createTestContext } from "./helpers/context.js";
const identities = [
  ["bait-maker","鱼饵制造机","Bait_Maker"], ["bone-mill","碎骨机","Bone_Mill"],
  ["charcoal-kiln","煤炭窑","Charcoal_Kiln"], ["crystalarium","宝石复制机","Crystalarium"],
  ["deluxe-worm-bin","高级虫饵盒","Deluxe_Worm_Bin"], ["furnace","熔炉","Furnace"],
  ["geode-crusher","晶球破开器","Geode_Crusher"], ["heavy-furnace","重型熔炉","Heavy_Furnace"],
  ["heavy-tapper","重型树液采集器","Heavy_Tapper"], ["lightning-rod","避雷针","Lightning_Rod"],
  ["mushroom-log","蘑菇树桩","Mushroom_Log"], ["recycling-machine","回收机","Recycling_Machine"],
  ["seed-maker","种子生产器","Seed_Maker"], ["slime-egg-press","史莱姆压蛋器","Slime_Egg-Press"],
  ["slime-incubator","史莱姆孵化器","Slime_Incubator"], ["solar-panel","太阳能板","Solar_Panel"],
  ["tapper","树液采集器","Tapper"], ["wood-chipper","碎木机","Wood_Chipper"], ["worm-bin","虫饵盒","Worm_Bin"]
];
const get = slug => {
  const item = entries.find(e => e.dataset === "items" && e.slug === slug);
  expect(item, slug).toBeDefined();
  return item.attributes;
};
test("nineteen missing refining identities have unique names and explicit source URLs", () => {
  for (const [slug, name, icon] of identities) {
    expect(entries.filter(e => e.dataset === "items" && e.name === name), name).toHaveLength(1);
    expect(get(slug).资料来源).toBe(`https://stardewvalleywiki.com/${icon}`);
  }
});
test("1.6 recipes retain changed unlock levels and do not charge removed fuel", () => {
  expect(get("charcoal-kiln").解锁条件).toBe("采集2级");
  expect(get("tapper").解锁条件).toBe("采集4级");
  expect(get("worm-bin").解锁条件).toBe("钓鱼4级");
  expect(get("worm-bin").制作配方).toBe("硬木×15、金锭×1、铁锭×1、纤维×50");
  expect(get("geode-crusher").投入产出).toContain("不消耗煤炭");
  expect(get("heavy-furnace").投入产出).toContain("25个矿石和3个煤炭");
  expect(get("heavy-furnace").投入产出).toContain("5至6");
});
test("processing exceptions prevent false guaranteed output and unsuitable inputs", () => {
  expect(get("crystalarium").使用限制).toContain("五彩碎片");
  expect(get("seed-maker").使用限制).toContain("茶叶");
  expect(get("seed-maker").投入产出).toContain("97.51%");
  expect(get("slime-egg-press").使用限制).toContain("虎纹");
  expect(get("slime-incubator").使用限制).toContain("夜间");
  expect(get("heavy-tapper").使用限制).toContain("蘑菇树");
  expect(get("lightning-rod").使用限制).toContain("不是固定半径");
  expect(get("solar-panel").加工时间).toContain("7个晴天");
  expect(get("recycling-machine").使用限制).toContain("Joja可乐");
});
test("refining details, dedicated icons and related links are available in a temporary database", async () => {
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
      expect(page.text).toContain(get(slug).制作配方);
      for (const link of get(slug).links) expect((await request(app).get(link)).status, link).toBe(200);
    }
  } finally { context.close(); }
}, 15000);
