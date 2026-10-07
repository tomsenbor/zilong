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
import * as routes from "../public/js/routes.js";

let context, app;
beforeAll(async () => {
  context = createTestContext();
  context.config.siteUrl = "https://pixelharvestwiki.com";
  await initialize(context);
  app = createApp(context);
});
afterAll(() => context?.close());

// Execute the production route handler, article and item renderers against real APIs.
// Only DOM plumbing, presentation-only enhancements and HTTP transport are doubled.
function client() {
  const controls = new Map(), events = new Map();
  const root = {
    innerHTML: "",
    insertAdjacentHTML(_position, html) { this.innerHTML += html; },
    querySelector(selector) {
      if (selector.startsWith("[data-library-dataset=")) return this.innerHTML.includes(selector.slice(1, -1)) ? {} : null;
      if (selector === "[data-dialog-backdrop]") return this.innerHTML.includes("data-dialog-backdrop") ? {} : null;
      if (selector === ".page-header h1" || selector === ".page-header__copy > p") {
        const tag = selector.endsWith("h1") ? "h1" : "p", appRoot = this;
        return { set textContent(value) { appRoot.innerHTML = appRoot.innerHTML.replace(new RegExp(`<${tag}>[^<]*</${tag}>`), `<${tag}>${escapeHtml(value)}</${tag}>`); } };
      }
      return null;
    }
  };
  const description = { content: "", setAttribute(key, value) { this[key] = value; } };
  const canonical = { href: "" };
  const document = {
    title: "",
    querySelector(selector) {
      if (selector === 'meta[name="description"]') return description;
      if (selector === 'link[rel="canonical"]') return canonical;
      if (selector === 'meta[name="robots"]') return null;
      if (!controls.has(selector)) controls.set(selector, { addEventListener() {} });
      return controls.get(selector);
    },
    querySelectorAll: () => [], head: { append() {} },
    createElement: () => ({ dataset: {}, remove() {} })
  };
  const sandbox = {
    ...routes, ...metadata, document, app: root, URL, URLSearchParams,
    state: { datasets: [], pageSize: 20, filters: {}, view: "card" },
    api: async url => {
      const result = await request(app).get(url);
      if (result.status !== 200) throw new Error(`${url}: ${result.status}`);
      return result.body;
    },
    PageHeader, renderItemDialog, escapeHtml, uiClass: value => value,
    fieldLabels: {}, formatCropDays: value => value,
    window: { matchMedia: () => ({ matches: false }) },
    loadLibraryFilterOptions: async () => ({}), renderLibrarySidebar: () => "",
    cardView: () => "", tableView: () => "", pagination: () => "", bindItemDialog() {},
    renderRelatedGuides: () => "", enhanceArticleDetail() {},
    siteChrome: { siteHeader: { classList: { remove() {} } }, menuButton: { setAttribute() {} } },
    updateActiveNavigation() {}, updateRouteChrome() {},
    errorView(error) { throw error; }, addEventListener: (event, handler) => events.set(event, handler)
  };
  const source = fs.readFileSync("public/js/app.js", "utf8");
  const slice = (start, end) => source.slice(source.indexOf(start), source.indexOf(end));
  vm.runInNewContext([
    slice("function updateSeo(", "function notFoundView("),
    slice("async function loadDatasets(", "async function home("),
    slice("async function library(", "function tableView("),
    slice("async function articleDetail(", "function enhanceArticleDetail("),
    slice("async function entryDetail(", "function bindItemDialog("),
    source.slice(source.indexOf("async function route()"), source.lastIndexOf("\nroute();"))
  ].join("\n"), sandbox);
  return {
    root, document, description, canonical,
    async render(path, event = "popstate") {
      sandbox.location = new URL(path, "https://pixelharvestwiki.com");
      await events.get(event)();
    }
  };
}

const paths = [
  ["greenhouse-crops-processing-route", "coal"],
  ["mines-topic-guide", "omni-geode"],
  ["community-center", "earth-crystal"],
  ["community-center", "solar-essence"],
  ["greenhouse-fruit-tree-planning", "orange"],
  ["greenhouse-fruit-tree-planning", "peach"]
];

// Missing article metadata assignment leaves the previous item title/description behind.
test.each(paths)("%s ↔ %s restores SSR semantics through app navigation and repeated popstate", async (guide, item) => {
  const browser = client();
  const guidePath = `/guides/${guide}`, itemPath = `/wiki/items/${item}`;
  for (const [path, event] of [
    [itemPath, "app:navigation"], [guidePath, "popstate"],
    [itemPath, "popstate"], [guidePath, "popstate"],
    ["/guides/seasonal-items-to-keep", "app:navigation"], [guidePath, "app:navigation"]
  ]) {
    await browser.render(path, event);
    const ssr = await request(app).get(path);
    expect(ssr.status).toBe(200);
    expect(escapeHtml(browser.document.title), path).toBe(ssr.text.match(/<title>(.*?)<\/title>/)[1]);
    expect(escapeHtml(browser.description.content), path).toBe(ssr.text.match(/<meta name="description" content="([^"]*)"/)[1]);
    expect(browser.canonical.href).toBe(`https://pixelharvestwiki.com${path}`);
    const headings = [...browser.root.innerHTML.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/g)].map(match => match[1]);
    expect(headings).toEqual([...ssr.text.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/g)].map(match => match[1]));
    if (path === guidePath) expect(browser.root.innerHTML).toContain(`href="${itemPath}"`);
  }
});
