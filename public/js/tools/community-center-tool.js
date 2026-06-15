import { api, escapeHtml } from "../api.js";
import { routePath } from "../routes.js";
import { uiClass } from "../ui-class.js";
import { createProgress, exportProgress, importProgress, loadProgress, saveProgress, STORAGE_KEY } from "./community-progress.js";
import { errorBox, loading, toolHero, toolImage } from "./tool-shell.js";

const seasonNames = { "春季": "春季", "夏季": "夏季", "秋季": "秋季", "冬季": "冬季" };
let activeStorageListener;

function totals(rooms, completed) {
  let done = 0;
  let required = 0;
  const byRoom = {};
  rooms.forEach((room) => {
    let roomDone = 0;
    let roomRequired = 0;
    room.bundles.forEach((bundle) => {
      const count = bundle.requiredCount || bundle.items.length;
      roomRequired += count;
      roomDone += Math.min(count, bundle.items.filter((item) => completed.has(`${bundle.id}:${item.id}`)).length);
    });
    done += roomDone;
    required += roomRequired;
    byRoom[room.id] = { done: roomDone, required: roomRequired };
  });
  return { done, required, percent: required ? Math.round(done / required * 100) : 0, byRoom };
}

function crossLink(room, item) {
  if (room.id === "fish-tank") return `<a href="${routePath("tool", { tool: "fish", search: new URLSearchParams({ q: item.name }) })}">查询捕获条件</a>`;
  if (room.id === "pantry") return `<a href="${routePath("tool", { tool: "crops", search: new URLSearchParams({ crop: item.id, season: item.seasons[0] || "春季" }) })}">计算作物收益</a>`;
  return "";
}

export async function renderCommunityCenterTool(app, params = new URLSearchParams()) {
  app.innerHTML = `<main class="shell tool-page community-tool-page">
    ${toolHero("社区中心进度清单", "按房间保存收集包进度，筛选当前季节可取得的物品，并支持本地导入与导出。", "/assets/stardew-ui/hero-community.png", [{ href: routePath("tool", { tool: "fish" }), label: "鱼类条件查询器" }, { href: routePath("tool", { tool: "crops" }), label: "作物收益计算器" }])}
    <section class="${uiClass("card community-dashboard")}">
      <div class="community-percent-wrap"><strong id="community-percent">0%</strong><span>总进度</span></div>
      <div class="community-controls">
        <div class="community-filter-group">
          <label><input type="radio" name="community-filter" value="all" checked> 全部</label>
          <label><input type="radio" name="community-filter" value="incomplete"> 未完成</label>
          <label><input type="radio" name="community-filter" value="season"> 当前季节</label>
        </div>
        <div class="community-season-group">
          <label for="community-season">季节</label>
          <select class="${uiClass("select")}" id="community-season">${Object.keys(seasonNames).map((season) => `<option>${season}</option>`).join("")}</select>
        </div>
        <div class="community-action-group">
          <button class="${uiClass("btn secondary")}" id="community-export" type="button">导出进度</button>
          <label class="${uiClass("btn secondary file-button")}" for="community-import">导入进度</label>
          <input id="community-import" type="file" accept="application/json" hidden>
          <button class="${uiClass("btn secondary")}" id="community-reset" type="button">重置</button>
        </div>
      </div>
    </section>
    <section id="community-content" class="tool-content">${loading("正在读取收集包…")}</section>
  </main>`;

  const content = app.querySelector("#community-content");
  try {
    const data = await api("/api/tools/community-center");
    const knownIds = new Set(data.knownSlotIds);
    let progress = loadProgress(localStorage, knownIds);

    const render = () => {
      const completed = new Set(progress.completedItemIds);
      const summary = totals(data.rooms, completed);
      const filter = app.querySelector('input[name="community-filter"]:checked').value;
      const season = app.querySelector("#community-season").value;
      app.querySelector("#community-percent").textContent = `${summary.percent}%`;
      content.innerHTML = data.rooms.map((room) => {
        const bundles = room.bundles.map((bundle) => {
          const visibleItems = bundle.items.filter((item) => {
            const checked = completed.has(`${bundle.id}:${item.id}`);
            if (filter === "incomplete") return !checked;
            if (filter === "season") return !item.seasons.length || item.seasons.includes(season);
            return true;
          });
          if (!visibleItems.length && filter !== "all") return "";
          const bundleDone = bundle.items.filter((item) => completed.has(`${bundle.id}:${item.id}`)).length;
          return `<article class="${uiClass("bundle-card card")}" id="${escapeHtml(bundle.id)}"><header><div><h3>${escapeHtml(bundle.name)}</h3><p>${Math.min(bundleDone, bundle.requiredCount)} / ${bundle.requiredCount} 项 · 奖励：${escapeHtml(bundle.reward)}</p></div></header>
            <div class="bundle-items">${visibleItems.map((item) => {
              const slotId = `${bundle.id}:${item.id}`;
              const qualityLabel = item.quality
                ? `<span class="item-quality">${escapeHtml(item.quality)}</span>`
                : "";
              return `<label class="bundle-item${completed.has(slotId) ? " completed" : ""}"><input type="checkbox" data-community-slot="${escapeHtml(slotId)}"${completed.has(slotId) ? " checked" : ""}>${toolImage(item.image, item.name)}<span><strong>${item.quantity > 1 ? `${item.quantity} × ` : ""}${escapeHtml(item.name)}${qualityLabel}</strong><small>${escapeHtml(item.seasons.join("、") || "全年")} · ${escapeHtml(item.source || "多种来源")}</small>${crossLink(room, item)}</span></label>`;
            }).join("")}</div></article>`;
        }).join("");
        if (!bundles && filter !== "all") return "";
        const roomTotal = summary.byRoom[room.id];
        return `<section class="community-room"><div class="room-heading">${toolImage(room.image, room.name)}<div><h2>${escapeHtml(room.name)}</h2><p>${roomTotal.done} / ${roomTotal.required} 项完成 · ${escapeHtml(room.reward)}</p></div></div><div class="bundle-grid">${bundles}</div></section>`;
      }).join("") || `<div class="${uiClass("empty card")}"><h2>当前筛选没有待办物品</h2><p>切换筛选条件继续查看。</p></div>`;

      content.querySelectorAll("[data-community-slot]").forEach((input) => input.addEventListener("change", () => {
        const next = new Set(progress.completedItemIds);
        input.checked ? next.add(input.dataset.communitySlot) : next.delete(input.dataset.communitySlot);
        progress = createProgress([...next]);
        saveProgress(localStorage, progress);
        render();
      }));
      const focus = params.get("focus");
      if (focus) requestAnimationFrame(() => document.getElementById(focus)?.scrollIntoView({ behavior: "smooth", block: "center" }));
    };

    app.querySelectorAll('input[name="community-filter"]').forEach((input) => input.addEventListener("change", render));
    app.querySelector("#community-season").addEventListener("change", render);
    app.querySelector("#community-export").addEventListener("click", () => {
      const output = exportProgress(progress);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([output.text], { type: "application/json" }));
      link.download = output.filename;
      link.click();
      URL.revokeObjectURL(link.href);
    });
    app.querySelector("#community-import").addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const imported = importProgress(await file.text(), knownIds);
        if (confirm(`将导入 ${imported.completedItemIds.length} 条进度，是否继续？`)) {
          progress = imported;
          saveProgress(localStorage, progress);
          render();
        }
      } catch (error) {
        alert(error.message);
      }
      event.target.value = "";
    });
    app.querySelector("#community-reset").addEventListener("click", () => {
      if (!confirm("确定清空本机保存的社区中心进度吗？")) return;
      progress = createProgress([]);
      saveProgress(localStorage, progress);
      render();
    });
    if (activeStorageListener) window.removeEventListener("storage", activeStorageListener);
    activeStorageListener = (event) => {
      if (event.key !== STORAGE_KEY) return;
      progress = loadProgress(localStorage, knownIds);
      render();
    };
    window.addEventListener("storage", activeStorageListener);
    render();
  } catch (error) {
    content.innerHTML = errorBox(error.message);
  }
}
