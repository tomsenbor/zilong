import { expect, test } from "vitest";
import { entries } from "../src/db/seeds.js";

test("crafting consumables cover all thirteen independent source identities", () => {
  const expected = ["field-snack", "bug-steak", "life-elixir", "oil-of-garlic", "monster-musk", "fairy-dust", "warp-totem-beach", "warp-totem-mountains", "warp-totem-farm", "warp-totem-desert", "warp-totem-island", "rain-totem", "treasure-totem"];
  for (const slug of expected) {
    const found = entries.filter(e => e.dataset === "items" && e.slug === slug);
    expect(found, slug).toHaveLength(1);
    expect(found[0].attributes.制作配方).toBeTruthy();
    expect(found[0].attributes.配方解锁).toBeTruthy();
  }
});

test("1.6 consumable caveats do not repeat outdated recovery and weather rules", () => {
  const get = slug => entries.find(e => e.dataset === "items" && e.slug === slug)?.attributes;
  expect(get("field-snack")?.效果).toContain("20");
  expect(get("bug-steak")?.效果).toContain("30");
  expect(get("life-elixir")?.效果).toContain("不恢复能量");
  expect(get("life-elixir")?.基础售价).toBe("250金");
  expect(get("fairy-dust")?.使用限制).toContain("下一个品质");
  expect(get("rain-totem")?.使用限制).toContain("不能连锁雷暴");
  expect(get("treasure-totem")?.使用限制).toContain("室内");
  expect(get("oil-of-garlic")?.使用限制).toContain("危险");
  expect(get("warp-totem-desert")?.配方解锁).toContain("10铱锭");
});
