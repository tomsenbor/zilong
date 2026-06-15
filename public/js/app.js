import { api, escapeHtml, imageFallback } from "./api.js";
import { createArticleOutline, estimateReadingMinutes } from "./article-layout.js";
import { renderFishTool } from "./tools/fish-tool.js";
import { renderCropTool } from "./tools/crop-tool.js";
import { renderCommunityCenterTool } from "./tools/community-center-tool.js";
import { PageHeader, PageHero, SiteFooter, SiteHeader } from "./components/site-components.js";
import { t } from "./i18n.js";
import {
  canonicalPathForRoute,
  hreflangCandidates,
  navigateTo,
  parseAppRoute,
  routePath
} from "./routes.js";
import {
  renderCategoryOverview,
  renderHomeView,
  renderItemDialog,
  renderLibrarySidebar
} from "./site-view.js";
import { uiClass } from "./ui-class.js";

const app = document.querySelector("#app");
const fieldLabels = { season: "季节", days: "成熟", sellPrice: "售价", source: "来源", location: "地点", weather: "天气", time: "时间", birthday: "生日", address: "住址", loves: "最爱礼物", ingredients: "材料", energy: "能量", type: "类型", skill: "技能", level: "等级", effect: "效果", reward: "奖励", date: "日期", area: "区域", open: "开放", features: "特色" };
const state = { datasets: [], page: 1, pageSize: 20, dataset: "crops", filters: {}, view: "card" };
let articleObserver;

function ensurePublicBodyClass() {
  document.body.classList.add("public-site", "site");
}

function mountSiteChrome() {
  document.querySelector("#site-header-root").innerHTML = SiteHeader();
  document.querySelector("#site-footer-root").innerHTML = SiteFooter();
  syncPublicAdminEntry();

  const siteHeader = document.querySelector("#site-header");
  const menuButton = document.querySelector("#menu-button");
  const searchToggle = document.querySelector("#search-toggle");
  const globalSearch = document.querySelector("#global-search");

  menuButton.addEventListener("click", () => {
    const isOpen = siteHeader.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
  searchToggle.addEventListener("click", () => {
    globalSearch.hidden = !globalSearch.hidden;
    searchToggle.setAttribute("aria-expanded", String(!globalSearch.hidden));
    if (!globalSearch.hidden) document.querySelector("#global-search-input").focus();
  });
  globalSearch.addEventListener("submit", (event) => {
    event.preventDefault();
    navigateTo(routePath("search", { q: new FormData(event.currentTarget).get("q") }));
    globalSearch.hidden = true;
    searchToggle.setAttribute("aria-expanded", "false");
  });

  return { siteHeader, menuButton, searchToggle, globalSearch };
}

function isDevelopmentHost(hostname = location.hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname.endsWith(".local");
}

async function syncPublicAdminEntry() {
  const entries = [...document.querySelectorAll("[data-dev-only-admin]")];
  if (!entries.length) return;
  const isDev = isDevelopmentHost();
  entries.forEach((entry) => {
    entry.hidden = !isDev;
  });
  if (isDev) return;
  try {
    await api("/api/admin/auth/session");
    entries.forEach((entry) => {
      entry.hidden = false;
    });
  } catch {
    entries.forEach((entry) => {
      entry.hidden = true;
    });
  }
}

ensurePublicBodyClass();
const siteChrome = mountSiteChrome();
bindInternalNavigation();

function updateActiveNavigation(routeName) {
  const activeRoute = routeName === "guide" || routeName === "guides"
    ? "articles"
    : routeName === "wiki" || routeName === "wikiDataset" || routeName === "wikiEntry"
      ? "library"
      : routeName === "tool"
        ? "tools"
        : routeName;
  document.querySelectorAll("[data-nav-route]").forEach((link) => {
    const isActive = link.dataset.navRoute === activeRoute;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function updateRouteChrome(routeName) {
  const isHome = routeName === "home" || !routeName;
  siteChrome.searchToggle.hidden = isHome;
  if (isHome) {
    siteChrome.globalSearch.hidden = true;
    siteChrome.searchToggle.setAttribute("aria-expanded", "false");
  }
}
document.addEventListener("error", (event) => {
  const target = event.target;
  if (target instanceof HTMLImageElement && target.dataset.fallback && target.src !== new URL(target.dataset.fallback, location.href).href) {
    target.src = target.dataset.fallback;
  }
}, true);

function img(src, alt, className = "pixel-icon") {
  return `<img class="${escapeHtml(uiClass(className))}" src="${escapeHtml(src || imageFallback)}" alt="${escapeHtml(alt)}" data-fallback="${imageFallback}">`;
}

function updateSeo(route) {
  const canonicalHref = new URL(canonicalPathForRoute(route), location.origin).href;
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = canonicalHref;
  document.querySelectorAll('link[data-hreflang-route]').forEach((element) => element.remove());
  hreflangCandidates(route)
    .filter((candidate) => candidate.available)
    .forEach((candidate) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = candidate.hreflang;
      link.href = new URL(candidate.href, location.origin).href;
      link.dataset.hreflangRoute = "true";
      document.head.append(link);
    });
}

function notFoundView(message, locale = "zh") {
  app.innerHTML = `<div class="shell section"><div class="${uiClass("card empty")}">
    <h1>${escapeHtml(t("notFoundTitle", locale))}</h1>
    <p>${escapeHtml(message || t("notFoundDescription", locale))}</p>
    <a class="${uiClass("btn primary")}" href="${routePath("home")}">${escapeHtml(t("homeLink", locale))}</a>
  </div></div>`;
}

function errorView(error, locale = "zh") {
  const status = error.status || error.cause?.status;
  if (status === 404) {
    notFoundView(error.message, locale);
    return;
  }
  app.innerHTML = `<div class="shell section"><div class="${uiClass("card empty")}">
    <h2>${escapeHtml(t("loadFailedTitle", locale))}</h2>
    <p>${escapeHtml(error.message)}</p>
    <a class="${uiClass("btn primary")}" href="${routePath("home")}">${escapeHtml(t("homeLink", locale))}</a>
  </div></div>`;
}

function bindInternalNavigation() {
  document.addEventListener("click", (event) => {
    const anchor = event.target.closest?.("a[href]");
    if (!anchor || event.defaultPrevented || anchor.target || anchor.hasAttribute("download")) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/") || url.pathname.startsWith("/assets/") || url.pathname.startsWith("/uploads/")) return;
    event.preventDefault();
    navigateTo(`${url.pathname}${url.search}`);
  });
}

function queryFromObject(values) {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  return query;
}

async function loadDatasets() {
  if (!state.datasets.length) state.datasets = (await api("/api/datasets")).items;
  return state.datasets;
}

async function home() {
  const [stats, datasets, articles] = await Promise.all([api("/api/stats"), api("/api/datasets"), api("/api/articles?featured=true&pageSize=6")]);
  state.datasets = datasets.items;
  app.innerHTML = renderHomeView({
    stats,
    datasets: datasets.items,
    articles: articles.items
  });
  bindHomeSearch();
}

function bindHomeSearch() {
  const form = app.querySelector("[data-home-search]");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = String(new FormData(form).get("q") || "").trim();
    navigateTo(query ? routePath("search", { q: query }) : routePath("wiki"));
  });
}

function articleLabel(item) {
  const categoryName = item.categories?.[0]?.name;
  if (categoryName) return categoryName;
  const title = item.title || "";
  if (/收益|赚钱|利润/.test(title)) return "收益";
  if (/问题|FAQ|常见/.test(title)) return "FAQ";
  if (/精通|姜岛|温室|高级|进阶/.test(title)) return "进阶";
  return "新手";
}

function articleCard(item) {
  const label = articleLabel(item);
  return `<a class="${uiClass("article-card card")}" href="${routePath("guide", { slug: item.slug })}">
    <div class="article-cover">${img(item.cover_image || imageFallback, item.title)}</div>
    <div class="article-body">
      <span class="article-tag">${escapeHtml(label)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <span class="meta">更新于 ${item.updated_at.slice(0, 10)}</span>
    </div>
  </a>`;
}

async function library(params, options = {}) {
  await loadDatasets();
  const requestedDataset = params.get("dataset");
  if (!requestedDataset && !options.datasetSlug) {
    app.innerHTML = renderCategoryOverview(state.datasets);
    return;
  }

  state.dataset = requestedDataset || options.datasetSlug || state.dataset;
  state.page = Number(params.get("page") || 1);
  state.filters = Object.fromEntries([...params.entries()].filter(([key]) => !["dataset", "page", "pageSize"].includes(key)));
  const query = new URLSearchParams({ page: state.page, pageSize: state.pageSize, ...state.filters });
  const data = await api(`/api/datasets/${state.dataset}/entries?${query}`);
  const fields = data.dataset.fields;
  const filterOptions = {};
  data.items.forEach((item) => fields.forEach((field) => {
    const values = Array.isArray(item.attributes[field]) ? item.attributes[field] : [item.attributes[field]];
    filterOptions[field] ||= new Set();
    values.filter(Boolean).forEach((value) => filterOptions[field].add(value));
  }));

  app.innerHTML = `${PageHeader({
    eyebrow: "图鉴大全",
    title: data.dataset.name,
    description: data.dataset.description || "组合筛选、排序并查看每一条游戏数据。"
  })}
    <div class="shell library-layout">
      ${renderLibrarySidebar(state.datasets, state.dataset)}
      <section class="library-results">
        <div class="${uiClass("library-toolbar card search-bar")}">
          <input class="${uiClass("input")}" id="library-q" value="${escapeHtml(state.filters.q || "")}" placeholder="搜索物品名称或说明">
          <select class="${uiClass("select")}" id="library-sort" aria-label="排序字段">
            <option value="name" ${state.filters.sort==="name"?"selected":""}>名称排序</option>
            ${fields.slice(0,3).map((field) => `<option value="${escapeHtml(field)}" ${state.filters.sort===field?"selected":""}>${escapeHtml(fieldLabels[field] || field)}排序</option>`).join("")}
          </select>
          <select class="${uiClass("select")}" id="library-order" aria-label="排序方向">
            <option value="asc" ${state.filters.order!=="desc"?"selected":""}>正序</option>
            <option value="desc" ${state.filters.order==="desc"?"selected":""}>倒序</option>
          </select>
          <div class="tool-actions"><button class="${uiClass("btn primary small")}" id="apply-filters">查询</button><button class="${uiClass("btn secondary small")}" id="view-toggle">${state.view==="table"?"卡片视图":"表格视图"}</button></div>
        </div>
        <div class="${uiClass("filter-row card")}">
          ${fields.slice(0,4).map((field) => `<label><span>${escapeHtml(fieldLabels[field] || field)}</span><select class="${uiClass("select")}" data-filter="${escapeHtml(field)}"><option value="">全部</option>${[...(filterOptions[field] || [])].map((value) => `<option ${state.filters[field]===value?"selected":""}>${escapeHtml(value)}</option>`).join("")}</select></label>`).join("")}
          <button class="${uiClass("btn secondary small")}" id="clear-filters">清空筛选</button>
          <b>共 ${data.pagination.total} 条资料</b>
        </div>
        <div id="results">${data.items.length ? (state.view==="table" ? tableView(data.items, fields) : cardView(data.items)) : `<div class="${uiClass("card empty")}">没有找到符合条件的资料。</div>`}</div>
        ${pagination(data.pagination)}
        <aside class="ad-slot" hidden aria-label="图鉴广告位"></aside>
      </section>
    </div>
    ${options.modalItem ? renderItemDialog(options.modalItem) : ""}`;

  document.querySelector("#apply-filters").addEventListener("click", () => {
    const nextFilters = {
      q: document.querySelector("#library-q").value,
      sort: document.querySelector("#library-sort").value,
      order: document.querySelector("#library-order").value
    };
    document.querySelectorAll("[data-filter]").forEach((element) => {
      if (element.value) nextFilters[element.dataset.filter] = element.value;
    });
    navigateTo(routePath("wikiDataset", { datasetSlug: state.dataset, search: queryFromObject(nextFilters) }));
  });
  document.querySelector("#library-q").addEventListener("keydown", (event) => {
    if (event.key === "Enter") document.querySelector("#apply-filters").click();
  });
  document.querySelector("#clear-filters").addEventListener("click", () => {
    navigateTo(routePath("wikiDataset", { datasetSlug: state.dataset }));
  });
  document.querySelector("#view-toggle").addEventListener("click", () => {
    state.view = state.view === "table" ? "card" : "table";
    library(params, options);
  });
  document.querySelectorAll("[data-page]").forEach((button) => button.addEventListener("click", () => {
    const query = queryFromObject({ ...state.filters, page: button.dataset.page });
    navigateTo(routePath("wikiDataset", { datasetSlug: state.dataset, search: query }));
    window.scrollTo(0, 0);
  }));
  if (options.modalItem) bindItemDialog(state.dataset);
}

function tableView(items, fields) {
  return `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>名称</th>${fields.slice(0,4).map((f)=>`<th>${fieldLabels[f]||f}</th>`).join("")}</tr></thead><tbody>${items.map((item)=>`<tr><td><a class="item-name" href="${routePath("wikiEntry", { datasetSlug: state.dataset, entrySlug: item.slug })}">${img(item.image,item.name)}${escapeHtml(item.name)}</a></td>${fields.slice(0,4).map((f)=>`<td>${escapeHtml(Array.isArray(item.attributes[f])?item.attributes[f].join("、"):item.attributes[f]||"-")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function cardView(items) {
  return `<div class="item-grid">${items.map((item) => `<a class="${uiClass("item-card card")}" href="${routePath("wikiEntry", { datasetSlug: state.dataset, entrySlug: item.slug })}">${img(item.image,item.name)}<strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.summary)}</small></a>`).join("")}</div>`;
}
function pagination(info) { if(info.pages<=1)return""; return `<div class="pagination">${Array.from({length:info.pages},(_,i)=>i+1).slice(Math.max(0,info.page-3),info.page+2).map((page)=>`<button data-page="${page}" class="${uiClass("btn ghost small", { active: page===info.page })}">${page}</button>`).join("")}</div>`; }

async function articlesPage() {
  const data = await api("/api/articles?pageSize=50");
  app.innerHTML = `${PageHero({
    eyebrow: "攻略资料",
    title: "星露谷攻略文章",
    description: "从开荒规划到精通系统的完整中文指南，按主题整理长期可读的农场路线。",
    actions: [
      { label: "浏览图鉴大全", href: routePath("wiki"), variant: "secondary" },
      { label: "查看实用工具", href: routePath("tools"), variant: "primary" }
    ]
  })}<section class="section"><div class="shell article-grid">${data.items.map(articleCard).join("")}</div></section>`;
}
async function articleDetail(slug) {
  const {item}=await api(`/api/articles/${encodeURIComponent(slug)}`);
  const categories = item.categories?.map((category) => category.name).join(" · ") || "深度攻略";
  app.innerHTML=`
    <section class="guide-detail-shell">
      <header class="shell guide-detail-header">
        <h1>${escapeHtml(item.title)}</h1>
        <div class="${uiClass("guide-overview card")}">
          <div><span>攻略分类</span><strong>${escapeHtml(categories)}</strong></div>
          <div><span>完整章节</span><strong id="guide-section-count">0 章</strong></div>
          <div><span>预计阅读</span><strong id="guide-reading-time">1 分钟</strong></div>
        </div>
      </header>
      <main class="shell guide-detail-grid">
        <section class="guide-reading">
          <details class="${uiClass("guide-toc-mobile card")}" open>
            <summary>本页目录</summary>
            <nav id="guide-toc-mobile"></nav>
          </details>
          <aside class="ad-slot" hidden aria-label="攻略广告位"></aside>
          <article class="${uiClass("card detail prose guide-article")}" id="guide-article">${item.html}</article>
        </section>
        <aside class="${uiClass("guide-toc card")}" aria-label="文章目录">
          <div class="guide-toc-title"><span>目录</span><b>章节导航</b></div>
          <nav id="guide-toc"></nav>
          <a class="guide-back" href="${routePath("guides")}">返回攻略列表</a>
        </aside>
      </main>
    </section>`;
  enhanceArticleDetail();
}

function enhanceArticleDetail() {
  const article = document.querySelector("#guide-article");
  const duplicateTitle = article.querySelector(":scope > h1:first-child");
  duplicateTitle?.remove();

  const headings = [...article.querySelectorAll("h2")];
  const outline = createArticleOutline(headings.map((heading) => heading.textContent));
  headings.forEach((heading, index) => {
    const section = outline[index];
    heading.id = section.id;
    heading.innerHTML = `<span aria-hidden="true">${section.number}</span>${escapeHtml(section.title)}`;
  });

  const links = outline.map((section) =>
    `<a href="#${section.id}" data-guide-section="${section.id}"><span>${section.number}</span>${escapeHtml(section.title)}</a>`
  ).join("");
  document.querySelector("#guide-toc").innerHTML = links;
  document.querySelector("#guide-toc-mobile").innerHTML = links;
  document.querySelector("#guide-section-count").textContent = `${outline.length} 章`;
  document.querySelector("#guide-reading-time").textContent = `${estimateReadingMinutes(article.textContent)} 分钟`;
  document.querySelectorAll("[data-guide-section]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      document.getElementById(link.dataset.guideSection)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  articleObserver?.disconnect();
  if (!("IntersectionObserver" in window)) return;
  articleObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    document.querySelectorAll("[data-guide-section]").forEach((link) => {
      link.classList.toggle("active", link.dataset.guideSection === visible.target.id);
    });
  }, { rootMargin: "-18% 0px -70% 0px" });
  headings.forEach((heading) => articleObserver.observe(heading));
}
async function entryDetail(datasetSlug, entrySlug) {
  await loadDatasets();
  const dataset = state.datasets.find((item) => item.slug === datasetSlug);
  if (!dataset) {
    const error = new Error("资料分类不存在");
    error.status = 404;
    throw error;
  }
  const {item}=await api(`/api/datasets/${dataset.slug}/entries/${encodeURIComponent(entrySlug)}`);
  if (item.slug && item.slug !== entrySlug) {
    navigateTo(routePath("wikiEntry", { datasetSlug: dataset.slug, entrySlug: item.slug }), { replace: true });
    return;
  }
  await library(new URLSearchParams(), { datasetSlug: dataset.slug, modalItem: item });
}

function bindItemDialog(datasetSlug) {
  const backdrop = document.querySelector("[data-dialog-backdrop]");
  const onDialogKeydown = (event) => {
    if (event.key === "Escape") closeDialog();
  };
  const closeDialog = () => {
    document.removeEventListener("keydown", onDialogKeydown);
    navigateTo(routePath("wikiDataset", { datasetSlug }));
  };
  const closeButton = document.querySelector("[data-dialog-close]");
  closeButton.addEventListener("click", closeDialog);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeDialog();
  });
  document.addEventListener("keydown", onDialogKeydown);
  closeButton.focus();
  document.querySelectorAll("[data-item-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("[data-item-tab]").forEach((button) => {
        const isActive = button === tab;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-selected", String(isActive));
      });
      document.querySelectorAll("[data-item-section]").forEach((section) => {
        section.hidden = section.dataset.itemSection !== tab.dataset.itemTab;
      });
    });
  });
}

function searchResultTypeLabel(type) {
  if (type === "article") return "攻略";
  if (type === "entry") return "图鉴";
  if (type === "tool") return "工具";
  return "";
}

async function searchPage(params) {
  await loadDatasets();
  const q=params.get("q")||""; const data=await api(`/api/search?q=${encodeURIComponent(q)}&pageSize=50`);
  app.innerHTML = `${PageHero({
    eyebrow: "全站搜索",
    title: "搜索结果",
    description: `关键词“${q}”找到 ${data.pagination.total} 条结果。`,
    className: "search-page-header"
  })}<section class="section search-results-section"><div class="shell">${data.items.length?`<div class="${uiClass("card search-results")}">${data.items.map((item)=>{ const label = searchResultTypeLabel(item.type); const href = item.type === "article" ? routePath("guide", { slug: item.slug }) : item.type === "tool" ? routePath("tools") : routePath("wikiEntry", { datasetSlug: item.dataset_slug, entrySlug: item.slug }); return `<a class="row-result" href="${href}">${label ? `<span class="row-result-type">${escapeHtml(label)}</span>` : ""}<h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.snippet)}</p></a>`; }).join("<hr>")}</div>`:`<div class="${uiClass("card empty")}">没有找到相关结果。</div>`}</div></section>`;
}

async function toolsPage() {
  app.innerHTML = `${PageHero({
    eyebrow: "农场主工具箱",
    title: "星露谷实用工具",
    description: "把资料库变成可以直接操作的规划助手，查询条件、核算收益并保存长期收集进度。",
    actions: [
      { label: "鱼类查询", href: routePath("tool", { tool: "fish" }), variant: "primary" },
      { label: "社区中心清单", href: routePath("tool", { tool: "community-center" }), variant: "secondary" }
    ]
  })}
    <section class="section"><div class="shell tools-grid">
      <a class="${uiClass("card tool-entry-card")}" href="${routePath("tool", { tool: "fish" })}">${img("/assets/game/36px-Fishing_Skill_Icon.png", "鱼类条件查询器")}<div><h2>鱼类条件查询器</h2><p>按季节、天气、时间、地点与获取方式筛选鱼类，避免空跑。</p><span>开始查询 →</span></div></a>
      <a class="${uiClass("card tool-entry-card")}" href="${routePath("tool", { tool: "crops" })}">${img("/assets/game/36px-Farming_Skill_Icon.png", "作物收益计算器")}<div><h2>作物收益计算器</h2><p>比较地块、预算、肥料、职业与加工方式下的真实净利润。</p><span>开始计算 →</span></div></a>
      <a class="${uiClass("card tool-entry-card")}" href="${routePath("tool", { tool: "community-center" })}">${img("/assets/game/36px-Bundle_Green.png", "社区中心进度清单")}<div><h2>社区中心进度清单</h2><p>按房间跟踪收集包，筛选季节待办，并在本地持续保存。</p><span>管理进度 →</span></div></a>
    </div></section>`;
}

async function route() {
  try {
    const currentRoute = parseAppRoute(location);
    const params = currentRoute.searchParams;
    siteChrome.siteHeader.classList.remove("open");
    siteChrome.menuButton.setAttribute("aria-expanded", "false");
    updateSeo(currentRoute);
    updateActiveNavigation(currentRoute.name);
    updateRouteChrome(currentRoute.name);

    if (currentRoute.locale !== "zh") {
      notFoundView("英文版路径已预留，当前暂未发布英文内容。", currentRoute.locale);
      return;
    }

    if(currentRoute.name==="home") await home();
    else if(currentRoute.name==="wiki") await library(params);
    else if(currentRoute.name==="wikiDataset") await library(params, { datasetSlug: currentRoute.params.datasetSlug });
    else if(currentRoute.name==="wikiEntry") await entryDetail(currentRoute.params.datasetSlug, currentRoute.params.entrySlug);
    else if(currentRoute.name==="guides") await articlesPage();
    else if(currentRoute.name==="guide") await articleDetail(currentRoute.params.slug);
    else if(currentRoute.name==="search") await searchPage(params);
    else if (currentRoute.name === "tool" && currentRoute.params.tool === "fish") await renderFishTool(app, params);
    else if (currentRoute.name === "tool" && (currentRoute.params.tool === "crops" || currentRoute.params.tool === "crop-profit")) await renderCropTool(app, params);
    else if (currentRoute.name === "tool" && currentRoute.params.tool === "community-center") await renderCommunityCenterTool(app, params);
    else if (currentRoute.name === "tools") await toolsPage();
    else notFoundView(undefined, currentRoute.locale);
  } catch(error) {
    const currentRoute = parseAppRoute(location);
    errorView(error, currentRoute.locale);
  }
}
addEventListener("popstate", route);
addEventListener("app:navigation", route);
route();
