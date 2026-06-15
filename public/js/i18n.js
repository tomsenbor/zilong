import { DEFAULT_LOCALE, normalizeLocale } from "./routes.js";

const messages = {
  zh: {
    notFoundTitle: "页面不存在",
    notFoundDescription: "请检查地址是否正确，或返回首页继续浏览资料库。",
    loadFailedTitle: "页面加载失败",
    homeLink: "返回首页"
  }
};

export function t(key, locale = DEFAULT_LOCALE) {
  const normalized = normalizeLocale(locale);
  return messages[normalized]?.[key] || messages.zh[key] || key;
}
