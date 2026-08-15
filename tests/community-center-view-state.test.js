import { describe, expect, test } from "vitest";
import { communityCenter } from "../src/features/tools/data/community-center.js";
import { calculateCommunityState } from "../public/js/tools/community-center-state.js";
import {
  getCommunityScopeSummary,
  getDefaultCommunityRoom,
  resolveCommunityView
} from "../public/js/tools/community-center-view-state.js";

function completedSlotsForRoom(room) {
  return room.bundles.flatMap((bundle) => bundle.items
    .slice(0, bundle.requiredCount)
    .map((item) => `${bundle.id}:${item.id}`));
}

function snapshot(value) {
  return JSON.stringify(value);
}

describe("community center view state", () => {
  test("defaults to standard and selects the first incomplete standard room", () => {
    const completedItemIds = completedSlotsForRoom(communityCenter[0]);
    const summary = calculateCommunityState(communityCenter, completedItemIds);

    expect(getDefaultCommunityRoom(communityCenter, summary, "standard")).toBe("pantry");
    expect(resolveCommunityView(communityCenter, { completedItemIds, summary })).toMatchObject({
      scope: "standard",
      roomId: "pantry"
    });
  });

  test("keeps standard and missing rooms strictly separated", () => {
    const summary = calculateCommunityState(communityCenter, []);
    const standard = resolveCommunityView(communityCenter, { summary, scope: "standard" });
    const missing = resolveCommunityView(communityCenter, { summary, scope: "missing" });

    expect(standard.visibleRooms).toHaveLength(6);
    expect(standard.visibleRooms.every((room) => room.progressScope === "standard")).toBe(true);
    expect(missing.visibleRooms).toHaveLength(1);
    expect(missing.visibleRooms[0].id).toBe("missing-bundle");
  });

  test("focusBundleId switches to the owning scope and room", () => {
    const summary = calculateCommunityState(communityCenter, []);
    const view = resolveCommunityView(communityCenter, {
      summary,
      scope: "standard",
      roomId: "crafts-room",
      focusBundleId: "missing-bundle-items"
    });

    expect(view).toMatchObject({
      scope: "missing",
      roomId: "missing-bundle",
      focusBundleId: "missing-bundle-items"
    });
  });

  test("invalid scope, room, and focus safely fall back", () => {
    const summary = calculateCommunityState(communityCenter, []);
    const view = resolveCommunityView(communityCenter, {
      summary,
      scope: "unknown",
      roomId: "unknown-room",
      focusBundleId: "unknown-bundle"
    });

    expect(view).toMatchObject({
      scope: "standard",
      roomId: "crafts-room",
      focusBundleId: null
    });
  });

  test("incomplete filter falls back when the selected room disappears", () => {
    const completedItemIds = completedSlotsForRoom(communityCenter[0]);
    const summary = calculateCommunityState(communityCenter, completedItemIds);
    const view = resolveCommunityView(communityCenter, {
      completedItemIds,
      summary,
      scope: "standard",
      roomId: "crafts-room",
      filter: "incomplete"
    });

    expect(view.roomId).toBe("pantry");
    expect(view.visibleRooms.some((room) => room.id === "crafts-room")).toBe(false);
  });

  test("preserves the all rooms selection when it remains valid", () => {
    const summary = calculateCommunityState(communityCenter, []);
    const view = resolveCommunityView(communityCenter, {
      summary,
      scope: "standard",
      roomId: "all"
    });

    expect(view.roomId).toBe("all");
    expect(view.displayedRooms).toHaveLength(6);
  });

  test("uses independent required-slot denominators for each scope", () => {
    const summary = calculateCommunityState(communityCenter, []);

    expect(getCommunityScopeSummary(summary, "standard").requiredSlots).toBe(110);
    expect(getCommunityScopeSummary(summary, "missing").requiredSlots).toBe(5);
  });

  test("does not mutate rooms, completed progress, or summary", () => {
    const completedItemIds = completedSlotsForRoom(communityCenter[0]);
    const summary = calculateCommunityState(communityCenter, completedItemIds);
    const roomsBefore = snapshot(communityCenter);
    const completedBefore = snapshot(completedItemIds);
    const summaryBefore = snapshot(summary);

    getDefaultCommunityRoom(communityCenter, summary, "standard");
    getCommunityScopeSummary(summary, "standard");
    resolveCommunityView(communityCenter, {
      completedItemIds,
      summary,
      scope: "standard",
      filter: "incomplete",
      season: "春季"
    });

    expect(snapshot(communityCenter)).toBe(roomsBefore);
    expect(snapshot(completedItemIds)).toBe(completedBefore);
    expect(snapshot(summary)).toBe(summaryBefore);
  });
});
