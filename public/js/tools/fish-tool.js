import { api, escapeHtml } from "../api.js";
import { navigateTo, routePath } from "../routes.js";
import { uiClass } from "../ui-class.js";
import {
  FISH_PAGE_SIZE,
  buildFishQuery,
  clearFishFilter,
  countAdvancedFishFilters,
  formatGameTime,
  getActiveFishFilters,
  nextVisibleFishCount,
  selectVisibleFish
} from "./fish-view-state.js";
import { errorBox, loading, toolHero, toolImage } from "./tool-shell.js";

export { buildFishQuery, formatGameTime } from "./fish-view-state.js";

const seasons = ["春季", "夏季", "秋季", "冬季"];
const weathers = ["晴天", "雨天"];

const options = (values, current, empty) =>
  `<option value="">${empty}</option>${values.map((value) => `<option${value === current ? " selected" : ""}>${escapeHtml(value)}</option>`).join("")}`;

const formatTimeRanges = (ranges) => ranges
  .map(({ start, end }) => `${formatGameTime(start)}–${formatGameTime(end)}`)
  .join("、");

function ruleDetails(item) {
  const rules = item.availabilityRules ?? [];
  const hasRequirements = rules.some((rule) => rule.requirements.length > 0);
  const hasAlternateSources = (item.alternateSources ?? []).length > 0;
  if (rules.length < 2 && !hasRequirements && !hasAlternateSources) return "";

  const ruleList = rules.map((rule) => `<li>
    <strong>${escapeHtml(rule.locations.join("、"))}</strong>
    <span>${escapeHtml(rule.seasons.join("、"))} · ${escapeHtml(rule.weather.join("、"))} · ${escapeHtml(formatTimeRanges(rule.timeRanges))}</span>
    ${rule.requirements.length ? `<span><b>前置条件：</b>${escapeHtml(rule.requirements.join("；"))}</span>` : ""}
  </li>`).join("");
  const alternateSources = hasAlternateSources
    ? `<p><b>其他来源：</b>${escapeHtml(item.alternateSources.join("、"))}</p>`
    : "";

  return `<details class="fish-availability-details"><summary>按地点查看条件</summary><ul>${ruleList}</ul>${alternateSources}</details>`;
}

function fishCard(item) {
  const times = formatTimeRanges(item.timeRanges);
  return `<article class="${uiClass("fish-card card")}">
    <div class="fish-card-heading">${toolImage(item.image, item.name)}<div><span class="tool-chip">${escapeHtml(item.category)}</span><h3>${escapeHtml(item.name)}</h3></div></div>
    <dl class="condition-list">
      <div><dt>季节</dt><dd>${escapeHtml(item.seasons.join("、"))}</dd></div>
      <div><dt>时间</dt><dd>${escapeHtml(times)}</dd></div>
      <div><dt>天气</dt><dd>${escapeHtml(item.weather.join("、"))}</dd></div>
      <div><dt>地点</dt><dd>${escapeHtml(item.locations.join("、"))}</dd></div>
      <div><dt>方式</dt><dd>${escapeHtml(item.sourceType)}</dd></div>
      <div><dt>难度</dt><dd>${escapeHtml(String(item.difficulty || "不适用"))}</dd></div>
    </dl>
    ${ruleDetails(item)}
    <div class="tool-card-footer"><strong>基础售价 ${escapeHtml(String(item.basePrice))}g</strong>${item.bundleIds.length ? `<a href="${routePath("tool", { tool: "community-center", search: new URLSearchParams({ focus: item.bundleIds[0] }) })}">查看收集包</a>` : ""}</div>
  </article>`;
}

function activeFiltersMarkup(params) {
  const filters = getActiveFishFilters(params);
  if (!filters.length) return "";

  const buttons = filters.map((filter) => {
    const visibleLabel = filter.value ? `${filter.label}：${filter.value}` : filter.label;
    const ariaLabel = `清除筛选：${filter.label}${filter.value}`;
    return `<button class="fish-active-filter" type="button" data-clear-fish-filter="${escapeHtml(filter.key)}" aria-label="${escapeHtml(ariaLabel)}">${escapeHtml(visibleLabel)} <span aria-hidden="true">×</span></button>`;
  }).join("");

  return `<section class="fish-active-filters" aria-label="已启用条件">
    <strong>已启用条件</strong>
    <div class="fish-active-filter-list">${buttons}<button class="fish-clear-all" type="button" data-clear-all-fish-filters>清除全部</button></div>
  </section>`;
}

export async function renderFishTool(app, params = new URLSearchParams()) {
  const advancedCount = countAdvancedFishFilters(params);
  const advancedFilterSummary = advancedCount ? `高级筛选（${advancedCount}项已启用）` : "高级筛选";

  app.innerHTML = `<main class="shell tool-page fish-tool-page">
    ${toolHero("鱼类条件查询器", "按季节、天气、时间、地点和获取方式查询鱼类，并关联社区中心收集包。", "/assets/stardew-ui/hero-fish.png", [{ href: routePath("tool", { tool: "crops" }), label: "作物收益计算器" }, { href: routePath("tool", { tool: "community-center" }), label: "社区中心清单" }])}
    <div class="tool-layout">
      <form id="fish-filter-form" class="${uiClass("card tool-form-card filter-card")}">
        <div class="fish-basic-filters">
          <div class="field"><label for="fish-q">鱼名关键词</label><input class="${uiClass("input")}" id="fish-q" name="q" value="${escapeHtml(params.get("q") || "")}" placeholder="例如：鲶鱼"></div>
          <div class="field"><label for="fish-season">季节</label><select class="${uiClass("select")}" id="fish-season" name="season">${options(seasons, params.get("season"), "全部季节")}</select></div>
          <div class="field"><label for="fish-location">地点</label><select class="${uiClass("select")}" id="fish-location" name="location"><option value="">全部地点</option></select></div>
        </div>
        <details id="fish-advanced-filters" class="fish-advanced-filters">
          <summary>${advancedFilterSummary}</summary>
          <div class="fish-advanced-filter-grid">
            <div class="field"><label for="fish-weather">天气</label><select class="${uiClass("select")}" id="fish-weather" name="weather">${options(weathers, params.get("weather"), "全部天气")}</select></div>
            <div class="field"><label for="fish-time">游戏时间</label><input class="${uiClass("input")}" id="fish-time" name="time" type="number" min="0" max="2600" step="10" value="${escapeHtml(params.get("time") || "")}" placeholder="例如 1830"></div>
            <div class="field"><label for="fish-source">获取方式</label><select class="${uiClass("select")}" id="fish-source" name="sourceType"><option value="">全部方式</option></select></div>
            <div class="field"><label for="fish-category">鱼类分类</label><select class="${uiClass("select")}" id="fish-category" name="category"><option value="">全部分类</option></select></div>
            <label class="check-field" for="fish-bundle-only"><input id="fish-bundle-only" name="bundleOnly" type="checkbox" value="true"${params.get("bundleOnly") === "true" ? " checked" : ""}>仅看社区中心收集包</label>
            <label class="check-field" for="fish-magic-bait"><input id="fish-magic-bait" name="magicBait" type="checkbox" value="true"${params.get("magicBait") === "true" ? " checked" : ""}>使用魔法鱼饵</label>
          </div>
        </details>
        <div class="tool-actions"><button class="${uiClass("btn primary")}" type="submit">查询鱼类</button><button class="${uiClass("btn secondary")}" id="fish-reset" type="button">重置</button></div>
      </form>
      <section class="tool-content">
        <div id="fish-result-summary" class="${uiClass("result-summary card")}" aria-live="polite">${loading("正在读取鱼类条件…")}</div>
        ${activeFiltersMarkup(params)}
        <div id="fish-results" class="fish-results">${loading("正在读取鱼类条件…")}</div>
      </section>
    </div>
  </main>`;

  const form = app.querySelector("#fish-filter-form");
  const results = app.querySelector("#fish-results");
  const resultSummary = app.querySelector("#fish-result-summary");
  const toolContent = app.querySelector(".tool-content");
  let cachedItems = [];
  let visibleCount = FISH_PAGE_SIZE;
  let resultTotal = 0;
  let gameVersion = "";

  const loadMoreFish = () => {
    visibleCount = nextVisibleFishCount(visibleCount, cachedItems.length);
    renderData();
  };

  const renderData = () => {
    const visibleItems = selectVisibleFish(cachedItems, visibleCount);
    resultSummary.innerHTML = `<strong>找到 ${resultTotal} 种鱼类 · 当前显示 ${visibleItems.length} 种</strong><span>适用游戏版本 ${escapeHtml(gameVersion)}</span>`;

    if (!cachedItems.length) {
      results.innerHTML = `<div class="${uiClass("empty card")}"><h2>当前条件没有匹配结果</h2><p>尝试放宽天气或地点条件。</p><button class="${uiClass("btn secondary")}" type="button" data-relax-filter="weather">不限天气</button> <button class="${uiClass("btn secondary")}" type="button" data-relax-filter="location">不限地点</button></div>`;
      return;
    }

    const loadMore = visibleItems.length < cachedItems.length
      ? `<div class="fish-load-more-row"><button class="${uiClass("btn secondary fish-load-more")}" type="button" data-fish-load-more aria-controls="fish-results">再显示12条</button></div>`
      : "";
    results.innerHTML = `${visibleItems.map(fishCard).join("")}${loadMore}`;
  };

  toolContent.addEventListener("click", (event) => {
    const button = event.target.closest?.("button");
    if (!button) return;

    if (button.hasAttribute("data-fish-load-more")) {
      loadMoreFish();
      return;
    }

    if (button.hasAttribute("data-clear-fish-filter")) {
      const filterKey = button.dataset.clearFishFilter;
      const query = clearFishFilter(params, filterKey);
      navigateTo(routePath("tool", { tool: "fish", search: query }));
      return;
    }

    if (button.hasAttribute("data-clear-all-fish-filters")) {
      navigateTo(routePath("tool", { tool: "fish" }));
      return;
    }

    if (button.hasAttribute("data-relax-filter")) {
      const query = clearFishFilter(params, button.dataset.relaxFilter);
      navigateTo(routePath("tool", { tool: "fish", search: query }));
    }
  });

  try {
    const data = await api(`/api/tools/fish?${params}`);
    form.elements.location.innerHTML = options(data.filters.locations, params.get("location"), "全部地点");
    form.elements.sourceType.innerHTML = options(data.filters.sourceTypes, params.get("sourceType"), "全部方式");
    form.elements.category.innerHTML = options(data.filters.categories, params.get("category"), "全部分类");
    cachedItems = data.items;
    resultTotal = data.total;
    gameVersion = data.gameVersion;
    renderData();
  } catch (error) {
    resultSummary.innerHTML = "<strong>鱼类结果加载失败</strong>";
    results.innerHTML = errorBox(error.message);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = buildFishQuery(new FormData(form));
    navigateTo(routePath("tool", { tool: "fish", search: query }));
  });
  app.querySelector("#fish-reset").addEventListener("click", () => {
    navigateTo(routePath("tool", { tool: "fish" }));
  });
}
