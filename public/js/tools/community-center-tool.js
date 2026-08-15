import { api, escapeHtml } from "../api.js";
import { routePath } from "../routes.js";
import { uiClass } from "../ui-class.js";
import {
  createProgress,
  exportProgress,
  importProgress,
  loadProgress,
  MAX_IMPORT_BYTES,
  saveProgress,
  STORAGE_KEY
} from "./community-progress.js";
import { calculateCommunityState } from "./community-center-state.js";
import {
  getCommunityScopeSummary,
  resolveCommunityView
} from "./community-center-view-state.js";
import { errorBox, loading, toolHero, toolImage } from "./tool-shell.js";

const seasonNames = { "春季": "春季", "夏季": "夏季", "秋季": "秋季", "冬季": "冬季" };
let activeStorageListener;

function crossLink(item) {
  if (item.fishId) {
    const search = new URLSearchParams({ q: item.name, category: item.fishCategory });
    return `<a class="community-cross-link" href="${routePath("tool", { tool: "fish", search })}">查询捕获条件</a>`;
  }
  if (item.cropId) {
    const search = new URLSearchParams({ crop: item.cropId, season: item.seasons[0] || "春季" });
    return `<a class="community-cross-link" href="${routePath("tool", { tool: "crops", search })}">计算作物收益</a>`;
  }
  return "";
}

export async function renderCommunityCenterTool(app, params = new URLSearchParams()) {
  app.innerHTML = `<main class="shell tool-page community-tool-page">
    ${toolHero("社区中心进度清单", "按房间保存收集包进度，筛选当前季节可取得的物品，并支持本地导入与导出。", "/assets/stardew-ui/hero-community.png", [{ href: routePath("tool", { tool: "fish" }), label: "鱼类条件查询器" }, { href: routePath("tool", { tool: "crops" }), label: "作物收益计算器" }])}
    <section class="${uiClass("card community-dashboard")}" aria-label="社区中心进度工具栏">
      <div class="community-dashboard-section community-percent-wrap">
        <span class="community-dashboard-label">当前范围进度</span>
        <strong id="community-percent">0%</strong>
        <span id="community-scope-progress">0 / 110 项 · 0 / 30 包</span>
        <progress id="community-scope-progress-bar" max="110" value="0">0%</progress>
      </div>
      <div class="community-dashboard-section">
        <span class="community-dashboard-label" id="community-scope-label">范围切换</span>
        <div class="community-scope-switch" role="group" aria-labelledby="community-scope-label">
          <button class="community-scope-button" type="button" data-community-scope="standard" aria-pressed="true">标准路线</button>
          <button class="community-scope-button" type="button" data-community-scope="missing" aria-pressed="false">遗失包</button>
        </div>
      </div>
      <div class="community-dashboard-section community-filter-section">
        <span class="community-dashboard-label">筛选</span>
        <div class="community-filter-group">
          <label><input type="radio" name="community-filter" value="all" checked> 全部</label>
          <label><input type="radio" name="community-filter" value="incomplete"> 未完成</label>
          <label><input type="radio" name="community-filter" value="season"> 当前季节</label>
        </div>
        <div class="community-season-group" hidden>
          <label for="community-season">季节</label>
          <select class="${uiClass("select")}" id="community-season" disabled>${Object.keys(seasonNames).map((season) => `<option>${season}</option>`).join("")}</select>
        </div>
      </div>
      <div class="community-dashboard-section">
        <span class="community-dashboard-label">操作</span>
        <div class="community-action-group">
          <button class="${uiClass("btn secondary")}" id="community-export" type="button">导出进度</button>
          <label class="${uiClass("btn secondary file-button")}" for="community-import">导入进度</label>
          <input id="community-import" type="file" accept="application/json" hidden>
          <button class="${uiClass("btn secondary")}" id="community-reset" type="button">重置</button>
        </div>
      </div>
      <p id="community-storage-status" class="community-storage-status" aria-live="polite"></p>
    </section>
    <section class="${uiClass("card community-room-selector")}" aria-label="房间选择">
      <label for="community-room-select">查看房间</label>
      <select class="${uiClass("select")}" id="community-room-select"><option value="all">全部房间</option></select>
      <span id="community-room-summary" aria-live="polite"></span>
    </section>
    <section id="community-content" class="tool-content">${loading("正在读取收集包…")}</section>
  </main>`;

  const content = app.querySelector("#community-content");
  try {
    const data = await api("/api/tools/community-center");
    const knownIds = new Set(data.knownSlotIds);
    const knownBundleIds = new Set(data.rooms.flatMap((room) => room.bundles.map((bundle) => bundle.id)));
    let progress = loadProgress(localStorage, knownIds);
    let pendingFocus = knownBundleIds.has(params.get("focus")) ? params.get("focus") : null;
    let activeScope = "standard";
    let activeFilter = "all";
    let activeRoomId = null;
    const storageStatus = app.querySelector("#community-storage-status");
    const roomSelect = app.querySelector("#community-room-select");
    const seasonSelect = app.querySelector("#community-season");
    const seasonGroup = app.querySelector(".community-season-group");

    const updateStorageStatus = ({ persistent }) => {
      storageStatus.textContent = persistent
        ? ""
        : "浏览器未能保存进度，本次修改仅在当前页面有效。";
    };

    const persistProgress = () => updateStorageStatus(saveProgress(localStorage, progress));

    const render = ({ restoreSlotId = null, restoreScrollY = null, focusRoom = false } = {}) => {
      const completed = new Set(progress.completedItemIds);
      const summary = calculateCommunityState(data.rooms, progress.completedItemIds);
      const previousRoomId = activeRoomId;
      const view = resolveCommunityView(data.rooms, {
        completedItemIds: progress.completedItemIds,
        summary,
        scope: activeScope,
        roomId: activeRoomId,
        filter: activeFilter,
        season: seasonSelect.value,
        focusBundleId: pendingFocus
      });
      activeScope = view.scope;
      activeFilter = view.filter;
      activeRoomId = view.roomId;

      const scopeSummary = getCommunityScopeSummary(summary, activeScope);
      app.querySelector("#community-percent").textContent = `${scopeSummary.percent}%`;
      app.querySelector("#community-scope-progress").textContent = `${scopeSummary.completedRequiredSlots} / ${scopeSummary.requiredSlots} 项 · ${scopeSummary.completedBundles} / ${scopeSummary.bundles} 包`;
      const scopeProgress = app.querySelector("#community-scope-progress-bar");
      scopeProgress.max = Math.max(scopeSummary.requiredSlots, 1);
      scopeProgress.value = scopeSummary.completedRequiredSlots;
      scopeProgress.textContent = `${scopeSummary.percent}%`;

      app.querySelectorAll("[data-community-scope]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.communityScope === activeScope));
      });
      const activeFilterInput = app.querySelector(`input[name="community-filter"][value="${activeFilter}"]`);
      if (activeFilterInput) activeFilterInput.checked = true;
      const seasonEnabled = activeFilter === "season";
      seasonGroup.hidden = !seasonEnabled;
      seasonSelect.disabled = !seasonEnabled;

      roomSelect.innerHTML = `<option value="all">全部房间</option>${view.visibleRooms
        .map((room) => `<option value="${escapeHtml(room.id)}">${escapeHtml(room.name)}</option>`)
        .join("")}`;
      roomSelect.value = activeRoomId;
      app.querySelector("#community-room-summary").textContent = view.visibleRooms.length
        ? `当前范围共 ${view.visibleRooms.length} 个可见房间`
        : "当前筛选没有可见房间";

      content.innerHTML = view.displayedRooms.map((room) => {
        const bundles = room.bundles.map((bundle) => {
          const bundleState = summary.bundleProgress[bundle.id];
          const bundleClass = `${uiClass("bundle-card card")}${bundleState.isComplete ? " is-complete" : ""}`;
          const bundleStatus = bundleState.isComplete
            ? `<span class="community-complete-status" aria-label="已完成">✓ 已完成</span>`
            : `<span class="community-bundle-count">${bundleState.creditedCount} / ${bundleState.requiredCount}</span>`;
          return `<article class="${bundleClass}" id="${escapeHtml(bundle.id)}" data-community-bundle="${escapeHtml(bundle.id)}" tabindex="-1"><header class="community-bundle-heading"><div><h3>${escapeHtml(bundle.name)}</h3><p>${bundleState.creditedCount} / ${bundleState.requiredCount} 项 · 奖励：${escapeHtml(bundle.reward)}</p></div>${bundleStatus}</header>
            <div class="bundle-items">${bundle.items.map((item) => {
              const slotId = `${bundle.id}:${item.id}`;
              const inputId = `community-slot-${slotId}`;
              const qualityLabel = item.quality
                ? `<span class="item-quality">${escapeHtml(item.quality)}</span>`
                : "";
              return `<div class="bundle-item${completed.has(slotId) ? " completed" : ""}"><input id="${escapeHtml(inputId)}" type="checkbox" data-community-slot="${escapeHtml(slotId)}"${completed.has(slotId) ? " checked" : ""}><label class="community-item-toggle" for="${escapeHtml(inputId)}">${toolImage(item.image, item.name)}<span class="community-item-copy"><strong>${item.quantity > 1 ? `${item.quantity} × ` : ""}${escapeHtml(item.name)}${qualityLabel}</strong><small>${completed.has(slotId) ? "✓ 已收集" : "待收集"}</small></span></label><span class="community-item-source">${escapeHtml(item.seasons.join("、") || "全年")} · ${escapeHtml(item.source || "多种来源")}</span><span class="community-item-link">${crossLink(item)}</span></div>`;
            }).join("")}</div></article>`;
        }).join("");
        const roomState = summary.roomProgress[room.id];
        return `<section class="community-room" data-community-room="${escapeHtml(room.id)}"><div class="room-heading">${toolImage(room.image, room.name)}<div class="community-room-copy"><h2 tabindex="-1" data-community-room-heading="${escapeHtml(room.id)}">${escapeHtml(room.name)}</h2><p>${roomState.creditedCount} / ${roomState.requiredCount} 项 · ${roomState.completedBundles} / ${roomState.totalBundles} 包 · 奖励：${escapeHtml(room.reward)}</p><progress max="${roomState.requiredCount}" value="${roomState.creditedCount}">${roomState.creditedCount} / ${roomState.requiredCount}</progress></div></div><div class="bundle-grid">${bundles}</div></section>`;
      }).join("") || `<div class="${uiClass("empty card community-empty")}"><h2>当前筛选没有待办物品</h2><p>查看全部不会清空已经保存的收集进度。</p><button class="${uiClass("btn secondary")}" type="button" data-community-show-all>查看全部</button></div>`;

      if (pendingFocus) {
        const target = [...content.querySelectorAll("[data-community-bundle]")]
          .find((element) => element.dataset.communityBundle === pendingFocus);
        if (target) {
          pendingFocus = false;
          requestAnimationFrame(() => {
            if (!target.isConnected) return;
            target.focus({ preventScroll: true });
            target.scrollIntoView({ behavior: "smooth", block: "center" });
          });
        }
      } else if (restoreSlotId || focusRoom || (previousRoomId !== null && previousRoomId !== activeRoomId)) {
        requestAnimationFrame(() => {
          if (Number.isFinite(restoreScrollY)) window.scrollTo({ top: restoreScrollY, behavior: "auto" });
          const restoredSlot = restoreSlotId
            ? [...content.querySelectorAll("[data-community-slot]")]
              .find((element) => element.dataset.communitySlot === restoreSlotId)
            : null;
          const roomHeading = activeRoomId === "all"
            ? null
            : [...content.querySelectorAll("[data-community-room-heading]")]
              .find((element) => element.dataset.communityRoomHeading === activeRoomId);
          (restoredSlot || roomHeading || roomSelect).focus({ preventScroll: true });
        });
      }
    };

    app.querySelectorAll("[data-community-scope]").forEach((button) => button.addEventListener("click", () => {
      activeScope = button.dataset.communityScope;
      activeRoomId = null;
      render();
    }));
    app.querySelectorAll('input[name="community-filter"]').forEach((input) => input.addEventListener("change", () => {
      activeFilter = input.value;
      render();
    }));
    seasonSelect.addEventListener("change", () => render());
    roomSelect.addEventListener("change", () => {
      activeRoomId = roomSelect.value;
      render({ focusRoom: activeRoomId !== "all" });
    });
    content.addEventListener("change", (event) => {
      const input = event.target.closest("[data-community-slot]");
      if (!input || !content.contains(input)) return;
      const scrollY = window.scrollY;
      const next = new Set(progress.completedItemIds);
      input.checked ? next.add(input.dataset.communitySlot) : next.delete(input.dataset.communitySlot);
      progress = createProgress([...next]);
      persistProgress();
      render({ restoreSlotId: input.dataset.communitySlot, restoreScrollY: scrollY });
    });
    content.addEventListener("click", (event) => {
      const showAll = event.target.closest("[data-community-show-all]");
      if (!showAll || !content.contains(showAll)) return;
      activeFilter = "all";
      render({ focusRoom: true });
    });
    app.querySelector("#community-export").addEventListener("click", () => {
      const output = exportProgress(progress);
      const link = document.createElement("a");
      const objectUrl = URL.createObjectURL(new Blob([output.text], { type: "application/json" }));
      link.href = objectUrl;
      link.download = output.filename;
      link.click();
      URL.revokeObjectURL(objectUrl);
    });
    app.querySelector("#community-import").addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        if (file.size > MAX_IMPORT_BYTES) {
          throw new Error("进度文件过大，最大允许 256 KiB");
        }
        const imported = importProgress(await file.text(), knownIds);
        if (confirm(`将导入 ${imported.completedItemIds.length} 条进度，是否继续？`)) {
          progress = imported;
          persistProgress();
          render();
        }
      } catch (error) {
        alert(error.message);
      } finally {
        event.target.value = "";
      }
    });
    app.querySelector("#community-reset").addEventListener("click", () => {
      if (!confirm("确定清空本机保存的社区中心进度吗？")) return;
      progress = createProgress([]);
      persistProgress();
      render({ focusRoom: true });
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
