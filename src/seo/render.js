import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { routePath, parseAppRoute, canonicalPathForRoute } from "../../public/js/routes.js";
import { makeEntrySlug } from "../utils/entry-slug.js";
import { stripDuplicateArticleTitleHeading } from "../utils/article-markdown.js";

const siteName = "星露谷物语中文资料库";
const defaultDescription = "作物 / 鱼类 / NPC / 任务 / 社区中心一站查询，覆盖星露谷物语 1.6.15 的中文资料与攻略。";
const authorName = "星露谷物语中文资料库";
const markdownOptions = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title", "width", "height", "loading"]
  },
  exclusiveFilter(frame) {
    if (frame.tag !== "img") return false;
    const src = frame.attribs.src || "";
    return !(src.startsWith("/uploads/") || src.startsWith("/assets/game/"));
  }
};

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function searchTerms(q = "") {
  return [...new Set(String(q).trim().split(/\s+/).filter(Boolean))].slice(0, 5);
}

function highlightSearchText(value = "", q = "") {
  const escaped = escapeHtml(value);
  const terms = searchTerms(q);
  if (!terms.length) return escaped;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  return escaped.replace(pattern, '<mark class="search-highlight">$1</mark>');
}

function stripMarkdown(value = "") {
  return String(value)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value = "", max = 150) {
  const text = stripMarkdown(value);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function siteOrigin(req, context) {
  const configured = context.config.siteUrl || process.env.SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");
  return `${req.protocol}://${req.get("host") || "localhost:3000"}`;
}

function absoluteUrl(pathname, req, context) {
  return new URL(pathname, `${siteOrigin(req, context)}/`).href;
}

function scriptJson(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function articleHtml(body = "", title = "") {
  return sanitizeHtml(marked.parse(stripDuplicateArticleTitleHeading(body, title)), markdownOptions);
}

function articleLink(article) {
  return routePath("guide", { slug: article.slug });
}

function entryLink(datasetSlug, entry) {
  return routePath("wikiEntry", { datasetSlug, entrySlug: makeEntrySlug(entry) });
}

function pageShell({ h1, lead, sections = [] }) {
  return `<section class="seo-prerender">
    <div class="container">
      <header>
        <h1>${escapeHtml(h1)}</h1>
        ${lead ? `<p>${escapeHtml(lead)}</p>` : ""}
      </header>
      ${sections.join("\n")}
    </div>
  </section>`;
}

function listSection(title, items) {
  if (!items.length) return "";
  return `<section>
    <h2>${escapeHtml(title)}</h2>
    <ul>
      ${items.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  </section>`;
}

function relatedSection(kind, title, items) {
  if (!items.length) return "";
  return `<section data-seo-related="${escapeHtml(kind)}">
    <h2>${escapeHtml(title)}</h2>
    <ul>
      ${items.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  </section>`;
}

function searchResultTypeLabel(type) {
  if (type === "article") return "攻略";
  if (type === "entry") return "图鉴";
  if (type === "tool") return "工具";
  return "";
}

function searchSuggestionLinks() {
  return `<div class="search-suggestions">
    <a class="btn btn-secondary" href="${routePath("wiki")}">浏览资料库</a>
    <a class="btn btn-secondary" href="${routePath("guides")}">阅读攻略</a>
    <a class="btn btn-secondary" href="${routePath("tools")}">使用工具</a>
  </div>`;
}

function searchResultsSection(q, results) {
  if (!q) {
    return `<section class="search-results-copy">
      <h2>搜索建议</h2>
      <p>输入关键词开始搜索，可以查找作物、鱼类、NPC、攻略和工具。</p>
      ${searchSuggestionLinks()}
    </section>`;
  }
  if (!results.length) {
    return `<section class="search-results-copy">
      <h2>搜索结果</h2>
      <p>没有找到与“${escapeHtml(q)}”相关的结果，建议换一个关键词，或先从资料库、攻略和工具入口浏览。</p>
      ${searchSuggestionLinks()}
    </section>`;
  }
  return `<section class="search-results-copy">
    <div class="search-results-heading">
      <h2>搜索结果</h2>
      <p class="search-summary">找到 ${results.length} 条与“${escapeHtml(q)}”相关内容</p>
    </div>
    <div class="card search-results">
      ${results.map((item) => {
        const label = searchResultTypeLabel(item.type);
        return `<a class="row-result" href="${escapeHtml(item.href)}">${label ? `<span class="row-result-type">${escapeHtml(label)}</span>` : ""}<h3>${highlightSearchText(item.title, q)}</h3><p>${highlightSearchText(item.snippet || "", q)}</p></a>`;
      }).join("<hr>")}
    </div>
  </section>`;
}

const internalLinkLabels = new Map([
  ["/tools/crop-profit", "作物收益计算器"],
  ["/tools/crops", "作物收益计算器"],
  ["/tools/fish", "鱼类查询器"],
  ["/tools/community-center", "社区中心进度清单"],
  ["/guides/year-one-spring-money-route", "第一年春季赚钱路线"],
  ["/guides/beginner-fishing-guide-and-fish-search", "新手钓鱼入门与鱼类查询使用指南"],
  ["/guides/early-community-center-priority-route", "社区中心前期优先完成路线"],
  ["/guides/mines-floor-40-preparation-route", "矿洞前 40 层准备与收益路线"],
  ["/guides/crop-profit-calculator-guide", "作物收益计算器使用指南"],
  ["/wiki/crops", "作物与种子"],
  ["/wiki/fish", "鱼类图鉴"],
  ["/wiki/items", "物品百科"]
]);

function normalizeAttributeText(value) {
  return Array.isArray(value) ? value.join("、") : String(value || "");
}

function normalizeInternalLinks(value) {
  const rawLinks = Array.isArray(value) ? value : [value];
  return rawLinks
    .flatMap((item) => String(item || "").split("|"))
    .map((href) => href.trim())
    .filter((href) => href.startsWith("/"));
}

function internalLinkLabel(href) {
  return internalLinkLabels.get(href) || href.replace(/^\//, "");
}

function buildEntryGuidanceSections(attributes, fields) {
  const fieldSet = new Set(fields);
  const guidanceItems = Object.entries(attributes)
    .filter(([key, value]) => key !== "links" && !fieldSet.has(key) && normalizeAttributeText(value))
    .map(([key, value]) => `<li><strong>${escapeHtml(key)}</strong>：${escapeHtml(normalizeAttributeText(value))}</li>`);
  const links = normalizeInternalLinks(attributes.links);
  const sections = [];
  if (guidanceItems.length) {
    sections.push(`<section><h2>实用说明</h2><ul>${guidanceItems.join("")}</ul></section>`);
  }
  if (links.length) {
    sections.push(listSection("相关工具与攻略", links.map((href) => (
      `<a href="${escapeHtml(href)}">${escapeHtml(internalLinkLabel(href))}</a>`
    ))));
  }
  return sections;
}

function buildToolGuidanceSections(tool) {
  const cropLinks = [
    `<a href="${routePath("guide", { slug: "crop-profit-calculator-guide" })}">作物收益计算器使用指南</a>`,
    `<a href="${routePath("guide", { slug: "year-one-spring-money-route" })}">第一年春季赚钱路线</a>`,
    `<a href="${routePath("wikiDataset", { datasetSlug: "crops" })}">作物与种子资料库</a>`
  ];
  const fishLinks = [
    `<a href="${routePath("guide", { slug: "beginner-fishing-guide-and-fish-search" })}">新手钓鱼入门与鱼类查询使用指南</a>`,
    `<a href="${routePath("wikiDataset", { datasetSlug: "fish" })}">鱼类图鉴</a>`,
    `<a href="${routePath("guide", { slug: "early-community-center-priority-route" })}">社区中心前期优先完成路线</a>`
  ];
  const communityLinks = [
    `<a href="${routePath("guide", { slug: "early-community-center-priority-route" })}">社区中心前期优先完成路线</a>`,
    `<a href="${routePath("tool", { tool: "fish" })}">鱼类查询器</a>`,
    `<a href="${routePath("wikiDataset", { datasetSlug: "crops" })}">作物与种子资料库</a>`,
    `<a href="${routePath("wikiDataset", { datasetSlug: "fish" })}">鱼类图鉴</a>`
  ];
  const sections = {
    "crop-profit": `<section><h2>使用说明</h2><p>作物收益不能只看售价，还要同时考虑种子成本、生长天数、重复收获次数、季节剩余天数、洒水器覆盖和加工设备容量。这个工具适合在播种前比较候选作物，尤其是春季草莓、夏季蓝莓、秋季蔓越莓、温室远古水果这类投入差异较大的路线。新手可以先输入当前季节、剩余天数和可种地块，再用结果决定是否扩大农田，避免把体力和本金都压在来不及成熟的作物上。常见误区是只看单次售价，忽略晚播导致少收一次，或忽略小桶不足造成作物堆仓。建议先读 ${cropLinks[0]}，再结合 ${cropLinks[1]} 和 ${cropLinks[2]} 核对成熟时间。</p></section>`,
    fish: `<section><h2>使用说明</h2><p>鱼类条件受季节、天气、时间、地点和钓鱼等级共同影响，很多鱼错过窗口后要等到下一个季节。这个工具适合查社区中心鱼缸、雨天限定鱼、夜间鱼、矿井鱼和姜岛鱼。新手使用时先选季节，再按天气和时间缩小范围；如果为了献祭，建议优先筛出当前季节能钓到的鱼，背包里先保留普通品质，不要把第一条直接卖掉。常见误区是忽略雨天和跨午夜时间，例如鳗鱼只在雨夜出现，鲶鱼需要雨天河流。钓鱼练级路线可参考 ${fishLinks[0]}，具体条目可查 ${fishLinks[1]}，献祭优先级可配合 ${fishLinks[2]}。</p></section>`,
    "community-center": `<section><h2>使用说明</h2><p>社区中心进度清单适合按房间、季节和当前可获取物品安排献祭，核心原则是不要乱卖季节限定物品。新手建议先记录春季采集、春季作物、雨天鱼和锅炉房矿物，再按当前季节筛选能立刻补齐的项目。常见误区是只盯着一个收集包，结果错过鱼缸天气窗口或把金星防风草、鲶鱼、鳗鱼、鲟鱼等关键物品卖掉。推荐在每个季节第一天打开清单，标记当季缺口；雨天先配合 ${communityLinks[1]} 查鱼，播种前用 ${communityLinks[2]} 核对作物，鱼缸项目可对照 ${communityLinks[3]}。完整路线可参考 ${communityLinks[0]}。</p></section>`
  };
  const canonicalTool = tool === "crops" ? "crop-profit" : tool;
  return [sections[canonicalTool] || sections.fish];
}

function mergeUniqueById(primary, fallback, limit) {
  const seen = new Set();
  return [...primary, ...fallback].filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  }).slice(0, limit);
}

function getDatasets(db) {
  return db.prepare(`
    SELECT d.*, COUNT(e.id) entry_count FROM datasets d
    LEFT JOIN dataset_entries e ON e.dataset_id=d.id AND e.published=1
    GROUP BY d.id ORDER BY d.sort_order, d.name
  `).all();
}

function getArticles(db, limit = 12) {
  return db.prepare(`
    SELECT id,title,slug,summary,body,game_version,featured,updated_at,created_at
    FROM articles
    WHERE status='published'
    ORDER BY featured DESC, updated_at DESC
    LIMIT ?
  `).all(limit);
}

function getRelatedArticles(db, article, limit = 6) {
  const sameCategory = db.prepare(`
    SELECT DISTINCT a.id,a.title,a.slug,a.summary,a.body,a.game_version,a.featured,a.updated_at,a.created_at
    FROM articles a
    JOIN article_categories ac ON ac.article_id = a.id
    WHERE a.status='published'
      AND a.id != ?
      AND ac.category_id IN (
        SELECT category_id FROM article_categories WHERE article_id = ?
      )
    ORDER BY a.featured DESC, a.updated_at DESC
    LIMIT ?
  `).all(article.id, article.id, limit);

  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const fallback = db.prepare(`
    SELECT id,title,slug,summary,body,game_version,featured,updated_at,created_at
    FROM articles
    WHERE status='published' AND id != ?
    ORDER BY featured DESC, updated_at DESC
    LIMIT ?
  `).all(article.id, limit * 2);

  return mergeUniqueById(sameCategory, fallback, limit);
}

function findArticle(db, slug) {
  return db.prepare("SELECT * FROM articles WHERE slug = ? AND status = 'published'").get(slug);
}

function findArticleBySlugOrTitle(db, slug) {
  const article = findArticle(db, slug);
  if (article) return { article, legacyTitleMatch: false };

  const legacyArticle = db.prepare("SELECT * FROM articles WHERE title = ? AND status = 'published'").get(slug);
  if (legacyArticle?.slug && legacyArticle.slug !== slug) {
    return { article: legacyArticle, legacyTitleMatch: true };
  }

  return { article: null, legacyTitleMatch: false };
}

function findDataset(db, slug) {
  return db.prepare("SELECT * FROM datasets WHERE slug = ?").get(slug);
}

function getDatasetEntries(db, datasetId, limit = 60) {
  return db.prepare(`
    SELECT * FROM dataset_entries
    WHERE dataset_id = ? AND published = 1
    ORDER BY name
    LIMIT ?
  `).all(datasetId, limit);
}

function getRelatedEntries(db, datasetId, currentEntryId, limit = 8) {
  return db.prepare(`
    SELECT * FROM dataset_entries
    WHERE dataset_id = ? AND published = 1 AND id != ?
    ORDER BY name
    LIMIT ?
  `).all(datasetId, currentEntryId, limit);
}

function findEntry(db, datasetSlug, entrySlug) {
  const baseQuery = `
    SELECT e.*, d.name dataset_name, d.slug dataset_slug, d.description dataset_description, d.fields_json
    FROM dataset_entries e JOIN datasets d ON d.id=e.dataset_id
    WHERE d.slug=? AND e.published=1
  `;
  const rows = db.prepare(baseQuery).all(datasetSlug);
  return rows.find((row) => makeEntrySlug(row) === entrySlug || row.slug === entrySlug || row.name === entrySlug);
}

function buildHomePage(db) {
  const datasets = getDatasets(db).slice(0, 6);
  const articles = getArticles(db, 6);
  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM dataset_entries WHERE published = 1) entries,
      (SELECT COUNT(*) FROM datasets) datasets,
      (SELECT COUNT(*) FROM articles WHERE status = 'published') articles
  `).get();
  const sections = [
    listSection("快捷入口", [
      `<a href="${routePath("tool", { tool: "crops" })}">作物收益计算器</a>`,
      `<a href="${routePath("tool", { tool: "fish" })}">鱼类查询</a>`,
      `<a href="${routePath("tool", { tool: "community-center" })}">社区中心清单</a>`,
      `<a href="${routePath("wiki")}">图鉴大全</a>`
    ]),
    listSection("资料概览", [
      `${Number(stats.entries) || 0} 个资料条目`,
      `${Number(stats.datasets) || 0} 个资料分类`,
      `${Number(stats.articles) || 0} 篇攻略文章`
    ]),
    listSection("攻略资料分类", datasets.map((dataset) => (
      `<a href="${routePath("wikiDataset", { datasetSlug: dataset.slug })}">${escapeHtml(dataset.name)}</a>：${escapeHtml(dataset.description || "")}`
    ))),
    listSection("热门攻略", articles.map((article) => (
      `<a href="${articleLink(article)}">${escapeHtml(article.title)}</a>：${escapeHtml(article.summary || "")}`
    )))
  ];
  return {
    title: siteName,
    description: defaultDescription,
    canonicalPath: routePath("home"),
    h1: siteName,
    html: pageShell({ h1: siteName, lead: defaultDescription, sections })
  };
}

function buildGuidesPage(db) {
  const articles = getArticles(db, 30);
  return {
    title: "星露谷攻略文章 - 星露谷物语中文资料库",
    description: "整理星露谷物语新手路线、赚钱路线、社区中心、鱼类、作物与进阶玩法攻略。",
    canonicalPath: routePath("guides"),
    h1: "星露谷攻略文章",
    html: pageShell({
      h1: "星露谷攻略文章",
      lead: "从第一年发展路线到专题速查，按主题阅读完整中文攻略。",
      sections: [
        listSection("攻略列表", articles.map((article) => (
          `<a href="${articleLink(article)}">${escapeHtml(article.title)}</a>：${escapeHtml(article.summary || "")}`
        )))
      ]
    })
  };
}

function buildGuidePage(db, slug, req, context) {
  const { article, legacyTitleMatch } = findArticleBySlugOrTitle(db, slug);
  if (!article) return buildNotFoundPage("攻略不存在", routePath("guides"));
  if (legacyTitleMatch) {
    return {
      status: 301,
      redirectPath: articleLink(article),
      title: article.title,
      description: truncate(article.summary || article.body || defaultDescription),
      canonicalPath: articleLink(article),
      h1: article.title,
      html: ""
    };
  }
  const description = truncate(article.summary || article.body || defaultDescription);
  const canonicalPath = articleLink(article);
  const canonical = absoluteUrl(canonicalPath, req, context);
  const relatedArticles = getRelatedArticles(db, article, 6);
  const relatedHtml = relatedSection("guides", "相关文章", relatedArticles.map((related) => (
    `<a href="${articleLink(related)}">${escapeHtml(related.title)}</a>：${escapeHtml(related.summary || "")}`
  )));
  const jsonLd = [{
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description,
    dateModified: article.updated_at || article.created_at,
    author: { "@type": "Organization", name: authorName },
    mainEntityOfPage: canonical
  }];
  return {
    title: `${article.title} - 星露谷攻略`,
    description,
    canonicalPath,
    ogType: "article",
    h1: article.title,
    jsonLd,
    html: `<article class="seo-prerender">
      <div class="container">
        <header>
          <h1>${escapeHtml(article.title)}</h1>
          <p>${escapeHtml(article.summary || "")}</p>
        </header>
        ${articleHtml(article.body, article.title)}
        ${relatedHtml}
      </div>
    </article>`
  };
}

function buildWikiPage(db) {
  const datasets = getDatasets(db);
  return {
    title: "攻略资料分类 - 星露谷物语中文资料库",
    description: "按作物、鱼类、村民、料理、物品、技能、任务、节日和地点浏览星露谷资料。",
    canonicalPath: routePath("wiki"),
    h1: "攻略资料分类",
    html: pageShell({
      h1: "攻略资料分类",
      lead: "从一颗种子到完整农场，按主题查找所有资料。",
      sections: [
        listSection("全部分类", datasets.map((dataset) => (
          `<a href="${routePath("wikiDataset", { datasetSlug: dataset.slug })}">${escapeHtml(dataset.name)}</a>：${escapeHtml(dataset.description || "")}（${dataset.entry_count} 条）`
        )))
      ]
    })
  };
}

function buildDatasetPage(db, datasetSlug) {
  const dataset = findDataset(db, datasetSlug);
  if (!dataset) return buildNotFoundPage("资料分类不存在", routePath("wiki"));
  const entries = getDatasetEntries(db, dataset.id, 80);
  return {
    title: `${dataset.name} - 星露谷资料库`,
    description: dataset.description || `查看${dataset.name}相关资料、条目和基础信息。`,
    canonicalPath: routePath("wikiDataset", { datasetSlug: dataset.slug }),
    h1: dataset.name,
    html: pageShell({
      h1: dataset.name,
      lead: dataset.description,
      sections: [
        listSection("条目列表", entries.map((entry) => (
          `<a href="${entryLink(dataset.slug, entry)}">${escapeHtml(entry.name)}</a>：${escapeHtml(entry.summary || "")}`
        )))
      ]
    })
  };
}

function buildEntryPage(db, datasetSlug, entrySlug) {
  const entry = findEntry(db, datasetSlug, entrySlug);
  if (!entry) return buildNotFoundPage("资料条目不存在", routePath("wikiDataset", { datasetSlug }));
  const slug = makeEntrySlug(entry);
  const attributes = parseJson(entry.attributes_json, {});
  const fields = parseJson(entry.fields_json, []);
  const canonicalPath = routePath("wikiEntry", { datasetSlug, entrySlug: slug });
  const fieldItems = fields.length
    ? fields.map((field) => {
      const value = attributes[field] ?? "-";
      const text = Array.isArray(value) ? value.join("、") : value;
      return `<li><strong>${escapeHtml(field)}</strong>：${escapeHtml(text)}</li>`;
    })
    : Object.entries(attributes).slice(0, 12).map(([key, value]) => {
      const text = Array.isArray(value) ? value.join("、") : value;
      return `<li><strong>${escapeHtml(key)}</strong>：${escapeHtml(text)}</li>`;
    });
  const guidanceSections = buildEntryGuidanceSections(attributes, fields);
  const relatedEntries = getRelatedEntries(db, entry.dataset_id, entry.id, 8);
  const relatedHtml = relatedSection("entries", "相关资料", relatedEntries.map((related) => (
    `<a href="${entryLink(datasetSlug, related)}">${escapeHtml(related.name)}</a>：${escapeHtml(related.summary || "")}`
  )));
  const jsonLd = [{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: routePath("home") },
      { "@type": "ListItem", position: 2, name: "资料库", item: routePath("wiki") },
      { "@type": "ListItem", position: 3, name: entry.dataset_name, item: routePath("wikiDataset", { datasetSlug }) },
      { "@type": "ListItem", position: 4, name: entry.name, item: canonicalPath }
    ]
  }];
  return {
    title: `${entry.name} - ${entry.dataset_name} - 星露谷资料库`,
    description: entry.summary || `${entry.name}属于${entry.dataset_name}，查看基础信息、获取方式和用途。`,
    canonicalPath,
    h1: entry.name,
    jsonLd,
    html: pageShell({
      h1: entry.name,
      lead: entry.summary || `${entry.name}属于${entry.dataset_name}。`,
      sections: [
        `<section><h2>分类</h2><p>${escapeHtml(entry.dataset_name)}</p></section>`,
        `<section><h2>基础信息</h2><ul>${fieldItems.join("")}</ul></section>`,
        ...guidanceSections,
        relatedHtml
      ]
    })
  };
}

function buildSearchPage(db, searchParams) {
  const q = String(searchParams.get("q") || "").trim();
  const description = q ? `关于“${q}”的攻略、资料和工具搜索结果。` : "搜索星露谷物语作物、鱼类、NPC、任务、社区中心和攻略。";
  const results = q ? searchContent(db, q) : [];
  return {
    title: q ? `${q} 搜索结果 - 星露谷物语中文资料库` : "搜索 - 星露谷物语中文资料库",
    description,
    canonicalPath: routePath("search", { q }),
    h1: q ? `搜索：${q}` : "搜索",
    html: pageShell({
      h1: q ? `搜索：${q}` : "搜索",
      lead: description,
      sections: [
        searchResultsSection(q, results)
      ]
    })
  };
}

function searchContent(db, q) {
  const pattern = `%${q}%`;
  const articles = db.prepare(`
    SELECT 'article' type,id,title,slug,summary snippet
    FROM articles
    WHERE status='published' AND (title LIKE ? OR summary LIKE ? OR body LIKE ?)
    ORDER BY featured DESC, updated_at DESC
    LIMIT 20
  `).all(pattern, pattern, pattern).map((item) => ({
    type: item.type,
    title: item.title,
    snippet: item.snippet,
    href: articleLink(item)
  }));
  const entries = db.prepare(`
    SELECT 'entry' type,e.id,e.name title,e.slug,e.aliases,e.summary snippet,d.slug dataset_slug
    FROM dataset_entries e JOIN datasets d ON d.id=e.dataset_id
    WHERE e.published=1 AND (e.name LIKE ? OR e.aliases LIKE ? OR e.summary LIKE ? OR e.attributes_json LIKE ?)
    LIMIT 30
  `).all(pattern, pattern, pattern, pattern).map((item) => ({
    type: item.type,
    title: item.title,
    snippet: item.snippet,
    href: entryLink(item.dataset_slug, item)
  }));
  return [...articles, ...entries].slice(0, 40);
}

function buildToolsPage() {
  return {
    title: "星露谷实用工具 - 星露谷物语中文资料库",
    description: "使用鱼类条件查询器、作物收益计算器和社区中心进度清单，提高农场规划效率。",
    canonicalPath: routePath("tools"),
    h1: "星露谷实用工具",
    html: pageShell({
      h1: "星露谷实用工具",
      lead: "围绕钓鱼、作物收益和社区中心进度的高频工具入口。",
      sections: [
        listSection("工具入口", [
          `<a href="${routePath("tool", { tool: "fish" })}">鱼类条件查询器</a>：按季节、天气、时间和地点查询可捕获鱼类。`,
          `<a href="${routePath("tool", { tool: "crop-profit" })}">作物收益计算器</a>：比较作物种植、肥料和加工收益。`,
          `<a href="${routePath("tool", { tool: "community-center" })}">社区中心进度清单</a>：跟踪收集包进度和季节待办。`
        ])
      ]
    })
  };
}

function buildToolDetailPage(tool) {
  const pages = {
    fish: {
      title: "鱼类条件查询器 - 星露谷实用工具",
      h1: "鱼类条件查询器",
      description: "按季节、天气、时间、地点和获取方式筛选星露谷物语鱼类。"
    },
    "crop-profit": {
      title: "作物收益计算器 - 星露谷实用工具",
      h1: "作物收益计算器",
      description: "按季节剩余天数、预算、肥料、职业和加工方式估算作物净收益。"
    },
    crops: {
      title: "作物收益计算器 - 星露谷实用工具",
      h1: "作物收益计算器",
      description: "按季节剩余天数、预算、肥料、职业和加工方式估算作物净收益。"
    },
    "community-center": {
      title: "社区中心进度清单 - 星露谷实用工具",
      h1: "社区中心进度清单",
      description: "按房间保存社区中心收集包进度，筛选当前季节可取得的物品。"
    }
  };
  const page = pages[tool] || pages.fish;
  const canonicalTool = tool === "crops" ? "crop-profit" : tool;
  return {
    ...page,
    canonicalPath: routePath("tool", { tool: canonicalTool }),
    html: pageShell({
      h1: page.h1,
      lead: page.description,
      sections: buildToolGuidanceSections(tool)
    })
  };
}

function buildNotFoundPage(message, backPath) {
  return {
    status: 404,
    noindex: true,
    title: `${message} - 星露谷物语中文资料库`,
    description: "没有找到对应的公开内容，请返回资料库继续浏览。",
    canonicalPath: backPath || routePath("home"),
    h1: message,
    html: pageShell({
      h1: message,
      lead: "没有找到对应的公开内容。",
      sections: [listSection("继续浏览", [`<a href="${backPath || routePath("home")}">返回上一层</a>`])]
    })
  };
}

function buildPage(req, context) {
  const route = parseAppRoute({ pathname: req.path, search: req.url.split("?")[1] ? `?${req.url.split("?")[1]}` : "" });
  switch (route.name) {
    case "home":
      return buildHomePage(context.db);
    case "guides":
      return buildGuidesPage(context.db);
    case "guide":
      return buildGuidePage(context.db, route.params.slug, req, context);
    case "wiki":
      return buildWikiPage(context.db);
    case "wikiDataset":
      return buildDatasetPage(context.db, route.params.datasetSlug);
    case "wikiEntry":
      return buildEntryPage(context.db, route.params.datasetSlug, route.params.entrySlug);
    case "search":
      return buildSearchPage(context.db, route.searchParams);
    case "tools":
      return buildToolsPage();
    case "tool":
      return buildToolDetailPage(route.params.tool);
    default:
      return buildNotFoundPage("页面不存在", routePath("home"));
  }
}

function renderDocument(page, canonical) {
  const title = page.title || siteName;
  const description = page.description || defaultDescription;
  const ogType = page.ogType || "website";
  const extra = [
    ...(page.noindex ? ['<meta name="robots" content="noindex, nofollow">'] : []),
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:type" content="${escapeHtml(ogType)}">`,
    `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    ...(page.jsonLd || []).map((json) => `<script type="application/ld+json">${scriptJson(json)}</script>`)
  ].join("\n  ");

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/design-system/tokens.css">
  <link rel="stylesheet" href="/design-system/base.css">
  <link rel="stylesheet" href="/design-system/layout.css">
  <link rel="stylesheet" href="/design-system/components.css">
  ${extra}
</head>
<body class="public-site site">
  <div class="site-frame">
    <div id="site-header-root"></div>
    <main id="app">${page.html}</main>
    <div id="site-footer-root"></div>
  </div>
  <script type="module" src="/js/app.js"></script>
</body>
</html>`;
}

export function renderPublicPage({ req, context }) {
  const page = buildPage(req, context);
  const canonicalPath = page.canonicalPath || canonicalPathForRoute(parseAppRoute({ pathname: req.path, search: req.url.split("?")[1] ? `?${req.url.split("?")[1]}` : "" }));
  const canonical = absoluteUrl(canonicalPath, req, context);
  return {
    html: renderDocument(page, canonical),
    status: page.status || 200,
    noindex: Boolean(page.noindex),
    redirectPath: page.redirectPath
  };
}

export function renderPublicHtml(args) {
  return renderPublicPage(args).html;
}
