import { expect, test } from "vitest";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { createTestContext } from "./helpers/context.js";
const rings = [["small-glow-ring","小型光辉戒指",50],["glow-ring","光辉戒指",100],["small-magnet-ring","小型磁铁戒指",50],["magnet-ring","磁铁戒指",100],["warrior-ring","战士戒指",750],["vampire-ring","吸血戒指",750],["savage-ring","野蛮人戒指",750],["ring-of-yoba","由巴的戒指",750],["sturdy-ring","结实戒指",750],["burglars-ring","窃贼戒指",750],["amethyst-ring","紫水晶戒指",100],["topaz-ring","黄水晶戒指",100],["aquamarine-ring","海蓝宝石戒指",200],["jade-ring","翡翠戒指",200],["emerald-ring","绿宝石戒指",300],["ruby-ring","红宝石戒指",300],["wedding-ring","结婚戒指",1000],["crabshell-ring","蟹壳戒指",1000],["napalm-ring","燃烧弹戒指",1000],["thorns-ring","荆棘戒指",100],["lucky-ring","幸运戒指",100],["hot-java-ring","热咖啡戒指",100],["protection-ring","保护戒指",100],["soul-sapper-ring","吸魂戒指",100],["phoenix-ring","凤凰戒指",100],["immunity-band","免疫指环",250],["glowstone-ring","辉石戒指",100]];
const get = slug => {
  const entry = entries.find(e=>e.dataset==="items" && e.slug===slug);
  expect(entry,slug).toBeDefined();
  return entry.attributes;
};
test("all 27 missing obtainable base rings have unique pages and exact resale prices", () => {
  expect(rings).toHaveLength(27);
  for (const [slug,name,price] of rings) {
    const found=entries.filter(e=>e.dataset==="items" && e.slug===slug);
    expect(found,name).toHaveLength(1);
    expect(found[0].name).toBe(name);
    expect(found[0].attributes.sellPrice).toBe(`${price}金（探险家公会）`);
  }
});
test("ring rules distinguish critical chance, daily revival and multiplayer marriage", () => {
  expect(get("topaz-ring").属性).toBe("防御+1");
  expect(get("aquamarine-ring").使用限制).toContain("不是增加10个百分点");
  expect(get("savage-ring").属性).toContain("3秒");
  expect(get("phoenix-ring").属性).toContain("每天一次");
  expect(get("phoenix-ring").属性).toContain("50%");
  expect(get("wedding-ring").使用限制).toContain("多人");
  expect(get("wedding-ring").使用限制).toContain("不提供战斗加成");
  expect(get("burglars-ring").使用限制).toContain("不保证");
  expect(get("soul-sapper-ring").属性).toContain("4点体力");
  expect(get("vampire-ring").属性).toContain("2点生命");
  expect(entries.some(e=>e.slug==="jukebox-ring")).toBe(false);
});
test("new ring routes, real icons and recommendations work in temporary data", async () => {
  const context=createTestContext();
  try {
    await initialize(context);
    const app=createApp(context);
    for (const [slug,name] of rings) {
      const api=await request(app).get(`/api/datasets/items/entries/${slug}`);
      expect(api.status,name).toBe(200);
      expect(api.body.item.name).toBe(name);
      expect(api.body.item.image).not.toContain("Prismatic_Shard");
      expect((await request(app).get(api.body.item.image)).status).toBe(200);
      expect((await request(app).get(`/wiki/items/${slug}`)).status).toBe(200);
      for (const link of get(slug).links) expect((await request(app).get(link)).status,link).toBe(200);
    }
  } finally { context.close(); }
},15000);
