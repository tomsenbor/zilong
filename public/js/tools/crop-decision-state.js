const DEFAULT_RANKING_LIMIT = 5;

export function cropSelectionChoices(data) {
  const all = [...data.items, ...data.excluded];
  return [...new Map(all.map(item => [item.id, { id: item.id, name: item.name }])).values()]
    .sort((a, b) => a.name.localeCompare(b.name, "zh-CN") || a.id.localeCompare(b.id));
}

export function resolveCropSelection(data, cropId) {
  if (!cropId) return { item: data.highlights.bestProfit, name: "", reason: "" };
  const item = data.items.find(item => item.id === cropId);
  if (item) return { item, name: item.name, reason: "" };
  const excluded = data.excluded.find(item => item.id === cropId);
  return { item: null, name: excluded?.name || cropId,
    reason: excluded?.reason || "未找到该作物，请重新选择。" };
}

export function comparisonScale(left, right) {
  const min = Math.min(0, left, right);
  const max = Math.max(0, left, right) || (min === 0 ? 1 : 0);
  const span = max - min;
  return { min, max, zero: (0 - min) / span * 100,
    bars: [left, right].map(value => ({ x: (Math.min(0, value) - min) / span * 100, width: Math.abs(value) / span * 100 })) };
}

export function comparisonTakeaway(left, right) {
  const gold = value => `${Math.abs(value).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}g`;
  const profit = left.profit - right.profit;
  const cost = left.cost - right.cost;
  return `${left.name}比${right.name}${profit === 0 ? "净赚相同" : `${profit > 0 ? "多赚" : "少赚"} ${gold(profit)}`}，整轮费用${cost === 0 ? "相同" : `${cost > 0 ? "多" : "少"} ${gold(cost)}`}。`;
}

const normalizedLimit = (limit) =>
  Number.isInteger(limit) && limit > 0 ? limit : DEFAULT_RANKING_LIMIT;

export function selectRankingItems(items, expanded, limit = DEFAULT_RANKING_LIMIT) {
  const ranking = Array.isArray(items) ? items : [];
  return ranking.slice(0, expanded ? ranking.length : normalizedLimit(limit));
}

export function canExpandRanking(items, limit = DEFAULT_RANKING_LIMIT) {
  return Array.isArray(items) && items.length > normalizedLimit(limit);
}

export function resolveComparison(items, leftId, rightId) {
  const ranking = Array.isArray(items) ? items : [];
  const findById = (id) => ranking.find((item) => String(item.id) === String(id));
  const left = findById(leftId) || ranking[0] || null;
  const right = findById(rightId) || ranking.find((item) => item.id !== left?.id) || null;

  if (ranking.length < 2 || !left || !right) {
    return { available: false, left, right, error: "" };
  }

  if (left.id === right.id) {
    return { available: true, left, right, error: "请选择两种不同作物" };
  }

  return { available: true, left, right, error: "" };
}

export function getMachineFieldVisibility(method) {
  return {
    jar: method === "jar",
    keg: method === "keg"
  };
}

export function getResetDecisionState() {
  return {
    advancedOpen: false,
    rankingExpanded: false,
    comparisonLeftId: "",
    comparisonRightId: ""
  };
}
