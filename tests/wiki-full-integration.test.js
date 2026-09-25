import { afterAll, beforeAll, expect, test } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import request from "supertest";
import { entries } from "../src/db/seeds.js";
import { makeEntrySlug } from "../src/utils/entry-slug.js";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { seedDatabase } from "../src/db/seed.js";
import { createTestContext } from "./helpers/context.js";
import { buildAssetIndex, resolveGameAssetUrl } from "../src/db/assets.js";

const manifest = JSON.parse(readFileSync(new URL("../docs/wiki-full-manifest.json", import.meta.url)));
const included = manifest.records.filter(r => r.disposition === "include");
let context, app;
const visited = new Set();
const assetIndex = buildAssetIndex(readdirSync(new URL('../public/assets/game/', import.meta.url)));
const byIdentity = new Map(entries.map(entry => [`${entry.dataset}/${makeEntrySlug(entry)}`, entry]));

beforeAll(async () => {
  context = createTestContext();
  await initialize(context);
  app = createApp(context);
}, 30000);
afterAll(() => context?.close());

test.each([...new Set(included.map(record => record.group))])("%s: every registered entry keeps its real API image, SSR content and links", async group => {
  expect(included.length).toBeGreaterThan(0);
    for (const record of included.filter(record => record.group === group)) {
      const source = byIdentity.get(`${record.dataset}/${record.slug}`);
      expect(source, record.key).toBeDefined();
      const image = resolveGameAssetUrl(source.image, assetIndex);
      const canonicalSlug = record.canonicalSlug || record.slug;
      expect(makeEntrySlug({ ...source, image }), record.key).toBe(canonicalSlug);
      const api = await request(app).get(`/api/datasets/${record.dataset}/entries/${canonicalSlug}`);
      expect(api.status, record.key).toBe(200);
      expect(api.body.item.name).toBe(record.displayName);
      expect(api.body.item.image).toBe(image);
      expect(api.body.item.slug).toBe(canonicalSlug);
      expect((await request(app).get(image)).status, image).toBe(200);
      const page = await request(app).get(`/wiki/${record.dataset}/${canonicalSlug}`);
      expect(page.status, record.key).toBe(200);
      expect(page.text).toContain(source.name.replaceAll("&", "&amp;"));
      for (const link of source.attributes.links || []) {
        if (visited.has(link)) continue;
        expect((await request(app).get(link)).status, link).toBe(200);
        visited.add(link);
      }
    }
}, 120000);

test("reimport preserves every registered entry ID and content", () => {
    const snapshot = () => context.db.prepare("SELECT id,dataset_id,slug,name,image,attributes_json FROM dataset_entries ORDER BY id").all();
    const before = snapshot();
    seedDatabase(context.db);
    expect(snapshot()).toEqual(before);
}, 120000);
