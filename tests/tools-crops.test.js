import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { crops } from "../src/features/tools/data/crops.js";
import {
  calculateCropProfit,
  getGrowthDays,
  getHarvestSchedule,
  getProcessedPrice,
  rankCropProfits,
  simulateProcessing
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

  test("stores normalized 1.6.15 growth, supply, yield, and processing metadata", () => {
    const parsnip = byId("parsnip");
    const coffee = byId("coffee-bean");

    expect(parsnip.growth).toMatchObject({
      stages: [1, 1, 1, 1],
      carriesAcrossSeason: false,
      trellis: false,
      paddy: false
    });
    expect(parsnip.seedOffers[0]).toMatchObject({
      sourceType: "shop",
      unitPrice: 20,
      currency: "gold",
      unlimited: true
    });
    expect(parsnip.sourceRefs.length).toBeGreaterThan(0);
    expect(parsnip.sourceRefs).toContain("https://stardewvalleywiki.com/Keg");
    expect(byId("carrot").seedOffers[0]).toMatchObject({
      unlimited: false,
      currency: "conditional"
    });
    expect(byId("carrot").requiresOwnedSeeds).toBe(true);
    expect(coffee.processing.keg).toMatchObject({
      inputQuantity: 5,
      outputQuantity: 1,
      durationMinutes: 120,
      unitPrice: 150
    });
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

  test("uses the geometric expectation for repeated extra potato drops", () => {
    const result = calculateCropProfit(byId("potato"), {
      season: "春季",
      startDay: 1,
      planningDays: 7,
      plots: 1,
      budget: 50,
      fertilizer: "none",
      agriculturist: false,
      tiller: false,
      method: "sell",
      includeSeedCost: true,
      locationMode: "seasonal"
    });

    expect(result.totalYield).toBe(1.25);
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

  test("fills the first planting and lets later batches shrink with the remaining budget", () => {
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

    expect(result.plantedTiles).toBe(20);
    expect(result.plantingBatches.map((batch) => batch.quantity)).toEqual([20, 15]);
    expect(result.seedPlan.totalSeedsUsed).toBe(35);
    expect(result.cost).toBe(700);
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
    expect(result.minimumYield).toBe(120);
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

const phaseOneInput = (overrides = {}) => ({
  season: "春季",
  startDay: 1,
  planningDays: 28,
  plots: 100,
  budget: null,
  fertilizer: "none",
  agriculturist: false,
  tiller: false,
  method: "sell",
  locationMode: "seasonal",
  includeSeedCost: true,
  yearStage: "year1",
  farmingLevel: 0,
  desertUnlocked: false,
  greenhouseUnlocked: false,
  islandUnlocked: false,
  ownedSeeds: {},
  jarCount: 0,
  kegCount: 0,
  includeFertilizerCost: false,
  ownedFertilizerCount: 0,
  ...overrides
});

describe("phase one crop availability and planting simulation", () => {
  test("keeps strawberries inventory-only when Spring 13 is outside the plan", () => {
    const result = calculateCropProfit(byId("strawberry"), phaseOneInput({ planningDays: 12 }));

    expect(result.eligible).toBe(false);
    expect(result.availability.status).toBe("inventoryRequired");
    expect(result.availability.blockingReasons).toContain("需要已有种子");
  });

  test("waits for Spring 13, buys strawberries, and harvests on Spring 21 and 25", () => {
    const result = calculateCropProfit(byId("strawberry"), phaseOneInput());

    expect(result.eligible).toBe(true);
    expect(result.plantingBatches).toEqual([
      expect.objectContaining({ day: 13, purchasedQuantity: 100, quantity: 100 })
    ]);
    expect(result.harvestDays).toEqual([21, 25]);
  });

  test("plants owned strawberries immediately and fills open plots at the festival", () => {
    const result = calculateCropProfit(byId("strawberry"), phaseOneInput({
      ownedSeeds: { strawberry: 5 },
      budget: 9500
    }));

    expect(result.plantingBatches).toEqual([
      expect.objectContaining({ day: 1, ownedQuantity: 5, quantity: 5 }),
      expect.objectContaining({ day: 13, purchasedQuantity: 95, quantity: 95 })
    ]);
  });

  test("does not assume the Egg Festival shop remains open after Spring 13", () => {
    const result = calculateCropProfit(byId("strawberry"), phaseOneInput({ startDay: 14 }));

    expect(result.eligible).toBe(false);
    expect(result.availability.status).toBe("inventoryRequired");
  });

  test("requires the desert for a gold Oasis purchase but accepts owned rhubarb seeds", () => {
    const locked = calculateCropProfit(byId("rhubarb"), phaseOneInput());
    const stocked = calculateCropProfit(byId("rhubarb"), phaseOneInput({ ownedSeeds: { rhubarb: 2 } }));

    expect(locked.availability.status).toBe("unlockRequired");
    expect(locked.eligible).toBe(false);
    expect(stocked.eligible).toBe(true);
    expect(stocked.plantedTiles).toBe(2);
  });

  test("collects every blocking reason before choosing the primary status", () => {
    const result = calculateCropProfit(byId("cactus-fruit"), phaseOneInput());

    expect(result.availability.status).toBe("excluded");
    expect(result.availability.blockingReasons).toEqual(expect.arrayContaining([
      "当前种植环境不允许种植",
      "需要解锁沙漠商店"
    ]));
  });

  test.each(["garlic", "artichoke", "red-cabbage"])("requires year two shop access for %s", (id) => {
    const result = calculateCropProfit(byId(id), phaseOneInput({ season: byId(id).seasons[0] }));

    expect(result.eligible).toBe(false);
    expect(result.availability.status).toBe("unlockRequired");
  });

  test("treats year-two rice shoots and a locked greenhouse as unlock requirements", () => {
    const rice = calculateCropProfit(byId("unmilled-rice"), phaseOneInput());
    const greenhouse = calculateCropProfit(byId("parsnip"), phaseOneInput({ locationMode: "greenhouse" }));

    expect(rice.availability.status).toBe("unlockRequired");
    expect(greenhouse.availability.status).toBe("unlockRequired");
    expect(greenhouse.availability.blockingReasons).toContain("需要解锁温室");
  });

  test("keeps complete season and inventory reasons for finite special seeds", () => {
    const result = calculateCropProfit(byId("pineapple"), phaseOneInput());

    expect(result.availability.status).toBe("excluded");
    expect(result.availability.blockingReasons).toEqual(expect.arrayContaining([
      "当前季节不可种植",
      "需要已有种子"
    ]));
  });

  test("does not keep buying summer seeds after a greenhouse calendar advances to fall", () => {
    const result = calculateCropProfit(byId("melon"), phaseOneInput({
      season: "夏季",
      locationMode: "greenhouse",
      greenhouseUnlocked: true,
      planningDays: 60,
      plots: 1
    }));

    expect(result.plantingBatches.map((batch) => batch.day)).toEqual([1, 13, 25]);
  });

  test("uses planning duration instead of an absolute day for greenhouse schedules", () => {
    const result = calculateCropProfit(byId("parsnip"), phaseOneInput({
      season: "春季",
      startDay: 20,
      locationMode: "greenhouse",
      greenhouseUnlocked: true,
      planningDays: 29,
      plots: 1
    }));

    expect(result.harvestDays).toEqual([24, 28]);
  });

  test("limits inventory-only carrots to the five seeds actually owned", () => {
    const result = calculateCropProfit(byId("carrot"), phaseOneInput({ ownedSeeds: { carrot: 5 } }));

    expect(result.eligible).toBe(true);
    expect(result.plantedTiles).toBe(5);
    expect(result.seedPlan.totalSeedsUsed).toBe(5);
    expect(result.totalYield).toBe(5);
    expect(result.cost).toBe(0);
  });

  test("turning off seed costs never turns a finite source into unlimited supply", () => {
    const result = calculateCropProfit(byId("carrot"), phaseOneInput({
      includeSeedCost: false,
      ownedSeeds: { carrot: 5 }
    }));

    expect(result.plantedTiles).toBe(5);
    expect(result.seedPlan.totalSeedsUsed).toBe(5);
  });

  test("honors the exact budget boundary down to one gold", () => {
    const exact = calculateCropProfit(byId("parsnip"), phaseOneInput({ planningDays: 5, plots: 10, budget: 200 }));
    const short = calculateCropProfit(byId("parsnip"), phaseOneInput({ planningDays: 5, plots: 10, budget: 199 }));

    expect(exact.plantedTiles).toBe(10);
    expect(exact.cost).toBe(200);
    expect(short.plantedTiles).toBe(9);
    expect(short.cost).toBe(180);
  });

  test("charges fertilizer once per tile rather than once per replant", () => {
    const result = calculateCropProfit(byId("parsnip"), phaseOneInput({
      yearStage: "later",
      fertilizer: "deluxe-speed-gro",
      includeFertilizerCost: true,
      plots: 1
    }));

    expect(result.seedRounds).toBe(9);
    expect(result.seedPlan.purchasedFertilizer).toBe(1);
    expect(result.cost).toBe(330);
  });

  test("distinguishes legal cross-season continuation from ordinary withering", () => {
    const corn = calculateCropProfit(byId("corn"), phaseOneInput({ season: "夏季", startDay: 20 }));
    const melon = calculateCropProfit(byId("melon"), phaseOneInput({ season: "夏季", startDay: 20 }));

    expect(corn.seasonEndState).toBe("continuesNextSeason");
    expect(corn.availability.status).toBe("executable");
    expect(melon.seasonEndState).toBe("withers");
    expect(melon.availability.status).toBe("excluded");
  });
});

describe("phase one capacity-limited processing", () => {
  test("counts a batch finishing exactly at the cutoff but not one minute later", () => {
    const crop = {
      ...byId("parsnip"),
      processing: {
        jar: {
          product: "测试腌菜",
          inputQuantity: 1,
          outputQuantity: 1,
          durationMinutes: 1600,
          unitPrice: 100
        }
      }
    };
    const input = { ...phaseOneInput({ planningDays: 1, jarCount: 1 }), seedCost: 0, fertilizerCost: 0 };
    const exact = simulateProcessing(crop, [{ day: 1, quantity: 2 }], "jar", 1, input);
    const late = simulateProcessing({
      ...crop,
      processing: { jar: { ...crop.processing.jar, durationMinutes: 1601 } }
    }, [{ day: 1, quantity: 2 }], "jar", 1, input);

    expect(exact.completedBatches).toBe(1);
    expect(exact.processedInputQuantity).toBe(1);
    expect(late.completedBatches).toBe(0);
    expect(late.inProcessQuantity).toBe(1);
  });

  test("settles direct, jar, and keg starfruit scenarios at the Summer 28 cutoff", () => {
    const result = calculateCropProfit(byId("starfruit"), phaseOneInput({
      season: "夏季",
      desertUnlocked: true,
      budget: 80000,
      jarCount: 10,
      kegCount: 10
    }));

    expect(result.totalYield).toBe(200);
    expect(result.scenarios.sell).toMatchObject({
      processedInputQuantity: 0,
      remainingRawQuantity: 200,
      revenue: 150000,
      profit: 70000
    });
    expect(result.scenarios.jar).toMatchObject({
      processedInputQuantity: 60,
      remainingRawQuantity: 140,
      profit: 118000
    });
    expect(result.scenarios.keg).toMatchObject({
      processedInputQuantity: 20,
      inProcessQuantity: 10,
      remainingRawQuantity: 180,
      profit: 100000
    });
  });

  test("uses zero machines when legacy input omits machine counts", () => {
    const result = calculateCropProfit(byId("blueberry"), phaseOneInput({ method: "keg" }));

    expect(result.scenarios.keg.processedInputQuantity).toBe(0);
    expect(result.scenarios.keg.remainingRawQuantity).toBe(result.totalYield);
    expect(result.scenarios.keg.assumptions).toContain("未填写小桶数量，按 0 台计算");
  });

  test("never makes more than ten coffee batches from fifty beans", () => {
    const coffee = {
      ...byId("coffee-bean"),
      processing: byId("coffee-bean").processing
    };
    const result = calculateCropProfit(coffee, phaseOneInput({
      season: "春季",
      ownedSeeds: { "coffee-bean": 1 },
      kegCount: 100,
      planningDays: 14
    }));

    expect(result.scenarios.keg.completedBatches).toBeLessThanOrEqual(
      Math.floor(result.totalYield / 5)
    );
    expect(result.scenarios.keg.processedInputQuantity).toBe(result.scenarios.keg.completedBatches * 5);
    const scenario = result.scenarios.keg;
    expect(result.totalYield).toBeCloseTo(
      scenario.processedInputQuantity
        + scenario.inProcessQuantity
        + scenario.queuedQuantity
        + scenario.unallocatedQuantity
    );
  });

  test("produces stable rankings and scenario order over twenty calculations", () => {
    const input = phaseOneInput({ season: "夏季", desertUnlocked: true, budget: 50000 });
    const snapshots = Array.from({ length: 20 }, () => {
      const result = rankCropProfits(crops, input);
      return JSON.stringify({
        items: result.items.map((item) => item.id),
        sell: result.rankings.sell.map((item) => item.id),
        jar: result.rankings.jar.map((item) => item.id),
        keg: result.rankings.keg.map((item) => item.id)
      });
    });

    expect(new Set(snapshots).size).toBe(1);
  });
});
