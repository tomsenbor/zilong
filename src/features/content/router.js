import { Router } from "express";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { AppError } from "../../middleware/errors.js";
import { makeEntrySlug } from "../../utils/entry-slug.js";

const integer = (value, fallback, max = 100) => Math.min(Math.max(Number.parseInt(value, 10) || fallback, 1), max);
const parse = (value, fallback) => {
  try { return JSON.parse(value); } catch { return fallback; }
};
const pageResult = (items, page, pageSize, total = items.length) => ({
  items,
  pagination: { page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) }
});
const contentLocale = "zh-CN";
const articleHtmlOptions = {
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

function mapEntry(row) {
  const slug = makeEntrySlug(row);
  return {
    ...row,
    slug,
    locale: row.locale || contentLocale,
    translationGroupId: row.translation_group_id || `entry:${row.dataset_slug || row.dataset_id}:${slug}`,
    attributes: parse(row.attributes_json, {}),
    attributes_json: undefined
  };
}

function mapArticle(row) {
  return {
    ...row,
    locale: row.locale || contentLocale,
    translationGroupId: row.translation_group_id || `article:${row.slug}`
  };
}

function mapDataset(row) {
  return {
    ...row,
    locale: row.locale || contentLocale,
    translationGroupId: row.translation_group_id || `dataset:${row.slug}`,
    fields: parse(row.fields_json, []),
    fields_json: undefined
  };
}

export function createContentRouter({ db }) {
  const router = Router();

  router.get("/stats", (req, res) => {
    const entries = db.prepare("SELECT COUNT(*) count FROM dataset_entries WHERE published = 1").get().count;
    const articles = db.prepare("SELECT COUNT(*) count FROM articles WHERE status = 'published'").get().count;
    const datasets = db.prepare("SELECT COUNT(*) count FROM datasets").get().count;
    res.json({ entries, articles, datasets, version: "1.6.15" });
  });

  router.get("/categories", (req, res) => {
    const items = db.prepare(`
      SELECT c.*, COUNT(ac.article_id) article_count FROM categories c
      LEFT JOIN article_categories ac ON ac.category_id = c.id
      GROUP BY c.id ORDER BY c.sort_order, c.name
    `).all();
    res.json({ items });
  });

  router.get("/articles", (req, res) => {
    const page = integer(req.query.page, 1, 100000);
    const pageSize = integer(req.query.pageSize, 12, 50);
    const featured = req.query.featured === "true" ? "AND featured = 1" : "";
    const q = `%${String(req.query.q || "")}%`;
    const total = db.prepare(`SELECT COUNT(*) count FROM articles WHERE status='published' ${featured} AND (title LIKE ? OR summary LIKE ?)`).get(q, q).count;
    const items = db.prepare(`
      SELECT id,title,slug,summary,cover_image,status,game_version,featured,updated_at
      FROM articles WHERE status='published' ${featured} AND (title LIKE ? OR summary LIKE ?)
      ORDER BY featured DESC, updated_at DESC LIMIT ? OFFSET ?
    `).all(q, q, pageSize, (page - 1) * pageSize).map(mapArticle);
    res.json(pageResult(items, page, pageSize, total));
  });

  router.get("/articles/:slug", (req, res, next) => {
    const item = mapArticle(db.prepare("SELECT * FROM articles WHERE slug = ? AND status = 'published'").get(req.params.slug) || {});
    if (!item.id) return next(new AppError(404, "ARTICLE_NOT_FOUND", "攻略不存在"));
    item.html = sanitizeHtml(marked.parse(item.body), articleHtmlOptions);
    item.categories = db.prepare(`
      SELECT c.* FROM categories c JOIN article_categories ac ON ac.category_id=c.id WHERE ac.article_id=?
    `).all(item.id);
    res.json({ item });
  });

  router.get("/datasets", (req, res) => {
    const items = db.prepare(`
      SELECT d.*, COUNT(e.id) entry_count FROM datasets d
      LEFT JOIN dataset_entries e ON e.dataset_id=d.id AND e.published=1
      GROUP BY d.id ORDER BY d.sort_order, d.name
    `).all().map(mapDataset);
    res.json({ items });
  });

  router.get("/datasets/:slug/entries", (req, res, next) => {
    const dataset = db.prepare("SELECT * FROM datasets WHERE slug = ?").get(req.params.slug);
    if (!dataset) return next(new AppError(404, "DATASET_NOT_FOUND", "资料分类不存在"));
    const page = integer(req.query.page, 1, 100000);
    const pageSize = integer(req.query.pageSize, 12, 100);
    const query = String(req.query.q || "").trim().toLowerCase();
    let items = db.prepare("SELECT * FROM dataset_entries WHERE dataset_id = ? AND published = 1").all(dataset.id).map(mapEntry);
    items = items.filter((item) => {
      if (query && !`${item.name} ${item.aliases} ${item.summary}`.toLowerCase().includes(query)) return false;
      return Object.entries(req.query).every(([key, value]) => {
        if (["q", "page", "pageSize", "sort", "order"].includes(key) || !value) return true;
        const actual = item.attributes[key];
        return Array.isArray(actual) ? actual.includes(value) : String(actual || "").includes(String(value));
      });
    });
    const sort = String(req.query.sort || "name");
    const direction = req.query.order === "desc" ? -1 : 1;
    items.sort((a, b) => String(a[sort] ?? a.attributes[sort] ?? "").localeCompare(String(b[sort] ?? b.attributes[sort] ?? ""), "zh-CN", { numeric: true }) * direction);
    const total = items.length;
    const paged = items.slice((page - 1) * pageSize, page * pageSize);
    res.json({ ...pageResult(paged, page, pageSize, total), dataset: mapDataset(dataset) });
  });

  router.get("/datasets/:slug/entries/:entrySlug", (req, res, next) => {
    const baseQuery = `
      SELECT e.*, d.name dataset_name, d.slug dataset_slug, d.fields_json
      FROM dataset_entries e JOIN datasets d ON d.id=e.dataset_id
      WHERE d.slug=? AND e.published=1
    `;
    const item = db.prepare(`${baseQuery} AND e.slug=?`).get(req.params.slug, req.params.entrySlug)
      || db.prepare(`${baseQuery} AND (e.name=? OR e.aliases LIKE ?)`).get(
        req.params.slug,
        req.params.entrySlug,
        `%${req.params.entrySlug}%`
      );
    if (!item) return next(new AppError(404, "ENTRY_NOT_FOUND", "资料条目不存在"));
    res.json({ item: { ...mapEntry(item), fields: parse(item.fields_json, []) } });
  });

  router.get("/search", (req, res) => {
    const q = String(req.query.q || "").trim();
    const page = integer(req.query.page, 1, 100000);
    const pageSize = integer(req.query.pageSize, 12, 50);
    if (!q) return res.json(pageResult([], page, pageSize, 0));
    const pattern = `%${q}%`;
    const articles = db.prepare(`
      SELECT 'article' type,id,title,slug,summary snippet,'' dataset_slug
      FROM articles WHERE status='published' AND (title LIKE ? OR summary LIKE ? OR body LIKE ?)
    `).all(pattern, pattern, pattern).map((item) => ({
      ...item,
      locale: contentLocale,
      translationGroupId: `article:${item.slug}`
    }));
    const entries = db.prepare(`
      SELECT 'entry' type,e.id,e.name title,e.slug,e.image,e.summary snippet,d.slug dataset_slug
      FROM dataset_entries e JOIN datasets d ON d.id=e.dataset_id
      WHERE e.published=1 AND (e.name LIKE ? OR e.aliases LIKE ? OR e.summary LIKE ? OR e.attributes_json LIKE ?)
    `).all(pattern, pattern, pattern, pattern).map((item) => ({
      ...item,
      slug: makeEntrySlug(item),
      locale: contentLocale,
      translationGroupId: `entry:${item.dataset_slug}:${makeEntrySlug(item)}`
    }));
    const all = [...articles, ...entries];
    res.json(pageResult(all.slice((page - 1) * pageSize, page * pageSize), page, pageSize, all.length));
  });

  return router;
}
