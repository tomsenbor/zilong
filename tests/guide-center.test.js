import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { articles } from "../src/db/seeds.js";
import {
  GUIDE_CENTER_GROUPS,
  GUIDE_CENTER_TOPICS,
  groupGuideArticles
} from "../public/js/guide-center.js";
import { createTestContext } from "./helpers/context.js";

let context;

afterEach(() => {
  context?.close();
  context = undefined;
});

function extractGuideCenter(html) {
  const categories = [...html.matchAll(
    /<section data-guide-category="([^"]+)">([\s\S]*?)<\/section>/g
  )].map((match) => ({
    title: match[1],
    links: [...match[2].matchAll(/href="(\/guides\/[^"?#]+)"/g)].map((link) => link[1])
  }));
  const topics = html.match(/<section data-guide-center-topics>[\s\S]*?<\/section>/)?.[0] || "";
  return {
    categories,
    topicLinks: [...topics.matchAll(/href="(\/guides\/[^"?#]+)"/g)].map((match) => match[1])
  };
}

function groupedSlugs(groups) {
  return groups.map((group) => ({
    title: group.title,
    slugs: group.articles.map((article) => article.slug)
  }));
}

describe("guide center", () => {
  test("SSR exposes all 48 guides exactly once in eight stable categories", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);

    const response = await request(app).get("/guides");
    expect(response.status).toBe(200);

    const center = extractGuideCenter(response.text);
    const links = center.categories.flatMap((category) => category.links);
    const expectedLinks = articles.map((article) => `/guides/${article.slug}`);

    expect(center.categories.map((category) => category.title)).toEqual(
      GUIDE_CENTER_GROUPS.map((group) => group.title)
    );
    expect(links).toHaveLength(48);
    expect(new Set(links).size).toBe(48);
    expect(new Set(links)).toEqual(new Set(expectedLinks));
    expect(response.text.match(/<h1\b/g)).toHaveLength(1);
    expect(response.text).toContain("<title>星露谷攻略文章 - 星露谷物语中文资料库</title>");
    expect(response.text).toContain('rel="canonical" href="https://pixelharvestwiki.com/guides"');

    for (const link of links) {
      expect((await request(app).get(link)).status, link).toBe(200);
    }
  });

  test("SSR includes the five core topic entries in fixed order", async () => {
    context = createTestContext();
    await initialize(context);
    const app = createApp(context);

    const response = await request(app).get("/guides");
    const center = extractGuideCenter(response.text);

    expect(center.topicLinks).toEqual(
      GUIDE_CENTER_TOPICS.map((topic) => `/guides/${topic.slug}`)
    );
  });

  test("grouping and order stay identical for repeated and shuffled inputs", () => {
    const expected = groupedSlugs(groupGuideArticles(articles));
    const inputs = [
      articles,
      [...articles].reverse(),
      [...articles].sort((left, right) => left.slug.localeCompare(right.slug)),
      [...articles].sort((left, right) => right.title.localeCompare(left.title))
    ];

    for (let run = 0; run < 5; run += 1) {
      for (const input of inputs) {
        expect(groupedSlugs(groupGuideArticles(input))).toEqual(expected);
      }
    }

    expect(expected.map((group) => group.title)).toEqual([
      "新手与第一年",
      "四季与赚钱",
      "社区中心与解锁",
      "钓鱼",
      "矿洞与资源",
      "村民与动物",
      "姜岛与后期",
      "工具与资料使用"
    ]);
    expect(expected.map((group) => group.slugs.length)).toEqual([8, 9, 6, 4, 6, 6, 3, 6]);
  });

  test("SSR and client use the same grouping selector and mobile grids collapse safely", () => {
    const clientSource = fs.readFileSync(path.resolve("public/js/app.js"), "utf8");
    const serverSource = fs.readFileSync(path.resolve("src/seo/render.js"), "utf8");
    const css = fs.readFileSync(path.resolve("design-system/components.css"), "utf8");

    expect(clientSource).toContain('from "./guide-center.js"');
    expect(clientSource).toContain("groupGuideArticles(data.items)");
    expect(serverSource).toContain('from "../../public/js/guide-center.js"');
    expect(serverSource).toContain("groupGuideArticles(articles)");
    expect(css).toMatch(/\.guide-topic-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/);
    expect(css).toMatch(/@media \(max-width:\s*720px\)[\s\S]*\.guide-topic-grid[\s\S]*grid-template-columns:\s*1fr/);
    expect(css).toMatch(/\.guide-category\s*\{[\s\S]*min-width:\s*0/);
  });
});
