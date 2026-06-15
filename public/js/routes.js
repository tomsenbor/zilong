export const DEFAULT_LOCALE = "zh";
export const DEFAULT_CONTENT_LOCALE = "zh-CN";
export const SUPPORTED_LOCALES = ["zh", "en"];

const EN_PREFIX = "/en";

function cleanSegment(value = "") {
  return encodeURIComponent(String(value)).replace(/%2F/gi, "");
}

function decodeSegment(value = "") {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeLocale(locale = DEFAULT_LOCALE) {
  return locale === "en" ? "en" : DEFAULT_LOCALE;
}

export function localePrefix(locale = DEFAULT_LOCALE) {
  return normalizeLocale(locale) === "en" ? EN_PREFIX : "";
}

export function stripLocalePrefix(pathname = "/") {
  if (pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`)) {
    return {
      locale: "en",
      pathname: pathname.slice(EN_PREFIX.length) || "/"
    };
  }
  return { locale: DEFAULT_LOCALE, pathname: pathname || "/" };
}

function withQuery(pathname, params = {}) {
  const query = params instanceof URLSearchParams
    ? params
    : new URLSearchParams();

  if (!(params instanceof URLSearchParams)) {
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") query.set(key, value);
    });
  }

  const search = query.toString();
  return search ? `${pathname}?${search}` : pathname;
}

export function routePath(name, params = {}, locale = DEFAULT_LOCALE) {
  const prefix = localePrefix(locale);

  switch (name) {
    case "home":
      return `${prefix || "/"}`;
    case "guides":
      return `${prefix}/guides`;
    case "guide":
      return `${prefix}/guides/${cleanSegment(params.slug)}`;
    case "wiki":
      return `${prefix}/wiki`;
    case "wikiDataset":
      return withQuery(`${prefix}/wiki/${cleanSegment(params.datasetSlug)}`, params.search);
    case "wikiEntry":
      return `${prefix}/wiki/${cleanSegment(params.datasetSlug)}/${cleanSegment(params.entrySlug)}`;
    case "search":
      return withQuery(`${prefix}/search`, { q: params.q });
    case "tools":
      return `${prefix}/tools`;
    case "tool":
      return withQuery(`${prefix}/tools/${cleanSegment(params.tool)}`, params.search);
    case "admin":
      return "/admin";
    case "about":
      return `${prefix || "/"}#about`;
    default:
      return prefix || "/";
  }
}

export function parseAppRoute(locationLike = globalThis.location) {
  const { locale, pathname } = stripLocalePrefix(locationLike?.pathname || "/");
  const searchParams = new URLSearchParams((locationLike?.search || "").replace(/^\?/, ""));
  const parts = pathname.split("/").filter(Boolean).map(decodeSegment);
  const route = (name, params = {}) => ({ name, locale, params, searchParams });

  if (!parts.length) return route("home");
  if (parts[0] === "guides" && parts.length === 1) return route("guides");
  if (parts[0] === "guides" && parts.length === 2) return route("guide", { slug: parts[1] });
  if (parts[0] === "wiki" && parts.length === 1) return route("wiki");
  if (parts[0] === "wiki" && parts.length === 2) return route("wikiDataset", { datasetSlug: parts[1] });
  if (parts[0] === "wiki" && parts.length === 3) return route("wikiEntry", { datasetSlug: parts[1], entrySlug: parts[2] });
  if (parts[0] === "search" && parts.length === 1) return route("search");
  if (parts[0] === "tools" && parts.length === 1) return route("tools");
  if (parts[0] === "tools" && parts.length === 2) return route("tool", { tool: parts[1] });

  return route("notFound", { pathname });
}

function pathForRoute(route, locale = DEFAULT_LOCALE) {
  const query = route.searchParams || new URLSearchParams();
  switch (route.name) {
    case "home":
      return routePath("home", {}, locale);
    case "guides":
      return routePath("guides", {}, locale);
    case "guide":
      return routePath("guide", { slug: route.params.slug }, locale);
    case "wiki":
      return routePath("wiki", {}, locale);
    case "wikiDataset":
      return routePath("wikiDataset", { datasetSlug: route.params.datasetSlug }, locale);
    case "wikiEntry":
      return routePath("wikiEntry", route.params, locale);
    case "search":
      return routePath("search", { q: query.get("q") || "" }, locale);
    case "tools":
      return routePath("tools", {}, locale);
    case "tool":
      return routePath("tool", { tool: route.params.tool }, locale);
    default:
      return routePath("home", {}, locale);
  }
}

export function canonicalPathForRoute(route) {
  return pathForRoute(route, DEFAULT_LOCALE);
}

export function hreflangCandidates(route) {
  return [
    {
      locale: DEFAULT_LOCALE,
      hreflang: DEFAULT_CONTENT_LOCALE,
      href: canonicalPathForRoute(route),
      available: true
    },
    {
      locale: "en",
      hreflang: "en",
      href: pathForRoute(route, "en"),
      available: false
    }
  ];
}

export function navigateTo(url, { replace = false } = {}) {
  if (typeof window === "undefined") return url;
  const target = new URL(url, window.location.href);
  const next = `${target.pathname}${target.search}`;
  if (`${window.location.pathname}${window.location.search}` === next) return next;
  window.history[replace ? "replaceState" : "pushState"]({}, "", next);
  window.dispatchEvent(new Event("app:navigation"));
  return next;
}
