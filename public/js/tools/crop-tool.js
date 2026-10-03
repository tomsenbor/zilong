import { api, escapeHtml } from "../api.js";
import { routePath } from "../routes.js";
import { uiClass } from "../ui-class.js";
import {
  canExpandRanking,
  comparisonScale,
  comparisonTakeaway,
  cropSelectionChoices,
  resolveCropSelection,
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

export function scenarioCards(item) {
  return `<div class="crop-result-grid">${["sell", "jar", "keg"].map((method) => {
    const scenario = item.scenarios[method];
    const detail = method === "sell" ? "全部按原料出售"
      : scenario.supported && scenario.processedInputQuantity === 0
      ? "规划期内未完成加工，全部按原料出售；请核对设备数量和剩余天数。"
      : scenario.supported
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
  ).join("")}</div><details class="crop-number-details"><summary>为什么有些作物不可选？</summary><ul>${(data.excluded || []).map(item => `<li>${escapeHtml(item.name)}：${escapeHtml(item.reason || "不满足当前种植条件")}</li>`).join("")}</ul></details>`;
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
    <span class="crop-ranking-value" data-mobile-label="收获次数">${item.harvests} 次</span><span class="crop-ranking-value" data-mobile-label="整轮成本">${formatGold(item.cost)}</span><span class="crop-ranking-value" data-mobile-label="净利润">${formatGold(item.profit)}</span><span class="crop-ranking-value" data-mobile-label="日均利润">${formatGold(item.dailyProfit)}</span>
    <details><summary>计算过程</summary>${item.steps.map((step) => `<p>${escapeHtml(step)}</p>`).join("")}</details>
  </article>`;
}

const comparisonFields = [
  ["净利润", (item) => formatGold(item.profit)],
  ["日均利润", (item) => formatGold(item.dailyProfit)],
  ["首次投入", (item) => formatGold(item.initialInvestment)],
  ["整轮成本", (item) => formatGold(item.cost)],
  ["收获次数", (item) => `${item.harvests} 次`],
  ["总产量", (item) => `${Number(item.totalYield).toFixed(1)} 个`]
];

function comparisonOptions(items, selectedId) {
  return items.map((item) =>
    `<option value="${escapeHtml(item.id)}"${item.id === selectedId ? " selected" : ""}>${escapeHtml(item.name)}</option>`
  ).join("");
}

export function comparisonCharts(left, right) {
  const fields = [["profit", "预计净赚", "越多收益越高", formatGold], ["cost", "整轮费用", "越少越省钱", formatGold], ["harvests", "收获次数", "次数不代表利润高低", n => `${n} 次`], ["totalYield", "总产量", "预计数量，不同作物单价不同", n => `${Number(n).toFixed(1)} 个`]];
  return `<div class="crop-chart-grid">${fields.map(([key, label, hint, format]) => {
    const scale = comparisonScale(left[key], right[key]);
    return `<section class="crop-chart"><h3>${label}</h3><p>${hint}</p>${[left, right].map((item, index) => `<div class="crop-chart-series"><div><span class="crop-series-${index}">${escapeHtml(item.name)}</span><strong>${escapeHtml(format(item[key]))}</strong></div><svg viewBox="-1 0 102 12" preserveAspectRatio="none" aria-hidden="true"><rect class="crop-chart-track" x="0" y="2" width="100" height="8" rx="1"/><rect class="crop-bar-${index}" x="${scale.bars[index].x}" y="2" width="${scale.bars[index].width}" height="8" rx="1"/><line class="crop-chart-zero" x1="${scale.zero}" x2="${scale.zero}" y1="0" y2="12"/></svg></div>`).join("")}<div class="crop-chart-scale"><span>${escapeHtml(format(scale.min))}</span><span>${escapeHtml(format(scale.max))}</span></div></section>`;
  }).join("")}</div><p class="crop-comparison-takeaway">${escapeHtml(comparisonTakeaway(left, right))}</p><p class="crop-chart-note">各维度独立刻度；亏损向零线左侧显示。两种作物使用相同输入条件，实际种植数量可能受预算限制。</p>`;
}

function comparisonMarkup(items, leftId, rightId) {
  const comparison = resolveComparison(items, leftId, rightId);
  if (!comparison.available) return "";

  const comparisonBody = comparison.error ? "" : `${comparisonCharts(comparison.left, comparison.right)}<details class="crop-number-details"><summary>查看详细数字（含首次投入、日均利润）</summary><div class="crop-comparison-table" role="table" aria-label="双作物收益对比">
    <div class="crop-comparison-row crop-comparison-head" role="row"><span role="columnheader">指标</span><strong role="columnheader">${escapeHtml(comparison.left.name)}</strong><strong role="columnheader">${escapeHtml(comparison.right.name)}</strong></div>
    ${comparisonFields.map(([label, formatter]) => `<div class="crop-comparison-row" role="row"><span role="rowheader">${label}</span><b role="cell">${escapeHtml(formatter(comparison.left))}</b><b role="cell">${escapeHtml(formatter(comparison.right))}</b></div>`).join("")}
  </div></details>`;

  return `<section class="crop-comparison" aria-labelledby="crop-comparison-title">
    <div class="crop-comparison-heading"><h2 id="crop-comparison-title">双作物对比</h2><p>选两种作物，看收益与投入的差别。</p></div>
    <div class="crop-comparison-selects">
      <div class="field crop-comparison-select"><label for="crop-compare-left">作物一</label><select class="${uiClass("select")}" id="crop-compare-left">${comparisonOptions(items, comparison.left.id)}</select></div>
      <div class="field crop-comparison-select"><label for="crop-compare-right">作物二</label><select class="${uiClass("select")}" id="crop-compare-right">${comparisonOptions(items, comparison.right.id)}</select></div>
    </div>
    <p class="crop-comparison-error" role="status"${comparison.error ? "" : " hidden"}>${escapeHtml(comparison.error)}</p>
    ${comparison.error ? "" : `<div class="crop-chart-legend"><span>${toolImage(comparison.left.image, comparison.left.name)}${escapeHtml(comparison.left.name)}（绿色）</span><span>${toolImage(comparison.right.image, comparison.right.name)}${escapeHtml(comparison.right.name)}（金色）</span></div>`}
    ${comparisonBody}
  </section>`;
}

export async function renderCropTool(app, params = new URLSearchParams()) {
  app.innerHTML = `<main class="shell tool-page crop-tool-page">
    ${toolHero("作物收益计算器", "综合季节剩余天数、地块、预算、职业、肥料和加工方式，比较可执行的净利润。", "", [{ href: routePath("tool", { tool: "fish" }), label: "鱼类条件查询器" }, { href: routePath("tool", { tool: "community-center" }), label: "社区中心清单" }])}
    <div class="crop-workbench">
    <form id="crop-calculator-form" class="${uiClass("card tool-form-card crop-form")}">
      <section id="crop-basic-conditions" class="crop-condition-section" aria-labelledby="crop-basic-title">
        <div class="crop-condition-heading"><h2 id="crop-basic-title">基础条件</h2><p>先填写影响本次种植决策的必要条件。</p></div>
        <div class="crop-basic-grid">
          <div class="field crop-choice-field"><label for="crop-choice">作物</label><select class="${uiClass("select")}" id="crop-choice" name="crop" aria-describedby="crop-choice-help"><option value="">全部作物（自动推荐）</option>${params.get("crop") ? `<option value="${escapeHtml(params.get("crop"))}" selected>${escapeHtml(params.get("crop"))}</option>` : ""}</select><small id="crop-choice-help">可指定一种作物；修改条件后点击“开始计算”。</small></div>
          <div class="field"><label for="crop-season">季节</label><select class="${uiClass("select")}" id="crop-season" name="season">${seasons.map((value) => `<option${params.get("season") === value ? " selected" : ""}>${value}</option>`).join("")}</select></div>
          <div class="field"><label for="crop-location">种植地点</label><select class="${uiClass("select")}" id="crop-location" name="locationMode"><option value="seasonal">普通农田</option><option value="greenhouse">温室</option><option value="island">姜岛农场</option></select></div>
          <div class="field"><label for="crop-start-day">开始日期</label><input class="${uiClass("input")}" id="crop-start-day" name="startDay" type="number" min="1" max="28" value="${escapeHtml(params.get("startDay") || "1")}"></div>
          <div class="field"><label for="crop-planning-days">规划天数</label><input class="${uiClass("input")}" id="crop-planning-days" name="planningDays" type="number" min="1" max="365" value="${escapeHtml(params.get("planningDays") || "28")}"></div>
          <div class="field"><label for="crop-plots">地块数量</label><input class="${uiClass("input")}" id="crop-plots" name="plots" type="number" min="1" max="9999" value="${escapeHtml(params.get("plots") || "100")}"></div>
          <div class="field"><label for="crop-budget">可用预算（选填）</label><input class="${uiClass("input")}" id="crop-budget" name="budget" type="number" min="0" value="${escapeHtml(params.get("budget") ?? "")}" aria-describedby="crop-budget-help"><small id="crop-budget-help">留空不限制采购费用；填写则限制整轮投入，不计卖出后再投资。</small></div>
          <div class="field"><label for="crop-method">出售方式</label><select class="${uiClass("select")}" id="crop-method" name="method"><option value="sell">直接出售</option><option value="jar">罐头瓶</option><option value="keg">小桶</option></select></div>
          <div class="field crop-machine-field" data-machine-field="jar" hidden><label for="crop-jar-count">罐头瓶数量</label><input class="${uiClass("input")}" id="crop-jar-count" name="jarCount" type="number" min="0" max="9999" value="0"></div>
          <div class="field crop-machine-field" data-machine-field="keg" hidden><label for="crop-keg-count">小桶数量</label><input class="${uiClass("input")}" id="crop-keg-count" name="kegCount" type="number" min="0" max="9999" value="0"></div>
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
    </div>
    <section id="crop-comparisons" aria-label="作物对比与排行"></section>
  </main>`;

  const form = app.querySelector("#crop-calculator-form");
  const results = app.querySelector("#crop-results");
  const comparisons = app.querySelector("#crop-comparisons");
  const advancedConditions = app.querySelector("#crop-advanced-conditions");
  let latestData = null;
  let resultInput = null;
  let calculationRequest = 0;
  let resetTimer = null;
  let decisionState = getResetDecisionState();

  const initializeDecisionState = (items) => {
    const focused = items.find((item) => item.id === resultInput?.crop);
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
    comparisons.querySelector("#crop-ranking-toggle")?.addEventListener("click", () => {
      decisionState.rankingExpanded = !decisionState.rankingExpanded;
      renderData(latestData);
    });
    comparisons.querySelector("#crop-compare-left")?.addEventListener("change", (event) => {
      decisionState.comparisonLeftId = event.currentTarget.value;
      renderData(latestData);
    });
    comparisons.querySelector("#crop-compare-right")?.addEventListener("change", (event) => {
      decisionState.comparisonRightId = event.currentTarget.value;
      renderData(latestData);
    });
  };

  const renderData = (data) => {
    if (!data) return;
    const cropChoice = form.elements.crop;
    const currentChoice = cropChoice.value;
    const choices = cropSelectionChoices(data);
    if (currentChoice && !choices.some(item => item.id === currentChoice)) choices.push({ id: currentChoice, name: currentChoice });
    cropChoice.innerHTML = `<option value="">全部作物（自动推荐）</option>${comparisonOptions(choices, currentChoice)}`;
    const selection = resolveCropSelection(data, resultInput?.crop);
    const selected = selection.item;

    const rankingItems = selectRankingItems(data.items, decisionState.rankingExpanded);
    const hasRankingToggle = canExpandRanking(data.items);
    const rankingToggle = hasRankingToggle
      ? `<button class="${uiClass("btn secondary")}" id="crop-ranking-toggle" type="button" aria-expanded="${decisionState.rankingExpanded}">${decisionState.rankingExpanded ? "收起到前5项" : `查看全部 ${data.items.length} 项`}</button>`
      : "";

    const method = resultInput?.method || "sell";
    if (!selected) {
      results.innerHTML = `<div class="${uiClass("empty card")}" role="status"><h2>${selection.name ? `${escapeHtml(selection.name)}：当前条件不可执行` : "没有可执行的种植方案"}</h2><p>${escapeHtml(selection.reason || "请检查预算、日期，以及高级条件中的地点解锁和已有种子。")}</p></div>${availabilityGroups(data)}`;
    } else {
    const scenario = selected.scenarios[method];
    results.innerHTML = `<div class="crop-answer ${uiClass("card")}"><div class="crop-answer-heading">${toolImage(selected.image, selected.name)}<div><span>当前方案 · ${scenarioLabels[method]}</span><h2>${escapeHtml(selected.name)}</h2></div></div><p>实际种植 ${selected.plantedTiles} 格，收获 ${selected.harvests} 次，预计共 ${selected.totalYield.toFixed(1)} 个。</p><div class="crop-profit-focus"><span>${selected.profit < 0 ? "预计亏损" : "预计净赚"}</span><strong>${formatGold(Math.abs(selected.profit))}</strong></div><p class="crop-cost-equation">卖出收入 ${formatGold(selected.revenue)} − 整轮费用 ${formatGold(selected.cost)} = 净赚 ${formatGold(selected.profit)}</p><p>首次需投入 <strong>${formatGold(selected.initialInvestment)}</strong>，后续采购 ${formatGold(selected.cost - selected.initialInvestment)}。</p><p class="crop-chart-note">费用仅包含已勾选计费的种子、肥料，不含设备造价。</p>${method !== "sell" ? `<p>完成加工 ${scenario.processedInputQuantity.toFixed(1)} 个，剩余原料 ${scenario.remainingRawQuantity.toFixed(1)} 个按原料价计入收入。${scenario.inProcessQuantity ? "期末仍在加工的产品未按成品结算。" : ""}</p>` : ""}</div>
      <details class="crop-number-details"><summary>查看计算明细与其他出售方式</summary>
      <div class="crop-result-grid">
        ${metric("净利润", formatGold(selected.profit), selected.name)}
        ${metric("日均利润", formatGold(selected.dailyProfit), "按有效规划天数")}
        ${metric("首次投入", formatGold(selected.initialInvestment), `整轮成本 ${formatGold(selected.cost)}；${selected.plantedTiles} 格实际种植。仅计已勾选的种子、肥料费用，不含设备造价。`)}
        ${metric("收获次数", `${selected.harvests} 次`, `预计产出 ${selected.totalYield.toFixed(1)} 个`)}
      </div>
      ${scenarioCards(selected)}
      ${selected.steps.map(step => `<p>${escapeHtml(step)}</p>`).join("")}</details>
      ${availabilityGroups(data)}`;
    }
    const period = resultInput.locationMode === "seasonal" ? `${resultInput.season}第 ${resultInput.startDay} 天至季末` : `${resultInput.planningDays} 天`;
    results.insertAdjacentHTML("afterbegin", `<p class="crop-chart-note">本次结果：${escapeHtml(period)} · ${escapeHtml({ seasonal: "普通农田", greenhouse: "温室", island: "姜岛农场" }[resultInput.locationMode])} · ${scenarioLabels[method]}。修改条件后请重新计算。</p>`);
    comparisons.innerHTML = `
      ${comparisonMarkup(data.items, decisionState.comparisonLeftId, decisionState.comparisonRightId)}
      <div class="${uiClass("result-summary card")}"><strong>全部可执行作物净利润排行</strong><span>共 ${data.items.length} 个可执行方案</span></div>
      <div class="crop-ranking"><div class="crop-ranking-head"><span>作物</span><span>收获</span><span>整轮成本</span><span>净利润</span><span>日均利润</span><span>详情</span></div>${rankingItems.map(resultRow).join("")}</div>
      ${rankingToggle ? `<div class="crop-ranking-actions">${rankingToggle}</div>` : ""}`;
    attachDecisionEvents();
  };

  async function calculate() {
    const request = ++calculationRequest;
    const { crop, ...values } = Object.fromEntries(new FormData(form));
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
    comparisons.innerHTML = "";
    results.innerHTML = loading("正在比较可种植作物…");
    try {
      const data = await api("/api/tools/crops/calculate", { method: "POST", body: JSON.stringify(payload) });
      if (request !== calculationRequest) return;
      latestData = data;
      resultInput = { ...payload, crop };
      initializeDecisionState(data.items);
      renderData(data);
    } catch (error) {
      if (request !== calculationRequest) return;
      latestData = null;
      results.innerHTML = errorBox(error.message);
    } finally {
      if (request === calculationRequest) results.setAttribute("aria-busy", "false");
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
      form.elements.crop.value = "";
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
