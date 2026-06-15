import { api, escapeHtml } from "../api.js";
import { navigateTo, routePath } from "../routes.js";
import { uiClass } from "../ui-class.js";
import { errorBox, loading, toolHero, toolImage } from "./tool-shell.js";

const seasons = ["春季", "夏季", "秋季", "冬季"];
const weathers = ["任意", "晴天", "雨天"];

const options = (values, current, empty) =>
  `<option value="">${empty}</option>${values.map((value) => `<option${value === current ? " selected" : ""}>${escapeHtml(value)}</option>`).join("")}`;

function fishCard(item) {
  const times = item.timeRanges.map(({ start, end }) => `${start}-${end}`).join("、");
  return `<article class="${uiClass("fish-card card")}">
    <div class="fish-card-heading">${toolImage(item.image, item.name)}<div><span class="tool-chip">${escapeHtml(item.category)}</span><h3>${escapeHtml(item.name)}</h3></div></div>
    <dl class="condition-list">
      <div><dt>季节</dt><dd>${escapeHtml(item.seasons.join("、"))}</dd></div>
      <div><dt>时间</dt><dd>${escapeHtml(times)}</dd></div>
      <div><dt>天气</dt><dd>${escapeHtml(item.weather.join("、"))}</dd></div>
      <div><dt>地点</dt><dd>${escapeHtml(item.locations.join("、"))}</dd></div>
      <div><dt>方式</dt><dd>${escapeHtml(item.sourceType)}</dd></div>
      <div><dt>难度</dt><dd>${item.difficulty || "不适用"}</dd></div>
    </dl>
    <div class="tool-card-footer"><strong>基础售价 ${item.basePrice}g</strong>${item.bundleIds.length ? `<a href="${routePath("tool", { tool: "community-center", search: new URLSearchParams({ focus: item.bundleIds[0] }) })}">查看收集包</a>` : ""}</div>
  </article>`;
}

export async function renderFishTool(app, params = new URLSearchParams()) {
  app.innerHTML = `<main class="shell tool-page fish-tool-page">
    ${toolHero("鱼类条件查询器", "按季节、天气、时间、地点和获取方式查询鱼类，并关联社区中心收集包。", "/assets/stardew-ui/hero-fish.png", [{ href: routePath("tool", { tool: "crops" }), label: "作物收益计算器" }, { href: routePath("tool", { tool: "community-center" }), label: "社区中心清单" }])}
    <div class="tool-layout">
      <form id="fish-filter-form" class="${uiClass("card tool-form-card filter-card")}">
        <div class="field"><label for="fish-q">鱼名关键词</label><input class="${uiClass("input")}" id="fish-q" name="q" value="${escapeHtml(params.get("q") || "")}" placeholder="例如：鲶鱼"></div>
        <div class="field"><label for="fish-season">季节</label><select class="${uiClass("select")}" id="fish-season" name="season">${options(seasons, params.get("season"), "全部季节")}</select></div>
        <div class="field"><label for="fish-weather">天气</label><select class="${uiClass("select")}" id="fish-weather" name="weather">${options(weathers, params.get("weather"), "全部天气")}</select></div>
        <div class="field"><label for="fish-time">游戏时间</label><input class="${uiClass("input")}" id="fish-time" name="time" type="number" min="0" max="2600" value="${escapeHtml(params.get("time") || "")}" placeholder="例如 1830"></div>
        <div class="field"><label for="fish-location">地点</label><select class="${uiClass("select")}" id="fish-location" name="location"><option value="">全部地点</option></select></div>
        <div class="field"><label for="fish-source">获取方式</label><select class="${uiClass("select")}" id="fish-source" name="sourceType"><option value="">全部方式</option></select></div>
        <div class="field"><label for="fish-category">鱼类分类</label><select class="${uiClass("select")}" id="fish-category" name="category"><option value="">全部分类</option></select></div>
        <div class="tool-actions"><button class="${uiClass("btn primary")}" type="submit">查询鱼类</button><button class="${uiClass("btn secondary")}" id="fish-reset" type="button">重置</button></div>
      </form>
      <section class="tool-content"><div id="fish-result-summary" class="${uiClass("result-summary card")}" aria-live="polite"></div><div id="fish-results" class="fish-results">${loading("正在读取鱼类条件…")}</div></section>
    </div>
  </main>`;

  const form = app.querySelector("#fish-filter-form");
  const results = app.querySelector("#fish-results");
  try {
    const data = await api(`/api/tools/fish?${params}`);
    form.elements.location.innerHTML = options(data.filters.locations, params.get("location"), "全部地点");
    form.elements.sourceType.innerHTML = options(data.filters.sourceTypes, params.get("sourceType"), "全部方式");
    form.elements.category.innerHTML = options(data.filters.categories, params.get("category"), "全部分类");
    app.querySelector("#fish-result-summary").innerHTML = `<strong>找到 ${data.total} 种鱼类</strong><span>适用游戏版本 ${escapeHtml(data.gameVersion)}</span>`;
    results.innerHTML = data.items.length ? data.items.map(fishCard).join("") : `<div class="${uiClass("empty card")}"><h2>当前条件没有匹配结果</h2><p>尝试放宽天气或地点条件。</p><button class="${uiClass("btn secondary")}" data-relax-filter="weather">不限天气</button> <button class="${uiClass("btn secondary")}" data-relax-filter="location">不限地点</button></div>`;
  } catch (error) {
    results.innerHTML = errorBox(error.message);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = new URLSearchParams(new FormData(form));
    [...query].forEach(([key, value]) => { if (!value) query.delete(key); });
    navigateTo(routePath("tool", { tool: "fish", search: query }));
  });
  app.querySelector("#fish-reset").addEventListener("click", () => { navigateTo(routePath("tool", { tool: "fish" })); });
  app.querySelectorAll("[data-relax-filter]").forEach((button) => button.addEventListener("click", () => {
    const query = new URLSearchParams(params);
    query.delete(button.dataset.relaxFilter);
    navigateTo(routePath("tool", { tool: "fish", search: query }));
  }));
}
