import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { crops } from "../src/features/tools/data/crops.js";
import {
  calculateCropProfit,
  getGrowthDays,
  getHarvestSchedule,
  getProcessedPrice,
  rankCropProfits
} from "../src/features/tools/crops.js";

const byId = (id) => crops.find((crop) => crop.id === id);

describe("crop tool data", () => {
  test("covers the sellable 1.6.15 crop catalog with valid assets", () => {
    expect(crops.length).toBeGreaterThanOrEqual(45);
    expect(new Set(crops.map((crop) => crop.id)).size).toBe(crops.length);

    for (const crop of crops) {
      expect(crop.growthStages.length, crop.id).toBeGreaterThan(0);
      expect(crop.growthStages.every((days) => Number.isInteger(days) && days > 0), crop.id).toBe(true);
      expect(crop.seedPrice, crop.id).toBeGreaterThanOrEqual(0);
      expect(crop.baseSellPrice, crop.id).toBeGreaterThanOrEqual(0);
      expect(
        fs.existsSync(path.resolve("public", crop.image.replace(/^\//, ""))),
        crop.image
      ).toBe(true);
    }
  });
});

describe("crop growth and harvest schedules", () => {
  test("uses base growth days without speed bonuses", () => {
    expect(getGrowthDays(byId("parsnip"), {
      fertilizer: "none",
      agriculturist: false
    })).toBe(4);
  });

  test("combines fertilizer and Agriculturist without changing regrow time", () => {
    const blueberry = byId("blueberry");
    const growthDays = getGrowthDays(blueberry, {
      fertilizer: "deluxe-speed-gro",
      agriculturist: true
    });
    const schedule = getHarvestSchedule(blueberry, {
      startDay: 1,
      planningDays: 28,
      growthDays
    });

    expect(growthDays).toBeLessThan(13);
    expect(schedule.harvestDays.slice(1).map((day, index) => day - schedule.harvestDays[index]))
      .toEqual(Array(schedule.harvestDays.length - 1).fill(4));
  });

  test("handles the last valid planting day for an ordinary crop", () => {
    const parsnip = byId("parsnip");

    expect(getHarvestSchedule(parsnip, {
      startDay: 24,
      planningDays: 28,
      growthDays: 4
    }).harvests).toBe(1);
    expect(getHarvestSchedule(parsnip, {
      startDay: 25,
      planningDays: 28,
      growthDays: 4
    }).harvests).toBe(0);
  });

  test("counts repeat harvests through the end of the season", () => {
    const schedule = getHarvestSchedule(byId("blueberry"), {
      startDay: 1,
      planningDays: 28,
      growthDays: 13
    });

    expect(schedule.harvestDays).toEqual([14, 18, 22, 26]);
    expect(schedule.seedRounds).toBe(1);
  });
});

describe("crop prices and profit", () => {
  test("applies the four preserve and keg formulas", () => {
    expect(getProcessedPrice(byId("blueberry"), "keg")).toBe(150);
    expect(getProcessedPrice(byId("blueberry"), "jar")).toBe(150);
    expect(getProcessedPrice(byId("cauliflower"), "keg")).toBe(393);
    expect(getProcessedPrice(byId("cauliflower"), "jar")).toBe(400);
  });

  test("charges seed cost for every replanting round", () => {
    const result = calculateCropProfit(byId("parsnip"), {
      startDay: 1,
      planningDays: 28,
      plots: 10,
      budget: null,
      fertilizer: "none",
      agriculturist: false,
      tiller: false,
      method: "sell",
      includeSeedCost: true
    });

    expect(result.harvests).toBe(6);
    expect(result.seedRounds).toBe(6);
    expect(result.cost).toBe(1200);
  });

  test("limits planted tiles when the budget cannot cover seed rounds", () => {
    const result = calculateCropProfit(byId("parsnip"), {
      startDay: 1,
      planningDays: 28,
      plots: 20,
      budget: 700,
      fertilizer: "none",
      agriculturist: false,
      tiller: false,
      method: "sell",
      includeSeedCost: true
    });

    expect(result.plantedTiles).toBe(5);
    expect(result.cost).toBe(600);
  });

  test("uses expected extra yield and marks the result as an estimate", () => {
    const result = calculateCropProfit(byId("blueberry"), {
      startDay: 1,
      planningDays: 28,
      plots: 10,
      budget: null,
      fertilizer: "none",
      agriculturist: false,
      tiller: false,
      method: "sell",
      includeSeedCost: true
    });

    expect(result.estimatedYield).toBe(true);
    expect(result.totalYield).toBeGreaterThan(120);
  });

  test("excludes crops that cannot use the selected processing method", () => {
    const result = calculateCropProfit(byId("hops"), {
      startDay: 1,
      planningDays: 28,
      plots: 10,
      budget: null,
      fertilizer: "none",
      agriculturist: false,
      tiller: false,
      method: "jar",
      includeSeedCost: true
    });

    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/加工/);
  });

  test("ranks eligible crops and returns highlights", () => {
    const result = rankCropProfits(crops, {
      season: "夏季",
      startDay: 1,
      planningDays: 28,
      plots: 24,
      budget: 5000,
      fertilizer: "none",
      agriculturist: false,
      tiller: false,
      method: "sell",
      includeSeedCost: true,
      locationMode: "seasonal"
    });

    expect(result.items.length).toBeGreaterThan(5);
    expect(result.items.every((item) => item.eligible)).toBe(true);
    expect(result.highlights.bestProfit.id).toBe(result.items[0].id);
    expect(result.highlights.bestDaily.dailyProfit).toBeGreaterThanOrEqual(0);
    expect(result.highlights.lowestStartup.cost).toBeGreaterThanOrEqual(0);
  });
});
