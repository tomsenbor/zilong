const EMPTY_TOTALS = Object.freeze({
  rooms: 0,
  bundles: 0,
  candidateSlots: 0,
  requiredSlots: 0
});

function emptyTotals() {
  return { ...EMPTY_TOTALS };
}

function roomScope(room) {
  return room.progressScope === "missing" ? "missing" : "standard";
}

export function getCommunityTotalsByScope(rooms = []) {
  const totals = {
    all: emptyTotals(),
    standard: emptyTotals(),
    missing: emptyTotals()
  };

  for (const room of rooms) {
    const scope = roomScope(room);
    const roomTotals = {
      rooms: 1,
      bundles: room.bundles.length,
      candidateSlots: room.bundles.reduce((sum, bundle) => sum + bundle.items.length, 0),
      requiredSlots: room.bundles.reduce((sum, bundle) => sum + bundle.requiredCount, 0)
    };

    for (const key of Object.keys(EMPTY_TOTALS)) {
      totals.all[key] += roomTotals[key];
      totals[scope][key] += roomTotals[key];
    }
  }

  return totals;
}

function emptyScopeProgress(totals) {
  return {
    ...totals,
    completedRequiredSlots: 0,
    completedBundles: 0,
    completedRooms: 0,
    percent: 0
  };
}

function finalizePercent(progress) {
  progress.percent = progress.requiredSlots === 0
    ? 0
    : Math.round((progress.completedRequiredSlots / progress.requiredSlots) * 100);
}

export function calculateCommunityState(rooms = [], completedItemIds = []) {
  const completed = new Set(Array.isArray(completedItemIds) ? completedItemIds : []);
  const totals = getCommunityTotalsByScope(rooms);
  const scopeProgress = {
    all: emptyScopeProgress(totals.all),
    standard: emptyScopeProgress(totals.standard),
    missing: emptyScopeProgress(totals.missing)
  };
  const bundleProgress = {};
  const roomProgress = {};

  for (const room of rooms) {
    const scope = roomScope(room);
    let selectedCount = 0;
    let creditedCount = 0;
    let completedBundles = 0;

    for (const bundle of room.bundles) {
      const bundleSelectedCount = bundle.items.reduce((sum, item) =>
        sum + Number(completed.has(`${bundle.id}:${item.id}`)), 0);
      const bundleCreditedCount = Math.min(bundleSelectedCount, bundle.requiredCount);
      const remainingCount = Math.max(bundle.requiredCount - bundleCreditedCount, 0);
      const isComplete = remainingCount === 0;

      selectedCount += bundleSelectedCount;
      creditedCount += bundleCreditedCount;
      if (isComplete) completedBundles += 1;

      bundleProgress[bundle.id] = {
        completed: bundleSelectedCount,
        required: bundle.requiredCount,
        selectedCount: bundleSelectedCount,
        creditedCount: bundleCreditedCount,
        requiredCount: bundle.requiredCount,
        remainingCount,
        isComplete
      };
    }

    const requiredCount = room.bundles.reduce((sum, bundle) => sum + bundle.requiredCount, 0);
    const isComplete = completedBundles === room.bundles.length;
    roomProgress[room.id] = {
      progressScope: scope,
      done: creditedCount,
      required: requiredCount,
      selectedCount,
      creditedCount,
      requiredCount,
      remainingCount: Math.max(requiredCount - creditedCount, 0),
      completedBundles,
      totalBundles: room.bundles.length,
      isComplete
    };

    for (const progress of [scopeProgress.all, scopeProgress[scope]]) {
      progress.completedRequiredSlots += creditedCount;
      progress.completedBundles += completedBundles;
      if (isComplete) progress.completedRooms += 1;
    }
  }

  finalizePercent(scopeProgress.all);
  finalizePercent(scopeProgress.standard);
  finalizePercent(scopeProgress.missing);

  return {
    ...totals.all,
    completedRequiredSlots: scopeProgress.all.completedRequiredSlots,
    completedBundles: scopeProgress.all.completedBundles,
    completedRooms: scopeProgress.all.completedRooms,
    percent: scopeProgress.all.percent,
    scopeProgress,
    bundleProgress,
    roomProgress
  };
}

export function filterCommunityRooms(
  rooms,
  completedItemIds,
  progress,
  filter = "all",
  season = "春季"
) {
  const completed = new Set(Array.isArray(completedItemIds) ? completedItemIds : []);

  return rooms.flatMap((room) => {
    if (filter === "incomplete" && progress.roomProgress[room.id]?.isComplete) return [];

    const bundles = room.bundles.flatMap((bundle) => {
      if (filter === "incomplete" && progress.bundleProgress[bundle.id]?.isComplete) return [];

      const items = bundle.items.filter((item) => {
        if (filter === "incomplete") return !completed.has(`${bundle.id}:${item.id}`);
        if (filter === "season") return item.seasons.length === 0 || item.seasons.includes(season);
        return true;
      });

      if (items.length === 0 && filter !== "all") return [];
      return [{ ...bundle, items }];
    });

    if (bundles.length === 0 && filter !== "all") return [];
    return [{ ...room, bundles }];
  });
}
