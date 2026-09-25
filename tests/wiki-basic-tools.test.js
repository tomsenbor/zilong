import { expect, test } from "vitest";
import { entries } from "../src/db/seeds.js";
import { readFileSync } from "node:fs";

test("verified basic tool upgrade rows keep separate identities and original images", () => {
  const tools = entries.filter(e => e.dataset === "items" && e.attributes.type === "基础工具与升级");
  expect(tools).toHaveLength(33);
  expect(new Set(tools.map(e => e.slug)).size).toBe(33);
  expect(tools.filter(e => e.slug === "starter-backpack")).toHaveLength(1);
  for (const tool of tools) {
    expect(tool.attributes.获取方式.length).toBeGreaterThan(18);
    expect(tool.attributes.主要用途.length).toBeGreaterThan(18);
    expect(readFileSync(`public${tool.image}`).subarray(1, 4).toString()).toBe("PNG");
  }
});

test("tool tiers distinguish trash recovery, watering capacity, pans and backpack costs", () => {
  const get = slug => {
    const item = entries.find(e => e.dataset === "items" && e.slug === slug);
    expect(item, slug).toBeDefined();
    return item.attributes;
  };
  expect(get("iridium-trash-can").功能).toContain("60%");
  expect(get("iridium-trash-can").升级费用).toBe("12500g");
  expect(get("iridium-watering-can").功能).toMatch(/100.*18/);
  expect(get("gold-pickaxe").功能).toContain("陨石");
  expect(get("copper-pan").获取方式).toContain("鱼缸");
  expect(get("deluxe-pack").获取方式).toContain("10000g");
  expect(get("golden-scythe").功能).toContain("75%");
});
