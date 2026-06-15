import { Button, PageHeader, SearchBar } from "./components/site-components.js";
import { routePath } from "./routes.js";
import { uiClass } from "./ui-class.js";

const fallbackImage = "/assets/game/36px-Prismatic_Shard.png";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function image(src, alt, className = "pixel-icon") {
  return `<img class="${escapeHtml(uiClass(className))}" src="${escapeHtml(src || fallbackImage)}" alt="${escapeHtml(alt)}" data-fallback="${fallbackImage}">`;
}

function attributeText(value, fallback = "资料整理中") {
  if (Array.isArray(value)) return value.join("、");
  return value || fallback;
}

export function renderFeaturedGuideCard(article) {
  return `<a class="${uiClass("featured-guide-card card")}" href="${routePath("guide", { slug: article.slug })}">
    <span class="featured-guide-icon">${image(article.cover_image, article.title)}</span>
    <span class="featured-guide-copy">
      <strong>${escapeHtml(article.title)}</strong>
      <span>${escapeHtml(article.summary)}</span>
    </span>
  </a>`;
}

export function renderCategoryOverview(datasets) {
  const primary = datasets.filter((dataset) => dataset.slug !== "catalog");

  return `<section class="category-page">
    ${PageHeader({
      eyebrow: "资料分类",
      title: "攻略资料分类",
      description: "按主题查找作物、鱼类、人物、任务、地点和物品资料。"
    })}
    <div class="shell category-page-content section--tight">
      <div class="category-overview-grid">
        ${primary.map((dataset) => `<a class="${uiClass("category-overview-card card")}" href="${routePath("wikiDataset", { datasetSlug: dataset.slug })}">
          <span class="category-overview-icon">${image(dataset.icon, dataset.name)}</span>
          <span class="category-overview-copy">
            <strong>${escapeHtml(dataset.name)}</strong>
            <span>${escapeHtml(dataset.description)}</span>
          </span>
          <b>${Number(dataset.entry_count) || 0} 条</b>
        </a>`).join("")}
      </div>
    </div>
  </section>`;
}

export function renderLibrarySidebar(datasets, activeSlug) {
  return `<aside class="${uiClass("library-sidebar card")}" aria-label="图鉴分类">
    <h2>图鉴分类</h2>
    <nav>
      ${datasets.map((dataset) => `<a data-dataset-link="${escapeHtml(dataset.slug)}" href="${routePath("wikiDataset", { datasetSlug: dataset.slug })}" ${dataset.slug === activeSlug ? 'aria-current="page"' : ""}>
        ${image(dataset.icon, dataset.name)}
        <span>${escapeHtml(dataset.name)}</span>
      </a>`).join("")}
    </nav>
  </aside>`;
}

export function renderItemDialog(item) {
  const source = attributeText(item.attributes?.source, "请查看对应分类的获取条件");
  const use = attributeText(
    item.attributes?.use
      || item.attributes?.features
      || item.attributes?.effect
      || item.attributes?.ingredients,
    item.summary
  );
  const sellPrice = attributeText(item.attributes?.sellPrice, "不可出售或暂无售价");

  return `<div class="item-dialog-backdrop" data-dialog-backdrop>
    <section class="${uiClass("item-dialog card")}" role="dialog" aria-modal="true" aria-labelledby="item-dialog-title">
      <header class="item-dialog-titlebar">
        <h2 id="item-dialog-title">物品详情</h2>
        <button class="${uiClass("btn ghost small")}" type="button" data-dialog-close aria-label="关闭物品详情">×</button>
      </header>
      <div class="item-dialog-content">
        <div class="item-dialog-information">
          <div class="item-dialog-heading">
            ${image(item.image, item.name, "item-dialog-icon pixel-icon")}
            <div>
              <strong>${escapeHtml(item.name)}</strong>
              <span>${escapeHtml(item.dataset_name || "物品百科")}</span>
            </div>
          </div>
          <div class="item-tabs" role="tablist" aria-label="物品信息">
            <button type="button" class="${uiClass("btn ghost small active")}" data-item-tab="source" role="tab" aria-selected="true">获取方式</button>
            <button type="button" class="${uiClass("btn ghost small")}" data-item-tab="use" role="tab" aria-selected="false">用途</button>
            <button type="button" class="${uiClass("btn ghost small")}" data-item-tab="sellPrice" role="tab" aria-selected="false">售价</button>
          </div>
          <div class="item-identity">
            <p><b>类型：</b>${escapeHtml(item.dataset_name || "物品百科")}</p>
          </div>
          <section class="item-tab-content" data-item-section="source">
            <h3>基本信息</h3>
            <p><b>获取方式：</b>${escapeHtml(source)}</p>
            <p>${escapeHtml(item.summary)}</p>
          </section>
          <section class="item-tab-content" data-item-section="use" hidden>
            <h3>主要用途</h3>
            <p>${escapeHtml(use)}</p>
          </section>
          <section class="item-tab-content" data-item-section="sellPrice" hidden>
            <h3>售价信息</h3>
            <p><b>基础售价：</b>${escapeHtml(sellPrice)}</p>
          </section>
        </div>
      </div>
    </section>
  </div>`;
}

export function renderHomeView({ stats, datasets, articles }) {
  const datasetBySlug = new Map(datasets.map((dataset) => [dataset.slug, dataset]));
  const datasetLink = (slug, query) => datasetBySlug.has(slug) ? routePath("wikiDataset", { datasetSlug: slug }) : routePath("search", { q: query });
  const articleLink = (keywords, query) => {
    const target = articles.find((article) => keywords.some((keyword) => article.title.includes(keyword)));
    return target ? routePath("guide", { slug: target.slug }) : routePath("search", { q: query });
  };
  const toolCards = [
    { title: "作物收益计算器", href: routePath("tool", { tool: "crops" }), icon: "/assets/game/36px-Farming_Skill_Icon.png", description: "按季节、天数、肥料和加工方式估算净收益。", action: "开始计算" },
    { title: "鱼类查询器", href: routePath("tool", { tool: "fish" }), icon: "/assets/game/36px-Fishing_Skill_Icon.png", description: "用时间、天气、地点和季节快速定位可钓鱼类。", action: "查询鱼类" },
    { title: "社区中心进度", href: routePath("tool", { tool: "community-center" }), icon: "/assets/game/36px-Bundle_Green.png", description: "跟踪收集包、缺失物品和当前季节待办。", action: "管理清单" },
    { title: "礼物推荐", href: datasetLink("villagers", "NPC 礼物"), icon: "/assets/game/32px-HeartIconLarge.png", description: "查村民生日、住址和最爱礼物，减少试错。", action: "查看 NPC" },
    { title: "矿洞掉落", href: routePath("search", { q: "矿洞 掉落" }), icon: "/assets/game/36px-Mining_Skill_Icon.png", description: "整理矿石、怪物、楼层和常用材料来源。", action: "查找掉落" },
    { title: "新手路线", href: articleLink(["第一年", "新手", "春季"], "新手路线"), icon: "/assets/game/28px-Quests_Icon.png", description: "从第一天规划、背包升级到社区中心初期路线。", action: "阅读路线" }
  ];
  const categoryCards = [
    { title: "作物", slug: "crops", icon: "/assets/game/36px-Farming_Skill_Icon.png", query: "作物" },
    { title: "鱼类", slug: "fish", icon: "/assets/game/36px-Fishing_Skill_Icon.png", query: "鱼类" },
    { title: "NPC", slug: "villagers", icon: "/assets/game/32px-HeartIconLarge.png", query: "NPC" },
    { title: "任务", slug: "quests", icon: "/assets/game/28px-Quests_Icon.png", query: "任务" },
    { title: "地点", slug: "locations", icon: "/assets/game/36px-Map_Icon.png", query: "地点" },
    { title: "模组", slug: "mods", icon: "/assets/game/36px-Prismatic_Shard.png", query: "模组" }
  ];
  const guideCards = [
    { title: "新手指南", label: "入门", query: "新手指南", keywords: ["新手", "第一年"], description: "基础路线、每日优先级和早期资源分配。" },
    { title: "第一年的赚钱路线", label: "收益", query: "第一年 赚钱", keywords: ["赚钱", "第一年", "收益"], description: "春夏秋冬的作物、钓鱼和加工收益节奏。" },
    { title: "常见问题", label: "FAQ", query: "常见问题", keywords: ["常见", "问题", "FAQ"], description: "新档最容易卡住的系统、任务和解锁问题。" },
    { title: "避坑指南", label: "进阶", query: "避坑", keywords: ["避坑", "建议", "路线"], description: "避免浪费天数、金币、礼物和稀有材料。" }
  ];

  return `<div class="home">
    <section class="home-hero">
      <div class="shell home-hero-grid">
        <div class="home-hero-copy">
          <span class="home-eyebrow">Wiki + Tools</span>
          <h1>星露谷物语中文资料库</h1>
          <p>作物 / 鱼类 / NPC / 任务 / 社区中心一站查询</p>
          <div class="home-search-card">
            ${SearchBar({
              id: "home-search",
              placeholder: "搜索作物、鱼类、NPC、任务、地点或攻略...",
              buttonLabel: "查询",
              home: true
            })}
          </div>
          <div class="home-quick-actions" aria-label="快捷入口">
            ${Button({ label: "作物收益计算器", href: routePath("tool", { tool: "crops" }), variant: "primary" })}
            ${Button({ label: "鱼类查询", href: routePath("tool", { tool: "fish" }), variant: "secondary" })}
            ${Button({ label: "社区中心清单", href: routePath("tool", { tool: "community-center" }), variant: "secondary" })}
            ${Button({ label: "NPC礼物查询", href: datasetLink("villagers", "NPC 礼物"), variant: "ghost" })}
          </div>
        </div>
        <aside class="home-hero-aside" aria-label="站点概览">
          <a class="${uiClass("home-mini-stat card")}" href="${routePath("wiki")}">${image("/assets/game/36px-Prismatic_Shard.png", "资料条目")}<span><strong>${Number(stats.entries) || 0}</strong><br>资料条目</span></a>
          <a class="${uiClass("home-mini-stat card")}" href="${routePath("wiki")}">${image("/assets/game/36px-Farming_Skill_Icon.png", "分类")}<span><strong>${Number(stats.datasets) || 0}</strong><br>资料分类</span></a>
          <a class="${uiClass("home-mini-stat card")}" href="${routePath("guides")}">${image("/assets/game/28px-Quests_Icon.png", "攻略")}<span><strong>${Number(stats.articles) || 0}</strong><br>攻略文章</span></a>
        </aside>
      </div>
    </section>

    <section class="home-section">
      <div class="shell">
        <div class="home-section-heading">
          <div><h2>实用工具</h2><p>常用查询和规划入口集中在这里。</p></div>
          <a class="${uiClass("btn ghost")}" href="${routePath("tools")}">全部工具</a>
        </div>
        <div class="home-tools-grid">
          ${toolCards.map((card) => `<a class="${uiClass("home-tool-card card")}" href="${escapeHtml(card.href)}">
            ${image(card.icon, card.title)}
            <span class="home-tool-card-copy"><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.description)}</p><span class="card-action">${escapeHtml(card.action)} →</span></span>
          </a>`).join("")}
        </div>
      </div>
    </section>

    <section class="home-section">
      <div class="shell">
        <div class="home-section-heading">
          <div><h2>分类入口</h2><p>按资料主题进入图鉴。</p></div>
          <a class="${uiClass("btn ghost")}" href="${routePath("wiki")}">查看全部</a>
        </div>
        <div class="home-categories-grid">
          ${categoryCards.map((card) => {
            const dataset = datasetBySlug.get(card.slug);
            return `<a class="${uiClass("home-category-card card")}" href="${escapeHtml(datasetLink(card.slug, card.query))}">
              ${image(dataset?.icon || card.icon, card.title)}
              <h3>${escapeHtml(dataset?.name || card.title)}</h3>
              <small>${Number(dataset?.entry_count) || "查询"} 条</small>
            </a>`;
          }).join("")}
        </div>
      </div>
    </section>

    <section class="home-section">
      <div class="shell">
        <div class="home-section-heading">
          <div><h2>热门攻略</h2><p>适合新档和回坑玩家的高频问题。</p></div>
          <a class="${uiClass("btn ghost")}" href="${routePath("guides")}">全部攻略</a>
        </div>
        <div class="home-guides-grid">
          ${guideCards.map((card) => `<a class="${uiClass("home-guide-card card")}" href="${escapeHtml(articleLink(card.keywords, card.query))}">
            <span class="guide-label">${escapeHtml(card.label)}</span>
            <h3>${escapeHtml(card.title)}</h3>
            <p>${escapeHtml(card.description)}</p>
            <span class="card-action">查看攻略 →</span>
          </a>`).join("")}
        </div>
      </div>
    </section>
  </div>`;
}
