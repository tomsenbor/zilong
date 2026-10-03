import { describe, expect, test } from "vitest";
import { crops } from "../src/features/tools/data/crops.js";
import { calculateCropProfit } from "../src/features/tools/crops.js";

const starfruit = crops.find((crop) => crop.id === "starfruit");
const input = { season: "夏季", locationMode: "greenhouse", greenhouseUnlocked: true, desertUnlocked: true, plots: 10, planningDays: 28 };

describe("starfruit supply and investment", () => {
  test.each(["春季", "夏季", "秋季", "冬季"])("buys Oasis seeds in %s without requiring inventory", (season) => {
    const result = calculateCropProfit(starfruit, { ...input, season });
    expect(result.eligible).toBe(true);
    expect(result.totalYield).toBe(20);
    expect(result.cost).toBe(8000);
  });
  test("retains outdoor season and desert unlock restrictions", () => {
    expect(calculateCropProfit(starfruit, { ...input, season: "春季", locationMode: "seasonal" }).eligible).toBe(false);
    expect(calculateCropProfit(starfruit, { ...input, desertUnlocked: false }).eligible).toBe(false);
  });
  test("separates the first seed purchase from two-round cost without changing profit", () => {
    expect(calculateCropProfit(starfruit, input)).toMatchObject({ initialInvestment: 4000, cost: 8000, profit: 7000 });
  });
  test("does not charge owned seeds as first investment", () => {
    expect(calculateCropProfit(starfruit, { ...input, ownedSeeds: { starfruit: 10 } })).toMatchObject({ initialInvestment: 0, cost: 4000, profit: 11000 });
  });
  test("respects excluded seed costs and non-executable results", () => {
    expect(calculateCropProfit(starfruit, { ...input, includeSeedCost: false })).toMatchObject({ initialInvestment: 0, cost: 0 });
    expect(calculateCropProfit(starfruit, { ...input, desertUnlocked: false })).toMatchObject({ initialInvestment: 0, cost: 0 });
  });
  test("includes only purchased fertilizer in first investment", () => {
    const result = calculateCropProfit(starfruit, { ...input, yearStage: "later", fertilizer: "speed-gro", ownedFertilizerCount: 5, includeFertilizerCost: true });
    expect(result.initialInvestment).toBe(4500);
    expect(result.cost).toBe(8500);
  });
});
