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
  const article = findArticle(db, slug);
  if (!article) return buildNotFoundPage("攻略不存在", routePath("guides"));
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
        results.length
          ? listSection("搜索结果", results.map((item) => (
            `<a href="${item.href}">${escapeHtml(item.title)}</a>：${escapeHtml(item.snippet || "")}`
          )))
          : "<section><h2>搜索结果</h2><p>没有找到相关结果。</p></section>"
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
      sections: [
        "<section><h2>主要功能</h2><p>页面加载后可继续使用筛选器、表单和本地保存等交互功能。</p></section>"
      ]
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
    noindex: Boolean(page.noindex)
  };
}

export function renderPublicHtml(args) {
  return renderPublicPage(args).html;
}
