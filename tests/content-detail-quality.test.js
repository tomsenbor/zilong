import { afterEach, describe, expect, test } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { entries } from "../src/db/seeds.js";
import { makeEntrySlug } from "../src/utils/entry-slug.js";
import { createTestContext } from "./helpers/context.js";

let context;

afterEach(() => context?.close());

const firstBatchNames = [
  "草莓",
  "远古水果",
  "蓝莓",
  "啤酒花",
  "甜瓜",
  "南瓜",
  "蔓越莓",
  "咖啡豆",
  "防风草",
  "土豆",
  "鲶鱼",
  "鳗鱼",
  "鲟鱼",
  "河豚",
  "沙丁鱼",
  "大海参",
  "章鱼",
  "鲷鱼",
  "红鲷鱼",
  "铱锭",
  "五彩碎片",
  "电池组",
  "铱矿石",
  "硬木",
  "煤炭",
  "石英",
  "阿比盖尔",
  "海莉",
  "谢恩",
  "莉亚",
  "塞巴斯蒂安"
];

const secondBatchNames = [
  "花椰菜",
  "大黄",
  "青豆",
  "甘蓝菜",
  "杨桃",
  "辣椒",
  "番茄",
  "玉米",
  "红叶卷心菜",
  "葡萄",
  "小麦",
  "大嘴鲈鱼",
  "金枪鱼",
  "幽灵鱼",
  "冰柱鱼",
  "岩浆鳗鱼",
  "木跃鱼",
  "沙鱼",
  "蝎鲤鱼",
  "狮子鱼",
  "黄貂鱼",
  "恐龙蛋",
  "兔子的脚",
  "松露",
  "上古水果酒",
  "鱼子酱",
  "自动抚摸机",
  "祝福雕像",
  "矮人王雕像",
  "铱镰刀"
];

const villagerBatchNames = entries.filter((entry) => entry.dataset === "villagers").map((entry) => entry.name);

const mineDropBatchNames = [
  "铜矿石",
  "铜锭",
  "铁矿石",
  "铁锭",
  "金矿石",
  "金锭",
  "晶球",
  "冰封晶球",
  "岩浆晶球",
  "万能晶球",
  "地晶",
  "泪晶",
  "火水晶",
  "史莱姆泥",
  "蝙蝠翅膀",
  "太阳精华",
  "虚空精华",
  "山洞萝卜",
  "红蘑菇",
  "紫蘑菇"
];

const questFestivalLocationBatchNames = [
  "社区中心",
  "Joja 发展申请书",
  "神秘的齐",
  "哥布林问题",
  "海盗的妻子",
  "齐先生的五彩农场",
  "深处的危险",
  "罗宾的资源大作战",
  "复活节",
  "花舞节",
  "夏威夷宴会",
  "月光水母起舞",
  "星露谷展览会",
  "万灵节",
  "冰雪节",
  "夜市",
  "冬日星盛宴",
  "沙漠节",
  "鳟鱼大赛",
  "鱿鱼节",
  "农场",
  "鹈鹕镇",
  "海滩",
  "山区",
  "矿井",
  "沙漠",
  "下水道",
  "秘密森林",
  "姜岛",
  "火山地牢",
  "齐先生的核桃房",
  "精通洞窟"
];

function findEntry(name) {
  const item = entries.find((entry) => entry.name === name);
  expect(item, name).toBeTruthy();
  return item;
}

function entryUrl(item) {
  return `/wiki/${item.dataset}/${makeEntrySlug(item)}`;
}

describe("first batch wiki detail content", () => {
  test("ships complete practical guidance for all first batch entries", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);

    const targetEntries = firstBatchNames.map(findEntry);
    const sitemap = await request(app).get("/sitemap.xml");
    expect(sitemap.status).toBe(200);

    for (const item of targetEntries) {
      const url = entryUrl(item);
      const attributes = item.attributes || {};
      expect(url, item.name).not.toMatch(/[\u3400-\u9fff]/);
      expect(attributes["获取方式"]?.length, item.name).toBeGreaterThan(24);
      expect(attributes["主要用途"]?.length, item.name).toBeGreaterThan(24);
      expect(attributes["新手建议"]?.length, item.name).toBeGreaterThan(24);
      expect(attributes["关联规划"]?.length, item.name).toBeGreaterThan(18);

      const links = Array.isArray(attributes.links) ? attributes.links : [attributes.links].filter(Boolean);
      expect(links.length, item.name).toBeGreaterThanOrEqual(2);

      const page = await request(app).get(url);
      expect(page.status, url).toBe(200);
      expect(page.text, url).toContain(item.name);
      expect(page.text, url).toContain("实用说明");
      expect(page.text, url).toContain("获取方式");
      expect(page.text, url).toContain("主要用途");
      expect(page.text, url).toContain("新手建议");
      for (const href of links) {
        expect(page.text, `${item.name} ${href}`).toContain(`href="${href}"`);
      }

      expect(sitemap.text, url).toContain(`https://pixelharvestwiki.com${url}`);
    }
  });

  test("uses real internal links for the first batch guidance", async () => {
    context = createTestContext();
    await initialize(context);
    const app = createApp(context);

    const uniqueLinks = new Set();
    for (const name of firstBatchNames) {
      const item = findEntry(name);
      const links = Array.isArray(item.attributes.links) ? item.attributes.links : [item.attributes.links].filter(Boolean);
      links.forEach((href) => uniqueLinks.add(href));
    }

    for (const href of uniqueLinks) {
      const response = await request(app).get(href);
      expect(response.status, href).toBe(200);
    }
  });
});

describe("villager gift wiki detail content", () => {
  test("ships complete gift guidance for every villager entry", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);

    const sitemap = await request(app).get("/sitemap.xml");
    expect(sitemap.status).toBe(200);

    for (const name of villagerBatchNames) {
      const item = findEntry(name);
      const url = entryUrl(item);
      const attributes = item.attributes || {};
      expect(url, item.name).not.toMatch(/[\u3400-\u9fff]/);
      expect(attributes.birthday, item.name).toBeTruthy();
      expect(attributes.address, item.name).toBeTruthy();
      expect(attributes.loves, item.name).toBeTruthy();
      expect(attributes["获取方式"]?.length, item.name).toBeGreaterThan(24);
      expect(attributes["主要用途"]?.length, item.name).toBeGreaterThan(24);
      expect(attributes["新手建议"]?.length, item.name).toBeGreaterThan(24);
      expect(attributes["关联规划"]?.length, item.name).toBeGreaterThan(18);

      const links = Array.isArray(attributes.links) ? attributes.links : [attributes.links].filter(Boolean);
      expect(links.length, item.name).toBeGreaterThanOrEqual(2);

      const page = await request(app).get(url);
      expect(page.status, url).toBe(200);
      expect(page.text, url).toContain(item.name);
      expect(page.text, url).toContain("实用说明");
      expect(page.text, url).toContain("获取方式");
      expect(page.text, url).toContain("主要用途");
      expect(page.text, url).toContain("新手建议");
      expect(page.text, url).toContain("关联规划");
      for (const href of links) {
        expect(page.text, `${item.name} ${href}`).toContain(`href="${href}"`);
      }

      expect(sitemap.text, url).toContain(`https://pixelharvestwiki.com${url}`);
    }
  });

  test("uses real internal links for villager gift guidance", async () => {
    context = createTestContext();
    await initialize(context);
    const app = createApp(context);

    const uniqueLinks = new Set();
    for (const name of villagerBatchNames) {
      const item = findEntry(name);
      const links = Array.isArray(item.attributes.links) ? item.attributes.links : [item.attributes.links].filter(Boolean);
      links.forEach((href) => uniqueLinks.add(href));
    }

    for (const href of uniqueLinks) {
      const response = await request(app).get(href);
      expect(response.status, href).toBe(200);
    }
  });
});

describe("second batch wiki detail content", () => {
  test("ships complete practical guidance for all second batch entries", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);

    const targetEntries = secondBatchNames.map(findEntry);
    const sitemap = await request(app).get("/sitemap.xml");
    expect(sitemap.status).toBe(200);

    for (const item of targetEntries) {
      const url = entryUrl(item);
      const attributes = item.attributes || {};
      expect(url, item.name).not.toMatch(/[\u3400-\u9fff]/);
      expect(attributes["获取方式"]?.length, item.name).toBeGreaterThan(24);
      expect(attributes["主要用途"]?.length, item.name).toBeGreaterThan(24);
      expect(attributes["新手建议"]?.length, item.name).toBeGreaterThan(24);
      expect(attributes["关联规划"]?.length, item.name).toBeGreaterThan(18);

      const links = Array.isArray(attributes.links) ? attributes.links : [attributes.links].filter(Boolean);
      expect(links.length, item.name).toBeGreaterThanOrEqual(2);

      const page = await request(app).get(url);
      expect(page.status, url).toBe(200);
      expect(page.text, url).toContain(item.name);
      expect(page.text, url).toContain("实用说明");
      expect(page.text, url).toContain("获取方式");
      expect(page.text, url).toContain("主要用途");
      expect(page.text, url).toContain("新手建议");
      for (const href of links) {
        expect(page.text, `${item.name} ${href}`).toContain(`href="${href}"`);
      }

      expect(sitemap.text, url).toContain(`https://pixelharvestwiki.com${url}`);
    }
  });

  test("uses real internal links for the second batch guidance", async () => {
    context = createTestContext();
    await initialize(context);
    const app = createApp(context);

    const uniqueLinks = new Set();
    for (const name of secondBatchNames) {
      const item = findEntry(name);
      const links = Array.isArray(item.attributes.links) ? item.attributes.links : [item.attributes.links].filter(Boolean);
      links.forEach((href) => uniqueLinks.add(href));
    }

    for (const href of uniqueLinks) {
      const response = await request(app).get(href);
      expect(response.status, href).toBe(200);
    }
  });
});

describe("mine drop wiki detail content", () => {
  test("ships complete mine drop guidance with stable URLs", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);

    const sitemap = await request(app).get("/sitemap.xml");
    expect(sitemap.status).toBe(200);

    for (const item of mineDropBatchNames.map(findEntry)) {
      const url = entryUrl(item);
      const attributes = item.attributes || {};
      expect(url, item.name).not.toMatch(/[\u3400-\u9fff]/);
      expect(attributes["获取方式"]?.length, item.name).toBeGreaterThan(24);
      expect(attributes["主要用途"]?.length, item.name).toBeGreaterThan(24);
      expect(attributes["新手建议"]?.length, item.name).toBeGreaterThan(24);
      expect(attributes["关联规划"]?.length, item.name).toBeGreaterThan(18);

      const links = Array.isArray(attributes.links) ? attributes.links : [attributes.links].filter(Boolean);
      expect(links.length, item.name).toBeGreaterThanOrEqual(2);

      const page = await request(app).get(url);
      expect(page.status, url).toBe(200);
      expect(page.text, url).toContain(item.name);
      expect(page.text, url).toContain("实用说明");
      expect(page.text, url).toContain("获取方式");
      expect(page.text, url).toContain("主要用途");
      expect(page.text, url).toContain("新手建议");
      expect(page.text, url).toContain("关联规划");
      for (const href of links) {
        expect(page.text, `${item.name} ${href}`).toContain(`href="${href}"`);
      }

      expect(sitemap.text, url).toContain(`https://pixelharvestwiki.com${url}`);
    }
  });

  test("uses real internal links for mine drop guidance", async () => {
    context = createTestContext();
    await initialize(context);
    const app = createApp(context);

    const uniqueLinks = new Set();
    for (const name of mineDropBatchNames) {
      const item = findEntry(name);
      const links = Array.isArray(item.attributes.links) ? item.attributes.links : [item.attributes.links].filter(Boolean);
      links.forEach((href) => uniqueLinks.add(href));
    }

    for (const href of uniqueLinks) {
      const response = await request(app).get(href);
      expect(response.status, href).toBe(200);
    }
  });
});

describe("quest festival and location wiki detail content", () => {
  test("ships complete practical guidance for quest, festival and location entries", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);

    const sitemap = await request(app).get("/sitemap.xml");
    expect(sitemap.status).toBe(200);

    for (const item of questFestivalLocationBatchNames.map(findEntry)) {
      const url = entryUrl(item);
      const attributes = item.attributes || {};
      expect(url, item.name).not.toMatch(/[\u3400-\u9fff]/);
      expect(attributes["获取方式"]?.length, item.name).toBeGreaterThan(24);
      expect(attributes["主要用途"]?.length, item.name).toBeGreaterThan(24);
      expect(attributes["新手建议"]?.length, item.name).toBeGreaterThan(24);
      expect(attributes["关联规划"]?.length, item.name).toBeGreaterThan(18);

      const links = Array.isArray(attributes.links) ? attributes.links : [attributes.links].filter(Boolean);
      expect(links.length, item.name).toBeGreaterThanOrEqual(2);

      const page = await request(app).get(url);
      expect(page.status, url).toBe(200);
      expect(page.text, url).toContain(item.name);
      expect(page.text, url).toContain("实用说明");
      expect(page.text, url).toContain("获取方式");
      expect(page.text, url).toContain("主要用途");
      expect(page.text, url).toContain("新手建议");
      expect(page.text, url).toContain("关联规划");
      for (const href of links) {
        expect(page.text, `${item.name} ${href}`).toContain(`href="${href}"`);
      }

      expect(sitemap.text, url).toContain(`https://pixelharvestwiki.com${url}`);
    }
  });

  test("uses real internal links for quest, festival and location guidance", async () => {
    context = createTestContext();
    await initialize(context);
    const app = createApp(context);

    const uniqueLinks = new Set();
    for (const name of questFestivalLocationBatchNames) {
      const item = findEntry(name);
      const links = Array.isArray(item.attributes.links) ? item.attributes.links : [item.attributes.links].filter(Boolean);
      links.forEach((href) => uniqueLinks.add(href));
    }

    for (const href of uniqueLinks) {
      const response = await request(app).get(href);
      expect(response.status, href).toBe(200);
    }
  });
});
