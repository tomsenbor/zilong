import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { articles, datasets } from "../src/db/seeds.js";

describe("dataset icons", () => {
  test("uses an existing and unique icon for every category", () => {
    const icons = datasets.map((dataset) => dataset.icon);

    expect(new Set(icons).size).toBe(icons.length);
    for (const icon of icons) {
      expect(fs.existsSync(path.resolve("public/assets/game", icon)), icon).toBe(true);
    }
  });

  test("uses an existing and unique cover for every built-in article", () => {
    const covers = articles.map((article) => article.coverImage);

    expect(covers.every(Boolean)).toBe(true);
    expect(new Set(covers).size).toBe(covers.length);
    for (const cover of covers) {
      expect(fs.existsSync(path.resolve("public", cover.replace(/^\//, ""))), cover).toBe(true);
    }
  });

  test("ships substantial built-in guides", () => {
    expect(articles).toHaveLength(21);
    for (const article of articles) {
      expect(article.body.length, article.title).toBeGreaterThan(1500);
      expect(article.body.split("\n## ").length, article.title).toBeGreaterThanOrEqual(4);
      const chapters = article.body.split(/\n## [^\n]+\n/).slice(1);
      expect(Math.min(...chapters.map((chapter) => chapter.trim().length)), article.title).toBeGreaterThan(160);
    }
  });

  test("ships the v5.3 content-building guide set with internal links", () => {
    const expectedGuides = new Map([
      ["第一年春季赚钱路线", "year-one-spring-money-route"],
      ["新手钓鱼入门与鱼类查询使用指南", "beginner-fishing-guide-and-fish-search"],
      ["社区中心前期优先完成路线", "early-community-center-priority-route"],
      ["矿洞前 40 层准备与收益路线", "mines-floor-40-preparation-route"],
      ["作物收益计算器使用指南", "crop-profit-calculator-guide"]
    ]);

    for (const [title, expectedSlug] of expectedGuides) {
      const article = articles.find((item) => item.title === title);
      expect(article, title).toBeTruthy();
      expect(article.slug, title).toBe(expectedSlug);
      expect(article.summary.length, title).toBeGreaterThan(18);
      expect(article.body, title).toMatch(/\]\(\/(?:tools|wiki)\//);
      expect(article.body, title).toContain("### 本节执行清单");
    }
  });

  test("ships the v5.3.3 second guide batch with English slugs and internal links", () => {
    const expectedSlugs = [
      "year-one-summer-money-route",
      "sprinkler-unlock-and-ore-route",
      "community-center-fish-tank-route",
      "seasonal-items-to-keep",
      "beginner-backpack-and-energy-route"
    ];

    for (const expectedSlug of expectedSlugs) {
      const article = articles.find((item) => item.slug === expectedSlug);
      expect(article, expectedSlug).toBeTruthy();
      expect(article.slug, expectedSlug).not.toMatch(/[\u3400-\u9fff]/);
      expect(article.summary.length, expectedSlug).toBeGreaterThan(18);
      expect((article.body.match(/\]\(\/(?:tools|wiki|guides)\//g) || []).length, expectedSlug).toBeGreaterThanOrEqual(2);
      expect(article.body, expectedSlug).toContain("### 本节执行清单");
    }
  });

  test("ships the v5.3.4 third guide batch with English slugs and internal links", () => {
    const expectedSlugs = [
      "year-one-fall-money-route",
      "coop-barn-animal-products-route",
      "greenhouse-crops-processing-route",
      "quest-board-special-orders-route",
      "winter-prep-year-two-route"
    ];

    for (const expectedSlug of expectedSlugs) {
      const article = articles.find((item) => item.slug === expectedSlug);
      expect(article, expectedSlug).toBeTruthy();
      expect(article.slug, expectedSlug).not.toMatch(/[\u3400-\u9fff]/);
      expect(article.summary.length, expectedSlug).toBeGreaterThan(18);
      expect((article.body.match(/\]\(\/(?:tools|wiki|guides)\//g) || []).length, expectedSlug).toBeGreaterThanOrEqual(2);
      expect(article.body, expectedSlug).toContain("### 本节执行清单");
    }
  });
});
