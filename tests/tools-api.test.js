import { afterEach, beforeEach, describe, expect, test } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { createTestContext } from "./helpers/context.js";

let context;
let app;

beforeEach(async () => {
  context = createTestContext();
  await initialize(context);
  app = createApp(context);
});

afterEach(() => context.close());

describe("tools API contracts", () => {
  test.each([
    "/api/tools/fish",
    "/api/tools/crops",
    "/api/tools/community-center"
  ])("%s returns versioned tool data", async (url) => {
    const response = await request(app).get(url);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      gameVersion: "1.6.15",
      dataVersion: 4
    });
    expect(Array.isArray(response.body.items ?? response.body.rooms)).toBe(true);
  });

  test("returns scoped community-center totals with legacy all-scope fields", async () => {
    const response = await request(app).get("/api/tools/community-center");

    expect(response.status).toBe(200);
    expect(response.body.gameVersion).toBe("1.6.15");
    expect(response.body.dataVersion).toBe(4);
    expect(response.body.knownSlotIds).toHaveLength(135);
    expect(new Set(response.body.knownSlotIds).size).toBe(135);
    expect(response.body.totals).toMatchObject({
      rooms: 7,
      bundles: 31,
      candidateSlots: 135,
      requiredSlots: 115,
      all: { rooms: 7, bundles: 31, candidateSlots: 135, requiredSlots: 115 },
      standard: { rooms: 6, bundles: 30, candidateSlots: 129, requiredSlots: 110 },
      missing: { rooms: 1, bundles: 1, candidateSlots: 6, requiredSlots: 5 }
    });
  });

  test("rejects an empty crop calculation request", async () => {
    const response = await request(app)
      .post("/api/tools/crops/calculate")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_TOOL_INPUT");
    expect(response.body.error.details.length).toBeGreaterThan(0);
  });

  test("keeps legacy crop requests compatible while returning all three scenarios", async () => {
    const response = await request(app)
      .post("/api/tools/crops/calculate")
      .send({
        season: "春季",
        startDay: 1,
        plots: 10,
        budget: 1000,
        method: "sell"
      });

    expect(response.status).toBe(200);
    expect(response.body.input).toMatchObject({
      yearStage: "year1",
      farmingLevel: 0,
      ownedSeeds: {},
      jarCount: 0,
      kegCount: 0
    });
    expect(response.body.groups).toEqual(expect.objectContaining({
      executable: expect.any(Array),
      unlockRequired: expect.any(Array),
      inventoryRequired: expect.any(Array)
    }));
    expect(response.body.rankings).toEqual(expect.objectContaining({
      sell: expect.any(Array),
      jar: expect.any(Array),
      keg: expect.any(Array)
    }));
    expect(response.body.items[0]).toEqual(expect.objectContaining({
      profit: expect.any(Number),
      cost: expect.any(Number),
      revenue: expect.any(Number),
      scenarios: expect.any(Object)
    }));
  });

  test("rejects unknown crop inventory ids and negative machine counts", async () => {
    const base = {
      season: "春季",
      startDay: 1,
      plots: 10,
      budget: 1000
    };
    const unknown = await request(app)
      .post("/api/tools/crops/calculate")
      .send({ ...base, ownedSeeds: { "not-a-crop": 1 } });
    const negative = await request(app)
      .post("/api/tools/crops/calculate")
      .send({ ...base, kegCount: -1 });

    expect(unknown.status).toBe(400);
    expect(unknown.body.error.code).toBe("INVALID_TOOL_INPUT");
    expect(negative.status).toBe(400);
    expect(negative.body.error.code).toBe("INVALID_TOOL_INPUT");
  });

  test("keeps greenhouse planningDays as a duration while returning absolute simulation days", async () => {
    const response = await request(app)
      .post("/api/tools/crops/calculate")
      .send({
        season: "春季",
        startDay: 20,
        planningDays: 10,
        plots: 1,
        budget: 100,
        locationMode: "greenhouse",
        greenhouseUnlocked: true
      });

    expect(response.status).toBe(200);
    expect(response.body.input.planningDays).toBe(10);
    expect(response.body.items.find((item) => item.id === "parsnip").harvestDays).toEqual([24, 28]);
  });

  test("applies fish bundle-only and magic-bait query booleans", async () => {
    const bundleResponse = await request(app)
      .get("/api/tools/fish")
      .query({ bundleOnly: "true" });
    const magicBaitResponse = await request(app)
      .get("/api/tools/fish")
      .query({ q: "河豚", season: "冬季", weather: "雨天", time: "0700", location: "海洋", magicBait: "true" });

    expect(bundleResponse.status).toBe(200);
    expect(bundleResponse.body.items.length).toBeGreaterThan(0);
    expect(bundleResponse.body.items.every((item) => item.bundleIds.length > 0)).toBe(true);
    expect(magicBaitResponse.status).toBe(200);
    expect(magicBaitResponse.body.items.map((item) => item.id)).toEqual(["pufferfish"]);
  });

  test.each(["0300", "0550", "1260", "2360", "2601", "-10", "605", "1200.5"])(
    "rejects invalid game time %s",
    async (time) => {
      const response = await request(app).get("/api/tools/fish").query({ time });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("INVALID_TOOL_INPUT");
    }
  );

  test.each(["0000", "0100", "0200", "0600", "2400", "2500", "2600"])(
    "accepts valid game time %s",
    async (time) => {
      const response = await request(app).get("/api/tools/fish").query({ time });

      expect(response.status).toBe(200);
    }
  );

  test("keeps legacy fish fields while adding rule-based availability", async () => {
    const response = await request(app).get("/api/tools/fish").query({ q: "鲶鱼", weather: "任意" });
    const item = response.body.items.find((entry) => entry.id === "catfish");

    expect(response.status).toBe(200);
    expect(item).toEqual(expect.objectContaining({
      id: "catfish",
      name: "鲶鱼",
      aliases: expect.any(Array),
      image: expect.any(String),
      seasons: expect.any(Array),
      locations: expect.any(Array),
      weather: expect.any(Array),
      timeRanges: expect.any(Array),
      sourceType: "钓竿",
      category: "普通",
      difficulty: expect.any(Number),
      behavior: expect.any(String),
      basePrice: expect.any(Number),
      bundleIds: expect.any(Array),
      notes: expect.any(String),
      gameVersion: "1.6.15",
      availabilityRules: expect.any(Array)
    }));
  });
});
