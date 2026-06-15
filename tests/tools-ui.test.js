import fs from "node:fs";
import { describe, expect, test } from "vitest";
import { SiteHeader } from "../public/js/components/site-components.js";
import { routePath } from "../public/js/routes.js";

const read = (filename) => fs.readFileSync(filename, "utf8");

describe("tools navigation and routes", () => {
  test("exposes a tools entry in the public navigation", () => {
    const html = SiteHeader();

    expect(html).toContain(`href="${routePath("tools")}"`);
    expect(html).toContain('data-nav-route="tools"');
  });

  test("routes the landing page and all three products", () => {
    const app = read("public/js/app.js");

    expect(app).toContain('"./tools/fish-tool.js"');
    expect(app).toContain('"./tools/crop-tool.js"');
    expect(app).toContain('"./tools/community-center-tool.js"');
    expect(app).toContain('currentRoute.name === "tools"');
    expect(app).toContain('currentRoute.name === "tool"');
    expect(app).toContain('currentRoute.params.tool === "fish"');
    expect(app).toContain('currentRoute.params.tool === "crops"');
    expect(app).toContain('currentRoute.params.tool === "community-center"');
  });
});

describe("v3 tool UI contracts", () => {
  test("fish query uses shared card, button, and filter classes", () => {
    const source = read("public/js/tools/fish-tool.js");

    for (const token of [
      'for="fish-q"',
      'for="fish-season"',
      'for="fish-weather"',
      'for="fish-time"',
      'for="fish-location"',
      'for="fish-source"',
      'for="fish-category"',
      'id="fish-result-summary"',
      'id="fish-reset"',
      "data-relax-filter",
      'uiClass("card tool-form-card filter-card")',
      'uiClass("fish-card card")',
      'uiClass("result-summary card")'
    ]) {
      expect(source).toContain(token);
    }
    expect(source).not.toMatch(/onclick\s*=/i);
    expect(source).not.toContain('class="panel');
  });

  test("crop calculator preserves inputs and uses shared cards", () => {
    const source = read("public/js/tools/crop-tool.js");

    for (const token of [
      'name="season"',
      'name="startDay"',
      'name="planningDays"',
      'name="plots"',
      'name="budget"',
      'name="fertilizer"',
      'name="agriculturist"',
      'name="tiller"',
      'name="method"',
      'name="locationMode"',
      'name="includeSeedCost"',
      'uiClass("card tool-form-card crop-form")',
      'uiClass("crop-result-card card")',
      'uiClass("result-summary card")',
      'class="crop-ranking-value"',
      'data-mobile-label="收获次数"',
      'data-mobile-label="启动成本"',
      'data-mobile-label="净利润"',
      'data-mobile-label="日均利润"'
    ]) {
      expect(source).toContain(token);
    }
    expect(source).not.toMatch(/onclick\s*=/i);
    expect(source).not.toContain('class="panel');
  });

  test("community center preserves persistence controls and shared cards", () => {
    const source = read("public/js/tools/community-center-tool.js");

    for (const token of [
      'id="community-percent"',
      'name="community-filter"',
      'id="community-season"',
      'id="community-export"',
      'id="community-import"',
      'id="community-reset"',
      'class="community-filter-group"',
      'class="community-season-group"',
      'class="community-action-group"',
      "item.quality",
      'routePath("tool", { tool: "fish"',
      'routePath("tool", { tool: "crops"',
      'uiClass("card community-dashboard")',
      'uiClass("bundle-card card")'
    ]) {
      expect(source).toContain(token);
    }
    expect(source).not.toMatch(/onclick\s*=/i);
    expect(source).not.toContain('class="panel');
    expect(source).not.toContain("btn danger");
  });
});

describe("locked responsive tool styles", () => {
  test("ships tool styles only through design-system components", () => {
    const css = read("design-system/components.css");
    const base = read("design-system/base.css");
    const input = read("public/css/input.css");

    expect(css).toContain(".tools-grid");
    expect(css).toContain(".tool-layout");
    expect(css).toContain(".fish-results");
    expect(css).toContain(".crop-result-card");
    expect(css).toContain(".bundle-grid");
    expect(css).toContain(".crop-ranking-value::before");
    expect(css).toContain('content: attr(data-mobile-label) "："');
    expect(css).toContain(".community-filter-group");
    expect(css).toContain(".community-action-group");
    expect(css).toMatch(/@media \(max-width:\s*480px\)[\s\S]*\.community-filter-group\s*\{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
    expect(css).toMatch(/@media \(max-width:\s*480px\)[\s\S]*\.community-season-group\s*\{[\s\S]*grid-template-columns:\s*auto minmax\(0,\s*1fr\)/);
    expect(css).toMatch(/@media \(max-width:\s*480px\)[\s\S]*\.community-action-group\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
    expect(base).toContain(":focus-visible");
    expect(css).toContain("@media (max-width: 980px)");
    expect(css).toContain("@media (max-width: 720px)");
    expect(input).not.toContain("pixel-panel");
    expect(input).not.toContain("farm-button");
    expect(fs.existsSync("public/css/app.css")).toBe(false);
  });
});
