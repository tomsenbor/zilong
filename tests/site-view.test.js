import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  renderCategoryOverview,
  renderFeaturedGuideCard,
  renderHomeView,
  renderItemCard,
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

  test("homepage secondary tool cards point to concrete content areas", () => {
    const html = renderHomeView({
      stats: { entries: 441, datasets: 10, articles: 6, version: "1.6.15" },
      datasets: [
        ...datasets,
        {
          id: 99,
          name: "村民关系",
          slug: "villagers",
          icon: "/assets/game/32px-HeartIconLarge.png",
          description: "生日、住址与礼物喜好",
          entry_count: 33
        }
      ],
      articles
    });

    expect(html).toContain("礼物推荐");
    expect(html).toContain("/guides/villager-gift-birthday-recommendation");
    expect(html).toContain("生日、住址、最爱礼物");
    expect(html).toContain("矿洞掉落");
    expect(html).toContain("/guides/mines-drops-and-floor-resource-route");
    expect(html).toContain("矿石、怪物、楼层");
    expect(html).toContain("新手路线");
    expect(html).toContain("/guides/beginner-year-one-route-overview");
    expect(html).toContain("第一天开局");
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

  test("item dialogs prioritize complete source, use, and sell price fields", () => {
    const dialog = renderItemDialog({
      name: "草莓",
      image: "/assets/game/24px-Strawberry.png",
      summary: "草莓是春季复活节后最常见的高价值作物。",
      dataset_name: "作物与种子",
      attributes: {
        source: "复活节商店",
        "获取方式": "春季 13 日复活节商店购买草莓种子后种植，成熟后可重复收获。",
        "主要用途": "适合春季现金流、送礼和后续种子规划。",
        "新手建议": "第一年不要盲目满田，优先保证浇水体力和背包空间。",
        sellPrice: "120 金"
      }
    });

    expect(dialog).toContain("春季 13 日复活节商店购买草莓种子后种植");
    expect(dialog).toContain("草莓是春季复活节后最常见的高价值作物。");
    expect(dialog).toContain("详情说明");
    expect(dialog).toContain("适合春季现金流、送礼和后续种子规划");
    expect(dialog).toContain("第一年不要盲目满田");
    expect(dialog).toContain("120 金");
    expect(dialog).not.toContain("请查看对应分类的获取条件");
  });

  test("item dialogs label beginner advice and planning guidance", () => {
    const dialog = renderItemDialog({
      name: "测试作物",
      image: "/assets/game/24px-Parsnip.png",
      summary: "测试说明",
      dataset_name: "作物与种子",
      attributes: {
        "主要用途": "用于验证详情页用途展示。",
        "新手建议": "建议先保留第一份，不要急着出售。",
        "关联规划": "配合作物收益计算器和社区中心清单一起规划。"
      }
    });

    expect(dialog).toContain("新手建议：建议先保留第一份，不要急着出售。");
    expect(dialog).toContain("关联规划：配合作物收益计算器和社区中心清单一起规划。");
  });

  test("item dialogs build useful fallback details for sparse fish entries", () => {
    const dialog = renderItemDialog({
      name: "鮟鱇鱼",
      image: "/assets/game/24px-Angler.png",
      summary: "秋季传奇鱼。",
      dataset_name: "鱼类图鉴",
      attributes: {
        season: "秋季",
        location: "木板桥北侧",
        weather: "任意",
        time: "全天"
      }
    });

    expect(dialog).toContain("秋季");
    expect(dialog).toContain("木板桥北侧");
    expect(dialog).toContain("图鉴收集");
    expect(dialog).toContain("暂无售价数据");
    expect(dialog).not.toContain("请查看对应分类的获取条件");
  });

  test("item dialogs expand sparse crop entries into complete detail sections", () => {
    const dialog = renderItemDialog({
      name: "大黄",
      image: "/assets/game/24px-Rhubarb.png",
      summary: "沙漠商店出售的高价值春季作物",
      dataset_name: "作物与种子",
      attributes: {
        season: "春季",
        days: "13 天",
        source: "绿洲",
        sellPrice: "220 金"
      }
    });

    expect(dialog).toContain("适用季节：春季");
    expect(dialog).toContain("成熟周期：13 天");
    expect(dialog).toContain("种子成本、播种日期、季节剩余天数");
    expect(dialog).toContain("社区中心、料理、送礼或加工");
    expect(dialog).toContain("实际收益会受到品质、职业加成、加工方式");
  });

  test("item dialogs expand sparse item entries into complete detail sections", () => {
    const dialog = renderItemDialog({
      name: "电池组",
      image: "/assets/game/24px-Battery_Pack.png",
      summary: "避雷针和太阳能板产物",
      dataset_name: "物品百科",
      attributes: {
        type: "资源",
        source: "避雷针|太阳能板",
        sellPrice: "500 金"
      }
    });

    expect(dialog).toContain("主要来源：避雷针|太阳能板");
    expect(dialog).toContain("设备制作、任务、送礼、收集或后续解锁");
    expect(dialog).toContain("第一份建议先保留");
    expect(dialog).toContain("出售前先确认它是否会卡住建筑、工具、收集或任务进度");
  });

  test("item cards keep long detail text out of the grid card body", () => {
    const longSummary = "防风草是春季最稳的基础作物，成熟快且成本低，适合第一周练耕种等级、完成社区中心春季作物收集包，并为品质作物包准备金星样本。新手建议至少保留普通品质和高品质各一批。";
    const card = renderItemCard({
      name: "防风草",
      slug: "parsnip",
      image: "/assets/game/24px-Parsnip.png",
      summary: longSummary,
      dataset_name: "作物与种子",
      attributes: {
        season: "春季",
        days: "4 天",
        source: "皮埃尔杂货店"
      }
    }, "crops");

    expect(card).toContain("/wiki/crops/parsnip");
    expect(card).toContain("防风草");
    expect(card).toContain("春季");
    expect(card).toContain("4 天");
    expect(card).not.toContain(longSummary);
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
    expect(components).toContain("font-size: clamp(1.62rem, 8.5vw, 2rem)");
    expect(components).toContain(".home-quick-actions .btn.ghost");
    expect(components).toContain(".home-quick-actions .btn.btn-ghost");
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
