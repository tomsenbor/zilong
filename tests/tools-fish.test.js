import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { fish } from "../src/features/tools/data/fish.js";
import {
  filterFish,
  getFishFilterOptions,
  matchesTime,
  normalizeGameTime
} from "../src/features/tools/fish.js";

const uniqueValues = (values) => [...new Set(values)];
const uniqueRanges = (ranges) => [...new Map(ranges.map((range) => [`${range.start}-${range.end}`, range])).values()];

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

      expect(item.availabilityRules.length, item.id).toBeGreaterThan(0);
      for (const rule of item.availabilityRules) {
        expect(rule.locations.length, item.id).toBeGreaterThan(0);
        expect(rule.seasons.length, item.id).toBeGreaterThan(0);
        expect(rule.weather.length, item.id).toBeGreaterThan(0);
        expect(rule.timeRanges.length, item.id).toBeGreaterThan(0);
        expect(["standard", "fixed-event"], item.id).toContain(rule.conditionType);
        expect(Array.isArray(rule.requirements), item.id).toBe(true);
      }

      expect(item.locations, item.id).toEqual(uniqueValues(item.availabilityRules.flatMap((rule) => rule.locations)));
      expect(item.seasons, item.id).toEqual(uniqueValues(item.availabilityRules.flatMap((rule) => rule.seasons)));
      expect(item.weather, item.id).toEqual(uniqueValues(item.availabilityRules.flatMap((rule) => rule.weather)));
      expect(item.timeRanges, item.id).toEqual(uniqueRanges(item.availabilityRules.flatMap((rule) => rule.timeRanges)));
    }
  });

  test("models fixed events and alternate sources without treating them as locations", () => {
    const nightMarketFish = fish.filter((item) => item.locations.includes("夜市潜水艇"));
    const extendedFamily = fish.filter((item) => item.notes.includes("大家族"));
    const crab = fish.find((item) => item.id === "crab");

    expect(nightMarketFish).toHaveLength(3);
    expect(nightMarketFish.every((item) => item.availabilityRules.every((rule) => rule.conditionType === "fixed-event"))).toBe(true);
    expect(nightMarketFish.every((item) => item.availabilityRules.some((rule) => rule.requirements.length > 0))).toBe(true);
    expect(extendedFamily).toHaveLength(5);
    expect(extendedFamily.every((item) => item.availabilityRules.every((rule) => rule.conditionType === "fixed-event"))).toBe(true);
    expect(crab.locations).toEqual(["海水"]);
    expect(crab.alternateSources).toContain("岩石蟹掉落");
  });

  test("uses the verified 1.6.15 tilapia difficulty", () => {
    expect(fish.find((item) => item.id === "tilapia").difficulty).toBe(50);
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

  test("normalizes supported early-morning times onto the 24-hour game timeline", () => {
    expect(normalizeGameTime(0)).toBe(2400);
    expect(normalizeGameTime(100)).toBe(2500);
    expect(normalizeGameTime(200)).toBe(2600);
    expect(normalizeGameTime(600)).toBe(600);
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

  test("keeps catfish location-specific seasons inside the same rule", () => {
    const secretWoods = filterFish(fish, {
      season: "夏季",
      weather: "雨天",
      time: 1200,
      location: "秘密森林池塘"
    });
    const townRiver = filterFish(fish, {
      season: "夏季",
      weather: "雨天",
      time: 1200,
      location: "小镇河流"
    });

    expect(secretWoods.map((item) => item.id)).toContain("catfish");
    expect(townRiver.map((item) => item.id)).not.toContain("catfish");
  });

  test.each([
    ["flounder", "冬季", "姜岛海洋", "海洋", "晴天", 1000],
    ["midnight-carp", "春季", "姜岛河流", "山区湖泊", "晴天", 2300],
    ["octopus", "冬季", "姜岛海洋", "海洋", "晴天", 1000],
    ["pufferfish", "冬季", "姜岛海洋", "海洋", "晴天", 1300],
    ["super-cucumber", "冬季", "姜岛海洋", "海洋", "晴天", 2000],
    ["tilapia", "春季", "姜岛河流", "海洋", "晴天", 1000],
    ["tuna", "春季", "姜岛海洋", "海洋", "晴天", 1000]
  ])("keeps %s available year-round only at its Ginger Island location", (id, season, islandLocation, valleyLocation, weather, time) => {
    const islandResult = filterFish(fish, { season, location: islandLocation, weather, time });
    const valleyResult = filterFish(fish, { season, location: valleyLocation, weather, time });

    expect(islandResult.map((item) => item.id)).toContain(id);
    expect(valleyResult.map((item) => item.id)).not.toContain(id);
  });

  test("matches locations exactly instead of by substring", () => {
    expect(filterFish(fish, { location: "海洋" }).map((item) => item.id)).not.toContain("lionfish");
    expect(filterFish(fish, { location: "姜岛海洋" }).map((item) => item.id)).not.toContain("anchovy");
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

  test("keeps freshwater and saltwater crab-pot catches separate", () => {
    expect(filterFish(fish, { sourceType: "蟹笼", location: "淡水" }).map((item) => item.id)).toEqual([
      "snail",
      "periwinkle",
      "crayfish"
    ]);
    expect(filterFish(fish, { sourceType: "蟹笼", location: "海水" }).map((item) => item.id)).toEqual([
      "lobster",
      "crab",
      "cockle",
      "mussel",
      "shrimp",
      "oyster",
      "clam"
    ]);
  });

  test("combines keyword, category, and community-center filters", () => {
    const result = filterFish(fish, {
      q: "河豚",
      category: "普通",
      bundleOnly: true
    });

    expect(result.map((item) => item.id)).toEqual(["pufferfish"]);
    expect(result.every((item) => item.bundleIds.length > 0)).toBe(true);
  });

  test("magic bait bypasses standard season, weather, and time but not location", () => {
    const bypassed = filterFish(fish, {
      q: "河豚",
      season: "冬季",
      weather: "雨天",
      time: 700,
      location: "海洋",
      magicBait: true
    });
    const wrongLocation = filterFish(fish, {
      q: "河豚",
      season: "冬季",
      weather: "雨天",
      time: 700,
      location: "小镇河流",
      magicBait: true
    });

    expect(bypassed.map((item) => item.id)).toEqual(["pufferfish"]);
    expect(wrongLocation).toEqual([]);
  });

  test("magic bait does not bypass fixed-event season and time rules", () => {
    const result = filterFish(fish, {
      q: "水滴鱼",
      season: "春季",
      weather: "晴天",
      time: 1200,
      location: "夜市潜水艇",
      magicBait: true
    });

    expect(result).toEqual([]);
  });

  test("builds stable filter options", () => {
    const options = getFishFilterOptions(fish);

    expect(options.locations).toContain("小镇河流");
    expect(options.locations).toContain("海洋");
    expect(options.sourceTypes).toEqual(["钓竿", "蟹笼", "特殊活动"]);
    expect(options.categories).toEqual(["普通", "传奇", "特殊"]);
  });

  test("returns a stable result order across repeated calls", () => {
    const filters = { season: "夏季", weather: "任意", magicBait: true };
    const expected = filterFish(fish, filters).map((item) => item.id);

    for (let attempt = 0; attempt < 10; attempt += 1) {
      expect(filterFish(fish, filters).map((item) => item.id)).toEqual(expected);
    }
  });
});
