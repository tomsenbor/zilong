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
      dataVersion: 1
    });
    expect(Array.isArray(response.body.items ?? response.body.rooms)).toBe(true);
  });

  test("rejects an empty crop calculation request", async () => {
    const response = await request(app)
      .post("/api/tools/crops/calculate")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_TOOL_INPUT");
    expect(response.body.error.details.length).toBeGreaterThan(0);
  });
});
