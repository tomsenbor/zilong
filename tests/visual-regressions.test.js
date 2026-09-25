import { test, expect } from "vitest";
import fs from "node:fs";
import vm from "node:vm";
import { renderHomeView, renderItemCard } from "../public/js/site-view.js";
import { collectLibraryFilterOptions } from "../public/js/wiki-filter-options.js";

test("homepage query entrances do not pretend to be counts", () => {
  const html = renderHomeView({ stats: {}, datasets: [], articles: [] });
  expect(html).not.toContain("查询 条");
  expect(html).toContain("进入查询");
});

test("crop maturity cards supply days without duplicating units", () => {
  for (const days of [4, "4", "4天"]) {
    const html = renderItemCard({ name: "测试作物", attributes: { days } }, "crops");
    expect(html).toContain("4 天");
    expect(html).not.toContain("天天");
  }
});

test("equivalent crop maturity options merge but special conditions survive", async () => {
  const options = collectLibraryFilterOptions(["days"],
    [4, "4天", "14天", "20天后每季最后一周"].map(days => ({ days })), "crops");
  expect(options.days).toEqual(["14 天", "20天后每季最后一周", "4 天"]);
});

test("public header switches menu and search mutually and focuses search", () => {
  // Execute the real mount function with only its DOM boundary represented.
  const elements = new Map();
  let focused;
  for (const id of ["site-header-root", "site-footer-root", "site-header", "menu-button", "search-toggle", "global-search", "global-search-input"]) {
    const classes = new Set();
    elements.set(`#${id}`, { hidden: id === "global-search", attributes: {}, handlers: {},
      classList: { toggle(name) { if (classes.has(name)) { classes.delete(name); return false; } classes.add(name); return true; }, remove(name) { classes.delete(name); }, contains(name) { return classes.has(name); } },
      setAttribute(name, value) { this.attributes[name] = value; },
      addEventListener(name, handler) { this.handlers[name] = handler; }, focus() { focused = id; }
    });
  }
  const source = fs.readFileSync("public/js/app.js", "utf8");
  const mount = source.slice(source.indexOf("function mountSiteChrome()"), source.indexOf("\nensurePublicBodyClass();"));
  vm.runInNewContext(`${mount}\nmountSiteChrome();`, { document: { querySelector: key => elements.get(key) }, SiteHeader: () => "", SiteFooter: () => "" });
  const menu = elements.get("#menu-button"), search = elements.get("#search-toggle"), form = elements.get("#global-search");
  menu.handlers.click(); search.handlers.click();
  expect(elements.get("#site-header").classList.contains("open")).toBe(false);
  expect(menu.attributes["aria-expanded"]).toBe("false");
  expect(form.hidden).toBe(false);
  expect(focused).toBe("global-search-input");
  menu.handlers.click();
  expect(form.hidden).toBe(true);
  expect(search.attributes["aria-expanded"]).toBe("false");
});
