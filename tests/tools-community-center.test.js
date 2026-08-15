import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { communityCenter } from "../src/features/tools/data/community-center.js";
import { crops } from "../src/features/tools/data/crops.js";
import { fish } from "../src/features/tools/data/fish.js";
import {
  calculateCommunityProgress,
  getCommunitySlotIds,
  getCommunityTotals,
  getCommunityTotalsByScope
} from "../src/features/tools/community-center.js";
import {
  calculateCommunityState,
  filterCommunityRooms
} from "../public/js/tools/community-center-state.js";
import {
  createProgress,
  DATA_VERSION,
  exportProgress,
  importProgress,
  loadProgress,
  migrateProgress,
  parseProgress,
  saveProgress,
  STORAGE_KEY
} from "../public/js/tools/community-progress.js";

describe("community center data", () => {
  const genericItemIcons = new Set([
    "/assets/game/36px-Bundle_Green.png",
    "/assets/game/36px-Farming_Skill_Icon.png",
    "/assets/game/36px-Mining.png",
    "/assets/game/36px-Bundle_Purple.png",
    "/assets/game/36px-Prismatic_Shard.png"
  ]);

  test("contains the complete standard route and missing bundle", () => {
    const totals = getCommunityTotals(communityCenter);
    const scopedTotals = getCommunityTotalsByScope(communityCenter);

    expect(communityCenter).toHaveLength(7);
    expect(communityCenter.map((room) => room.id)).toEqual([
      "crafts-room",
      "pantry",
      "fish-tank",
      "boiler-room",
      "bulletin-board",
      "vault",
      "missing-bundle"
    ]);
    expect(totals).toEqual({
      rooms: 7,
      bundles: 31,
      candidateSlots: 135,
      requiredSlots: 115
    });
    expect(scopedTotals).toEqual({
      all: totals,
      standard: { rooms: 6, bundles: 30, candidateSlots: 129, requiredSlots: 110 },
      missing: { rooms: 1, bundles: 1, candidateSlots: 6, requiredSlots: 5 }
    });
    expect(communityCenter.slice(0, 6).every((room) => room.progressScope === "standard")).toBe(true);
    expect(communityCenter.at(-1)).toMatchObject({
      progressScope: "missing",
      contentType: "abandoned-joja-mart"
    });
  });

  test("keeps the seven standard optional selection counts", () => {
    const optionalCounts = new Map(communityCenter.flatMap((room) =>
      room.bundles.map((bundle) => [bundle.id, [bundle.items.length, bundle.requiredCount]])))
    ;

    expect(Object.fromEntries([
      "exotic-foraging-bundle",
      "quality-crops-bundle",
      "animal-bundle",
      "artisan-bundle",
      "crab-pot-bundle",
      "adventurer-bundle",
      "missing-bundle-items"
    ].map((id) => [id, optionalCounts.get(id)]))).toEqual({
      "exotic-foraging-bundle": [9, 5],
      "quality-crops-bundle": [4, 3],
      "animal-bundle": [6, 5],
      "artisan-bundle": [12, 6],
      "crab-pot-bundle": [10, 5],
      "adventurer-bundle": [4, 2],
      "missing-bundle-items": [6, 5]
    });
  });

  test("uses 1.6 rewards and minimum-quality semantics", () => {
    const bundles = new Map(communityCenter.flatMap((room) =>
      room.bundles.map((bundle) => [bundle.id, bundle])));
    const nightFishing = bundles.get("night-fishing-bundle");
    const riverFish = bundles.get("river-fish-bundle");
    const qualityItems = [
      ...bundles.get("quality-crops-bundle").items,
      ...bundles.get("missing-bundle-items").items.filter((item) => item.minimumQuality)
    ];

    expect(nightFishing.reward).toBe("1 个光辉戒指");
    expect(riverFish.reward).toBe("30 个高级鱼饵");
    expect(qualityItems.every((item) => item.quality.endsWith("以上"))).toBe(true);
    expect(qualityItems.map((item) => item.minimumQuality)).toEqual([
      "gold", "gold", "gold", "gold", "silver", "gold", "gold"
    ]);
    expect(communityCenter.find((room) => room.id === "bulletin-board").reward)
      .toBe("仅对已见面的非可恋爱村民增加两心好感");
  });

  test("uses unique ids, valid selection counts, and existing local images", () => {
    const roomIds = new Set();
    const bundleIds = new Set();
    const slotIds = getCommunitySlotIds(communityCenter);

    expect(new Set(slotIds).size).toBe(slotIds.length);
    for (const room of communityCenter) {
      expect(roomIds.has(room.id)).toBe(false);
      roomIds.add(room.id);
      expect(fs.existsSync(path.resolve("public", room.image.replace(/^\//, "")))).toBe(true);

      for (const bundle of room.bundles) {
        expect(bundleIds.has(bundle.id)).toBe(false);
        bundleIds.add(bundle.id);
        expect(bundle.requiredCount).toBeGreaterThan(0);
        expect(bundle.requiredCount).toBeLessThanOrEqual(bundle.items.length);
        for (const item of bundle.items) {
          expect(fs.existsSync(path.resolve("public", item.image.replace(/^\//, ""))), item.image).toBe(true);
        }
      }
    }
  });

  test("uses a real item icon for every community-center slot", () => {
    const items = communityCenter.flatMap((room) =>
      room.bundles.flatMap((bundle) => bundle.items)
    );

    expect(items).toHaveLength(135);
    expect(items.filter((item) =>
      genericItemIcons.has(item.image) && item.id !== "prismatic-shard"
    )).toEqual([]);
  });

  test("uses one consistent icon for repeated items and their quality variants", () => {
    const items = communityCenter.flatMap((room) =>
      room.bundles.flatMap((bundle) => bundle.items)
    );
    const expectedIcons = {
      apple: "/assets/game/36px-Apple.png",
      "gold-parsnip": "/assets/game/36px-Parsnip.png",
      "gold-melon": "/assets/game/36px-Melon.png",
      "gold-pumpkin": "/assets/game/36px-Pumpkin.png",
      "gold-corn": "/assets/game/36px-Corn.png",
      "silver-wine": "/assets/game/36px-Wine.png",
      "gold-ancient-fruit": "/assets/game/36px-Ancient_Fruit.png",
      "gold-void-salmon": "/assets/game/36px-Void_Salmon.png"
    };

    for (const [id, image] of Object.entries(expectedIcons)) {
      expect(items.find((item) => item.id === id)?.image, id).toBe(image);
    }

    const imagesByName = Map.groupBy(items, (item) => item.name);
    for (const [name, repeatedItems] of imagesByName) {
      if (repeatedItems.length < 2 || name === "木材") continue;
      expect(new Set(repeatedItems.map((item) => item.image)).size, name).toBe(1);
    }
  });

  test("keeps fish bundle references reciprocal and uses canonical fish data", () => {
    const bundles = new Map(communityCenter.flatMap((room) =>
      room.bundles.map((bundle) => [bundle.id, bundle])));
    const fishById = new Map(fish.map((item) => [item.id, item]));

    for (const fishItem of fish) {
      for (const bundleId of fishItem.bundleIds) {
        const bundle = bundles.get(bundleId);
        expect(bundle, `${fishItem.id}:${bundleId}`).toBeDefined();
        expect(bundle.items.some((item) => item.fishId === fishItem.id), `${fishItem.id}:${bundleId}`).toBe(true);
      }
    }

    const linkedFishItems = communityCenter.flatMap((room) => room.bundles)
      .flatMap((bundle) => bundle.items.map((item) => ({ bundle, item })))
      .filter(({ item }) => item.fishId);
    for (const { bundle, item } of linkedFishItems) {
      const canonical = fishById.get(item.fishId);
      expect(canonical, item.fishId).toBeDefined();
      expect(item.image).toBe(canonical.image);
      expect(item.seasons).toEqual(canonical.seasons);
      if (bundle.id !== "missing-bundle-items") {
        expect(canonical.bundleIds).toContain(bundle.id);
      }
    }
  });

  test("links only real crop ids and keeps explicit quality-crop mappings", () => {
    const cropIds = new Set(crops.map((crop) => crop.id));
    const items = communityCenter.flatMap((room) =>
      room.bundles.flatMap((bundle) => bundle.items));
    const cropMappings = Object.fromEntries(items
      .filter((item) => item.id.startsWith("gold-") && item.cropId)
      .map((item) => [item.id, item.cropId]));

    expect(items.filter((item) => item.cropId).every((item) => cropIds.has(item.cropId))).toBe(true);
    expect(cropMappings).toEqual({
      "gold-parsnip": "parsnip",
      "gold-melon": "melon",
      "gold-pumpkin": "pumpkin",
      "gold-corn": "corn",
      "gold-ancient-fruit": "ancient-fruit"
    });
    expect(items.filter((item) => ["大壶牛奶", "大棕色鸡蛋", "布料", "奶酪", "苹果"].includes(item.name))
      .every((item) => !item.cropId)).toBe(true);
  });
});

describe("community center progress", () => {
  test("caps optional bundle progress at requiredCount", () => {
    const exotic = communityCenter
      .find((room) => room.id === "crafts-room")
      .bundles.find((bundle) => bundle.id === "exotic-foraging-bundle");
    const completed = exotic.items.slice(0, 7).map((item) => `${exotic.id}:${item.id}`);
    const result = calculateCommunityProgress(communityCenter, completed);

    expect(result.bundleProgress[exotic.id]).toMatchObject({
      completed: 7,
      required: 5,
      selectedCount: 7,
      creditedCount: 5,
      requiredCount: 5,
      remainingCount: 0,
      isComplete: true
    });
    expect(result.completedRequiredSlots).toBe(5);
  });

  test("reports standard completion independently from the missing bundle", () => {
    const standardSlots = communityCenter
      .filter((room) => room.progressScope === "standard")
      .flatMap((room) => room.bundles.flatMap((bundle) =>
        bundle.items.slice(0, bundle.requiredCount).map((item) => `${bundle.id}:${item.id}`)));
    const result = calculateCommunityProgress(communityCenter, standardSlots);

    expect(result.scopeProgress.standard).toMatchObject({
      completedRequiredSlots: 110,
      completedBundles: 30,
      completedRooms: 6,
      percent: 100
    });
    expect(result.scopeProgress.missing).toMatchObject({
      completedRequiredSlots: 0,
      completedRooms: 0,
      percent: 0
    });
    expect(result.scopeProgress.all.percent).toBe(96);
  });

  test("ignores unknown and duplicate completed ids", () => {
    const id = "spring-crops-bundle:parsnip";
    const result = calculateCommunityProgress(communityCenter, [id, id, "unknown:item"]);

    expect(result.completedRequiredSlots).toBe(1);
    expect(result.scopeProgress.standard.completedRequiredSlots).toBe(1);
    expect(result.scopeProgress.missing.completedRequiredSlots).toBe(0);
  });

  test("uses the same deterministic state result on the server and client", () => {
    const completed = [
      "spring-crops-bundle:parsnip",
      "spring-crops-bundle:potato",
      "missing-bundle-items:prismatic-shard"
    ];

    expect(calculateCommunityState(communityCenter, completed))
      .toEqual(calculateCommunityProgress(communityCenter, completed));
    expect(calculateCommunityProgress([], []).scopeProgress).toEqual({
      all: expect.objectContaining({ requiredSlots: 0, percent: 0 }),
      standard: expect.objectContaining({ requiredSlots: 0, percent: 0 }),
      missing: expect.objectContaining({ requiredSlots: 0, percent: 0 })
    });
  });

  test("filters completed optional bundles and preserves seasonal completion state", () => {
    const exotic = communityCenter
      .find((room) => room.id === "crafts-room")
      .bundles.find((bundle) => bundle.id === "exotic-foraging-bundle");
    const completed = exotic.items.slice(0, exotic.requiredCount)
      .map((item) => `${exotic.id}:${item.id}`);
    const progress = calculateCommunityProgress(communityCenter, completed);
    const incomplete = filterCommunityRooms(communityCenter, completed, progress, "incomplete", "春季");
    const seasonal = filterCommunityRooms(communityCenter, completed, progress, "season", "春季");

    expect(incomplete.flatMap((room) => room.bundles).some((bundle) => bundle.id === exotic.id)).toBe(false);
    expect(seasonal.flatMap((room) => room.bundles).flatMap((bundle) => bundle.items)
      .every((item) => item.seasons.length === 0 || item.seasons.includes("春季"))).toBe(true);
    expect(progress.bundleProgress[exotic.id].selectedCount).toBe(5);
  });

  test("marks a room complete only when all of its bundles are complete", () => {
    const vault = communityCenter.find((room) => room.id === "vault");
    const allVaultSlots = vault.bundles.flatMap((bundle) =>
      bundle.items.map((item) => `${bundle.id}:${item.id}`)
    );

    const partial = calculateCommunityProgress(communityCenter, allVaultSlots.slice(0, 3));
    const complete = calculateCommunityProgress(communityCenter, allVaultSlots);

    expect(partial.roomProgress.vault.isComplete).toBe(false);
    expect(complete.roomProgress.vault.isComplete).toBe(true);
    expect(complete.completedRooms).toBe(1);
  });
});

describe("community progress persistence", () => {
  const knownIds = ["spring-crops-bundle:parsnip", "river-fish-bundle:sunfish"];

  test("serializes and restores only known unique slot ids", () => {
    const progress = createProgress([
      knownIds[0],
      knownIds[0],
      "removed-bundle:removed-item"
    ], new Date("2026-06-12T12:00:00.000Z"));
    const parsed = parseProgress(JSON.stringify(progress), new Set(knownIds));

    expect(parsed.completedItemIds).toEqual([knownIds[0]]);
    expect(parsed.updatedAt).toBe("2026-06-12T12:00:00.000Z");
  });

  test("migrates old data and removes unknown ids", () => {
    const migrated = migrateProgress({
      schemaVersion: 0,
      completedItemIds: [knownIds[1], "old:item"]
    }, new Set(knownIds));

    expect(migrated.schemaVersion).toBe(1);
    expect(migrated.dataVersion).toBe(2);
    expect(migrated.completedItemIds).toEqual([knownIds[1]]);
  });

  test("rejects invalid imports before changing storage", () => {
    expect(() => importProgress("not-json", new Set(knownIds))).toThrow(/JSON/);
    expect(() => importProgress('{"completedItemIds":"wrong"}', new Set(knownIds))).toThrow(/格式/);
  });

  test("strictly validates manual import versions, ids, dates, and size", () => {
    const valid = {
      schemaVersion: 1,
      dataVersion: DATA_VERSION,
      updatedAt: "2026-06-12T12:00:00.000Z",
      completedItemIds: [knownIds[0]]
    };

    expect(importProgress(JSON.stringify(valid), new Set(knownIds))).toEqual(valid);
    expect(() => importProgress(JSON.stringify({ ...valid, schemaVersion: 2 }), new Set(knownIds))).toThrow(/版本过新/);
    expect(() => importProgress(JSON.stringify({ ...valid, dataVersion: DATA_VERSION + 1 }), new Set(knownIds))).toThrow(/版本过新/);
    expect(() => importProgress(JSON.stringify({ ...valid, dataVersion: -1 }), new Set(knownIds))).toThrow(/格式/);
    expect(() => importProgress(JSON.stringify({ ...valid, completedItemIds: [knownIds[0], knownIds[0]] }), new Set(knownIds))).toThrow(/重复项目/);
    expect(() => importProgress(JSON.stringify({ ...valid, completedItemIds: ["unknown:item"] }), new Set(knownIds))).toThrow(/未知项目/);
    expect(() => importProgress(JSON.stringify({ ...valid, completedItemIds: [42] }), new Set(knownIds))).toThrow(/格式/);
    expect(() => importProgress(JSON.stringify({ ...valid, completedItemIds: Array.from({ length: 1001 }, (_, index) => `item:${index}`) }), new Set(knownIds))).toThrow(/格式/);
    expect(() => importProgress(JSON.stringify({ ...valid, updatedAt: "not-a-date" }), new Set(knownIds))).toThrow(/日期无效/);
    expect(() => importProgress(" ".repeat(256 * 1024 + 1), new Set(knownIds))).toThrow(/文件过大/);
  });

  test("local migration tolerates old duplicates and removed ids but rejects future data", () => {
    const migrated = migrateProgress({
      schemaVersion: 1,
      dataVersion: 1,
      updatedAt: "2026-06-12T12:00:00.000Z",
      completedItemIds: [knownIds[0], knownIds[0], "removed:item"]
    }, new Set(knownIds));

    expect(migrated.completedItemIds).toEqual([knownIds[0]]);
    expect(() => migrateProgress({
      schemaVersion: 1,
      dataVersion: DATA_VERSION + 1,
      completedItemIds: []
    }, new Set(knownIds))).toThrow(/版本过新/);

    const futureStorage = {
      getItem: () => JSON.stringify({
        schemaVersion: 1,
        dataVersion: DATA_VERSION + 1,
        completedItemIds: []
      })
    };
    expect(() => loadProgress(futureStorage, new Set(knownIds))).toThrow(/版本过新/);
  });

  test("loads, saves, and exports a portable progress file", () => {
    const values = new Map();
    const storage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value)
    };
    const progress = createProgress([knownIds[0]], new Date("2026-06-12T12:00:00.000Z"));

    expect(saveProgress(storage, progress)).toEqual({ persistent: true });
    expect(values.has(STORAGE_KEY)).toBe(true);
    expect(loadProgress(storage, new Set(knownIds)).completedItemIds).toEqual([knownIds[0]]);

    const exported = exportProgress(progress, new Date("2026-06-12T12:00:00.000Z"));
    expect(exported.filename).toBe("pixelharvest-community-center-2026-06-12.json");
    expect(JSON.parse(exported.text).completedItemIds).toEqual([knownIds[0]]);
  });

  test("exports normalized progress in stable id order without UI state", () => {
    const progress = {
      schemaVersion: 1,
      dataVersion: DATA_VERSION,
      updatedAt: "2026-06-12T12:00:00.000Z",
      completedItemIds: [knownIds[1], knownIds[0], knownIds[1]],
      filter: "season"
    };
    const first = exportProgress(progress, new Date("2026-06-12T12:00:00.000Z"));
    const second = exportProgress({ ...progress, completedItemIds: [...progress.completedItemIds].reverse() }, new Date("2026-06-12T12:00:00.000Z"));

    expect(first.text).toBe(second.text);
    expect(JSON.parse(first.text)).toEqual({
      schemaVersion: 1,
      dataVersion: DATA_VERSION,
      updatedAt: "2026-06-12T12:00:00.000Z",
      completedItemIds: [...knownIds].sort()
    });
  });

  test("continues in memory when browser storage is unavailable", () => {
    const brokenStorage = {
      getItem() { throw new Error("blocked"); },
      setItem() { throw new Error("blocked"); }
    };

    expect(loadProgress(brokenStorage, new Set(knownIds)).completedItemIds).toEqual([]);
    expect(saveProgress(brokenStorage, createProgress([]))).toEqual({ persistent: false });
    expect(saveProgress(null, createProgress([]))).toEqual({ persistent: false });
  });
});
