import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  renderCategoryOverview,
  renderFeaturedGuideCard,
  renderHomeView,
  renderItemDialog,
  renderLibrarySidebar
} from "../public/js/site-view.js";
import {
  BaseCard,
  Button,
  PageHeader,
  PageHero,
  SearchBar,
  SiteFooter,
  SiteHeader,
  SiteLogo,
  stardewUiAsset
} from "../public/js/components/site-components.js";
import { hreflangCandidates, parseAppRoute, routePath } from "../public/js/routes.js";

const datasets = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  name: index === 9 ? "完整图鉴索引" : `分类 ${index + 1}`,
  slug: index === 9 ? "catalog" : `dataset-${index + 1}`,
  icon: `/assets/game/icon-${index + 1}.png`,
  description: `分类说明 ${index + 1}`,
  entry_count: 10 + index
}));

const articles = Array.from({ length: 6 }, (_, index) => ({
  title: `热门攻略 ${index + 1}`,
  slug: `guide-${index + 1}`,
  summary: `完整攻略摘要 ${index + 1}`,
  cover_image: `/assets/game/guide-${index + 1}.png`,
  game_version: "1.6.15",
  updated_at: "2026-06-13 00:00:00"
}));

const forbiddenRuntimeTokens = [
  "wood-panel",
  "pixel-frame",
  "pixel-button",
  "base-card",
  "ui-card",
  "ui-button",
  "page-hero",
  "home-v2",
  "library-toolbar-pixel",
  "library-layout-pixel",
  "pixel-item-card",
  'class="panel',
  "btn danger"
];

describe("UI Kit v4 refinement public views", () => {
  test("renders the homepage as a database and tool entrance", () => {
    const html = renderHomeView({
      stats: { entries: 441, datasets: 10, articles: 6, version: "1.6.15" },
      datasets,
      articles
    });

    expect(html).toContain('class="home"');
    expect(html).toContain("data-home-search");
    expect(html.match(/class="home-tool-card card"/g)).toHaveLength(6);
    expect(html.match(/class="home-category-card card"/g)).toHaveLength(6);
    expect(html.match(/class="home-guide-card card"/g)).toHaveLength(4);
    for (const token of forbiddenRuntimeTokens) expect(html).not.toContain(token);
  });

  test("uses shared cards for featured guides, categories, sidebar, and dialog", () => {
    expect(renderFeaturedGuideCard(articles[0])).toContain('class="featured-guide-card card"');
    expect(renderCategoryOverview(datasets).match(/class="category-overview-card card"/g)).toHaveLength(9);
    expect(renderCategoryOverview(datasets)).toContain('class="page-header"');
    expect(renderLibrarySidebar(datasets, "dataset-2")).toContain('class="library-sidebar card"');

    const dialog = renderItemDialog({
      name: "南瓜",
      image: "/assets/game/36px-Pumpkin.png",
      summary: "秋季高价值作物",
      dataset_name: "作物与种子",
      attributes: {
        source: "皮埃尔杂货店",
        use: "料理、任务与送礼",
        sellPrice: "320金币"
      }
    });

    expect(dialog).toContain('class="item-dialog card"');
    expect(dialog).toContain('role="dialog"');
    expect(dialog).toContain('class="item-dialog-icon pixel-icon"');
    expect(dialog).toContain('class="item-dialog-heading"');
    expect(dialog).not.toContain("item-dialog-image");
    expect(dialog).not.toContain("item-dialog-visual");
    expect(dialog).toContain('data-item-section="source"');
    for (const token of forbiddenRuntimeTokens) expect(dialog).not.toContain(token);
  });

  test("loads only the v3 design-system entrypoints", () => {
    const admin = fs.readFileSync(path.resolve("public/admin.html"), "utf8");
    const dockerfile = fs.readFileSync(path.resolve("Dockerfile"), "utf8");
    const renderSource = fs.readFileSync(path.resolve("src/seo/render.js"), "utf8");

    for (const source of [renderSource, admin]) {
      expect(source).toContain("/design-system/tokens.css");
      expect(source).toContain("/design-system/base.css");
      expect(source).toContain("/design-system/layout.css");
      expect(source).toContain("/design-system/components.css");
      expect(source).not.toContain("/css/app.css");
      expect(source).not.toContain("/css/tailwind.css");
      expect(source).not.toContain("homepage.css");
    }

    expect(renderSource).toContain('class="site-frame"');
    expect(fs.existsSync(path.resolve("public/index.html"))).toBe(false);
    expect(fs.existsSync(path.resolve("design-system/homepage.css"))).toBe(false);
    expect(fs.existsSync(path.resolve("public/css/app.css"))).toBe(false);
    expect(dockerfile).toMatch(/^COPY design-system \.\/design-system$/m);
  });

  test("defines the refined locked components and rules", () => {
    const tokens = fs.readFileSync(path.resolve("design-system/tokens.css"), "utf8");
    const base = fs.readFileSync(path.resolve("design-system/base.css"), "utf8");
    const components = fs.readFileSync(path.resolve("design-system/components.css"), "utf8");
    const layout = fs.readFileSync(path.resolve("design-system/layout.css"), "utf8");
    const rules = fs.readFileSync(path.resolve("design-system/rules.md"), "utf8");

    expect(tokens).toContain("--color-primary: #2f6b3f");
    expect(tokens).toContain("--container-width: 1200px");
    expect(components).toMatch(/\.card\s*\{[\s\S]*border:\s*1px solid var\(--border-light\)/);
    expect(components).toContain(".btn.primary");
    expect(components).toContain(".search-bar");
    expect(base).toContain(".pixel-icon");
    expect(base).toContain("image-rendering: pixelated");
    expect(layout).toMatch(/\.home-tools-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
    expect(rules).toContain("UI Kit v3 Lockdown Rules");
    expect(rules).toContain("Use `.card`");
  });

  test("shared chrome and helpers emit v3 classes only", () => {
    const header = SiteHeader();
    const logo = SiteLogo();
    const footer = SiteFooter();
    const pageHeader = PageHeader({ eyebrow: "测试标签", title: "测试标题", description: "测试描述" });
    const hero = PageHero({
      eyebrow: "测试标签",
      title: "测试标题",
      description: "测试描述",
      image: stardewUiAsset("hero-tools.png"),
      actions: [{ label: "主按钮", href: routePath("home") }]
    });
    const search = SearchBar({ id: "test-search", home: true });
    const button = Button({ label: "按钮", href: routePath("home"), variant: "secondary" });
    const card = BaseCard({ content: "卡片内容" });

    expect(header).toContain('class="site-header site-header--v2"');
    expect(header).toContain(logo);
    expect(header).toContain('class="site-search search-bar"');
    expect(header).toContain("data-dev-only-admin");
    expect(header).toContain("/assets/game/512px-Main_Logo_ZH.png");
    expect(header).not.toContain(stardewUiAsset("logo.png"));
    expect(logo).toContain('class="brand site-logo-link"');
    expect(logo).toContain('class="site-logo"');
    expect(footer).toContain('class="site-footer"');
    expect(pageHeader).toContain('class="page-header"');
    expect(hero).toContain('class="page-header"');
    expect(hero).not.toContain("page-hero");
    expect(search).toContain("data-home-search");
    expect(button).toContain("btn-secondary");
    expect(card).toContain('class="card"');

    for (const output of [header, footer, pageHeader, hero, search, button, card]) {
      for (const token of forbiddenRuntimeTokens) expect(output).not.toContain(token);
    }
  });

  test("generates and parses real public URLs with future locale support", () => {
    expect(routePath("home")).toBe("/");
    expect(routePath("guides")).toBe("/guides");
    expect(routePath("guide", { slug: "第一年春季完整发展路线" })).toBe("/guides/%E7%AC%AC%E4%B8%80%E5%B9%B4%E6%98%A5%E5%AD%A3%E5%AE%8C%E6%95%B4%E5%8F%91%E5%B1%95%E8%B7%AF%E7%BA%BF");
    expect(routePath("wiki")).toBe("/wiki");
    expect(routePath("wikiDataset", { datasetSlug: "crops" })).toBe("/wiki/crops");
    expect(routePath("wikiEntry", { datasetSlug: "crops", entrySlug: "草莓" })).toBe("/wiki/crops/%E8%8D%89%E8%8E%93");
    expect(routePath("search", { q: "温室" })).toBe("/search?q=%E6%B8%A9%E5%AE%A4");
    expect(routePath("tools")).toBe("/tools");
    expect(routePath("tool", { tool: "fish" })).toBe("/tools/fish");
    expect(routePath("guides", {}, "en")).toBe("/en/guides");
    expect(parseAppRoute({ pathname: "/wiki/crops/草莓", search: "" })).toMatchObject({
      name: "wikiEntry",
      locale: "zh",
      params: { datasetSlug: "crops", entrySlug: "草莓" }
    });
    expect(parseAppRoute({ pathname: "/en/tools/fish", search: "?season=spring" })).toMatchObject({
      name: "tool",
      locale: "en",
      params: { tool: "fish" }
    });
    const alternates = hreflangCandidates(parseAppRoute({ pathname: "/guides", search: "" }));
    expect(alternates.find((item) => item.locale === "zh")).toMatchObject({
      hreflang: "zh-CN",
      href: "/guides",
      available: true
    });
    expect(alternates.find((item) => item.locale === "en")).toMatchObject({
      href: "/en/guides",
      available: false
    });
  });

  test("runtime JS no longer emits old UI classes", () => {
    const files = [
      "public/js/app.js",
      "public/js/site-view.js",
      "public/js/components/site-components.js",
      "public/js/admin.js",
      "public/js/tools/tool-shell.js",
      "public/js/tools/fish-tool.js",
      "public/js/tools/crop-tool.js",
      "public/js/tools/community-center-tool.js"
    ];

    for (const file of files) {
      const source = fs.readFileSync(path.resolve(file), "utf8");
      for (const token of forbiddenRuntimeTokens) expect(source).not.toContain(token);
      expect(source).not.toContain('style="');
    }
  });

  test("v5.1 keeps homepage compact, article details aligned, and search cards padded", () => {
    const appSource = fs.readFileSync(path.resolve("public/js/app.js"), "utf8");
    const siteViewSource = fs.readFileSync(path.resolve("public/js/site-view.js"), "utf8");
    const toolShellSource = fs.readFileSync(path.resolve("public/js/tools/tool-shell.js"), "utf8");
    const components = fs.readFileSync(path.resolve("design-system/components.css"), "utf8");
    const layout = fs.readFileSync(path.resolve("design-system/layout.css"), "utf8");

    expect(appSource).toContain("function updateRouteChrome");
    expect(appSource).toContain("siteChrome.searchToggle.hidden = isHome");
    expect(appSource).toContain('class="article-tag"');
    expect(appSource).toContain('class="shell guide-detail-header"');
    expect(appSource).toContain('uiClass("card search-results")');
    expect(appSource).toContain('uiClass("card empty")');
    expect(appSource).toContain("function syncPublicAdminEntry");
    expect(appSource).toContain("isDevelopmentHost");
    expect(appSource).not.toContain('image: stardewUiAsset("hero-articles.png")');
    expect(appSource).not.toContain('image: stardewUiAsset("hero-tools.png")');
    expect(siteViewSource).toContain('class="home-tool-card-copy"');
    expect(toolShellSource).toContain('!icon.includes("/assets/stardew-ui/hero-")');
    expect(toolShellSource).toContain('class="page-header__inner"');
    expect(toolShellSource).not.toContain('class="shell page-header__inner"');
    expect(components).toContain(".article-tag");
    expect(components).toContain(".guide-detail-header");
    expect(components).toContain(".search-results");
    expect(components).toContain(".tool-header .page-header__inner");
    expect(components).toMatch(/\.article-cover\s*\{[\s\S]*min-height:\s*72px/);
    expect(layout).toMatch(/\.home-hero\s*\{[\s\S]*clamp\(14px,\s*3vw,\s*38px\)/);
  });

  test("v5.1 keeps crop ranking layered and 390px mobile overflow-safe", () => {
    const cropToolSource = fs.readFileSync(path.resolve("public/js/tools/crop-tool.js"), "utf8");
    const toolShellSource = fs.readFileSync(path.resolve("public/js/tools/tool-shell.js"), "utf8");
    const components = fs.readFileSync(path.resolve("design-system/components.css"), "utf8");
    const layout = fs.readFileSync(path.resolve("design-system/layout.css"), "utf8");

    expect(cropToolSource).toContain('class="crop-name-copy"');
    expect(cropToolSource).toContain('class="crop-harvest-note"');
    expect(cropToolSource).not.toContain("/assets/game/24px-Parsnip.png");
    expect(toolShellSource).toContain('className = "tool-icon pixel-icon"');
    expect(components).toContain(".crop-name-copy");
    expect(components).toContain(".crop-harvest-note");
    expect(components).toContain(".item-dialog-icon");
    expect(components).not.toContain(".item-dialog-image");
    expect(components).not.toContain(".item-dialog-visual");
    expect(components).toContain("@media (max-width: 480px)");
    expect(components).toMatch(/\.nav-admin\s*\{[\s\S]*display:\s*none/);
    expect(components).toMatch(/\.page-header__media\s*\{[\s\S]*display:\s*none/);
    expect(components).toMatch(/@media \(max-width:\s*720px\)[\s\S]*\.crop-ranking-row\s*\{[\s\S]*grid-template-columns:\s*1fr/);
    expect(layout).toMatch(/@media \(max-width:\s*720px\)[\s\S]*\.home-hero-grid,[\s\S]*\.home-tools-grid,[\s\S]*\.home-categories-grid,[\s\S]*\.home-guides-grid\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  });

  test("entry detail route replaces legacy Chinese slugs with stable canonical slugs", () => {
    const appSource = fs.readFileSync(path.resolve("public/js/app.js"), "utf8");

    expect(appSource).toContain("item.slug !== entrySlug");
    expect(appSource).toContain('routePath("wikiEntry", { datasetSlug: dataset.slug, entrySlug: item.slug })');
    expect(appSource).toContain("replace: true");
  });
});
