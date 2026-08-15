import { describe, expect, test } from "vitest";
import {
  canExpandRanking,
  getMachineFieldVisibility,
  getResetDecisionState,
  resolveComparison,
  selectRankingItems
} from "../public/js/tools/crop-decision-state.js";

const items = Array.from({ length: 7 }, (_, index) => ({
  id: `crop-${index + 1}`,
  name: `作物 ${index + 1}`,
  profit: 700 - index * 10,
  dailyProfit: 70 - index,
  cost: 100 + index,
  harvests: index + 1,
  totalYield: (index + 1) * 10
}));

describe("crop tool decision state", () => {
  test("shows the first five ranked crops by default without mutating the response", () => {
    const snapshot = structuredClone(items);

    expect(selectRankingItems(items, false).map((item) => item.id)).toEqual([
      "crop-1",
      "crop-2",
      "crop-3",
      "crop-4",
      "crop-5"
    ]);
    expect(items).toEqual(snapshot);
  });

  test("returns the complete existing ranking when expanded", () => {
    expect(selectRankingItems(items, true)).toEqual(items);
  });

  test("only offers ranking expansion when more than five items exist", () => {
    expect(canExpandRanking(items.slice(0, 5))).toBe(false);
    expect(canExpandRanking(items)).toBe(true);
  });

  test("resolves two different crops without adding calculations", () => {
    const comparison = resolveComparison(items, "crop-1", "crop-2");

    expect(comparison).toMatchObject({
      available: true,
      error: "",
      left: items[0],
      right: items[1]
    });
  });

  test("rejects the same crop id with an explicit message", () => {
    const comparison = resolveComparison(items, "crop-2", "crop-2");

    expect(comparison.available).toBe(true);
    expect(comparison.error).toBe("请选择两种不同作物");
  });

  test("keeps a valid focus crop as the left comparison choice", () => {
    const comparison = resolveComparison(items, "crop-4", "crop-2");

    expect(comparison.left.id).toBe("crop-4");
    expect(comparison.right.id).toBe("crop-2");
  });

  test.each([
    ["sell", { jar: false, keg: false }],
    ["jar", { jar: true, keg: false }],
    ["keg", { jar: false, keg: true }]
  ])("shows only the equipment used by %s", (method, expected) => {
    expect(getMachineFieldVisibility(method)).toEqual(expected);
  });

  test("reset closes advanced conditions and collapses the ranking", () => {
    expect(getResetDecisionState()).toEqual({
      advancedOpen: false,
      rankingExpanded: false,
      comparisonLeftId: "",
      comparisonRightId: ""
    });
  });
});
