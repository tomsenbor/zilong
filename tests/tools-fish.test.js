import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { fish } from "../src/features/tools/data/fish.js";
import {
  filterFish,
  getFishFilterOptions,
  matchesTime
} from "../src/features/tools/fish.js";

describe("fish tool data", () => {
  test("covers the complete 1.6.15 fish query catalog", () => {
    expect(fish.length).toBeGreaterThanOrEqual(72);
    expect(new Set(fish.map((item) => item.id)).size).toBe(fish.length);
    expect(fish.filter((item) => item.sourceType === "蟹笼")).toHaveLength(10);
    expect(fish.filter((item) => item.category === "传奇")).toHaveLength(10);
    expect(fish.filter((item) => item.sourceType === "特殊活动")).toHaveLength(3);

    for (const item of fish) {
      expect(item.name, item.id).toBeTruthy();
      expect(item.seasons.length, item.id).toBeGreaterThan(0);
      expect(item.locations.length, item.id).toBeGreaterThan(0);
      expect(item.weather.length, item.id).toBeGreaterThan(0);
      expect(
        fs.existsSync(path.resolve("public", item.image.replace(/^\//, ""))),
        item.image
      ).toBe(true);
      for (const range of item.timeRanges) {
        expect(range.start, item.id).toBeGreaterThanOrEqual(0);
        expect(range.end, item.id).toBeGreaterThan(range.start);
        expect(range.end, item.id).toBeLessThanOrEqual(2600);
      }
    }
  });
});

describe("fish time matching", () => {
  test("includes exact time boundaries and excludes the end boundary", () => {
    expect(matchesTime([{ start: 600, end: 1200 }], 600)).toBe(true);
    expect(matchesTime([{ start: 600, end: 1200 }], 1150)).toBe(true);
    expect(matchesTime([{ start: 600, end: 1200 }], 1200)).toBe(false);
  });

  test("matches ranges that continue after midnight", () => {
    expect(matchesTime([{ start: 1800, end: 2600 }], 100)).toBe(true);
    expect(matchesTime([{ start: 1800, end: 2600 }], 200)).toBe(false);
  });
});

describe("fish filtering", () => {
  test("finds catfish for rainy spring river conditions", () => {
    const result = filterFish(fish, {
      season: "春季",
      weather: "雨天",
      time: 1200,
      location: "小镇河流"
    });

    expect(result.map((item) => item.id)).toContain("catfish");
    expect(result.every((item) => item.weather.includes("雨天") || item.weather.includes("任意"))).toBe(true);
  });

  test("does not apply rod season, weather, or time restrictions to crab pots", () => {
    const result = filterFish(fish, {
      sourceType: "蟹笼",
      season: "冬季",
      weather: "晴天",
      time: 700
    });

    expect(result).toHaveLength(10);
  });

  test("combines keyword, category, and community-center filters", () => {
    const result = filterFish(fish, {
      q: "河豚",
      category: "普通",
      bundleOnly: true
    });

    expect(result.map((item) => item.id)).toEqual(["pufferfish"]);
  });

  test("builds stable filter options", () => {
    const options = getFishFilterOptions(fish);

    expect(options.locations).toContain("小镇河流");
    expect(options.locations).toContain("海洋");
    expect(options.sourceTypes).toEqual(["钓竿", "蟹笼", "特殊活动"]);
    expect(options.categories).toEqual(["普通", "传奇", "特殊"]);
  });
});
