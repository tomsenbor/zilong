import { escapeHtml } from "../api.js";
import { routePath } from "../routes.js";
import { uiClass } from "../ui-class.js";

export const stardewUiAsset = (name) => `/assets/stardew-ui/${name}`;

const navItems = [
  { route: "home", href: routePath("home"), label: "首页" },
  { route: "articles", href: routePath("guides"), label: "攻略资料" },
  { route: "library", href: routePath("wiki"), label: "图鉴大全" },
  { route: "tools", href: routePath("tools"), label: "实用工具" },
  { route: "about", href: routePath("about"), label: "关于本站" },
  { route: "community", href: routePath("tool", { tool: "community-center" }), label: "社区中心" }
];

const buttonVariants = new Set(["primary", "secondary", "ghost"]);

export function Button({ label, href, variant = "primary", compact = false, className = "", type = "button" } = {}) {
  const normalizedVariant = buttonVariants.has(variant) ? variant : "primary";
  const classes = [
    "btn",
    normalizedVariant,
    compact ? "small" : "",
    className
  ].filter(Boolean);
  const classAttribute = uiClass(classes);

  if (href) {
    return `<a class="${classAttribute}" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
  }

  return `<button class="${classAttribute}" type="${escapeHtml(type)}">${escapeHtml(label)}</button>`;
}

export function BaseCard({ content = "", href = "", className = "", ariaLabel = "" } = {}) {
  const tag = href ? "a" : "div";
  const hrefAttribute = href ? ` href="${escapeHtml(href)}"` : "";
  const ariaAttribute = ariaLabel ? ` aria-label="${escapeHtml(ariaLabel)}"` : "";
  return `<${tag} class="${escapeHtml(uiClass("card", className))}"${hrefAttribute}${ariaAttribute}>${content}</${tag}>`;
}

export function SearchBar({
  id = "site-search",
  placeholder = "搜索作物、鱼类、NPC、任务或攻略...",
  value = "",
  buttonLabel = "搜索",
  className = "",
  home = false
} = {}) {
  const inputId = `${id}-input`;
  const homeAttribute = home ? " data-home-search" : "";

  return `<form class="${escapeHtml(uiClass("search-bar", className))}" id="${escapeHtml(id)}" role="search"${homeAttribute}>
    <label class="sr-only" for="${escapeHtml(inputId)}">搜索</label>
    <input class="${escapeHtml(uiClass("input"))}" id="${escapeHtml(inputId)}" name="q" type="search" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" autocomplete="off">
    ${Button({ label: buttonLabel, variant: "primary", type: "submit" })}
  </form>`;
}

export function SiteLogo() {
  return `<a class="brand site-logo-link" href="${routePath("home")}" aria-label="星露谷物语中文资料库首页">
    <img class="site-logo" src="/assets/game/512px-Main_Logo_ZH.png" alt="星露谷物语中文资料库">
  </a>`;
}

export function SiteHeader({ active = "home" } = {}) {
  return `<header class="site-header site-header--v2" id="site-header">
    <div class="shell nav">
      ${SiteLogo()}
      <nav class="nav-links" aria-label="主要导航">
        ${navItems.map((item) => `<a href="${item.href}" data-nav-route="${item.route}" ${item.route === active ? 'class="active" aria-current="page"' : ""}>${item.label}</a>`).join("")}
      </nav>
      <div class="nav-actions">
        <button class="${uiClass("nav-search-toggle btn secondary small")}" id="search-toggle" type="button" aria-label="展开搜索" aria-expanded="false">搜索</button>
        <a class="${uiClass("btn secondary small nav-admin")}" href="/admin" data-dev-only-admin>后台管理</a>
        <button class="${uiClass("menu-button btn secondary small")}" id="menu-button" type="button" aria-label="展开菜单" aria-expanded="false">菜单</button>
      </div>
    </div>
    <form class="${uiClass("site-search search-bar")}" id="global-search" hidden role="search">
      <div class="shell">
        <label for="global-search-input">全站搜索</label>
        <input class="${uiClass("site-input")}" id="global-search-input" name="q" type="search" aria-label="全站搜索" placeholder="搜索作物、鱼类、NPC、任务或攻略...">
        ${Button({ label: "搜索", variant: "primary", compact: true, type: "submit" })}
      </div>
    </form>
  </header>`;
}

export function SiteFooter() {
  return `<footer class="site-footer" id="about">
    <div class="shell footer-grid">
      <section>
        <b>星露谷物语中文资料库</b>
        <p class="footer-note">非官方中文资料与工具站，聚合作物、鱼类、NPC、任务和社区中心查询。游戏素材版权归 ConcernedApe 所有。</p>
      </section>
      <section>
        <b>快速导航</b>
        <a href="${routePath("wiki")}">图鉴大全</a>
        <a href="${routePath("guides")}">攻略资料</a>
        <a href="${routePath("tools")}">实用工具</a>
      </section>
      <section>
        <b>实用工具</b>
        <a href="${routePath("tool", { tool: "crops" })}">作物收益计算器</a>
        <a href="${routePath("tool", { tool: "fish" })}">鱼类查询器</a>
        <a href="${routePath("tool", { tool: "community-center" })}">社区中心清单</a>
      </section>
      <section>
        <b>管理入口</b>
        <a href="/admin">后台管理</a>
      </section>
    </div>
  </footer>`;
}

export function PageHeader({
  eyebrow = "星露谷资料库",
  title,
  description,
  image = "",
  imageAlt = "",
  actions = [],
  className = ""
} = {}) {
  const actionHtml = actions.length
    ? `<div class="page-header__actions">${actions.map((action) => Button(action)).join("")}</div>`
    : "";
  const imageHtml = image
    ? `<div class="page-header__media"><img src="${escapeHtml(image)}" alt="${escapeHtml(imageAlt || title || "")}"></div>`
    : "";

  return `<section class="${escapeHtml(uiClass("page-header", className))}">
    <div class="shell page-header__inner">
      <div class="page-header__copy">
        <span class="eyebrow">${escapeHtml(eyebrow)}</span>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
        ${actionHtml}
      </div>
      ${imageHtml}
    </div>
  </section>`;
}

export function PageHero(options = {}) {
  return PageHeader(options);
}
