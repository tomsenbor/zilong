import { expect, test } from "vitest";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { createTestContext } from "./helpers/context.js";

const shoes = [
  [
    "sneakers",
    "运动鞋",
    1,
    0,
    50
  ],
  [
    "rubber-boots",
    "橡胶靴",
    0,
    1,
    50
  ],
  [
    "leather-boots",
    "皮靴",
    1,
    1,
    100
  ],
  [
    "work-boots",
    "工作靴",
    2,
    0,
    100
  ],
  [
    "combat-boots",
    "战靴",
    3,
    0,
    150
  ],
  [
    "tundra-boots",
    "冻土靴",
    2,
    1,
    150
  ],
  [
    "leprechaun-shoes",
    "矮精灵鞋子",
    2,
    1,
    150
  ],
  [
    "thermal-boots",
    "热能靴",
    1,
    2,
    150
  ],
  [
    "dark-boots",
    "黑暗之靴",
    4,
    2,
    300
  ],
  [
    "firewalker-boots",
    "蹈火者靴",
    3,
    3,
    300
  ],
  [
    "genie-shoes",
    "神怪之鞋",
    1,
    6,
    350
  ],
  [
    "crystal-shoes",
    "水晶鞋",
    3,
    5,
    400
  ],
  [
    "emilys-magic-boots",
    "艾米丽的魔法靴",
    4,
    4,
    400
  ],
  [
    "cinderclown-shoes",
    "灰烬小丑鞋",
    6,
    5,
    550
  ],
  [
    "mermaid-boots",
    "美人鱼靴",
    5,
    8,
    650
  ],
  [
    "dragonscale-boots",
    "龙鳞靴",
    7,
    0,
    350
  ]
];
test("sixteen missing obtainable shoes preserve exact defense, immunity and resale values", () => {
  for (const [slug,name,defense,immunity,price] of shoes) {
    const found = entries.filter(e => e.dataset === "items" && e.slug === slug);
    expect(found,name).toHaveLength(1);
    expect(found[0].name).toBe(name);
    expect(found[0].attributes.属性).toBe(`防御+${defense}；免疫+${immunity}`);
    expect(found[0].attributes.sellPrice).toBe(`${price}金（探险家公会）`);
  }
});
test("shoe acquisition distinguishes trades, random rewards and unobtainable data", () => {
  const get = slug => {
    const entry = entries.find(e => e.slug === slug);
    expect(entry,slug).toBeDefined();
    return entry.attributes;
  };
  expect(get("cinderclown-shoes").获取方式).toContain("100个火山晶石");
  expect(get("emilys-magic-boots").获取方式).toContain("14心");
  expect(get("mermaid-boots").获取方式).toContain("稀有宝箱");
  expect(get("dragonscale-boots").获取方式).toContain("稀有宝箱");
  expect(get("work-boots").使用限制).toContain("混合");
  expect(entries.some(e => e.slug === "cowboy-boots")).toBe(false);
});
test("shoe pages, dedicated icons and related links are accessible in an isolated database", async () => {
  const context = createTestContext();
  try {
    await initialize(context);
    const app = createApp(context);
    for (const [slug,name] of shoes) {
      const api = await request(app).get(`/api/datasets/items/entries/${slug}`);
      expect(api.status,name).toBe(200);
      expect(api.body.item.name).toBe(name);
      expect(api.body.item.image).not.toContain("Prismatic_Shard");
      expect((await request(app).get(api.body.item.image)).status).toBe(200);
      expect((await request(app).get(`/wiki/items/${slug}`)).status).toBe(200);
      for (const link of entries.find(e=>e.slug===slug).attributes.links) {
        expect((await request(app).get(link)).status,link).toBe(200);
      }
    }
  } finally { context.close(); }
},15000);
