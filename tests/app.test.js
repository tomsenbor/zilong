import { afterEach, describe, expect, test } from "vitest";
import request from "supertest";
import fs from "node:fs";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { createTestContext } from "./helpers/context.js";

let context;

afterEach(() => context?.close());

function getBodyClassTokens(html) {
  const match = html.match(/<body\b[^>]*\bclass=(["'])(.*?)\1/i);
  return new Set((match?.[2] || "").split(/\s+/).filter(Boolean));
}

function expectBodyClassTokens(html, expectedTokens) {
  const tokens = getBodyClassTokens(html);
  for (const token of expectedTokens) {
    expect(tokens.has(token)).toBe(true);
  }
}

describe("application shell", () => {
  test("reports health and database readiness", async () => {
    context = createTestContext();
    const app = createApp(context);
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "ok",
      database: "ready",
      version: "1.6.15"
    });
    expect(response.headers["content-security-policy"]).toContain("default-src 'self'");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  test("sets a secure session cookie behind the configured HTTPS proxy", async () => {
    context = createTestContext();
    context.config.nodeEnv = "production";
    context.config.trustProxy = 1;
    context.config.cookieSecure = true;
    await initialize(context);
    const app = createApp(context);

    const response = await request(app)
      .post("/api/admin/auth/login")
      .set("x-forwarded-proto", "https")
      .send({ username: "admin", password: "test-password" });

    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]?.[0]).toContain("Secure");
  });

  test("does not upgrade assets before HTTPS is enabled", async () => {
    context = createTestContext();
    context.config.nodeEnv = "production";
    context.config.cookieSecure = false;
    const app = createApp(context);

    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.headers["content-security-policy"]).not.toContain("upgrade-insecure-requests");
  });

  test("returns 404 for missing static assets instead of the SPA shell", async () => {
    context = createTestContext();
    const app = createApp(context);
    const response = await request(app).get("/assets/game/missing-image.png");

    expect(response.status).toBe(404);
    expect(response.type).toMatch(/json/);
  });

  test("serves the SPA shell for real public URLs and keeps admin separate", async () => {
    context = createTestContext();
    await initialize(context);
    const app = createApp(context);

    for (const url of [
      "/guides",
      "/guides/year-one-spring-complete-route",
      "/wiki",
      "/wiki/crops",
      "/wiki/crops/%E8%8D%89%E8%8E%93",
      "/search?q=%E6%B8%A9%E5%AE%A4",
      "/tools",
      "/tools/fish"
    ]) {
      const response = await request(app).get(url);
      expect(response.status).toBe(200);
      expect(response.text).toContain('<main id="app">');
      expect(response.text).toContain('/js/app.js');
    }

    const admin = await request(app).get("/admin");
    expect(admin.status).toBe(200);
    expect(admin.text).toContain("admin-app");
    const adminBodyClasses = getBodyClassTokens(admin.text);
    expect(adminBodyClasses.has("public-site")).toBe(false);
    expect(adminBodyClasses.has("site")).toBe(false);
  });

  test("renders public pages through the SEO document shell only", async () => {
    context = createTestContext();
    await initialize(context);
    const app = createApp(context);
    const appSource = fs.readFileSync("src/app.js", "utf8");
    const clientSource = fs.readFileSync("public/js/app.js", "utf8");
    const routesSource = fs.readFileSync("public/js/routes.js", "utf8");

    expect(appSource).not.toContain("public\", \"index.html");
    expect(appSource).not.toContain("public', 'index.html");
    expect(appSource).not.toContain("readFileSync(path.join(root, \"public\", \"index.html\"))");
    expect(clientSource).not.toContain("redirectLegacyHashIfNeeded");
    expect(clientSource).not.toContain("location.hash");
    expect(clientSource).not.toContain("url.hash");
    expect(clientSource).not.toContain("hashchange");
    expect(clientSource).toContain('document.body.classList.add("public-site", "site")');
    expect(routesSource).not.toContain("location.hash");
    expect(routesSource).not.toContain("target.hash");

    for (const url of ["/", "/guides", "/wiki", "/tools"]) {
      const response = await request(app).get(url);
      expect(response.status).toBe(200);
      expectBodyClassTokens(response.text, ["public-site", "site"]);
      expect(response.text).toContain('<div class="site-frame">');
      expect(response.text).toContain('<main id="app">');
      expect(response.text).toContain("/design-system/tokens.css");
      expect(response.text).toContain("/design-system/base.css");
      expect(response.text).toContain("/design-system/layout.css");
      expect(response.text).toContain("/design-system/components.css");
      expect(response.text).toContain("/js/app.js");
      expect(response.text).toContain("<h1>");
      expect(response.text).not.toContain("pixel-site-frame");
      expect(response.text).not.toContain("pixel-frame");
      expect(response.text).not.toContain("pixel-button");
      expect(response.text).not.toContain("wood-");
      expect(response.text).not.toContain("ui-card");
      expect(response.text).not.toContain("ui-button");
      expect(response.text).not.toContain("base-card");
      expect(response.text).not.toContain("old-card");
      expect(response.text).not.toContain("stardew-panel");
      expect(response.text).not.toContain("game-menu");
      expect(response.text).not.toContain("heavy-border");
      expect(response.text).not.toContain("/css/app.css");
      expect(response.text).not.toContain("/css/tailwind.css");
      expect(response.text).not.toContain("homepage.css");
    }
  });

  test("renders SEO HTML for public real URLs without exposing admin to indexing", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);

    const home = await request(app).get("/");
    expect(home.status).toBe(200);
    expect(home.text).toContain("<title>");
    expect(home.text).toContain('rel="canonical" href="https://pixelharvestwiki.com/"');
    expect(home.text).toContain('property="og:title"');
    expect(home.text).toContain("<h1>星露谷物语中文资料库</h1>");
    expect(home.text).toContain("作物 / 鱼类 / NPC / 任务 / 社区中心一站查询");

    const guides = await request(app).get("/guides");
    expect(guides.text).toContain("<h1>星露谷攻略文章</h1>");
    expect(guides.text).toContain("第一年春季完整发展路线");

    const guide = await request(app).get("/guides/year-one-spring-complete-route");
    expect(guide.text).toContain("<h1>第一年春季完整发展路线</h1>");
    expect(guide.text).toContain("从防风草到草莓");
    expect(guide.text).toContain("复活节与草莓");
    expect(guide.text).toContain('"@type":"Article"');
    expect(guide.text).toContain('"mainEntityOfPage"');

    const wiki = await request(app).get("/wiki");
    expect(wiki.text).toContain("<h1>攻略资料分类</h1>");
    expect(wiki.text).toContain("作物与种子");

    const dataset = await request(app).get("/wiki/crops");
    expect(dataset.text).toContain("<h1>作物与种子</h1>");
    expect(dataset.text).toContain("草莓");

    const entry = await request(app).get("/wiki/crops/strawberry");
    expect(entry.text).toContain("<h1>草莓</h1>");
    expect(entry.text).toContain("作物与种子");
    expect(entry.text).toContain("基础信息");
    expect(entry.text).toContain('"@type":"BreadcrumbList"');
    expect(entry.text).toContain("https://pixelharvestwiki.com/wiki/crops/strawberry");

    const search = await request(app).get(`/search?q=${encodeURIComponent("鱼类")}`);
    expect(search.text).toContain("<title>鱼类 搜索结果");
    expect(search.text).toContain("<h1>搜索：鱼类</h1>");
    expect(search.text).toContain('全<mark class="search-highlight">鱼类</mark>季节与天气速查');
    expect(search.text).toContain("找到");
    expect(search.text).toContain('<mark class="search-highlight">鱼类</mark>');
    expect(search.text).toContain('<span class="row-result-type">攻略</span>');
    expect(search.text).toContain('<span class="row-result-type">图鉴</span>');
    expect(search.text).toContain("/guides/");
    expect(search.text).not.toContain("#article");

    const searchLanding = await request(app).get("/search");
    expect(searchLanding.text).toContain("输入关键词开始搜索");
    expect(searchLanding.text).toContain('href="/wiki"');
    expect(searchLanding.text).toContain('href="/tools"');

    const noResults = await request(app).get(`/search?q=${encodeURIComponent("不存在的星露谷搜索词")}`);
    expect(noResults.text).toContain("没有找到与");
    expect(noResults.text).toContain("建议换一个关键词");
    expect(noResults.text).toContain('href="/guides"');

    for (const url of ["/tools", "/tools/fish", "/tools/crop-profit", "/tools/community-center"]) {
      const response = await request(app).get(url);
      expect(response.status).toBe(200);
      expect(response.text).toContain("<h1>");
      expect(response.text).toContain('rel="canonical" href="https://pixelharvestwiki.com');
      expect(response.text).toContain('property="og:description"');
    }

    const admin = await request(app).get("/admin");
    expect(admin.text).toContain("admin-app");
    expect(admin.text).not.toContain('rel="canonical"');
    expect(admin.text).not.toContain('property="og:title"');
  });

  test("serves sitemap, robots, and noindex for admin", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);

    const sitemap = await request(app).get("/sitemap.xml");
    expect(sitemap.status).toBe(200);
    expect(sitemap.headers["content-type"]).toContain("application/xml");
    expect(sitemap.text).toContain("<loc>https://pixelharvestwiki.com/</loc>");
    expect(sitemap.text).toContain("<loc>https://pixelharvestwiki.com/guides</loc>");
    expect(sitemap.text).toMatch(/<loc>https:\/\/pixelharvestwiki\.com\/guides\/[^<]+<\/loc>/);
    expect(sitemap.text).toContain("<loc>https://pixelharvestwiki.com/wiki</loc>");
    expect(sitemap.text).toContain("<loc>https://pixelharvestwiki.com/wiki/crops</loc>");
    expect(sitemap.text).toContain("<loc>https://pixelharvestwiki.com/wiki/crops/strawberry</loc>");
    expect(sitemap.text).toContain("<loc>https://pixelharvestwiki.com/tools</loc>");
    expect(sitemap.text).toContain("<loc>https://pixelharvestwiki.com/tools/fish</loc>");
    expect(sitemap.text).toContain("<loc>https://pixelharvestwiki.com/tools/crop-profit</loc>");
    expect(sitemap.text).toContain("<loc>https://pixelharvestwiki.com/tools/community-center</loc>");
    expect(sitemap.text).not.toContain("/admin");
    expect(sitemap.text).not.toContain("/search");
    expect(sitemap.text).not.toContain("#article");
    expect(sitemap.text).not.toContain("/en/");

    const robots = await request(app).get("/robots.txt");
    expect(robots.status).toBe(200);
    expect(robots.headers["content-type"]).toContain("text/plain");
    expect(robots.text).toContain("User-agent: *");
    expect(robots.text).toContain("Allow: /");
    expect(robots.text).toContain("Disallow: /admin");
    expect(robots.text).toContain("Sitemap: https://pixelharvestwiki.com/sitemap.xml");

    const admin = await request(app).get("/admin");
    expect(admin.status).toBe(200);
    expect(admin.headers["x-robots-tag"]).toContain("noindex");
  });

  test("serves v5.3 content-building guides through real URLs and sitemap", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);
    const guidePaths = new Map([
      ["第一年春季赚钱路线", "/guides/year-one-spring-money-route"],
      ["新手钓鱼入门与鱼类查询使用指南", "/guides/beginner-fishing-guide-and-fish-search"],
      ["社区中心前期优先完成路线", "/guides/early-community-center-priority-route"],
      ["矿洞前 40 层准备与收益路线", "/guides/mines-floor-40-preparation-route"],
      ["作物收益计算器使用指南", "/guides/crop-profit-calculator-guide"]
    ]);
    const sitemap = await request(app).get("/sitemap.xml");

    for (const [title, path] of guidePaths) {
      const page = await request(app).get(path);
      expect(page.status, title).toBe(200);
      expect(page.text, title).toContain(`<h1>${title}</h1>`);
      expect(page.text, title).toMatch(/href="\/(?:tools|wiki)\//);
      expect(sitemap.text, title).toContain(`https://pixelharvestwiki.com${path}`);
      expect(sitemap.text, title).not.toContain(`/guides/${encodeURIComponent(title)}`);
    }
  });

  test("serves original built-in guides through English slugs and redirects legacy Chinese URLs", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);
    const guidePaths = new Map([
      ["第一年春季完整发展路线", "/guides/year-one-spring-complete-route"],
      ["温室解锁与全年种植布局", "/guides/greenhouse-unlock-year-round-layout"],
      ["全鱼类季节与天气速查", "/guides/all-fish-season-weather-reference"],
      ["村民送礼与生日指南", "/guides/villager-gifts-and-birthdays-guide"],
      ["1.6 精通系统详解", "/guides/mastery-system-guide-1-6"],
      ["姜岛解锁与金色核桃收集路线", "/guides/ginger-island-golden-walnut-route"]
    ]);
    const sitemap = await request(app).get("/sitemap.xml");

    for (const [title, path] of guidePaths) {
      const slug = path.replace("/guides/", "");
      const row = context.db.prepare("SELECT title, slug FROM articles WHERE title = ?").get(title);
      const page = await request(app).get(path);
      const legacy = await request(app).get(`/guides/${encodeURIComponent(title)}`);

      expect(row.slug, title).toBe(slug);
      expect(row.slug, title).not.toMatch(/[\u3400-\u9fff]/);
      expect(page.status, path).toBe(200);
      expect(page.text, path).toContain(`<h1>${title}</h1>`);
      expect(legacy.status, title).toBe(301);
      expect(legacy.headers.location, title).toBe(path);
      expect(sitemap.text, title).toContain(`https://pixelharvestwiki.com${path}`);
      expect(sitemap.text, title).not.toContain(`/guides/${encodeURIComponent(title)}`);
    }
  });

  test("serves v5.3.3 guide batch through English URLs and sitemap", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);
    const guidePaths = [
      "/guides/year-one-summer-money-route",
      "/guides/sprinkler-unlock-and-ore-route",
      "/guides/community-center-fish-tank-route",
      "/guides/seasonal-items-to-keep",
      "/guides/beginner-backpack-and-energy-route"
    ];
    const sitemap = await request(app).get("/sitemap.xml");
    const rows = context.db.prepare(`
      SELECT slug, body
      FROM articles
      WHERE slug IN (${guidePaths.map(() => "?").join(",")})
      ORDER BY slug
    `).all(...guidePaths.map((path) => path.replace("/guides/", "")));

    expect(rows).toHaveLength(guidePaths.length);

    for (const path of guidePaths) {
      const slug = path.replace("/guides/", "");
      const row = rows.find((item) => item.slug === slug);
      const page = await request(app).get(path);
      const internalLinks = [...page.text.matchAll(/href="(\/(?:tools|wiki|guides)\/[^"#]+)"/g)]
        .map((match) => match[1]);

      expect(page.status, path).toBe(200);
      expect(page.text, path).toContain("<h1>");
      expect(row.slug, path).not.toMatch(/[\u3400-\u9fff]/);
      expect(new Set(internalLinks).size, path).toBeGreaterThanOrEqual(2);
      expect(sitemap.text, path).toContain(`https://pixelharvestwiki.com${path}`);
    }
  });

  test("serves v5.3.4 guide batch through English URLs and sitemap", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);
    const guidePaths = [
      "/guides/year-one-fall-money-route",
      "/guides/coop-barn-animal-products-route",
      "/guides/greenhouse-crops-processing-route",
      "/guides/quest-board-special-orders-route",
      "/guides/winter-prep-year-two-route"
    ];
    const sitemap = await request(app).get("/sitemap.xml");
    const rows = context.db.prepare(`
      SELECT slug, body
      FROM articles
      WHERE slug IN (${guidePaths.map(() => "?").join(",")})
      ORDER BY slug
    `).all(...guidePaths.map((path) => path.replace("/guides/", "")));

    expect(rows).toHaveLength(guidePaths.length);

    for (const path of guidePaths) {
      const slug = path.replace("/guides/", "");
      const row = rows.find((item) => item.slug === slug);
      const page = await request(app).get(path);
      const internalLinks = [...page.text.matchAll(/href="(\/(?:tools|wiki|guides)\/[^"#]+)"/g)]
        .map((match) => match[1]);

      expect(page.status, path).toBe(200);
      expect(page.text, path).toContain("<h1>");
      expect(row.slug, path).not.toMatch(/[\u3400-\u9fff]/);
      expect(new Set(internalLinks).size, path).toBeGreaterThanOrEqual(2);
      expect(sitemap.text, path).toContain(`https://pixelharvestwiki.com${path}`);
    }
  });

  test("serves homepage entrance guides through English URLs and sitemap", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);
    const guidePaths = [
      "/guides/villager-gift-birthday-recommendation",
      "/guides/mines-drops-and-floor-resource-route",
      "/guides/beginner-year-one-route-overview"
    ];
    const sitemap = await request(app).get("/sitemap.xml");
    const rows = context.db.prepare(`
      SELECT slug, body
      FROM articles
      WHERE slug IN (${guidePaths.map(() => "?").join(",")})
      ORDER BY slug
    `).all(...guidePaths.map((path) => path.replace("/guides/", "")));

    expect(rows).toHaveLength(guidePaths.length);

    for (const path of guidePaths) {
      const slug = path.replace("/guides/", "");
      const row = rows.find((item) => item.slug === slug);
      const page = await request(app).get(path);
      const internalLinks = [...page.text.matchAll(/href="(\/(?:tools|wiki|guides)\/[^"#]+)"/g)]
        .map((match) => match[1]);

      expect(page.status, path).toBe(200);
      expect(page.text, path).toContain("<h1>");
      expect(row.slug, path).not.toMatch(/[\u3400-\u9fff]/);
      expect(new Set(internalLinks).size, path).toBeGreaterThanOrEqual(2);
      expect(sitemap.text, path).toContain(`https://pixelharvestwiki.com${path}`);
    }
  });

  test("serves tool and wiki workflow guides through English URLs and sitemap", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);
    const guidePaths = [
      "/guides/crop-wiki-and-profit-tool-planning",
      "/guides/fish-wiki-and-query-tool-route",
      "/guides/community-center-checklist-and-wiki-route",
      "/guides/wiki-item-detail-reading-guide",
      "/guides/tool-first-new-player-workflow"
    ];
    const sitemap = await request(app).get("/sitemap.xml");
    const rows = context.db.prepare(`
      SELECT slug, body
      FROM articles
      WHERE slug IN (${guidePaths.map(() => "?").join(",")})
      ORDER BY slug
    `).all(...guidePaths.map((path) => path.replace("/guides/", "")));

    expect(rows).toHaveLength(guidePaths.length);

    for (const path of guidePaths) {
      const slug = path.replace("/guides/", "");
      const row = rows.find((item) => item.slug === slug);
      const page = await request(app).get(path);
      const internalLinks = [...page.text.matchAll(/href="(\/(?:tools|wiki|guides)\/?[^"#]*)"/g)]
        .map((match) => match[1]);

      expect(page.status, path).toBe(200);
      expect(page.text, path).toContain("<h1>");
      expect(row.slug, path).not.toMatch(/[\u3400-\u9fff]/);
      expect(row.body, path).toMatch(/\]\(\/tools\//);
      expect(row.body, path).toMatch(/\]\(\/wiki(?:\/|\))/);
      expect(new Set(internalLinks).size, path).toBeGreaterThanOrEqual(2);
      expect(sitemap.text, path).toContain(`https://pixelharvestwiki.com${path}`);
    }
  });

  test("serves greenhouse fruit tree guide and fruit item details through real URLs", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);
    const guidePath = "/guides/greenhouse-fruit-tree-planning";
    const fruitPaths = [
      "/wiki/items/apple",
      "/wiki/items/apricot",
      "/wiki/items/cherry",
      "/wiki/items/orange",
      "/wiki/items/peach",
      "/wiki/items/pomegranate",
      "/wiki/items/banana"
    ];

    const guide = await request(app).get(guidePath);
    const sitemap = await request(app).get("/sitemap.xml");
    const guideLinks = [...guide.text.matchAll(/href="(\/(?:tools|wiki|guides)\/[^"#]+)"/g)]
      .map((match) => match[1]);
    const fruitRows = context.db.prepare(`
      SELECT e.slug, e.attributes_json
      FROM dataset_entries e
      JOIN datasets d ON d.id = e.dataset_id
      WHERE d.slug = 'items'
        AND e.slug IN (${fruitPaths.map(() => "?").join(",")})
      ORDER BY e.slug
    `).all(...fruitPaths.map((path) => path.replace("/wiki/items/", "")));

    expect(guide.status).toBe(200);
    expect(guide.text).toContain("<h1>");
    expect(new Set(guideLinks).size).toBeGreaterThanOrEqual(5);
    expect(sitemap.text).toContain(`https://pixelharvestwiki.com${guidePath}`);
    expect(fruitRows).toHaveLength(fruitPaths.length);

    for (const path of fruitPaths) {
      const slug = path.replace("/wiki/items/", "");
      const row = fruitRows.find((item) => item.slug === slug);
      const attributes = JSON.parse(row.attributes_json);
      const page = await request(app).get(path);

      expect(page.status, path).toBe(200);
      expect(sitemap.text, path).toContain(`https://pixelharvestwiki.com${path}`);
      expect(attributes["获取方式"], path).toBeTruthy();
      expect(attributes["主要用途"], path).toBeTruthy();
      expect(attributes["新手建议"], path).toBeTruthy();
      expect(attributes["关联规划"], path).toBeTruthy();
      expect(attributes.links, path).toContain(guidePath);
    }
  });

  test("does not render a duplicate article title when markdown starts with the same H1", async () => {
    context = createTestContext();
    await initialize(context);
    context.db.prepare(`
      INSERT INTO articles(title, slug, summary, body, status, featured)
      VALUES (?, ?, ?, ?, 'published', 0)
    `).run(
      "Duplicate H1 Test Guide",
      "duplicate-h1-test-guide",
      "Regression fixture for article title rendering.",
      "# Duplicate H1 Test Guide\n\n## Real section\n\nUseful guide body."
    );
    const app = createApp(context);

    const page = await request(app).get("/guides/duplicate-h1-test-guide");
    const titleH1Count = [...page.text.matchAll(/<h1>Duplicate H1 Test Guide<\/h1>/g)].length;
    expect(page.status).toBe(200);
    expect(titleH1Count).toBe(1);
    expect(page.text).toContain("<h2>Real section</h2>");

    const apiResponse = await request(app).get("/api/articles/duplicate-h1-test-guide");
    expect(apiResponse.status).toBe(200);
    expect(apiResponse.body.item.html).not.toContain("<h1>Duplicate H1 Test Guide</h1>");
    expect(apiResponse.body.item.html).toContain("<h2>Real section</h2>");
  });

  test("renders crawlable v5.3.2 tool guidance and enhanced wiki entry guidance", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);

    const cropTool = await request(app).get("/tools/crops");
    expect(cropTool.status).toBe(200);
    expect(cropTool.text).toContain("作物收益不能只看售价");
    expect(cropTool.text).toContain('href="/guides/crop-profit-calculator-guide"');
    expect(cropTool.text).toContain('href="/guides/year-one-spring-money-route"');
    expect(cropTool.text).toContain('href="/wiki/crops"');

    const fishTool = await request(app).get("/tools/fish");
    expect(fishTool.status).toBe(200);
    expect(fishTool.text).toContain("鱼类条件受季节、天气、时间、地点");
    expect(fishTool.text).toContain('href="/guides/beginner-fishing-guide-and-fish-search"');
    expect(fishTool.text).toContain('href="/wiki/fish"');
    expect(fishTool.text).toContain('href="/guides/early-community-center-priority-route"');

    const communityTool = await request(app).get("/tools/community-center");
    expect(communityTool.status).toBe(200);
    expect(communityTool.text).toContain("不要乱卖季节限定物品");
    expect(communityTool.text).toContain('href="/guides/early-community-center-priority-route"');
    expect(communityTool.text).toContain('href="/tools/fish"');
    expect(communityTool.text).toContain('href="/wiki/crops"');
    expect(communityTool.text).toContain('href="/wiki/fish"');

    const enhancedEntries = [
      ["/wiki/crops/ancient-fruit", "温室和姜岛"],
      ["/wiki/crops/strawberry", "复活节"],
      ["/wiki/crops/parsnip", "社区中心"],
      ["/wiki/crops/potato", "现金周转"],
      ["/wiki/crops/coffee-bean", "三倍浓缩咖啡"],
      ["/wiki/fish/catfish", "雨天"],
      ["/wiki/fish/eel", "雨夜"],
      ["/wiki/fish/sturgeon", "鱼塘"],
      ["/wiki/items/iridium-bar", "工具升级"],
      ["/wiki/items/prismatic-shard", "第一块不要急着送礼"]
    ];

    for (const [url, phrase] of enhancedEntries) {
      const page = await request(app).get(url);
      expect(page.status, url).toBe(200);
      expect(page.text, url).toContain("实用说明");
      expect(page.text, url).toContain(phrase);
      expect(url, url).not.toMatch(/[\u3400-\u9fff]/);
    }

    const ancientFruit = await request(app).get("/wiki/crops/ancient-fruit");
    expect(ancientFruit.text).toContain('href="/tools/crop-profit"');
    expect(ancientFruit.text).toContain('href="/guides/crop-profit-calculator-guide"');
    const catfish = await request(app).get("/wiki/fish/catfish");
    expect(catfish.text).toContain('href="/tools/fish"');
    const iridiumBar = await request(app).get("/wiki/items/iridium-bar");
    expect(iridiumBar.text).toContain('href="/guides/mines-floor-40-preparation-route"');
  });

  test("renders internal links and noindexed friendly 404 pages for real URLs", async () => {
    context = createTestContext();
    context.config.siteUrl = "https://pixelharvestwiki.com";
    await initialize(context);
    const app = createApp(context);

    const article = context.db.prepare(`
      SELECT id, slug FROM articles
      WHERE status='published'
      ORDER BY featured DESC, updated_at DESC
      LIMIT 1
    `).get();
    const guide = await request(app).get(`/guides/${encodeURIComponent(article.slug)}`);
    expect(guide.status).toBe(200);
    expect(guide.text).toContain('data-seo-related="guides"');
    const relatedGuidesHtml = guide.text.split('data-seo-related="guides"')[1] || "";
    const relatedGuideLinks = [...relatedGuidesHtml.matchAll(/href="(\/guides\/[^"#]+)"/g)].map((match) => match[1]);
    expect(relatedGuideLinks.length).toBeGreaterThanOrEqual(3);
    expect(relatedGuideLinks.length).toBeLessThanOrEqual(6);
    expect(relatedGuidesHtml).not.toContain("#article");

    const entryPage = await request(app).get("/wiki/crops/strawberry");
    expect(entryPage.status).toBe(200);
    expect(entryPage.text).toContain('data-seo-related="entries"');
    const relatedEntriesHtml = entryPage.text.split('data-seo-related="entries"')[1] || "";
    const relatedEntryLinks = [...relatedEntriesHtml.matchAll(/href="(\/wiki\/crops\/[^"#]+)"/g)].map((match) => match[1]);
    expect(relatedEntryLinks.length).toBeGreaterThanOrEqual(4);
    expect(relatedEntryLinks.length).toBeLessThanOrEqual(8);
    expect(relatedEntryLinks.every((href) => !/%E[0-9A-F]{2}/i.test(href))).toBe(true);
    expect(relatedEntriesHtml).not.toContain("#entry");
    expect(relatedEntriesHtml).not.toContain("#library");

    const cropEntry = context.db.prepare(`
      SELECT e.name FROM dataset_entries e
      JOIN datasets d ON d.id=e.dataset_id
      WHERE d.slug='crops' AND e.slug='strawberry'
      LIMIT 1
    `).get();
    const search = await request(app).get(`/search?q=${encodeURIComponent(cropEntry.name)}`);
    expect(search.status).toBe(200);
    expect(search.text).toContain("/wiki/crops/strawberry");
    expect(search.text).not.toContain("#article");
    expect(search.text).not.toContain("#entry");
    expect(search.text).not.toContain("#library");

    for (const url of [
      "/guides/missing-stage-four-guide",
      "/wiki/missing-stage-four-dataset",
      "/wiki/crops/missing-stage-four-entry"
    ]) {
      const response = await request(app).get(url);
      expect(response.status).toBe(404);
      expect(response.headers["x-robots-tag"]).toContain("noindex");
      expect(response.text).toContain('name="robots" content="noindex');
      expect(response.text).toContain("<h1>");
    }
  });
});
