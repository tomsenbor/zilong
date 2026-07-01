import { afterEach, beforeEach, describe, expect, test } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { initialize } from "../src/db/initialize.js";
import { createTestContext } from "./helpers/context.js";

let context;
let app;

beforeEach(async () => {
  context = createTestContext();
  await initialize(context);
  app = createApp(context);
});

afterEach(() => context.close());

describe("public API", () => {
  test("paginates and filters dataset entries", async () => {
    const response = await request(app)
      .get("/api/datasets/crops/entries")
      .query({ season: "春季", page: 1, pageSize: 5, sort: "name" });

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(5);
    expect(response.body.items.every((item) => item.attributes.season.includes("春季"))).toBe(true);
    expect(response.body.pagination.total).toBeGreaterThan(5);
  });

  test("searches Chinese content across articles and data", async () => {
    const response = await request(app).get("/api/search?q=温室");

    expect(response.status).toBe(200);
    expect(response.body.items.some((item) => item.title.includes("温室"))).toBe(true);
    expect(response.body.items[0]).toMatchObject({
      locale: "zh-CN"
    });
    expect(response.body.items[0].translationGroupId).toBeTruthy();
  });

  test("prepares public content payloads for future localization", async () => {
    const articles = await request(app).get("/api/articles?pageSize=1");
    const article = await request(app).get(
      `/api/articles/${encodeURIComponent(articles.body.items[0].slug)}`
    );
    const datasets = await request(app).get("/api/datasets");
    const entries = await request(app).get(`/api/datasets/${datasets.body.items[0].slug}/entries?pageSize=1`);

    expect(articles.body.items[0]).toMatchObject({ locale: "zh-CN" });
    expect(articles.body.items[0].translationGroupId).toMatch(/^article:/);
    expect(article.body.item.translationGroupId).toBe(articles.body.items[0].translationGroupId);
    expect(datasets.body.items[0]).toMatchObject({ locale: "zh-CN" });
    expect(datasets.body.items[0].translationGroupId).toMatch(/^dataset:/);
    expect(entries.body.items[0]).toMatchObject({ locale: "zh-CN" });
    expect(entries.body.items[0].translationGroupId).toMatch(/^entry:/);
  });

  test("uses stable English entry slugs and resolves legacy Chinese entry URLs", async () => {
    const crops = await request(app).get("/api/datasets/crops/entries").query({ q: "草莓", pageSize: 10 });
    const strawberry = crops.body.items.find((item) => item.name === "草莓");
    expect(strawberry).toMatchObject({ slug: "strawberry" });

    const ancientFruit = await request(app).get("/api/datasets/crops/entries").query({ q: "远古水果", pageSize: 10 });
    expect(ancientFruit.body.items.find((item) => item.name === "远古水果")).toMatchObject({ slug: "ancient-fruit" });

    const canonical = await request(app).get("/api/datasets/crops/entries/strawberry");
    expect(canonical.status).toBe(200);
    expect(canonical.body.item).toMatchObject({ name: "草莓", slug: "strawberry" });

    const legacy = await request(app).get(`/api/datasets/crops/entries/${encodeURIComponent("草莓")}`);
    expect(legacy.status).toBe(200);
    expect(legacy.body.item).toMatchObject({ name: "草莓", slug: "strawberry" });

    const search = await request(app).get("/api/search").query({ q: "草莓", pageSize: 50 });
    expect(search.body.items.find((item) => item.type === "entry" && item.title === "草莓")).toMatchObject({
      dataset_slug: "crops",
      slug: "strawberry"
    });
  });

  test("keeps public dataset entry slugs URL-stable across all datasets", async () => {
    const datasets = await request(app).get("/api/datasets");

    for (const dataset of datasets.body.items) {
      const firstPage = await request(app)
        .get(`/api/datasets/${dataset.slug}/entries`)
        .query({ pageSize: 100 });
      expect(firstPage.body.items.every((item) => item.slug && !/[\u3400-\u9fff]/.test(item.slug))).toBe(true);

      for (let page = 2; page <= firstPage.body.pagination.pages; page += 1) {
        const entries = await request(app)
          .get(`/api/datasets/${dataset.slug}/entries`)
          .query({ page, pageSize: 100 });
        expect(entries.body.items.every((item) => item.slug && !/[\u3400-\u9fff]/.test(item.slug))).toBe(true);
      }
    }
  });

  test("returns every complete chapter for a built-in guide", async () => {
    const response = await request(app).get("/api/articles/ginger-island-golden-walnut-route");

    expect(response.status).toBe(200);
    expect(response.body.item.slug).toBe("ginger-island-golden-walnut-route");
    expect(response.body.item.html.match(/<h2>/g)?.length).toBeGreaterThanOrEqual(6);
    expect(response.body.item.html).toContain("登岛背包清单");
    expect(response.body.item.html).toContain("姜岛也会真正成为稳定的第二生产基地");
  });

  test("keeps legacy Chinese guide API URLs compatible while returning stable slugs", async () => {
    const response = await request(app).get(
      `/api/articles/${encodeURIComponent("姜岛解锁与金色核桃收集路线")}`
    );

    expect(response.status).toBe(200);
    expect(response.body.item.slug).toBe("ginger-island-golden-walnut-route");
    expect(response.body.item.title).toBe("姜岛解锁与金色核桃收集路线");
  });

  test("keeps local uploaded images in sanitized article markdown", async () => {
    const agent = request.agent(app);
    const login = await agent.post("/api/admin/auth/login").send({
      username: "admin",
      password: "test-password"
    });
    await agent
      .post("/api/admin/articles")
      .set("x-csrf-token", login.body.csrfToken)
      .send({
        title: "带图片攻略",
        summary: "验证攻略图片",
        body: "## 配图\n\n![温室布局](/uploads/layout.png)",
        status: "published",
        gameVersion: "1.6.15",
        featured: false,
        categoryIds: []
      });

    const response = await request(app).get(`/api/articles/${encodeURIComponent("带图片攻略")}`);
    expect(response.body.item.html).toContain('<img src="/uploads/layout.png" alt="温室布局"');
  });

  test("serves catalog assets whose filenames contain URL escape characters", async () => {
    const entries = await request(app)
      .get("/api/datasets/catalog/entries")
      .query({ q: "Dish O", pageSize: 10 });
    const item = entries.body.items.find((entry) => entry.name === "Dish O%27 The Sea");

    expect(item).toBeTruthy();
    const image = await request(app).get(item.image);
    expect(image.status).toBe(200);
    expect(image.type).toBe("image/png");
  });
});

describe("admin API", () => {
  test("logs in and creates an article with csrf protection", async () => {
    const agent = request.agent(app);
    const login = await agent.post("/api/admin/auth/login").send({
      username: "admin",
      password: "test-password"
    });

    expect(login.status).toBe(200);
    expect(login.body.csrfToken).toBeTruthy();

    const created = await agent
      .post("/api/admin/articles")
      .set("x-csrf-token", login.body.csrfToken)
      .send({
        title: "测试攻略",
        summary: "用于验证后台新增流程",
        body: "# 测试",
        status: "published",
        gameVersion: "1.6.15",
        featured: false,
        categoryIds: []
      });

    expect(created.status).toBe(201);
    expect(created.body.item.slug).toBe("测试攻略");
  });

  test("rejects an unauthenticated write", async () => {
    const response = await request(app).post("/api/admin/articles").send({ title: "非法写入" });
    expect(response.status).toBe(401);
  });

  test("uploads and removes an unreferenced image", async () => {
    const agent = request.agent(app);
    const login = await agent.post("/api/admin/auth/login").send({
      username: "admin",
      password: "test-password"
    });
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64"
    );

    const uploaded = await agent
      .post("/api/admin/media")
      .set("x-csrf-token", login.body.csrfToken)
      .attach("image", png, { filename: "test.png", contentType: "image/png" });

    expect(uploaded.status).toBe(201);
    expect(uploaded.body.item.url).toMatch(/^\/uploads\//);

    const removed = await agent
      .delete(`/api/admin/media/${uploaded.body.item.id}`)
      .set("x-csrf-token", login.body.csrfToken);
    expect(removed.status).toBe(204);
  });

  test("returns a clear client error when an upload exceeds the limit", async () => {
    const agent = request.agent(app);
    const login = await agent.post("/api/admin/auth/login").send({
      username: "admin",
      password: "test-password"
    });

    const response = await agent
      .post("/api/admin/media")
      .set("x-csrf-token", login.body.csrfToken)
      .attach("image", Buffer.alloc(context.config.maxUploadBytes + 1), {
        filename: "too-large.png",
        contentType: "image/png"
      });

    expect(response.status).toBe(413);
    expect(response.body.error.code).toBe("UPLOAD_TOO_LARGE");
  });

  test("includes category ids when editing articles", async () => {
    const agent = request.agent(app);
    const login = await agent.post("/api/admin/auth/login").send({
      username: "admin",
      password: "test-password"
    });
    const response = await agent
      .get("/api/admin/articles")
      .set("x-csrf-token", login.body.csrfToken);

    const article = response.body.items.find((item) => item.title === "第一年春季完整发展路线");
    expect(article.category_ids.length).toBeGreaterThan(0);
  });

  test("exports JSON and downloads a restorable database backup", async () => {
    const agent = request.agent(app);
    await agent.post("/api/admin/auth/login").send({
      username: "admin",
      password: "test-password"
    });

    const exported = await agent.get("/api/admin/export");
    expect(exported.status).toBe(200);
    expect(exported.headers["content-disposition"]).toContain("stardew-export-");
    expect(exported.body.entries.length).toBeGreaterThan(400);

    const backup = await agent.get("/api/admin/backup").buffer(true);
    expect(backup.status).toBe(200);
    expect(backup.headers["content-disposition"]).toContain("stardew-backup-");
    expect(backup.body.length).toBeGreaterThan(1000);
    expect(backup.body.subarray(0, 15).toString()).toBe("SQLite format 3");
  });
});
