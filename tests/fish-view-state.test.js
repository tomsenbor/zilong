import { describe, expect, test } from "vitest";
import {
  FISH_PAGE_SIZE,
  buildFishQuery,
  clearFishFilter,
  countAdvancedFishFilters,
  formatGameTime,
  getActiveFishFilters,
  nextVisibleFishCount,
  selectVisibleFish
} from "../public/js/tools/fish-view-state.js";

const fish = Array.from({ length: 25 }, (_, index) => ({ id: `fish-${index + 1}` }));

describe("fish view state", () => {
  test("selects the first 12 fish from a 25-item response", () => {
    expect(FISH_PAGE_SIZE).toBe(12);
    expect(selectVisibleFish(fish, FISH_PAGE_SIZE)).toEqual(fish.slice(0, 12));
  });

  test("advances the second page to 24 visible fish", () => {
    expect(nextVisibleFishCount(12, 25)).toBe(24);
  });

  test("caps the third page at the total item count", () => {
    expect(nextVisibleFishCount(24, 25)).toBe(25);
  });

  test("does not request another page when 12 or fewer fish exist", () => {
    expect(nextVisibleFishCount(12, 12)).toBe(12);
    expect(nextVisibleFishCount(8, 8)).toBe(8);
  });

  test("selectVisibleFish does not mutate the source array", () => {
    const items = fish.slice();
    const snapshot = items.slice();

    selectVisibleFish(items, 12);

    expect(items).toEqual(snapshot);
  });

  test("returns active filters in the fixed product order", () => {
    const params = new URLSearchParams([
      ["magicBait", "true"],
      ["category", "普通"],
      ["location", "海洋"],
      ["q", "鲶鱼"],
      ["bundleOnly", "true"],
      ["sourceType", "钓竿"],
      ["time", "1830"],
      ["weather", "雨天"],
      ["season", "春季"]
    ]);

    expect(getActiveFishFilters(params)).toEqual([
      { key: "q", label: "关键词", value: "鲶鱼" },
      { key: "season", label: "季节", value: "春季" },
      { key: "location", label: "地点", value: "海洋" },
      { key: "weather", label: "天气", value: "雨天" },
      { key: "time", label: "时间", value: "18:30" },
      { key: "sourceType", label: "方式", value: "钓竿" },
      { key: "category", label: "分类", value: "普通" },
      { key: "bundleOnly", label: "仅社区中心", value: "" },
      { key: "magicBait", label: "魔法鱼饵", value: "" }
    ]);
  });

  test("ignores empty, false, and unknown URL parameters", () => {
    const params = new URLSearchParams([
      ["q", ""],
      ["bundleOnly", "false"],
      ["magicBait", ""],
      ["unknown", "value"]
    ]);

    expect(getActiveFishFilters(params)).toEqual([]);
  });

  test("formats active game time as HH:MM", () => {
    expect(formatGameTime(600)).toBe("06:00");
    expect(formatGameTime(2400)).toBe("00:00");
    expect(getActiveFishFilters(new URLSearchParams({ time: "1830" }))).toEqual([
      { key: "time", label: "时间", value: "18:30" }
    ]);
  });

  test("clears one filter without mutating the input URLSearchParams", () => {
    const params = new URLSearchParams({ season: "春季", weather: "雨天" });
    const cleared = clearFishFilter(params, "season");

    expect(cleared.toString()).toBe("weather=%E9%9B%A8%E5%A4%A9");
    expect(params.toString()).toContain("season=");
    expect(cleared).not.toBe(params);
  });

  test("advanced count excludes keyword, season, and location", () => {
    const params = new URLSearchParams({ q: "鲶鱼", season: "春季", location: "河流" });

    expect(countAdvancedFishFilters(params)).toBe(0);
  });

  test("advanced count includes both active boolean filters", () => {
    const params = new URLSearchParams({ weather: "雨天", bundleOnly: "true", magicBait: "true" });

    expect(countAdvancedFishFilters(params)).toBe(3);
  });

  test("buildFishQuery preserves stage-three active-filter serialization", () => {
    const query = buildFishQuery(new URLSearchParams([
      ["q", "鲶鱼"],
      ["bundleOnly", "true"],
      ["magicBait", "false"],
      ["weather", ""]
    ]));

    expect(query.toString()).toBe("q=%E9%B2%B6%E9%B1%BC&bundleOnly=true");
  });
});
