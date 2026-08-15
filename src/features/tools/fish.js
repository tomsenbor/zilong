import { fishCategories, fishSourceTypes } from "./constants.js";

export function normalizeGameTime(time) {
  const numericTime = Number(time);
  return numericTime >= 0 && numericTime <= 200 ? numericTime + 2400 : numericTime;
}

export function isValidGameTime(time) {
  const numericTime = Number(time);
  if (!Number.isInteger(numericTime)) return false;
  if (numericTime === 2600) return true;

  const hour = Math.floor(numericTime / 100);
  const minute = numericTime % 100;
  if (minute < 0 || minute > 50 || minute % 10 !== 0) return false;
  if (hour >= 0 && hour < 2) return true;
  if (hour === 2) return minute === 0;
  return hour >= 6 && hour <= 25;
}

export function matchesTime(ranges, time) {
  if (time === undefined || time === null || Number.isNaN(Number(time))) return true;
  const normalized = normalizeGameTime(time);
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
    bundleOnly,
    magicBait
  } = filters;

  return items.filter((item) => {
    if (q && !includesText([item.name, ...item.aliases, item.notes], q)) return false;
    if (sourceType && item.sourceType !== sourceType) return false;
    if (category && item.category !== category) return false;
    if (bundleOnly && item.bundleIds.length === 0) return false;

    return item.availabilityRules.some((rule) => {
      if (location && !rule.locations.includes(location)) return false;
      if (item.sourceType === "蟹笼") return true;

      const bypassStandardConditions = magicBait && rule.conditionType === "standard";
      if (bypassStandardConditions) return true;
      if (season && !rule.seasons.includes(season)) return false;
      if (weather && weather !== "任意" && !rule.weather.includes("任意") && !rule.weather.includes(weather)) return false;
      if (!matchesTime(rule.timeRanges, time)) return false;
      return true;
    });
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
