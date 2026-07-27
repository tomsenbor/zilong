import { afterEach, describe, expect, test } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { entries } from "../src/db/seeds.js";
import { makeEntrySlug } from "../src/utils/entry-slug.js";
import { selectRelatedGuides } from "../public/js/related-guides.js";
import { createTestContext } from "./helpers/context.js";

let context;

afterEach(() => context?.close());

function relatedGuideLinks(html) {
  const section = html.match(/<section data-seo-related="guides"[\s\S]*?<\/section>/)?.[0] || "";
  return [...section.matchAll(/<a href="(\/guides\/[^"]+)"/g)].map((match) => match[1]);
}

const expectedGuideRecommendations = new Map([
  ["/guides/beginner-guide", [
    "/guides/year-one-summer-money-route",
    "/guides/year-one-fall-money-route",
    "/guides/winter-prep-year-two-route",
    "/guides/year-one-spring-money-route"
  ]],
  ["/guides/beginner", [
    "/guides/year-one-summer-money-route",
    "/guides/beginner-backpack-and-energy-route",
    "/guides/year-one-fall-money-route",
    "/guides/coop-barn-animal-products-route"
  ]],
  ["/guides/money-making", [
    "/guides/year-one-spring-money-route",
    "/guides/year-one-summer-money-route",
    "/guides/beginner-year-one-route-overview",
    "/guides/crop-wiki-and-profit-tool-planning"
  ]],
  ["/guides/community-center", [
    "/guides/beginner-guide",
    "/guides/greenhouse-unlock-year-round-layout",
    "/guides/greenhouse-crops-processing-route",
    "/guides/fall-season-topic-guide"
  ]],
  ["/guides/resources", [
    "/guides/greenhouse-unlock-year-round-layout",
    "/guides/ginger-island-golden-walnut-route",
    "/guides/sprinkler-unlock-and-ore-route",
    "/guides/greenhouse-crops-processing-route"
  ]]
]);

describe("v5.4.2 growth content", () => {
  test("serves every new guide path with its canonical page and related guides", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);
    const pages = new Map([
      ["/guides/beginner-guide", "星露谷物语新手完整指南"],
      ["/guides/beginner", "新手成长路线"],
      ["/guides/money-making", "赚钱攻略"],
      ["/guides/community-center", "社区中心攻略"],
      ["/guides/resources", "资源获取攻略"]
    ]);

    for (const [path, title] of pages) {
      const response = await request(app).get(path);
      expect(response.status, path).toBe(200);
      expect(response.text, path).toContain(`<h1>${title}</h1>`);
      expect(response.text, path).toContain(`rel="canonical" href="https://pixelharvestwiki.com${path}"`);
      expect(response.text, path).toContain('data-seo-related="guides"');
      const links = relatedGuideLinks(response.text);
      expect(links, path).toHaveLength(4);
      expect(new Set(links).size, path).toBe(4);
      expect(links, path).not.toContain(path);
      for (const link of links) {
        expect((await request(app).get(link)).status, `${path} -> ${link}`).toBe(200);
      }
    }

    const sitemap = await request(app).get("/sitemap.xml");
    for (const path of pages.keys()) {
      expect(sitemap.text, path).toContain(`https://pixelharvestwiki.com${path}`);
    }
  });

  test("keeps SSR guide recommendations aligned with the client selections", async () => {
    context = createTestContext();
    await initialize(context);
    const app = createApp(context);
    const articleList = (await request(app).get("/api/articles?pageSize=50")).body.items;

    for (const [path, expectedLinks] of expectedGuideRecommendations) {
      const slug = path.replace("/guides/", "");
      const current = (await request(app).get(`/api/articles/${slug}`)).body.item;
      const clientLinks = selectRelatedGuides(current, articleList, 4)
        .map((article) => `/guides/${article.slug}`);
      const response = await request(app).get(path);
      expect(response.status, path).toBe(200);
      expect(clientLinks, path).toEqual(expectedLinks);
      expect(relatedGuideLinks(response.text), path).toEqual(clientLinks);
    }
  });

  test("keeps shared guide selections stable across repeated calls and input ordering", async () => {
    context = createTestContext();
    await initialize(context);
    const articles = context.db.prepare(`
      SELECT id,title,slug,summary,featured,updated_at
      FROM articles
      WHERE status='published'
    `).all();
    const articleBySlug = new Map(articles.map((article) => [article.slug, article]));
    const inputOrders = [
      articles,
      [...articles].reverse(),
      [...articles.slice(7), ...articles.slice(0, 7)]
    ];

    for (const [path, expectedLinks] of expectedGuideRecommendations) {
      const current = articleBySlug.get(path.replace("/guides/", ""));
      for (const input of inputOrders) {
        for (let attempt = 0; attempt < 3; attempt += 1) {
          const links = selectRelatedGuides(current, input, 4)
            .map((article) => `/guides/${article.slug}`);
          expect(links, `${path} attempt ${attempt + 1}`).toEqual(expectedLinks);
          expect(new Set(links).size, path).toBe(4);
          expect(links, path).not.toContain(path);
          expect(links.every((link) => articleBySlug.has(link.replace("/guides/", ""))), path).toBe(true);
        }
      }
    }
  });

  test("serves every internal link used by all 198 wiki recommendations", async () => {
    context = createTestContext();
    await initialize(context);
    const app = createApp(context);
    const references = new Map();

    expect(entries).toHaveLength(198);
    for (const entry of entries) {
      for (const href of entry.attributes.links || []) {
        const names = references.get(href) || [];
        names.push(entry.name);
        references.set(href, names);
      }
    }

    for (const [href, names] of references) {
      const response = await request(app).get(href);
      expect(response.status, `${href} used by ${names.join("、")}`).toBe(200);
    }
  });

  test("exposes the four growth entrances on the homepage", async () => {
    context = createTestContext();
    await initialize(context);
    const response = await request(createApp(context)).get("/");

    expect(response.status).toBe(200);
    for (const [path, label] of [
      ["/guides/beginner", "新手必看"],
      ["/guides/money-making", "赚钱路线"],
      ["/guides/community-center", "解锁路线"],
      ["/guides/resources", "后期玩法"]
    ]) {
      expect(response.text).toContain(`href="${path}"`);
      expect(response.text).toContain(`>${label}</a>`);
    }
  });

  test("strengthens priority crops, legendary fish, and rare fish with practical guidance", async () => {
    context = createTestContext();
    await initialize(context);
    const app = createApp(context);
    const names = [
      "远古水果", "杨桃", "南瓜", "蓝莓", "草莓",
      "蓝铁饼鱼", "传说之鱼", "绯红鱼", "鮟鱇鱼", "冰川鱼", "变种鲤鱼", "虾虎鱼"
    ];

    for (const name of names) {
      const entry = entries.find((item) => item.name === name);
      expect(entry, name).toBeTruthy();
      expect(entry.attributes["获取方式"]?.length, name).toBeGreaterThan(24);
      expect(entry.attributes["主要用途"]?.length, name).toBeGreaterThan(24);
      expect(entry.attributes["新手建议"]?.length, name).toBeGreaterThan(24);
      expect(entry.attributes.links.length, name).toBeGreaterThanOrEqual(4);

      const path = `/wiki/${entry.dataset}/${makeEntrySlug(entry)}`;
      const response = await request(app).get(path);
      expect(response.status, path).toBe(200);
      expect(response.text, path).toContain("相关工具与攻略");
    }
  });
});
