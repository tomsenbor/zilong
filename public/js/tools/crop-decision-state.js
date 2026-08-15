const DEFAULT_RANKING_LIMIT = 5;

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
