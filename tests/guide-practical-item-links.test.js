import { afterAll, beforeAll, expect, test } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { createTestContext } from "./helpers/context.js";

let context, app;
beforeAll(async () => {
  context = createTestContext();
  context.config.siteUrl = "https://pixelharvestwiki.com";
  await initialize(context);
  app = createApp(context);
});
afterAll(() => context?.close());

const links = [
  ["greenhouse-crops-processing-route", "coal", "煤炭"],
  ["mines-topic-guide", "omni-geode", "万能晶球"],
  ["community-center", "earth-crystal", "地晶"],
  ["community-center", "solar-essence", "太阳精华"],
  ["greenhouse-fruit-tree-planning", "orange", "橙子"],
  ["greenhouse-fruit-tree-planning", "peach", "桃子"]
];

// Catch a missing/non-HTML body link or an SSR/API sanitizer that drops it.
test.each(links)("%s exposes a crawlable %s link in both SSR and client article HTML", async (source, target, name) => {
  const page = await request(app).get(`/guides/${source}`);
  const api = await request(app).get(`/api/articles/${source}`);
  expect(page.status).toBe(200);
  expect(api.status).toBe(200);
  const body = page.text.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1];
  expect(body).toBeDefined();
  const anchor = `<a href="/wiki/items/${target}">${name}</a>`;
  expect(body).toContain(anchor);
  expect(api.body.item.html).toContain(anchor);
  expect(body.split(anchor)).toHaveLength(2);
});

test.each(links)("%s target %s is a real self-canonical item rather than a 404 or category fallback", async (_source, target, name) => {
  const page = await request(app).get(`/wiki/items/${target}`);
  expect(page.status).toBe(200);
  expect(page.headers.location).toBeUndefined();
  expect(page.text).toContain(`rel="canonical" href="https://pixelharvestwiki.com/wiki/items/${target}"`);
  expect(page.text).not.toMatch(/<meta[^>]+name="robots"[^>]+noindex/);
  expect(page.headers["x-robots-tag"] || "").not.toContain("noindex");
  const headings = [...page.text.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
  expect(headings).toHaveLength(1);
  expect(headings[0][1]).toContain(name);
});
