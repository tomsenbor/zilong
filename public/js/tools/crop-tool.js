import { api, escapeHtml } from "../api.js";
import { routePath } from "../routes.js";
import { uiClass } from "../ui-class.js";
import { errorBox, formatGold, loading, toolHero, toolImage } from "./tool-shell.js";

const seasons = ["春季", "夏季", "秋季", "冬季"];

const metric = (label, value, note) =>
  `<article class="${uiClass("crop-result-card card")}"><span>${label}</span><strong>${value}</strong><small>${escapeHtml(note)}</small></article>`;

function resultRow(item) {
  return `<article class="crop-ranking-row">
    <div class="crop-name">${toolImage(item.image, item.name)}<div class="crop-name-copy"><strong class="crop-name-main">${escapeHtml(item.name)}</strong><small class="crop-harvest-note">收获：${item.harvestDays.join("、")} 日</small></div></div>
    <span class="crop-ranking-value" data-mobile-label="收获次数">${item.harvests} 次</span><span class="crop-ranking-value" data-mobile-label="启动成本">${formatGold(item.cost)}</span><span class="crop-ranking-value" data-mobile-label="净利润">${formatGold(item.profit)}</span><span class="crop-ranking-value" data-mobile-label="日均利润">${formatGold(item.dailyProfit)}</span>
    <details><summary>计算过程</summary>${item.steps.map((step) => `<p>${escapeHtml(step)}</p>`).join("")}</details>
  </article>`;
}

export async function renderCropTool(app, params = new URLSearchParams()) {
  app.innerHTML = `<main class="shell tool-page">
    ${toolHero("作物收益计算器", "综合季节剩余天数、地块、预算、职业、肥料和加工方式，比较可执行的净利润。", "", [{ href: routePath("tool", { tool: "fish" }), label: "鱼类条件查询器" }, { href: routePath("tool", { tool: "community-center" }), label: "社区中心清单" }])}
    <form id="crop-calculator-form" class="${uiClass("card tool-form-card crop-form")}">
      <div class="field"><label for="crop-season">季节</label><select class="${uiClass("select")}" id="crop-season" name="season">${seasons.map((value) => `<option${params.get("season") === value ? " selected" : ""}>${value}</option>`).join("")}</select></div>
      <div class="field"><label for="crop-start-day">开始日期</label><input class="${uiClass("input")}" id="crop-start-day" name="startDay" type="number" min="1" max="28" value="${escapeHtml(params.get("startDay") || "1")}"></div>
      <div class="field"><label for="crop-planning-days">规划天数</label><input class="${uiClass("input")}" id="crop-planning-days" name="planningDays" type="number" min="1" max="365" value="${escapeHtml(params.get("planningDays") || "28")}"></div>
      <div class="field"><label for="crop-plots">地块数量</label><input class="${uiClass("input")}" id="crop-plots" name="plots" type="number" min="1" max="9999" value="${escapeHtml(params.get("plots") || "100")}"></div>
      <div class="field"><label for="crop-budget">可用预算</label><input class="${uiClass("input")}" id="crop-budget" name="budget" type="number" min="0" value="${escapeHtml(params.get("budget") || "10000")}"></div>
      <div class="field"><label for="crop-fertilizer">生长肥料</label><select class="${uiClass("select")}" id="crop-fertilizer" name="fertilizer"><option value="none">不使用</option><option value="speed-gro">生长激素</option><option value="deluxe-speed-gro">高级生长激素</option><option value="hyper-speed-gro">顶级生长激素</option></select></div>
      <label class="check-field"><input name="agriculturist" type="checkbox"> 农业学家（生长速度 +10%）</label>
      <label class="check-field"><input name="tiller" type="checkbox"> 农耕人（原作物售价 +10%）</label>
      <div class="field"><label for="crop-method">出售方式</label><select class="${uiClass("select")}" id="crop-method" name="method"><option value="sell">直接出售</option><option value="jar">罐头瓶</option><option value="keg">小桶</option></select></div>
      <div class="field"><label for="crop-location">种植地点</label><select class="${uiClass("select")}" id="crop-location" name="locationMode"><option value="seasonal">普通农田</option><option value="greenhouse">温室</option><option value="island">姜岛农场</option></select></div>
      <label class="check-field"><input name="includeSeedCost" type="checkbox" checked> 计入种子成本</label>
      <div class="tool-actions"><button class="${uiClass("btn primary")}" type="submit">开始计算</button><button class="${uiClass("btn secondary")}" type="reset">恢复默认</button></div>
    </form>
    <section id="crop-results" class="tool-content">${loading("正在核算全部作物收益…")}</section>
  </main>`;

  const form = app.querySelector("#crop-calculator-form");
  const results = app.querySelector("#crop-results");
  const focusCrop = params.get("crop");

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
      includeSeedCost: form.elements.includeSeedCost.checked
    };
    results.innerHTML = loading("正在比较可种植作物…");
    try {
      const data = await api("/api/tools/crops/calculate", { method: "POST", body: JSON.stringify(payload) });
      const selected = data.items.find((item) => item.id === focusCrop) || data.highlights.bestProfit;
      results.innerHTML = selected ? `
        <div class="crop-result-grid">
          ${metric("净利润", formatGold(selected.profit), selected.name)}
          ${metric("日均利润", formatGold(selected.dailyProfit), "按有效规划天数")}
          ${metric("启动成本", formatGold(selected.cost), `${selected.plantedTiles} 格实际种植`)}
          ${metric("收获次数", `${selected.harvests} 次`, `预计产出 ${selected.totalYield.toFixed(1)} 个`)}
        </div>
        <div class="${uiClass("result-summary card")}"><strong>${focusCrop && selected.id === focusCrop ? `已定位：${escapeHtml(selected.name)}` : "作物净利润排行"}</strong><span>共 ${data.items.length} 个可执行方案</span></div>
        <div class="crop-ranking"><div class="crop-ranking-head"><span>作物</span><span>收获</span><span>启动成本</span><span>净利润</span><span>日均利润</span><span>详情</span></div>${data.items.map(resultRow).join("")}</div>`
        : `<div class="${uiClass("empty card")}"><h2>没有可执行的种植方案</h2><p>请增加预算、减少地块，或调整季节和开始日期。</p></div>`;
    } catch (error) {
      results.innerHTML = errorBox(error.message);
    }
  }

  const updateLocationFields = () => {
    const seasonal = form.elements.locationMode.value === "seasonal";
    form.elements.startDay.closest(".field").hidden = !seasonal;
    form.elements.planningDays.closest(".field").hidden = seasonal;
  };
  form.addEventListener("submit", (event) => { event.preventDefault(); calculate(); });
  form.addEventListener("reset", () => setTimeout(() => { updateLocationFields(); calculate(); }));
  form.elements.locationMode.addEventListener("change", updateLocationFields);
  updateLocationFields();
  await calculate();
}
