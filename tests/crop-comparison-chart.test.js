import { expect, test } from "vitest";
import * as view from "../public/js/tools/crop-decision-state.js";

test("comparison bars share a zero-based scale within each dimension", () => {
  expect(view.comparisonScale(100, 50)).toEqual({ min: 0, max: 100, zero: 0, bars: [{ x: 0, width: 100 }, { x: 0, width: 50 }] });
});
test("losses extend left from zero and profit right", () => {
  expect(view.comparisonScale(-100, 100)).toEqual({ min: -100, max: 100, zero: 50, bars: [{ x: 0, width: 50 }, { x: 50, width: 50 }] });
});
test("two losses keep their real magnitudes", () => {
  expect(view.comparisonScale(-100, -50)).toEqual({ min: -100, max: 0, zero: 100, bars: [{ x: 0, width: 100 }, { x: 50, width: 50 }] });
});
test("zero values do not produce invalid widths", () => {
  expect(view.comparisonScale(0, 0)).toEqual({ min: 0, max: 1, zero: 0, bars: [{ x: 0, width: 0 }, { x: 0, width: 0 }] });
});
test("comparison summary reports cost tradeoff without calling the highest profit universally best", () => {
  expect(view.comparisonTakeaway({ name: "杨桃", profit: 7000, cost: 8000 }, { name: "甜瓜", profit: 4000, cost: 2000 })).toBe("杨桃比甜瓜多赚 3,000g，整轮费用多 6,000g。");
});
