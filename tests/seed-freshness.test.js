import { afterEach, describe, expect, test } from "vitest";
import { initialize } from "../src/db/initialize.js";
import { seedDatabase } from "../src/db/seed.js";
import { createTestContext } from "./helpers/context.js";

let context;

afterEach(() => context?.close());

describe("seed freshness timestamps", () => {
  test("keeps an unchanged wiki entry lastmod stable across repeated seeds", async () => {
    context = createTestContext();
    await initialize(context);

    const entry = context.db.prepare(`
      SELECT e.id
      FROM dataset_entries e
      JOIN datasets d ON d.id = e.dataset_id
      WHERE d.slug != 'catalog'
      ORDER BY e.id
      LIMIT 1
    `).get();
    context.db.prepare("UPDATE dataset_entries SET updated_at = '2001-01-01 00:00:00' WHERE id = ?").run(entry.id);

    seedDatabase(context.db);

    const unchanged = context.db.prepare("SELECT updated_at FROM dataset_entries WHERE id = ?").get(entry.id);
    expect(unchanged.updated_at).toBe("2001-01-01 00:00:00");
  });

  test("refreshes a wiki entry lastmod only when seeded content changes", async () => {
    context = createTestContext();
    await initialize(context);

    const entry = context.db.prepare(`
      SELECT e.id, e.summary
      FROM dataset_entries e
      JOIN datasets d ON d.id = e.dataset_id
      WHERE d.slug != 'catalog'
      ORDER BY e.id
      LIMIT 1
    `).get();
    context.db.prepare(`
      UPDATE dataset_entries
      SET summary = 'stale test content', updated_at = '2001-01-01 00:00:00'
      WHERE id = ?
    `).run(entry.id);

    seedDatabase(context.db);

    const refreshed = context.db.prepare("SELECT summary, updated_at FROM dataset_entries WHERE id = ?").get(entry.id);
    expect(refreshed.summary).toBe(entry.summary);
    expect(refreshed.updated_at).not.toBe("2001-01-01 00:00:00");
  });

  test("refreshes an article lastmod only when seeded content changes", async () => {
    context = createTestContext();
    await initialize(context);

    const article = context.db.prepare(`
      SELECT id, summary
      FROM articles
      WHERE status = 'published'
      ORDER BY id
      LIMIT 1
    `).get();
    context.db.prepare(`
      UPDATE articles
      SET summary = 'stale test content', updated_at = '2001-01-01 00:00:00'
      WHERE id = ?
    `).run(article.id);

    seedDatabase(context.db);

    const refreshed = context.db.prepare("SELECT summary, updated_at FROM articles WHERE id = ?").get(article.id);
    expect(refreshed.summary).toBe(article.summary);
    expect(refreshed.updated_at).not.toBe("2001-01-01 00:00:00");
  });
});
