import { api, escapeHtml } from "../api.js";
import { routePath } from "../routes.js";
import { uiClass } from "../ui-class.js";
import {
  canExpandRanking,
  getMachineFieldVisibility,
  getResetDecisionState,
  resolveComparison,
  selectRankingItems
} from "./crop-decision-state.js";
import { errorBox, formatGold, loading, toolHero, toolImage } from "./tool-shell.js";

const seasons = ["春季", "夏季", "秋季", "冬季"];

const metric = (label, value, note) =>
  `<article class="${uiClass("crop-result-card card")}"><span>${label}</span><strong>${value}</strong><small>${escapeHtml(note)}</small></article>`;

const scenarioLabels = { sell: "直接出售", jar: "罐头瓶", keg: "小桶" };

function scenarioCards(item) {
  return `<div class="crop-result-grid">${["sell", "jar", "keg"].map((method) => {
    const scenario = item.scenarios[method];
    const detail = scenario.supported
      ? `完成加工 ${scenario.processedInputQuantity.toFixed(1)}，剩余原料 ${scenario.remainingRawQuantity.toFixed(1)}`
      : "该作物不支持此加工方式";
    return metric(scenarioLabels[method], formatGold(scenario.profit), detail);
  }).join("")}</div>`;
}

function availabilityGroups(data) {
  const groups = [
    ["executable", "可立即执行"],
    ["unlockRequired", "需要解锁"],
    ["inventoryRequired", "需要已有种子"]
  ];
  return `<div class="${uiClass("result-summary card")}">${groups.map(([key, label]) =>
    `<span><strong>${label}</strong> ${data.groups[key].length} 项</span>`
  ).join("")}</div>`;
}

function parseOwnedSeeds(value) {
  const inventory = {};
  for (const part of value.split(/[，,]/).map((item) => item.trim()).filter(Boolean)) {
    const [id, quantity] = part.split(":").map((item) => item.trim());
    if (id && /^\d+$/.test(quantity)) inventory[id] = Number(quantity);
  }
  return inventory;
}

function resultRow(item) {
  return `<article class="crop-ranking-row">
    <div class="crop-name">${toolImage(item.image, item.name)}<div class="crop-name-copy"><strong class="crop-name-main">${escapeHtml(item.name)}</strong><small class="crop-harvest-note">收获：${escapeHtml(item.harvestDays.join("、"))} 日</small></div></div>
    <span class="crop-ranking-value" data-mobile-label="收获次数">${item.harvests} 次</span><span class="crop-ranking-value" data-mobile-label="启动成本">${formatGold(item.cost)}</span><span class="crop-ranking-value" data-mobile-label="净利润">${formatGold(item.profit)}</span><span class="crop-ranking-value" data-mobile-label="日均利润">${formatGold(item.dailyProfit)}</span>
    <details><summary>计算过程</summary>${item.steps.map((step) => `<p>${escapeHtml(step)}</p>`).join("")}</details>
  </article>`;
}

const comparisonFields = [
  ["净利润", (item) => formatGold(item.profit)],
  ["日均利润", (item) => formatGold(item.dailyProfit)],
  ["启动成本", (item) => formatGold(item.cost)],
  ["收获次数", (item) => `${item.harvests} 次`],
  ["总产量", (item) => `${Number(item.totalYield).toFixed(1)} 个`]
];

function comparisonOptions(items, selectedId) {
  return items.map((item) =>
    `<option value="${escapeHtml(item.id)}"${item.id === selectedId ? " selected" : ""}>${escapeHtml(item.name)}</option>`
  ).join("");
}

function comparisonMarkup(items, leftId, rightId) {
  const comparison = resolveComparison(items, leftId, rightId);
  if (!comparison.available) return "";

  const comparisonBody = comparison.error ? "" : `<div class="crop-comparison-table" role="table" aria-label="双作物收益对比">
    <div class="crop-comparison-row crop-comparison-head" role="row"><span role="columnheader">指标</span><strong role="columnheader">${escapeHtml(comparison.left.name)}</strong><strong role="columnheader">${escapeHtml(comparison.right.name)}</strong></div>
    ${comparisonFields.map(([label, formatter]) => `<div class="crop-comparison-row" role="row"><span role="rowheader">${label}</span><b role="cell">${escapeHtml(formatter(comparison.left))}</b><b role="cell">${escapeHtml(formatter(comparison.right))}</b></div>`).join("")}
  </div>`;

  return `<section class="crop-comparison" aria-labelledby="crop-comparison-title">
    <div class="crop-comparison-heading"><h2 id="crop-comparison-title">双作物对比</h2><p>直接比较当前响应中的关键决策数据。</p></div>
    <div class="crop-comparison-selects">
      <div class="field crop-comparison-select"><label for="crop-compare-left">作物一</label><select class="${uiClass("select")}" id="crop-compare-left">${comparisonOptions(items, comparison.left.id)}</select></div>
      <div class="field crop-comparison-select"><label for="crop-compare-right">作物二</label><select class="${uiClass("select")}" id="crop-compare-right">${comparisonOptions(items, comparison.right.id)}</select></div>
    </div>
    <p class="crop-comparison-error" role="status"${comparison.error ? "" : " hidden"}>${escapeHtml(comparison.error)}</p>
    ${comparisonBody}
  </section>`;
}

export async function renderCropTool(app, params = new URLSearchParams()) {
  app.innerHTML = `<main class="shell tool-page crop-tool-page">
    ${toolHero("作物收益计算器", "综合季节剩余天数、地块、预算、职业、肥料和加工方式，比较可执行的净利润。", "", [{ href: routePath("tool", { tool: "fish" }), label: "鱼类条件查询器" }, { href: routePath("tool", { tool: "community-center" }), label: "社区中心清单" }])}
    <form id="crop-calculator-form" class="${uiClass("card tool-form-card crop-form")}">
      <section id="crop-basic-conditions" class="crop-condition-section" aria-labelledby="crop-basic-title">
        <div class="crop-condition-heading"><h2 id="crop-basic-title">基础条件</h2><p>先填写影响本次种植决策的必要条件。</p></div>
        <div class="crop-basic-grid">
          <div class="field"><label for="crop-season">季节</label><select class="${uiClass("select")}" id="crop-season" name="season">${seasons.map((value) => `<option${params.get("season") === value ? " selected" : ""}>${value}</option>`).join("")}</select></div>
          <div class="field"><label for="crop-location">种植地点</label><select class="${uiClass("select")}" id="crop-location" name="locationMode"><option value="seasonal">普通农田</option><option value="greenhouse">温室</option><option value="island">姜岛农场</option></select></div>
          <div class="field"><label for="crop-start-day">开始日期</label><input class="${uiClass("input")}" id="crop-start-day" name="startDay" type="number" min="1" max="28" value="${escapeHtml(params.get("startDay") || "1")}"></div>
          <div class="field"><label for="crop-planning-days">规划天数</label><input class="${uiClass("input")}" id="crop-planning-days" name="planningDays" type="number" min="1" max="365" value="${escapeHtml(params.get("planningDays") || "28")}"></div>
          <div class="field"><label for="crop-plots">地块数量</label><input class="${uiClass("input")}" id="crop-plots" name="plots" type="number" min="1" max="9999" value="${escapeHtml(params.get("plots") || "100")}"></div>
          <div class="field"><label for="crop-budget">可用预算</label><input class="${uiClass("input")}" id="crop-budget" name="budget" type="number" min="0" value="${escapeHtml(params.get("budget") || "10000")}"></div>
          <div class="field"><label for="crop-method">出售方式</label><select class="${uiClass("select")}" id="crop-method" name="method"><option value="sell">直接出售</option><option value="jar">罐头瓶</option><option value="keg">小桶</option></select></div>
        </div>
      </section>
      <details id="crop-advanced-conditions" class="crop-advanced-conditions">
        <summary>高级条件</summary>
        <div class="crop-advanced-grid">
          <div class="field"><label for="crop-year-stage">游戏年份</label><select class="${uiClass("select")}" id="crop-year-stage" name="yearStage"><option value="year1">第一年</option><option value="later">后续年度</option></select></div>
          <div class="field"><label for="crop-farming-level">耕种等级</label><input class="${uiClass("input")}" id="crop-farming-level" name="farmingLevel" type="number" min="0" max="10" value="0"></div>
          <div class="field"><label for="crop-fertilizer">生长肥料</label><select class="${uiClass("select")}" id="crop-fertilizer" name="fertilizer"><option value="none">不使用</option><option value="speed-gro">生长激素</option><option value="deluxe-speed-gro">高级生长激素</option><option value="hyper-speed-gro">顶级生长激素</option></select></div>
          <div class="field"><label for="crop-owned-fertilizer">已有肥料数量</label><input class="${uiClass("input")}" id="crop-owned-fertilizer" name="ownedFertilizerCount" type="number" min="0" max="9999" value="0"></div>
          <label class="check-field"><input name="agriculturist" type="checkbox"> 农业学家（生长速度 +10%）</label>
          <label class="check-field"><input name="tiller" type="checkbox"> 农耕人（原作物售价 +10%）</label>
          <div class="field crop-machine-field" data-machine-field="jar" hidden><label for="crop-jar-count">罐头瓶数量</label><input class="${uiClass("input")}" id="crop-jar-count" name="jarCount" type="number" min="0" max="9999" value="0"></div>
          <div class="field crop-machine-field" data-machine-field="keg" hidden><label for="crop-keg-count">小桶数量</label><input class="${uiClass("input")}" id="crop-keg-count" name="kegCount" type="number" min="0" max="9999" value="0"></div>
          <label class="check-field"><input name="desertUnlocked" type="checkbox"> 已解锁沙漠</label>
          <label class="check-field"><input name="greenhouseUnlocked" type="checkbox"> 已解锁温室</label>
          <label class="check-field"><input name="islandUnlocked" type="checkbox"> 已解锁姜岛</label>
          <div class="field"><label for="crop-owned-seeds">已有特殊种子</label><input class="${uiClass("input")}" id="crop-owned-seeds" name="ownedSeeds" type="text" placeholder="例如 carrot:5, ancient-fruit:2"></div>
          <label class="check-field"><input name="includeSeedCost" type="checkbox" checked> 计入种子成本</label>
          <label class="check-field"><input name="includeFertilizerCost" type="checkbox"> 计入肥料成本</label>
        </div>
      </details>
      <div class="tool-actions"><button class="${uiClass("btn primary")}" type="submit">开始计算</button><button class="${uiClass("btn secondary")}" type="reset">恢复默认</button></div>
    </form>
    <section id="crop-results" class="tool-content" aria-live="polite">${loading("正在核算全部作物收益…")}</section>
  </main>`;

  const form = app.querySelector("#crop-calculator-form");
  const results = app.querySelector("#crop-results");
  const advancedConditions = app.querySelector("#crop-advanced-conditions");
  const focusCrop = params.get("crop");
  let latestData = null;
  let resetTimer = null;
  let decisionState = getResetDecisionState();

  const initializeDecisionState = (items) => {
    const focused = items.find((item) => item.id === focusCrop);
    const left = focused || items[0] || null;
    const rankedSecond = items[1] || null;
    const right = rankedSecond?.id !== left?.id
      ? rankedSecond
      : items.find((item) => item.id !== left?.id) || null;

    decisionState = {
      ...getResetDecisionState(),
      comparisonLeftId: left?.id || "",
      comparisonRightId: right?.id || ""
    };
  };

  const attachDecisionEvents = () => {
    results.querySelector("#crop-ranking-toggle")?.addEventListener("click", () => {
      decisionState.rankingExpanded = !decisionState.rankingExpanded;
      renderData(latestData);
    });
    results.querySelector("#crop-compare-left")?.addEventListener("change", (event) => {
      decisionState.comparisonLeftId = event.currentTarget.value;
      renderData(latestData);
    });
    results.querySelector("#crop-compare-right")?.addEventListener("change", (event) => {
      decisionState.comparisonRightId = event.currentTarget.value;
      renderData(latestData);
    });
  };

  const renderData = (data) => {
    if (!data) return;
    const selected = data.items.find((item) => item.id === focusCrop) || data.highlights.bestProfit;
    if (!selected) {
      results.innerHTML = `<div class="${uiClass("empty card")}"><h2>没有可执行的种植方案</h2><p>请增加预算、减少地块，或调整季节和开始日期。</p></div>`;
      return;
    }

    const rankingItems = selectRankingItems(data.items, decisionState.rankingExpanded);
    const hasRankingToggle = canExpandRanking(data.items);
    const rankingToggle = hasRankingToggle
      ? `<button class="${uiClass("btn secondary")}" id="crop-ranking-toggle" type="button" aria-expanded="${decisionState.rankingExpanded}">${decisionState.rankingExpanded ? "收起到前5项" : `查看全部 ${data.items.length} 项`}</button>`
      : "";

    results.innerHTML = `
      <div class="crop-result-grid">
        ${metric("净利润", formatGold(selected.profit), selected.name)}
        ${metric("日均利润", formatGold(selected.dailyProfit), "按有效规划天数")}
        ${metric("启动成本", formatGold(selected.cost), `${selected.plantedTiles} 格实际种植`)}
        ${metric("收获次数", `${selected.harvests} 次`, `预计产出 ${selected.totalYield.toFixed(1)} 个`)}
      </div>
      ${scenarioCards(selected)}
      ${availabilityGroups(data)}
      ${comparisonMarkup(data.items, decisionState.comparisonLeftId, decisionState.comparisonRightId)}
      <div class="${uiClass("result-summary card")}"><strong>${focusCrop && selected.id === focusCrop ? `已定位：${escapeHtml(selected.name)}` : "作物净利润排行"}</strong><span>共 ${data.items.length} 个可执行方案</span></div>
      <div class="crop-ranking"><div class="crop-ranking-head"><span>作物</span><span>收获</span><span>启动成本</span><span>净利润</span><span>日均利润</span><span>详情</span></div>${rankingItems.map(resultRow).join("")}</div>
      ${rankingToggle ? `<div class="crop-ranking-actions">${rankingToggle}</div>` : ""}`;
    attachDecisionEvents();
  };

  async function calculate() {
    const values = Object.fromEntries(new FormData(form));
    const payload = {
      ...values,
      startDay: Number(values.startDay),
      planningDays: Number(values.planningDays),
      plots: Number(values.plots),
      budget: values.budget === "" ? null : Number(values.budget),
      agriculturist: form.elements.agriculturist.checked,
      tiller: form.elements.tiller.checked,
      includeSeedCost: form.elements.includeSeedCost.checked,
      yearStage: values.yearStage,
      farmingLevel: Number(values.farmingLevel),
      desertUnlocked: form.elements.desertUnlocked.checked,
      greenhouseUnlocked: form.elements.greenhouseUnlocked.checked,
      islandUnlocked: form.elements.islandUnlocked.checked,
      ownedSeeds: parseOwnedSeeds(values.ownedSeeds),
      jarCount: Number(values.jarCount),
      kegCount: Number(values.kegCount),
      includeFertilizerCost: form.elements.includeFertilizerCost.checked,
      ownedFertilizerCount: Number(values.ownedFertilizerCount)
    };
    results.setAttribute("aria-busy", "true");
    results.innerHTML = loading("正在比较可种植作物…");
    try {
      const data = await api("/api/tools/crops/calculate", { method: "POST", body: JSON.stringify(payload) });
      latestData = data;
      initializeDecisionState(data.items);
      renderData(data);
    } catch (error) {
      latestData = null;
      results.innerHTML = errorBox(error.message);
    } finally {
      results.setAttribute("aria-busy", "false");
    }
  }

  const updateLocationFields = () => {
    const seasonal = form.elements.locationMode.value === "seasonal";
    form.elements.startDay.closest(".field").hidden = !seasonal;
    form.elements.planningDays.closest(".field").hidden = seasonal;
  };

  const updateMachineFields = () => {
    const visibility = getMachineFieldVisibility(form.elements.method.value);
    form.querySelector('[data-machine-field="jar"]').hidden = !visibility.jar;
    form.querySelector('[data-machine-field="keg"]').hidden = !visibility.keg;
  };

  form.addEventListener("submit", (event) => { event.preventDefault(); calculate(); });
  form.addEventListener("reset", () => {
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      decisionState = getResetDecisionState();
      advancedConditions.open = decisionState.advancedOpen;
      updateLocationFields();
      updateMachineFields();
      calculate();
    });
  });
  form.elements.locationMode.addEventListener("change", updateLocationFields);
  form.elements.method.addEventListener("change", updateMachineFields);
  updateLocationFields();
  updateMachineFields();
  await calculate();
}
