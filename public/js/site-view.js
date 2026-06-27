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

function normalizeAttributeValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join("、");
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function pickAttribute(attributes = {}, keys = []) {
  for (const key of keys) {
    const value = normalizeAttributeValue(attributes[key]);
    if (value) return value;
  }
  return "";
}

function uniqueParts(parts) {
  return [...new Set(parts.map((part) => normalizeAttributeValue(part)).filter(Boolean))];
}

function datasetText(item, datasetSlug) {
  return `${item.dataset_slug || datasetSlug || ""} ${item.dataset_name || ""}`;
}

function isFishEntry(item, datasetSlug) {
  const text = datasetText(item, datasetSlug);
  return text.includes("fish") || text.includes("鱼");
}

function isCropEntry(item, datasetSlug) {
  const text = datasetText(item, datasetSlug);
  return text.includes("crops") || text.includes("作物") || text.includes("种子");
}

function isCookingEntry(item, datasetSlug) {
  const text = datasetText(item, datasetSlug);
  return text.includes("cooking") || text.includes("料理") || text.includes("配方");
}

function isItemEntry(item, datasetSlug) {
  const text = datasetText(item, datasetSlug);
  return text.includes("items") || text.includes("物品百科") || text.includes("资源") || text.includes("矿物");
}

function isVillagerEntry(item, datasetSlug) {
  const text = datasetText(item, datasetSlug);
  return text.includes("villagers") || text.includes("村民") || text.includes("关系");
}

function isLocationEntry(item, datasetSlug) {
  const text = datasetText(item, datasetSlug);
  return text.includes("locations") || text.includes("地点") || text.includes("地图");
}

function isQuestEntry(item, datasetSlug) {
  const text = datasetText(item, datasetSlug);
  return text.includes("quests") || text.includes("任务");
}

function isFestivalEntry(item, datasetSlug) {
  const text = datasetText(item, datasetSlug);
  return text.includes("festivals") || text.includes("节日") || text.includes("活动");
}

function isSkillEntry(item, datasetSlug) {
  const text = datasetText(item, datasetSlug);
  return text.includes("skills") || text.includes("技能") || text.includes("职业");
}

function conditionText(attributes = {}) {
  const parts = uniqueParts([
    pickAttribute(attributes, ["season", "季节"]),
    pickAttribute(attributes, ["location", "地点"]),
    pickAttribute(attributes, ["weather", "天气"]),
    pickAttribute(attributes, ["time", "时间"]),
    pickAttribute(attributes, ["days", "成熟时间"]),
    pickAttribute(attributes, ["source", "来源"])
  ]);
  return parts.join("、");
}

function fieldLine(label, value) {
  const normalized = normalizeAttributeValue(value);
  return normalized ? `${label}：${normalized}` : "";
}

function buildItemSourceText(item) {
  const attributes = item.attributes || {};
  const specificSource = pickAttribute(attributes, ["获取方式"]);
  const source = pickAttribute(attributes, ["source", "来源"]);
  const explicit = specificSource || source;

  if (isFishEntry(item)) {
    const conditionLines = uniqueParts([
      fieldLine("季节", pickAttribute(attributes, ["season", "季节"])),
      fieldLine("地点", pickAttribute(attributes, ["location", "地点"])),
      fieldLine("天气", pickAttribute(attributes, ["weather", "天气"])),
      fieldLine("时间", pickAttribute(attributes, ["time", "时间"])),
      fieldLine("方式", pickAttribute(attributes, ["sourceType", "方式", "source", "来源"]))
    ]);
    const lines = [
      explicit ? `主要来源：${explicit}。` : `${item.name}需要按鱼类出现条件确认获取窗口。`,
      conditionLines.length ? `鱼类条件：${conditionLines.join("；")}。` : "",
      "建议先核对季节、天气、时间和地点，再安排当天行程；雨天鱼、夜间鱼和季节限定鱼不要拖到月末再补。"
    ];
    return uniqueParts(lines).join("\n");
  }

  if (isCropEntry(item)) {
    const season = pickAttribute(attributes, ["season", "季节"]);
    const days = pickAttribute(attributes, ["days", "成熟时间"]);
    const lines = [
      specificSource || (source ? `${item.name}主要通过${source}获得。` : `${item.name}通常通过购买种子、活动、采集或解锁后的种植流程获得。`),
      uniqueParts([fieldLine("适用季节", season), fieldLine("成熟周期", days)]).join("；") + (season || days ? "。" : ""),
      "规划时建议先核对种子成本、播种日期、季节剩余天数和浇水能力，避免买到来不及成熟的种子。"
    ];
    return uniqueParts(lines).join("\n");
  }

  if (isCookingEntry(item)) {
    const lines = [
      source ? `配方来源：${source}。` : `${item.name}通常需要先解锁配方，再准备对应食材制作。`,
      fieldLine("常用材料", pickAttribute(attributes, ["ingredients", "材料"])),
      "制作前建议确认食材是否还要用于社区中心、任务或送礼，稀缺食材不要一次性全部消耗。"
    ];
    return uniqueParts(lines).join("\n");
  }

  const lines = [
    explicit ? `主要来源：${explicit}。` : `${item.name}可通过采集、加工、商店、怪物掉落、任务奖励或解锁内容等方式取得。`,
    fieldLine("类型", pickAttribute(attributes, ["type", "类型", "area", "区域", "skill", "技能", "date", "日期", "birthday", "生日"])),
    "获取前先确认建筑、商店、怪物掉落或加工设备是否已经解锁；如果是稀有材料，建议先保留第一份再决定出售或消耗。"
  ];
  return uniqueParts(lines).join("\n");
}

function buildItemUseText(item) {
  const attributes = item.attributes || {};
  const primary = pickAttribute(attributes, ["主要用途", "use", "用途", "features", "effect", "ingredients", "reward", "loves"]);
  let fallback = "可用于资料查询、路线规划、收集检查或任务优先级判断。";
  let advice = "第一份建议先保留，确认没有献祭、任务、制作、送礼或解锁需求后再出售。";

  if (isFishEntry(item)) {
    fallback = "主要用于图鉴收集、社区中心鱼缸、料理、鱼塘、任务或出售。";
    advice = "第一条建议先查献祭和鱼塘用途；雨天、夜间或季节限定鱼尤其不要随手卖掉。";
  } else if (isCropEntry(item)) {
    fallback = "可用于收益规划、社区中心、料理、送礼或加工。";
    advice = "新手至少保留一份普通品质样本；高价值作物再结合种子成本、播种日期、季节剩余天数和加工设备决定是否出售。";
  } else if (isCookingEntry(item)) {
    fallback = "主要用于恢复体力、提供增益、送礼或完成特定任务。";
    advice = "制作前先确认食材是否稀缺；带增益的料理适合下矿、钓鱼或长距离跑图前准备。";
  } else if (isItemEntry(item)) {
    fallback = "常用于设备制作、任务、送礼、收集或后续解锁。";
    advice = "第一份建议先保留；出售前先确认是否会影响建筑、工具、社区中心、博物馆或后期解锁。";
  } else if (isVillagerEntry(item)) {
    fallback = "主要用于生日、送礼、行程查询和好感度规划。";
    advice = "送礼前先确认最爱与讨厌物品，生日当天优先送高品质最爱礼物。";
  } else if (isLocationEntry(item)) {
    fallback = "主要用于确认开放条件、营业时间、可触发事件和资源获取路线。";
    advice = "出门前先核对时间和解锁条件，避免白跑或错过商店营业窗口。";
  } else if (isQuestEntry(item)) {
    fallback = "主要用于确认触发条件、提交物品、奖励和任务优先级。";
    advice = "接任务前先确认物品是否季节限定，避免为了低收益任务消耗关键样本。";
  } else if (isFestivalEntry(item)) {
    fallback = "主要用于确认日期、地点、活动奖励、商店物品和当天行程安排。";
    advice = "节日前一天整理背包和金币，避免错过限定商店、比赛奖励或关键种子。";
  } else if (isSkillEntry(item)) {
    fallback = "主要用于确认升级效果、职业路线、配方解锁和后期精通规划。";
    advice = "选择职业前先看自己的主要玩法，种地、钓鱼、下矿和加工路线对收益影响不同。";
  }

  const notes = uniqueParts([
    item.summary,
    primary || fallback,
    pickAttribute(attributes, ["新手建议"]),
    pickAttribute(attributes, ["关联规划"]),
    advice
  ]);
  return notes.join("\n");
}

function buildItemSellPriceText(item) {
  const attributes = item.attributes || {};
  const price = pickAttribute(attributes, ["sellPrice", "售价", "基础售价", "basePrice"]);
  if (!price) {
    return "暂无售价数据，建议以游戏内实际品质、职业和加工状态为准。\n没有售价或不可出售的物品，通常更应该先看解锁、献祭、制作、任务或收藏用途。";
  }
  if (isCropEntry(item)) {
    return `${price}。\n实际收益会受到品质、职业加成、加工方式、种子成本和季节剩余天数影响；做种植规划时不要只看单个售价。`;
  }
  if (isFishEntry(item)) {
    return `${price}。\n鱼类售价还会受品质、钓鱼职业、料理用途和鱼塘规划影响；稀有鱼建议先确认献祭或收集需求。`;
  }
  return `${price}。\n出售前先确认它是否会卡住建筑、工具、收集或任务进度；稀有材料、解锁材料和任务物品通常优先保留。`;
}

function renderParagraphs(text) {
  return normalizeAttributeValue(text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function renderLabeledParagraphs(label, text) {
  const lines = normalizeAttributeValue(text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines
    .map((line, index) => `<p>${index === 0 ? `<b>${escapeHtml(label)}：</b>` : ""}${escapeHtml(line)}</p>`)
    .join("");
}

function buildCardMeta(item, datasetSlug) {
  const attributes = item.attributes || {};
  const parts = uniqueParts([
    pickAttribute(attributes, ["season", "季节"]),
    pickAttribute(attributes, ["location", "地点"]),
    pickAttribute(attributes, ["days", "成熟时间"]),
    pickAttribute(attributes, ["source", "来源"]),
    pickAttribute(attributes, ["type", "类型"]),
    pickAttribute(attributes, ["date", "日期"])
  ]).slice(0, 2);

  if (parts.length) return parts.join(" · ");
  if (isFishEntry(item, datasetSlug)) return "查看鱼类条件";
  if (isCropEntry(item, datasetSlug)) return "查看作物资料";
  return item.dataset_name || "查看详情";
}

export function renderItemCard(item, datasetSlug) {
  return `<a class="${uiClass("item-card card")}" href="${routePath("wikiEntry", { datasetSlug, entrySlug: item.slug })}">
    ${image(item.image, item.name)}
    <strong>${escapeHtml(item.name)}</strong>
    <small>${escapeHtml(buildCardMeta(item, datasetSlug))}</small>
  </a>`;
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
  const source = buildItemSourceText(item);
  const use = buildItemUseText(item);
  const sellPrice = buildItemSellPriceText(item);

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
            ${renderLabeledParagraphs("获取方式", source)}
            ${item.summary ? renderLabeledParagraphs("详情说明", item.summary) : ""}
          </section>
          <section class="item-tab-content" data-item-section="use" hidden>
            <h3>主要用途</h3>
            ${renderParagraphs(use)}
          </section>
          <section class="item-tab-content" data-item-section="sellPrice" hidden>
            <h3>售价信息</h3>
            ${renderLabeledParagraphs("基础售价", sellPrice)}
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
    { title: "礼物推荐", href: datasetLink("villagers", "NPC 礼物"), icon: "/assets/game/32px-HeartIconLarge.png", description: "按生日、住址、最爱礼物查村民，送礼前先避开讨厌物。", action: "查看礼物" },
    { title: "矿洞掉落", href: routePath("guide", { slug: "mines-floor-40-preparation-route" }), icon: "/assets/game/36px-Mining_Skill_Icon.png", description: "按矿石、怪物、楼层和常用材料规划前 40 层下矿路线。", action: "查看矿洞路线" },
    { title: "新手路线", href: routePath("guide", { slug: "year-one-spring-money-route" }), icon: "/assets/game/28px-Quests_Icon.png", description: "从第一天开局、背包升级、钓鱼下矿到社区中心前期目标。", action: "阅读路线" }
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
