import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { communityCenter } from "../src/features/tools/data/community-center.js";
import {
  calculateCommunityProgress,
  getCommunitySlotIds,
  getCommunityTotals
} from "../src/features/tools/community-center.js";
import {
  createProgress,
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
      isComplete: true
    });
    expect(result.completedRequiredSlots).toBe(5);
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
    expect(migrated.dataVersion).toBe(1);
    expect(migrated.completedItemIds).toEqual([knownIds[1]]);
  });

  test("rejects invalid imports before changing storage", () => {
    expect(() => importProgress("not-json", new Set(knownIds))).toThrow(/JSON/);
    expect(() => importProgress('{"completedItemIds":"wrong"}', new Set(knownIds))).toThrow(/格式/);
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

  test("continues in memory when browser storage is unavailable", () => {
    const brokenStorage = {
      getItem() { throw new Error("blocked"); },
      setItem() { throw new Error("blocked"); }
    };

    expect(loadProgress(brokenStorage, new Set(knownIds)).completedItemIds).toEqual([]);
    expect(saveProgress(brokenStorage, createProgress([]))).toEqual({ persistent: false });
  });
});
