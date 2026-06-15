export function getCommunitySlotIds(rooms) {
  return rooms.flatMap((room) =>
    room.bundles.flatMap((bundle) =>
      bundle.items.map((item) => `${bundle.id}:${item.id}`)
    )
  );
}

export function getCommunityTotals(rooms) {
  return rooms.reduce((totals, room) => {
    totals.rooms += 1;
    totals.bundles += room.bundles.length;
    for (const bundle of room.bundles) {
      totals.candidateSlots += bundle.items.length;
      totals.requiredSlots += bundle.requiredCount;
    }
    return totals;
  }, { rooms: 0, bundles: 0, candidateSlots: 0, requiredSlots: 0 });
}

export function calculateCommunityProgress(rooms, completedItemIds = []) {
  const completed = new Set(completedItemIds);
  const totals = getCommunityTotals(rooms);
  const bundleProgress = {};
  const roomProgress = {};
  let completedRequiredSlots = 0;
  let completedBundles = 0;
  let completedRooms = 0;

  for (const room of rooms) {
    let roomCompletedBundles = 0;
    for (const bundle of room.bundles) {
      const completedCount = bundle.items.filter((item) =>
        completed.has(`${bundle.id}:${item.id}`)
      ).length;
      const isComplete = completedCount >= bundle.requiredCount;
      completedRequiredSlots += Math.min(completedCount, bundle.requiredCount);
      if (isComplete) {
        completedBundles += 1;
        roomCompletedBundles += 1;
      }
      bundleProgress[bundle.id] = {
        completed: completedCount,
        required: bundle.requiredCount,
        isComplete
      };
    }

    const isComplete = roomCompletedBundles === room.bundles.length;
    if (isComplete) completedRooms += 1;
    roomProgress[room.id] = {
      completedBundles: roomCompletedBundles,
      totalBundles: room.bundles.length,
      isComplete
    };
  }

  return {
    ...totals,
    completedRequiredSlots,
    completedBundles,
    completedRooms,
    percent: totals.requiredSlots === 0
      ? 0
      : Math.round((completedRequiredSlots / totals.requiredSlots) * 100),
    bundleProgress,
    roomProgress
  };
}
