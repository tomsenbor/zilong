import fs from "node:fs";
import path from "node:path";
import { articles, datasets, entries } from "./seeds.js";
import { makeSlug } from "../utils/slug.js";
import { makeEntrySlug } from "../utils/entry-slug.js";
import { buildAssetIndex, resolveGameAssetUrl } from "./assets.js";

const slug = makeSlug;

function gameAssetUrl(filename) {
  return `/assets/game/${filename.replaceAll("%", "%25")}`;
}

function catalogEntries() {
  const assetDir = path.resolve("public/assets/game");
  if (!fs.existsSync(assetDir)) return [];
  const selected = new Map();
  const priority = { "36": 4, "40": 3, "48": 2, "24": 1, "20": 0 };
  for (const filename of fs.readdirSync(assetDir)) {
    const match = filename.match(/^(\d+)px-(.+)\.(png|gif)$/i);
    if (!match) continue;
    const [, size, rawName] = match;
    const current = selected.get(rawName);
    if (!current || (priority[size] ?? -1) > (priority[current.size] ?? -1)) {
      selected.set(rawName, { size, filename });
    }
  }
  return [...selected.entries()].map(([rawName, asset]) => ({
    dataset: "catalog",
    name: rawName.replaceAll("_", " "),
    summary: "星露谷物语 1.6.15 对象图鉴索引",
    image: gameAssetUrl(asset.filename),
    attributes: { type: rawName.includes("Icon") ? "角色或界面" : "物品与对象", assetName: rawName }
  }));
}

export function refreshSearchIndex(db) {
  db.exec("DELETE FROM search_index");
  const insert = db.prepare("INSERT INTO search_index(entity_type, entity_id, title, body) VALUES (?, ?, ?, ?)");
  for (const row of db.prepare("SELECT id, title, summary, body FROM articles WHERE status = 'published'").all()) {
    insert.run("article", row.id, row.title, `${row.summary} ${row.body}`);
  }
  for (const row of db.prepare("SELECT id, name, aliases, summary, attributes_json FROM dataset_entries WHERE published = 1").all()) {
    insert.run("entry", row.id, row.name, `${row.aliases} ${row.summary} ${row.attributes_json}`);
  }
}

export function seedDatabase(db) {
  db.exec("BEGIN");
  try {
    const categoryInsert = db.prepare("INSERT OR IGNORE INTO categories(name, slug, sort_order) VALUES (?, ?, ?)");
    ["新手入门", "农场经营", "钓鱼", "人物关系", "进阶攻略"].forEach((name, index) => categoryInsert.run(name, slug(name), index));

    const datasetInsert = db.prepare(`
      INSERT INTO datasets(name, slug, description, icon, fields_json, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET name=excluded.name, description=excluded.description,
        icon=excluded.icon, fields_json=excluded.fields_json, sort_order=excluded.sort_order
    `);
    datasets.forEach((item, index) => datasetInsert.run(item.name, item.slug, item.description, `/assets/game/${item.icon}`, JSON.stringify(item.fields), index));

    const datasetIds = new Map(db.prepare("SELECT id, slug FROM datasets").all().map((row) => [row.slug, row.id]));
    const entryInsert = db.prepare(`
      INSERT INTO dataset_entries(dataset_id, name, slug, summary, image, attributes_json)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(dataset_id, slug) DO UPDATE SET summary=excluded.summary,
        image=excluded.image, attributes_json=excluded.attributes_json, updated_at=CURRENT_TIMESTAMP
    `);
    const entryByName = db.prepare("SELECT id, slug FROM dataset_entries WHERE dataset_id = ? AND name = ?");
    const entryBySlug = db.prepare("SELECT id FROM dataset_entries WHERE dataset_id = ? AND slug = ?");
    const updateEntrySlug = db.prepare("UPDATE dataset_entries SET slug = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    const deleteEntry = db.prepare("DELETE FROM dataset_entries WHERE id = ?");
    const assetDir = path.resolve("public/assets/game");
    const assetIndex = buildAssetIndex(fs.existsSync(assetDir) ? fs.readdirSync(assetDir) : []);
    [...entries, ...catalogEntries()].forEach((item) => {
      const datasetId = datasetIds.get(item.dataset);
      const image = resolveGameAssetUrl(item.image, assetIndex);
      const stableSlug = makeEntrySlug({ ...item, image });
      const existing = entryByName.get(datasetId, item.name);
      if (existing && existing.slug !== stableSlug) {
        const target = entryBySlug.get(datasetId, stableSlug);
        if (target && target.id !== existing.id) deleteEntry.run(existing.id);
        else updateEntrySlug.run(stableSlug, existing.id);
      }
      entryInsert.run(
        datasetId,
        item.name,
        stableSlug,
        item.summary,
        image,
        JSON.stringify(item.attributes)
      );
    });

    const articleInsert = db.prepare(`
      INSERT INTO articles(title, slug, summary, body, cover_image, status, featured)
      VALUES (?, ?, ?, ?, ?, 'published', ?)
      ON CONFLICT(slug) DO UPDATE SET summary=excluded.summary, body=excluded.body,
        cover_image=excluded.cover_image, featured=excluded.featured
    `);
    const relationInsert = db.prepare("INSERT OR IGNORE INTO article_categories(article_id, category_id) VALUES (?, ?)");
    const articleByTitle = db.prepare("SELECT id, slug FROM articles WHERE title = ?");
    const articleBySlug = db.prepare("SELECT id FROM articles WHERE slug = ?");
    const updateArticleSlug = db.prepare("UPDATE articles SET slug = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    const deleteArticle = db.prepare("DELETE FROM articles WHERE id = ?");
    articles.forEach((item) => {
      const articleSlug = item.slug || slug(item.title);
      const existing = articleByTitle.get(item.title);
      if (existing && existing.slug !== articleSlug) {
        const target = articleBySlug.get(articleSlug);
        if (target && target.id !== existing.id) deleteArticle.run(existing.id);
        else updateArticleSlug.run(articleSlug, existing.id);
      }
      articleInsert.run(item.title, articleSlug, item.summary, item.body, item.coverImage, item.featured);
      const articleId = db.prepare("SELECT id FROM articles WHERE slug = ?").get(articleSlug).id;
      item.categories.forEach((category) => {
        const categoryId = db.prepare("SELECT id FROM categories WHERE name = ?").get(category)?.id;
        if (categoryId) relationInsert.run(articleId, categoryId);
      });
    });
    refreshSearchIndex(db);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
