import { escapeHtml, imageFallback } from "../api.js";
import { uiClass } from "../ui-class.js";

export const formatGold = (value) =>
  `${new Intl.NumberFormat("zh-CN").format(Math.round(Number(value) || 0))}g`;

export function toolImage(src, alt, className = "tool-icon pixel-icon") {
  return `<img class="${escapeHtml(uiClass(className))}" src="${escapeHtml(src || imageFallback)}" alt="${escapeHtml(alt)}" loading="lazy" data-fallback="${imageFallback}">`;
}

export function toolHero(title, description, icon, links = []) {
  const actions = links
    .map((link) => `<a class="${uiClass("btn secondary")}" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`)
    .join("");
  const showMedia = icon && !icon.includes("/assets/stardew-ui/hero-");
  const media = showMedia
    ? `<div class="page-header__media">${toolImage(icon, title, "tool-header-icon")}</div>`
    : "";

  return `<section class="${uiClass("page-header tool-header")}">
    <div class="page-header__inner">
      <div class="page-header__copy">
        <span class="eyebrow">星露谷实用工具</span>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
        <div class="page-header__actions">${actions}</div>
      </div>
      ${media}
    </div>
  </section>`;
}

export const loading = (text) => `<div class="${uiClass("tool-status card")}" role="status">${escapeHtml(text)}</div>`;
export const errorBox = (text) =>
  `<div class="${uiClass("tool-status card error")}" role="alert">${escapeHtml(text || "加载失败，请稍后重试。")}</div>`;
