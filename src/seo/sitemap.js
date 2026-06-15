import { routePath } from "../../public/js/routes.js";
import { makeEntrySlug } from "../utils/entry-slug.js";

function xmlEscape(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function siteOrigin(req, context) {
  const configured = context.config.siteUrl || process.env.SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");
  return `${req.protocol}://${req.get("host") || "localhost:3000"}`;
}

function absoluteUrl(pathname, req, context) {
  return new URL(pathname, `${siteOrigin(req, context)}/`).href;
}

function normalizeLastmod(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function sitemapUrl({ loc, lastmod, changefreq, priority }) {
  return [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${xmlEscape(normalizeLastmod(lastmod))}</lastmod>` : "",
    changefreq ? `    <changefreq>${xmlEscape(changefreq)}</changefreq>` : "",
    priority ? `    <priority>${xmlEscape(priority)}</priority>` : "",
    "  </url>"
  ].filter(Boolean).join("\n");
}

function addUrl(items, seen, path, req, context, options = {}) {
  if (seen.has(path)) return;
  seen.add(path);
  items.push({
    loc: absoluteUrl(path, req, context),
    ...options
  });
}

export function renderSitemapXml({ req, context }) {
  const items = [];
  const seen = new Set();

  addUrl(items, seen, routePath("home"), req, context, { changefreq: "daily", priority: "1.0" });
  addUrl(items, seen, routePath("guides"), req, context, { changefreq: "weekly", priority: "0.8" });

  const articles = context.db.prepare(`
    SELECT slug, updated_at
    FROM articles
    WHERE status = 'published'
    ORDER BY featured DESC, updated_at DESC, id ASC
  `).all();
  for (const article of articles) {
    addUrl(items, seen, routePath("guide", { slug: article.slug }), req, context, {
      lastmod: article.updated_at,
      changefreq: "monthly",
      priority: "0.7"
    });
  }

  addUrl(items, seen, routePath("wiki"), req, context, { changefreq: "weekly", priority: "0.8" });

  const datasets = context.db.prepare(`
    SELECT id, slug
    FROM datasets
    ORDER BY sort_order ASC, name ASC
  `).all();
  for (const dataset of datasets) {
    addUrl(items, seen, routePath("wikiDataset", { datasetSlug: dataset.slug }), req, context, {
      changefreq: "weekly",
      priority: "0.7"
    });
  }

  const entries = context.db.prepare(`
    SELECT e.*, d.slug dataset_slug
    FROM dataset_entries e
    JOIN datasets d ON d.id = e.dataset_id
    WHERE e.published = 1
    ORDER BY d.sort_order ASC, d.name ASC, e.name ASC
  `).all();
  for (const entry of entries) {
    addUrl(items, seen, routePath("wikiEntry", {
      datasetSlug: entry.dataset_slug,
      entrySlug: makeEntrySlug(entry)
    }), req, context, {
      lastmod: entry.updated_at,
      changefreq: "monthly",
      priority: "0.6"
    });
  }

  addUrl(items, seen, routePath("tools"), req, context, { changefreq: "weekly", priority: "0.8" });
  for (const tool of ["fish", "crop-profit", "community-center"]) {
    addUrl(items, seen, routePath("tool", { tool }), req, context, {
      changefreq: "weekly",
      priority: "0.7"
    });
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...items.map(sitemapUrl),
    "</urlset>",
    ""
  ].join("\n");
}

export function renderRobotsTxt({ req, context }) {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml", req, context)}`,
    ""
  ].join("\n");
}
