import { afterAll, beforeAll, expect, test, vi } from "vitest";
import request from "supertest";
import fs from "node:fs";
import vm from "node:vm";
import { createTestContext } from "./helpers/context.js";
import { initialize } from "../src/db/initialize.js";
import { createApp } from "../src/app.js";
import { loadLibraryFilterOptions } from "../public/js/site-view.js";

let context, app;
beforeAll(async () => { context = createTestContext(); await initialize(context); app = createApp(context); });
afterAll(() => context.close());

test("one compact request supplies all item filters and repeated calls reuse it", async () => {
  const urls = [];
  const fetchPage = async url => {
    urls.push(url);
    const response = await request(app).get(url);
    expect(response.status).toBe(200);
    return response.body;
  };
  const [options, again] = await Promise.all([
    loadLibraryFilterOptions(fetchPage, "items"), loadLibraryFilterOptions(fetchPage, "items")
  ]);
  expect(options.type).toContain("家具");
  expect(options.type).toContain("帽子");
  expect(again).toEqual(options);
  expect(await loadLibraryFilterOptions(fetchPage, "items")).toEqual(options);
  expect(urls).toEqual(["/api/datasets/items/filter-options"]);
});

test("filter endpoint excludes unpublished entries and preserves normalized and special values", async () => {
  const id = context.db.prepare("SELECT id FROM datasets WHERE slug='crops'").get().id;
  const rows = context.db.prepare("SELECT id FROM dataset_entries WHERE dataset_id=? LIMIT 5").all(id);
  [4, "4天", "14天", "20天后每季最后一周", "未公开周期"].forEach((days, i) => {
    context.db.prepare("UPDATE dataset_entries SET attributes_json=?, published=? WHERE id=?")
      .run(JSON.stringify({days}), i === 4 ? 0 : 1, rows[i].id);
  });
  const r = await request(app).get("/api/datasets/crops/filter-options?q=不存在&page=99");
  expect(r.status).toBe(200);
  expect(r.body.options.days).toContain("4 天");
  expect(r.body.options.days).not.toContain("4天");
  expect(r.body.options.days).toContain("14 天");
  expect(r.body.options.days).toContain("20天后每季最后一周");
  expect(r.body.options.days).not.toContain("未公开周期");
  expect(r.body.items).toBeUndefined();
  expect((await request(app).get("/api/datasets/not-a-dataset/filter-options")).status).toBe(404);
});

test("a failed filter request can be retried and cache expires", async () => {
  let calls = 0;
  const fetchPage = async () => { calls++; if (calls === 1) throw new Error("offline"); return {options:{type:["家具"]}}; };
  await expect(loadLibraryFilterOptions(fetchPage, "items")).rejects.toThrow("offline");
  expect(await loadLibraryFilterOptions(fetchPage, "items")).toEqual({type:["家具"]});
  expect(await loadLibraryFilterOptions(fetchPage, "items")).toEqual({type:["家具"]});
  expect(calls).toBe(2);
  const now = Date.now();
  const clock = vi.spyOn(Date, "now").mockReturnValue(now + 301000);
  try { await loadLibraryFilterOptions(fetchPage, "items"); expect(calls).toBe(3); }
  finally { clock.mockRestore(); }
});

test("opening a detail from its existing list fetches only the detail and preserves the list", async () => {
  const source = fs.readFileSync("public/js/app.js", "utf8");
  const fn = source.slice(source.indexOf("async function entryDetail("), source.indexOf("\nfunction bindItemDialog("));
  const urls = [], inserted = [];
  const sandbox = {
    loadDatasets: async () => {}, state: {datasets:[{slug:"items"}]},
    api: async url => { urls.push(url); return {item:{slug:"furniture-1846",name:"《1000 年后》"}}; },
    app: {querySelector: selector => selector.includes("data-library-dataset") ? {} : null, insertAdjacentHTML: (where, html) => inserted.push(html)},
    renderItemDialog: item => item.name, bindItemDialog: () => {},
    library: async () => { throw new Error("list reloaded"); }, URLSearchParams
  };
  vm.runInNewContext(fn, sandbox);
  await sandbox.entryDetail("items", "furniture-1846");
  expect(urls).toEqual(["/api/datasets/items/entries/furniture-1846"]);
  expect(inserted).toEqual(["《1000 年后》"]);
});
