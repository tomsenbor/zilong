import { calculateCommunityState, filterCommunityRooms } from "./community-center-state.js";

const VALID_SCOPES = new Set(["standard", "missing"]);
const VALID_FILTERS = new Set(["all", "incomplete", "season"]);

function normalizeScope(scope) {
  return VALID_SCOPES.has(scope) ? scope : "standard";
}

function roomScope(room) {
  return room.progressScope === "missing" ? "missing" : "standard";
}

function findBundleOwner(rooms, bundleId) {
  if (!bundleId) return null;
  for (const room of rooms) {
    if (room.bundles.some((bundle) => bundle.id === bundleId)) return room;
  }
  return null;
}

export function getCommunityScopeSummary(summary, scope = "standard") {
  const normalizedScope = normalizeScope(scope);
  const scopeSummary = summary?.scopeProgress?.[normalizedScope];
  return scopeSummary
    ? { ...scopeSummary }
    : {
        rooms: 0,
        bundles: 0,
        candidateSlots: 0,
        requiredSlots: 0,
        completedRequiredSlots: 0,
        completedBundles: 0,
        completedRooms: 0,
        percent: 0
      };
}

export function getDefaultCommunityRoom(rooms = [], progress = {}, scope = "standard") {
  const normalizedScope = normalizeScope(scope);
  const scopedRooms = rooms.filter((room) => roomScope(room) === normalizedScope);
  return scopedRooms.find((room) => !progress?.roomProgress?.[room.id]?.isComplete)?.id
    ?? scopedRooms[0]?.id
    ?? "all";
}

export function resolveCommunityView(rooms = [], options = {}) {
  const completedItemIds = Array.isArray(options.completedItemIds)
    ? options.completedItemIds
    : [];
  const summary = options.summary
    ?? calculateCommunityState(rooms, completedItemIds);
  const focusOwner = findBundleOwner(rooms, options.focusBundleId);
  const focusBundleId = focusOwner ? options.focusBundleId : null;
  const scope = focusOwner ? roomScope(focusOwner) : normalizeScope(options.scope);
  let filter = VALID_FILTERS.has(options.filter) ? options.filter : "all";
  let requestedRoomId = focusOwner?.id ?? options.roomId;

  let filteredRooms = filterCommunityRooms(
    rooms,
    completedItemIds,
    summary,
    filter,
    options.season
  ).filter((room) => roomScope(room) === scope);

  if (focusOwner && !filteredRooms.some((room) => room.id === focusOwner.id)) {
    filter = "all";
    filteredRooms = filterCommunityRooms(
      rooms,
      completedItemIds,
      summary,
      filter,
      options.season
    ).filter((room) => roomScope(room) === scope);
  }

  const visibleRoomIds = new Set(filteredRooms.map((room) => room.id));
  let roomId;
  if (requestedRoomId === "all" && !focusOwner) {
    roomId = "all";
  } else if (visibleRoomIds.has(requestedRoomId)) {
    roomId = requestedRoomId;
  } else {
    roomId = getDefaultCommunityRoom(filteredRooms, summary, scope);
  }

  const displayedRooms = roomId === "all"
    ? filteredRooms
    : filteredRooms.filter((room) => room.id === roomId);

  return {
    scope,
    filter,
    roomId,
    focusBundleId,
    visibleRooms: filteredRooms,
    displayedRooms
  };
}
