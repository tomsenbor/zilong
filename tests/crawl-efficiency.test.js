import fs from "node:fs";
import { afterEach, describe, expect, test } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { createTestContext } from "./helpers/context.js";

let context;

afterEach(() => context?.close());

function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

function sitemapEntries(xml) {
  return new Map([...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, block]) => {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    return [loc, { lastmod }];
  }));
}

describe("crawl efficiency", () => {
  test("public pages do not expose the private admin entry or probe its session API", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);

    const home = await request(app).get("/");
    const publicAppSource = fs.readFileSync(new URL("../public/js/app.js", import.meta.url), "utf8");
    const publicComponentsSource = fs.readFileSync(new URL("../public/js/components/site-components.js", import.meta.url), "utf8");

    expect(home.status).toBe(200);
    expect(home.text).not.toContain('href="/admin"');
    expect(publicAppSource).not.toContain('/api/admin/auth/session');
    expect(publicComponentsSource).not.toContain('href="/admin"');
  });

  test("robots keeps public content crawlable while excluding private admin endpoints", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);

    const robots = await request(app).get("/robots.txt");

    expect(robots.status).toBe(200);
    expect(robots.text).toContain("Allow: /");
    expect(robots.text).toContain("Disallow: /admin");
    expect(robots.text).toContain("Disallow: /api/admin/");
  });

  test("search result pages remain followable but are excluded from indexing", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);

    const search = await request(app).get("/search?q=草莓");

    expect(search.status).toBe(200);
    expect(search.headers["x-robots-tag"]).toBe("noindex,follow");
    expect(search.text).toContain('<meta name="robots" content="noindex,follow">');
  });

  test("sitemap hub lastmod values come from the newest published child content", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    context.db.prepare("UPDATE articles SET updated_at = '2026-08-01 09:00:00'").run();
    context.db.prepare("UPDATE articles SET updated_at = '2026-08-09 12:00:00' WHERE slug = (SELECT slug FROM articles WHERE status = 'published' LIMIT 1)").run();
    context.db.prepare("UPDATE dataset_entries SET updated_at = '2026-08-02 09:00:00'").run();
    context.db.prepare(`
      UPDATE dataset_entries
      SET updated_at = '2026-08-11 12:00:00'
      WHERE id = (
        SELECT e.id
        FROM dataset_entries e
        JOIN datasets d ON d.id = e.dataset_id
        WHERE d.slug = 'crops'
        ORDER BY e.id
        LIMIT 1
      )
    `).run();
    const app = createApp(context);

    const sitemap = await request(app).get("/sitemap.xml");
    const entries = sitemapEntries(sitemap.text);

    expect(sitemap.status).toBe(200);
    expect(entries.get("https://pixelharvestwiki.com/")?.lastmod).toBe("2026-08-11");
    expect(entries.get("https://pixelharvestwiki.com/guides")?.lastmod).toBe("2026-08-09");
    expect(entries.get("https://pixelharvestwiki.com/wiki")?.lastmod).toBe("2026-08-11");
    expect(entries.get("https://pixelharvestwiki.com/wiki/crops")?.lastmod).toBe("2026-08-11");
  });

  test("every sitemap URL is a direct indexable canonical response", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);
    const sitemap = await request(app).get("/sitemap.xml");
    const urls = sitemapUrls(sitemap.text);

    expect(urls.length).toBeGreaterThan(0);
    expect(new Set(urls).size).toBe(urls.length);

    for (const absoluteUrl of urls) {
      const url = new URL(absoluteUrl);
      const response = await request(app).get(`${url.pathname}${url.search}`);
      expect(response.status, absoluteUrl).toBe(200);
      expect(response.headers.location, absoluteUrl).toBeUndefined();
      expect(response.headers["x-robots-tag"], absoluteUrl).toBeUndefined();
      expect(response.text, absoluteUrl).not.toMatch(/<meta name="robots" content="[^"]*noindex/i);
      expect(response.text, absoluteUrl).toContain(`rel="canonical" href="${absoluteUrl}"`);
    }
  });
});
