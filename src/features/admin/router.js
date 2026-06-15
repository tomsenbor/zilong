import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { z } from "zod";
import { AppError } from "../../middleware/errors.js";
import { refreshSearchIndex, seedDatabase } from "../../db/seed.js";
import { makeSlug } from "../../utils/slug.js";
import { requireAdmin, requireCsrf } from "../auth/router.js";

const slug = makeSlug;
const articleSchema = z.object({
  title: z.string().min(2).max(120),
  slug: z.string().optional(),
  summary: z.string().max(500).default(""),
  body: z.string().default(""),
  coverImage: z.string().default(""),
  status: z.enum(["draft", "published"]).default("draft"),
  gameVersion: z.string().default("1.6.15"),
  featured: z.boolean().default(false),
  categoryIds: z.array(z.number().int()).default([])
});
const entrySchema = z.object({
  datasetId: z.number().int().positive(),
  name: z.string().min(1).max(120),
  slug: z.string().optional(),
  aliases: z.string().default(""),
  summary: z.string().default(""),
  image: z.string().default(""),
  attributes: z.record(z.any()).default({}),
  gameVersion: z.string().default("1.6.15"),
  published: z.boolean().default(true)
});

const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
const mapEntry = (row) => ({ ...row, attributes: parse(row.attributes_json, {}), attributes_json: undefined });

function replaceArticleCategories(db, articleId, ids) {
  db.prepare("DELETE FROM article_categories WHERE article_id=?").run(articleId);
  const insert = db.prepare("INSERT OR IGNORE INTO article_categories(article_id,category_id) VALUES (?,?)");
  ids.forEach((id) => insert.run(articleId, id));
}

export function createAdminRouter(context) {
  const { db, config } = context;
  const router = Router();
  router.use(requireAdmin);
  router.use((req, res, next) => ["GET", "HEAD", "OPTIONS"].includes(req.method) ? next() : requireCsrf(req, res, next));

  router.get("/dashboard", (req, res) => {
    const count = (table) => db.prepare(`SELECT COUNT(*) count FROM ${table}`).get().count;
    res.json({
      stats: { articles: count("articles"), entries: count("dataset_entries"), datasets: count("datasets"), media: count("media") },
      recent: db.prepare("SELECT id,title,status,updated_at FROM articles ORDER BY updated_at DESC LIMIT 8").all()
    });
  });
  router.get("/articles", (req, res) => {
    const categoryIds = db.prepare("SELECT category_id FROM article_categories WHERE article_id=? ORDER BY category_id");
    const items = db.prepare("SELECT * FROM articles ORDER BY updated_at DESC").all().map((item) => ({
      ...item,
      category_ids: categoryIds.all(item.id).map((row) => row.category_id)
    }));
    res.json({ items });
  });
  router.post("/articles", (req, res, next) => {
    try {
      const input = articleSchema.parse(req.body);
      const result = db.prepare(`
        INSERT INTO articles(title,slug,summary,body,cover_image,status,game_version,featured)
        VALUES (?,?,?,?,?,?,?,?)
      `).run(input.title, slug(input.slug || input.title), input.summary, input.body, input.coverImage, input.status, input.gameVersion, Number(input.featured));
      replaceArticleCategories(db, Number(result.lastInsertRowid), input.categoryIds);
      refreshSearchIndex(db);
      res.status(201).json({ item: db.prepare("SELECT * FROM articles WHERE id=?").get(result.lastInsertRowid) });
    } catch (error) { next(error); }
  });
  router.put("/articles/:id", (req, res, next) => {
    try {
      const input = articleSchema.parse(req.body);
      const result = db.prepare(`
        UPDATE articles SET title=?,slug=?,summary=?,body=?,cover_image=?,status=?,game_version=?,
          featured=?,updated_at=CURRENT_TIMESTAMP WHERE id=?
      `).run(input.title, slug(input.slug || input.title), input.summary, input.body, input.coverImage, input.status, input.gameVersion, Number(input.featured), req.params.id);
      if (!result.changes) throw new AppError(404, "ARTICLE_NOT_FOUND", "攻略不存在");
      replaceArticleCategories(db, Number(req.params.id), input.categoryIds);
      refreshSearchIndex(db);
      res.json({ item: db.prepare("SELECT * FROM articles WHERE id=?").get(req.params.id) });
    } catch (error) { next(error); }
  });
  router.delete("/articles/:id", (req, res) => {
    db.prepare("DELETE FROM articles WHERE id=?").run(req.params.id);
    refreshSearchIndex(db);
    res.status(204).end();
  });

  router.get("/categories", (req, res) => res.json({ items: db.prepare("SELECT * FROM categories ORDER BY sort_order,name").all() }));
  router.post("/categories", (req, res) => {
    const name = String(req.body.name || "").trim();
    if (!name) throw new AppError(400, "INVALID_CATEGORY", "分类名称不能为空");
    const result = db.prepare("INSERT INTO categories(name,slug,description,icon) VALUES (?,?,?,?)")
      .run(name, slug(req.body.slug || name), req.body.description || "", req.body.icon || "");
    res.status(201).json({ item: db.prepare("SELECT * FROM categories WHERE id=?").get(result.lastInsertRowid) });
  });
  router.delete("/categories/:id", (req, res) => {
    db.prepare("DELETE FROM categories WHERE id=?").run(req.params.id);
    res.status(204).end();
  });

  router.get("/datasets", (req, res) => {
    const items = db.prepare("SELECT * FROM datasets ORDER BY sort_order,name").all().map((row) => ({ ...row, fields: parse(row.fields_json, []) }));
    res.json({ items });
  });
  router.get("/entries", (req, res) => {
    const datasetId = Number(req.query.datasetId);
    const items = db.prepare("SELECT * FROM dataset_entries WHERE dataset_id=? ORDER BY name").all(datasetId).map(mapEntry);
    res.json({ items });
  });
  router.post("/entries", (req, res, next) => {
    try {
      const input = entrySchema.parse(req.body);
      const result = db.prepare(`
        INSERT INTO dataset_entries(dataset_id,name,slug,aliases,summary,image,attributes_json,game_version,published)
        VALUES (?,?,?,?,?,?,?,?,?)
      `).run(input.datasetId, input.name, slug(input.slug || input.name), input.aliases, input.summary, input.image, JSON.stringify(input.attributes), input.gameVersion, Number(input.published));
      refreshSearchIndex(db);
      res.status(201).json({ item: mapEntry(db.prepare("SELECT * FROM dataset_entries WHERE id=?").get(result.lastInsertRowid)) });
    } catch (error) { next(error); }
  });
  router.put("/entries/:id", (req, res, next) => {
    try {
      const input = entrySchema.parse(req.body);
      db.prepare(`
        UPDATE dataset_entries SET dataset_id=?,name=?,slug=?,aliases=?,summary=?,image=?,attributes_json=?,
          game_version=?,published=?,updated_at=CURRENT_TIMESTAMP WHERE id=?
      `).run(input.datasetId, input.name, slug(input.slug || input.name), input.aliases, input.summary, input.image, JSON.stringify(input.attributes), input.gameVersion, Number(input.published), req.params.id);
      refreshSearchIndex(db);
      res.json({ item: mapEntry(db.prepare("SELECT * FROM dataset_entries WHERE id=?").get(req.params.id)) });
    } catch (error) { next(error); }
  });
  router.delete("/entries/:id", (req, res) => {
    db.prepare("DELETE FROM dataset_entries WHERE id=?").run(req.params.id);
    refreshSearchIndex(db);
    res.status(204).end();
  });

  router.get("/export", (req, res) => {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: "1.6.15",
      categories: db.prepare("SELECT * FROM categories").all(),
      articles: db.prepare("SELECT * FROM articles").all(),
      datasets: db.prepare("SELECT * FROM datasets").all(),
      entries: db.prepare("SELECT * FROM dataset_entries").all()
    };
    res.setHeader("Content-Disposition", `attachment; filename="stardew-export-${Date.now()}.json"`);
    res.json(payload);
  });
  router.post("/import", (req, res) => {
    if (req.body?.resetSeed === true) seedDatabase(db);
    res.json({ message: "数据导入完成" });
  });
  router.get("/backup", (req, res) => {
    const backup = path.join(path.dirname(config.databasePath), `stardew-backup-${Date.now()}.db`);
    db.exec(`VACUUM INTO '${backup.replaceAll("'", "''")}'`);
    res.download(backup, path.basename(backup), () => fs.rmSync(backup, { force: true }));
  });
  return router;
}
