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
