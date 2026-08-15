export const FISH_PAGE_SIZE = 12;

const FILTER_DEFINITIONS = [
  { key: "q", label: "关键词" },
  { key: "season", label: "季节" },
  { key: "location", label: "地点" },
  { key: "weather", label: "天气", advanced: true },
  { key: "time", label: "时间", advanced: true, format: formatGameTime },
  { key: "sourceType", label: "方式", advanced: true },
  { key: "category", label: "分类", advanced: true },
  { key: "bundleOnly", label: "仅社区中心", advanced: true, boolean: true },
  { key: "magicBait", label: "魔法鱼饵", advanced: true, boolean: true }
];

export function selectVisibleFish(items, visibleCount) {
  return items.slice(0, visibleCount);
}

export function nextVisibleFishCount(current, total, pageSize = FISH_PAGE_SIZE) {
  return Math.min(total, current + pageSize);
}

export function formatGameTime(value) {
  const numericValue = Number(value);
  const hour = Math.floor(numericValue / 100) % 24;
  const minute = numericValue % 100;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function buildFishQuery(formData) {
  const query = new URLSearchParams(formData);
  [...query].forEach(([key, value]) => {
    if (!value || value === "false") query.delete(key);
  });
  return query;
}

export function getActiveFishFilters(params) {
  return FILTER_DEFINITIONS.flatMap((definition) => {
    const rawValue = params.get(definition.key);
    if (!rawValue || rawValue === "false") return [];
    const value = definition.boolean ? "" : (definition.format ? definition.format(rawValue) : rawValue);
    return [{ key: definition.key, label: definition.label, value }];
  });
}

export function clearFishFilter(params, key) {
  const query = new URLSearchParams(params);
  query.delete(key);
  return query;
}

export function countAdvancedFishFilters(params) {
  const advancedKeys = new Set(FILTER_DEFINITIONS.filter((definition) => definition.advanced).map((definition) => definition.key));
  return getActiveFishFilters(params).filter((filter) => advancedKeys.has(filter.key)).length;
}
