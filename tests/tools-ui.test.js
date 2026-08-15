import fs from "node:fs";
import { describe, expect, test } from "vitest";
import { SiteHeader } from "../public/js/components/site-components.js";
import { routePath } from "../public/js/routes.js";
import { buildFishQuery, formatGameTime } from "../public/js/tools/fish-tool.js";

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
      'step="10"',
      'for="fish-location"',
      'for="fish-source"',
      'for="fish-category"',
      'name="bundleOnly"',
      'name="magicBait"',
      'value="true"',
      "仅看社区中心收集包",
      "使用魔法鱼饵",
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

  test("fish query restores boolean URL state and omits unchecked values", () => {
    const source = read("public/js/tools/fish-tool.js");
    const stateSource = read("public/js/tools/fish-view-state.js");

    expect(source).toContain('params.get("bundleOnly") === "true" ? " checked" : ""');
    expect(source).toContain('params.get("magicBait") === "true" ? " checked" : ""');
    expect(source).toContain("buildFishQuery(new FormData(form))");
    expect(stateSource).toContain('if (!value || value === "false") query.delete(key)');
  });

  test("fish cards format game time and expose rule details and requirements", () => {
    const source = read("public/js/tools/fish-tool.js");

    for (const token of [
      "formatGameTime",
      "按地点查看条件",
      "前置条件",
      "availabilityRules",
      "alternateSources",
      'routePath("tool", { tool: "community-center"'
    ]) {
      expect(source).toContain(token);
    }
    expect(source).toContain('const weathers = ["晴天", "雨天"]');
    expect(source).not.toContain('const weathers = ["任意"');
    expect(source).not.toMatch(/\$\{start\}-\$\{end\}/);
  });

  test("fish UI formats game times and serializes only active boolean filters", () => {
    expect(formatGameTime(600)).toBe("06:00");
    expect(formatGameTime(1800)).toBe("18:00");
    expect(formatGameTime(2400)).toBe("00:00");
    expect(formatGameTime(2600)).toBe("02:00");

    const query = buildFishQuery(new URLSearchParams([
      ["bundleOnly", "true"],
      ["magicBait", "false"],
      ["weather", ""]
    ]));
    expect(query.toString()).toBe("bundleOnly=true");
  });

  test("fish query exposes collapsed advanced filters and cached progressive results", () => {
    const source = read("public/js/tools/fish-tool.js");

    for (const token of [
      'class="fish-basic-filters"',
      'id="fish-advanced-filters"',
      '<summary>${advancedFilterSummary}</summary>',
      'class="fish-active-filters"',
      'data-clear-fish-filter',
      'data-clear-all-fish-filters',
      'data-fish-load-more',
      'aria-controls="fish-results"',
      'let cachedItems = []',
      'selectVisibleFish(cachedItems, visibleCount)',
      'nextVisibleFishCount(visibleCount, cachedItems.length)',
      'getActiveFishFilters(params)',
      'countAdvancedFishFilters(params)',
      'clearFishFilter(params, filterKey)'
    ]) {
      expect(source).toContain(token);
    }

    expect(source).not.toMatch(/<details[^>]*id="fish-advanced-filters"[^>]*\sopen(?:\s|>)/);
    expect(source).not.toMatch(/onclick\s*=/i);
    expect(source).toContain('export { buildFishQuery, formatGameTime } from "./fish-view-state.js";');

    const loadMoreHandler = source.slice(
      source.indexOf("const loadMoreFish"),
      source.indexOf("const renderData")
    );
    expect(loadMoreHandler).not.toContain("api(");
    expect(loadMoreHandler).not.toContain("navigateTo(");
    expect(loadMoreHandler).not.toContain("history.pushState");
  });

  test("fish stage-three fields and bundle links remain available", () => {
    const source = read("public/js/tools/fish-tool.js");

    for (const token of [
      'name="q"',
      'name="season"',
      'name="location"',
      'name="weather"',
      'name="time"',
      'name="sourceType"',
      'name="category"',
      'name="bundleOnly"',
      'name="magicBait"',
      "availabilityRules",
      "requirements",
      'routePath("tool", { tool: "community-center"'
    ]) {
      expect(source).toContain(token);
    }
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
      'name="yearStage"',
      'name="farmingLevel"',
      'name="desertUnlocked"',
      'name="greenhouseUnlocked"',
      'name="islandUnlocked"',
      'name="ownedSeeds"',
      'name="jarCount"',
      'name="kegCount"',
      'name="includeFertilizerCost"',
      'name="ownedFertilizerCount"',
      "scenarioCards",
      "availabilityGroups",
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

  test("crop calculator exposes the stage two decision controls without changing its API", () => {
    const source = read("public/js/tools/crop-tool.js");

    for (const token of [
      'class="shell tool-page crop-tool-page"',
      'id="crop-basic-conditions"',
      'id="crop-advanced-conditions"',
      '<summary>高级条件</summary>',
      'aria-live="polite"',
      'id="crop-compare-left"',
      'id="crop-compare-right"',
      'id="crop-ranking-toggle"',
      'selectRankingItems(',
      'resolveComparison(',
      'getMachineFieldVisibility(',
      'getResetDecisionState('
    ]) {
      expect(source).toContain(token);
    }

    expect(source.match(/api\("\/api\/tools\/crops\/calculate"/g)).toHaveLength(1);
    expect(source).not.toContain("/api/tools/crops/compare");

    const localDecisionEvents = source.slice(
      source.indexOf("const attachDecisionEvents"),
      source.indexOf("const renderData")
    );
    expect(localDecisionEvents.match(/renderData\(latestData\)/g)).toHaveLength(3);
    expect(localDecisionEvents).not.toContain("calculate(");
    expect(localDecisionEvents).not.toContain("api(");

    const resetHandler = source.slice(
      source.indexOf('form.addEventListener("reset"'),
      source.indexOf('form.elements.locationMode.addEventListener')
    );
    expect(resetHandler.match(/calculate\(\)/g)).toHaveLength(1);
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

  test("community center uses shared scoped state, strict import, and one-shot focus", () => {
    const source = read("public/js/tools/community-center-tool.js");
    const viewStateSource = read("public/js/tools/community-center-view-state.js");

    expect(source).not.toMatch(/function totals\s*\(/);
    expect(source).toContain("calculateCommunityState(data.rooms, progress.completedItemIds)");
    expect(source).toContain("getCommunityScopeSummary(summary, activeScope)");
    expect(viewStateSource).toContain("filterCommunityRooms(");
    expect(source).toContain('id="community-storage-status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("浏览器未能保存进度，本次修改仅在当前页面有效。");
    expect(source).toContain("MAX_IMPORT_BYTES");
    expect(source).toContain("file.size > MAX_IMPORT_BYTES");
    expect(source).toContain("let pendingFocus");
    expect(source).toContain('content.querySelectorAll("[data-community-bundle]")');
    expect(source).toContain("pendingFocus = false");
    expect(source).toContain('tabindex="-1"');
    expect(source).not.toContain("document.getElementById(focus)");

    const importHandler = source.slice(
      source.indexOf('app.querySelector("#community-import")'),
      source.indexOf('app.querySelector("#community-reset")')
    );
    expect(importHandler.indexOf("importProgress(")).toBeLessThan(importHandler.indexOf("confirm("));
    expect(importHandler.indexOf("confirm(")).toBeLessThan(importHandler.indexOf("persistProgress("));
    expect(importHandler).toContain("finally");
    expect(importHandler).toContain('event.target.value = ""');
  });

  test("community center stage six uses scoped view state and delegated item events", () => {
    const source = read("public/js/tools/community-center-tool.js");

    for (const token of [
      'id="community-scope-progress"',
      'data-community-scope="standard"',
      'data-community-scope="missing"',
      'aria-pressed="true"',
      'id="community-room-select"',
      'data-community-show-all',
      'data-community-room-heading',
      '<progress',
      'resolveCommunityView(',
      'getCommunityScopeSummary('
    ]) {
      expect(source).toContain(token);
    }

    expect(source).toContain('content.addEventListener("change"');
    expect(source).toContain('content.addEventListener("click"');
    expect(source).not.toContain('content.querySelectorAll("[data-community-slot]").forEach');
    expect(source).toContain('</label><span class="community-item-source">');
    expect(source).not.toContain('${crossLink(item)}</span></label>');
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
