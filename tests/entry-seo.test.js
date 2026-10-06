import { afterAll, beforeAll, expect, test } from "vitest";
import request from "supertest";
import fs from "node:fs";
import vm from "node:vm";
import { createTestContext } from "./helpers/context.js";
import { initialize } from "../src/db/initialize.js";
import { createApp } from "../src/app.js";
import * as metadata from "../public/js/dataset-metadata.js";
import { PageHeader } from "../public/js/components/site-components.js";
import { renderItemDialog } from "../public/js/site-view.js";
import { escapeHtml } from "../public/js/api.js";
import { routePath, parseAppRoute, canonicalPathForRoute } from "../public/js/routes.js";

let context, server;
beforeAll(async () => {
  context = createTestContext();
  context.config.siteUrl = "https://pixelharvestwiki.com";
  await initialize(context);
  server = createApp(context);
});
afterAll(() => context.close());

// Run the actual list/detail renderers; replace only browser plumbing and HTTP transport.
function client() {
  const controls = new Map();
  const description = { content: "", setAttribute(key, value) { this[key] = value; } };
  const root = {
    innerHTML: "",
    insertAdjacentHTML(where, html) { this.innerHTML += html; },
    querySelector(selector) {
      if (selector.startsWith("[data-library-dataset=")) return this.innerHTML.includes(selector.slice(1, -1)) ? {} : null;
      if (selector === "[data-dialog-backdrop]") return this.innerHTML.includes("data-dialog-backdrop") ? {} : null;
      if (selector === ".page-header h1" || selector === ".page-header__copy > p") {
        const tag = selector.endsWith("h1") ? "h1" : "p";
        const app = this;
        return { set textContent(value) { app.innerHTML = app.innerHTML.replace(new RegExp(`<${tag}>[^<]*</${tag}>`), `<${tag}>${escapeHtml(value)}</${tag}>`); } };
      }
      return null;
    }
  };
  const document = {
    title: "",
    querySelector(selector) {
      if (selector === 'meta[name="description"]') return description;
      if (!controls.has(selector)) controls.set(selector, { addEventListener() {} });
      return controls.get(selector);
    },
    querySelectorAll: () => []
  };
  const sandbox = {
    document, app: root, state: { datasets: [], pageSize: 20, filters: {}, view: "card" },
    api: async url => {
      const result = await request(server).get(url);
      if (result.status !== 200) throw Object.assign(new Error(result.body.message), { status: result.status });
      return result.body;
    },
    datasetMetadata: metadata.datasetMetadata,
    entryMetadata: (...args) => metadata.entryMetadata(...args),
    PageHeader, renderItemDialog, escapeHtml, routePath, URLSearchParams,
    uiClass: value => value, fieldLabels: {}, formatCropDays: value => value,
    window: { matchMedia: () => ({ matches: false }) },
    loadLibraryFilterOptions: async () => ({}), renderLibrarySidebar: () => "",
    cardView: () => "", tableView: () => "", pagination: () => "", bindItemDialog: () => {}
  };
  const source = fs.readFileSync("public/js/app.js", "utf8");
  const slice = (start, end) => source.slice(source.indexOf(start), source.indexOf(end));
  vm.runInNewContext([
    slice("async function loadDatasets(", "async function home("),
    slice("async function library(", "function tableView("),
    slice("async function entryDetail(", "function bindItemDialog(")
  ].join("\n"), sandbox);
  return { sandbox, root, document, description, controls };
}

for (const [dataset, slug, name] of [
  ["items", "furniture-1846", "《1000 年后》"],
  ["cooking", "crab-cakes", "蟹黄糕"],
  ["villagers", "vincent", "文森特"]
]) {
  for (const existingList of [false, true]) {
    test(`${dataset} detail retains SSR title, description and single entry H1 after ${existingList ? "list navigation" : "direct load or refresh"}`, async () => {
      const browser = client();
      if (existingList) await browser.sandbox.library(new URLSearchParams(), { datasetSlug: dataset });
      await browser.sandbox.entryDetail(dataset, slug);
      const ssr = await request(server).get(`/wiki/${dataset}/${slug}`);
      expect(ssr.status).toBe(200);
      expect(browser.document.title).toContain(name);
      expect(browser.document.title).toBe(ssr.text.match(/<title>(.*?)<\/title>/)[1]);
      expect(browser.description.content).toContain(name);
      expect(browser.description.content).toBe(ssr.text.match(/<meta name="description" content="([^"]*)"/)[1]);
      expect([...browser.root.innerHTML.matchAll(/<h1>(.*?)<\/h1>/g)].map(match => match[1])).toEqual([name]);
      expect(ssr.text).toContain(`rel="canonical" href="https://pixelharvestwiki.com/wiki/${dataset}/${slug}"`);
      if (!existingList) {
        // Re-rendering the background (view toggle) must not switch back to category semantics.
        await browser.sandbox.library(new URLSearchParams(), { datasetSlug: dataset, modalItem: (await request(server).get(`/api/datasets/${dataset}/entries/${slug}`)).body.item });
        expect(browser.document.title).toContain(name);
      }
      await browser.sandbox.library(new URLSearchParams(), { datasetSlug: dataset });
      const category = await request(server).get(`/wiki/${dataset}`);
      expect(browser.document.title).toBe(category.text.match(/<title>(.*?)<\/title>/)[1]);
      expect(browser.root.innerHTML).not.toContain("data-dialog-backdrop");
    });
  }
}

test("unproven old guide stays a real noindex 404; known guide and exclusions stay intact", async () => {
  const missing = await request(server).get("/guides/wiki-detail-usage-guide");
  expect(missing.status).toBe(404);
  expect(missing.headers.location).toBeUndefined();
  expect(missing.headers["x-robots-tag"]).toContain("noindex");
  expect((await request(server).get("/guides/wiki-item-detail-reading-guide")).status).toBe(200);
  expect((await request(server).get("/wiki/catalog/angler")).headers["x-robots-tag"]).toContain("noindex");
  const filter = await request(server).get("/tools/fish?q=鲟鱼");
  expect(filter.text).toContain('rel="canonical" href="https://pixelharvestwiki.com/tools/fish"');
  expect((await request(server).get("/robots.txt")).text).toContain("Disallow: /admin");
  expect((await request(server).get("/guides/" + encodeURIComponent("图鉴详情页阅读与保留判断指南"))).headers.location).toBe("/guides/wiki-item-detail-reading-guide");
});

test("legacy hashes do not override real paths or canonical semantics", () => {
  const detail = parseAppRoute({ pathname: "/wiki/cooking/crab-cakes", hash: "#/library?dataset=fish" });
  expect(detail.name).toBe("wikiEntry");
  expect(canonicalPathForRoute(detail)).toBe("/wiki/cooking/crab-cakes");
  expect(parseAppRoute({ pathname: "/", hash: "#/entry?dataset=fish&id=legend" }).name).toBe("home");
});

test("published practical corrections survive seeding and their guide links reach real content", async () => {
  const legend = (await request(server).get("/api/datasets/fish/entries/legend")).body.item;
  expect(legend.attributes.time).toBe("全天");
  expect(legend.attributes.获取方式).toContain("至少10级");
  expect(legend.attributes.获取方式).toContain("至少4格");
  expect(legend.attributes.资料来源).toBe("https://stardewvalleywiki.com/Legend");
  const strawberry = (await request(server).get("/api/datasets/crops/entries/strawberry")).body.item;
  expect(strawberry.attributes.复收日历).toContain("春13播种→春21、25");
  expect(strawberry.attributes.复收日历).toContain("春20、24、28");
  expect(strawberry.attributes.资料来源).toBe("https://stardewvalleywiki.com/Strawberry");
  for (const path of ["/guides/all-fish-season-weather-reference", "/guides/year-one-spring-money-route"]) {
    const response = await request(server).get(path);
    expect(response.status).toBe(200);
    const links = [...response.text.matchAll(/href="(\/(?:wiki|guides|tools)\/[^"#]+)"/g)].map(match => match[1].replaceAll("&amp;", "&"));
    expect(links).toContain(path.includes("fish") ? "/wiki/fish/legend" : "/wiki/crops/strawberry");
    for (const link of new Set(links)) expect((await request(server).get(link)).status, link).toBe(200);
  }
});
