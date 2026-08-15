import {
  calculateCommunityState,
  getCommunityTotalsByScope as calculateTotalsByScope
} from "../../../public/js/tools/community-center-state.js";

export function getCommunitySlotIds(rooms) {
  return rooms.flatMap((room) =>
    room.bundles.flatMap((bundle) =>
      bundle.items.map((item) => `${bundle.id}:${item.id}`)
    )
  );
}

export function getCommunityTotals(rooms) {
  return calculateTotalsByScope(rooms).all;
}

export function getCommunityTotalsByScope(rooms) {
  return calculateTotalsByScope(rooms);
}

export function calculateCommunityProgress(rooms, completedItemIds = []) {
  return calculateCommunityState(rooms, completedItemIds);
}
