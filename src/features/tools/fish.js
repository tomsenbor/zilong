function normalizeTime(time) {
  return time < 600 ? time + 2400 : time;
}

export function matchesTime(ranges, time) {
  if (time === undefined || time === null || Number.isNaN(Number(time))) return true;
  const normalized = normalizeTime(Number(time));
  return ranges.some(({ start, end }) => normalized >= start && normalized < end);
}

function includesText(values, query) {
  const normalized = query.toLocaleLowerCase("zh-CN");
  return values.some((value) => String(value).toLocaleLowerCase("zh-CN").includes(normalized));
}

export function filterFish(items, filters = {}) {
  const {
    q,
    season,
    weather,
    time,
    location,
    sourceType,
    category,
    bundleOnly
  } = filters;

  return items.filter((item) => {
    if (q && !includesText([item.name, ...item.aliases, item.notes], q)) return false;
    if (sourceType && item.sourceType !== sourceType) return false;
    if (category && item.category !== category) return false;
    if (bundleOnly && item.bundleIds.length === 0) return false;
    if (location && !item.locations.some((value) => value.includes(location))) return false;

    if (item.sourceType !== "蟹笼") {
      if (season && !item.seasons.includes(season)) return false;
      if (weather && weather !== "任意" && !item.weather.includes("任意") && !item.weather.includes(weather)) return false;
      if (!matchesTime(item.timeRanges, time)) return false;
    }

    return true;
  });
}

export function getFishFilterOptions(items) {
  const unique = (values) => [...new Set(values)].sort((a, b) => a.localeCompare(b, "zh-CN"));
  const availableSources = new Set(items.map((item) => item.sourceType));
  const availableCategories = new Set(items.map((item) => item.category));
  return {
    locations: unique(items.flatMap((item) => item.locations)),
    sourceTypes: fishSourceTypes.filter((value) => availableSources.has(value)),
    categories: fishCategories.filter((value) => availableCategories.has(value))
  };
}
import { fishCategories, fishSourceTypes } from "./constants.js";
