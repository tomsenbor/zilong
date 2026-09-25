import { expect, test } from "vitest";
import { entries } from "../src/db/seeds.js";
import { readFileSync } from "node:fs";

test("source-listed remaining paths, lights, signs and facilities have 44 separate new identities", () => {
  const rows = entries.filter(e => e.image.startsWith("/assets/game/Craft_"));
  expect(rows).toHaveLength(44);
  expect(new Set(rows.map(e => e.slug)).size).toBe(44);
  for (const row of rows) {
    expect(row.attributes.制作配方).toBeTruthy();
    expect(row.attributes.配方解锁).toBeTruthy();
    expect(row.attributes.获取方式.length).toBeGreaterThan(18);
    expect(readFileSync(`public${row.image}`).subarray(1, 4).toString()).toBe("PNG");
  }
});

test("craft recipes separate output quantity, shop currency and non-automatic collection", () => {
  const get = slug => {
    const item = entries.find(e => e.dataset === "items" && e.slug === slug);
    expect(item, slug).toBeDefined();
    return item.attributes;
  };
  expect(get("crystal-floor").单次产量).toBe(5);
  expect(get("explosive-ammo").单次产量).toBe(5);
  expect(get("hopper").配方解锁).toContain("50齐钻");
  expect(get("hopper").主要用途).toContain("手动");
  expect(get("tub-o-flowers").配方解锁).toContain("1000g");
  expect(get("mini-obelisk").使用限制).toContain("姜岛");
  expect(get("text-sign").使用限制).toContain("60");
  expect(get("anvil").主要用途).toContain("3铱锭");
});
