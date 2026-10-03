import { expect, test } from "vitest";
import * as view from "../public/js/tools/crop-decision-state.js";
import { rankCropProfits } from "../src/features/tools/crops.js";
import { crops } from "../src/features/tools/data/crops.js";

const autumn = () => rankCropProfits(crops, { season: "秋季", method: "sell", budget: null });

test("all crops keeps the existing automatic recommendation", () => {
  const data = autumn();
  expect(view.resolveCropSelection(data, "").item.id).toBe(data.highlights.bestProfit.id);
});
test("a chosen crop replaces the recommendation without filtering comparisons", () => {
  const data = autumn();
  const before = structuredClone(data);
  expect(view.resolveCropSelection(data, "pumpkin").item.name).toBe("南瓜");
  expect(data).toEqual(before);
});
test("a crop outside its season stays selected with the actual blocking reason", () => {
  const result = view.resolveCropSelection(autumn(), "parsnip");
  expect(result.item).toBeNull();
  expect(result.name).toBe("防风草");
  expect(result.reason).toContain("季节");
});
test("a locked crop is not silently replaced by the best available crop", () => {
  const data = rankCropProfits(crops, { season: "夏季", desertUnlocked: false });
  const result = view.resolveCropSelection(data, "starfruit");
  expect(result.item).toBeNull();
  expect(result.reason).toContain("沙漠");
});
test("an unknown linked crop has an explicit failure rather than a fallback", () => {
  expect(view.resolveCropSelection(autumn(), "missing")).toMatchObject({ item: null, name: "missing" });
  expect(view.resolveCropSelection(autumn(), "missing").reason).toContain("未找到");
});
test("crop choices contain the whole calculator roster across seasons and zero budget", () => {
  const data = rankCropProfits(crops, { season: "冬季", budget: 0 });
  const choices = view.cropSelectionChoices(data);
  expect(choices.map(item => item.id).sort()).toEqual(crops.map(item => item.id).sort());
  expect(view.cropSelectionChoices(autumn()).map(item => item.id)).toEqual(choices.map(item => item.id));
});
