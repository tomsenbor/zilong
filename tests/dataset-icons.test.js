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

  test("ships six substantial built-in guides", () => {
    expect(articles).toHaveLength(6);
    for (const article of articles) {
      expect(article.body.length, article.title).toBeGreaterThan(1500);
      expect(article.body.split("\n## ").length, article.title).toBeGreaterThanOrEqual(4);
      const chapters = article.body.split(/\n## [^\n]+\n/).slice(1);
      expect(Math.min(...chapters.map((chapter) => chapter.trim().length)), article.title).toBeGreaterThan(160);
    }
  });
});
