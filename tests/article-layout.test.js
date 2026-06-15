import { describe, expect, test } from "vitest";
import { createArticleOutline, estimateReadingMinutes } from "../public/js/article-layout.js";

describe("article detail layout", () => {
  test("creates stable unique anchors for every chapter", () => {
    expect(createArticleOutline(["首次登岛", "西部农场", "首次登岛"])).toEqual([
      { id: "guide-section-1", title: "首次登岛", number: "01" },
      { id: "guide-section-2", title: "西部农场", number: "02" },
      { id: "guide-section-3", title: "首次登岛", number: "03" }
    ]);
  });

  test("estimates at least one minute from the complete article text", () => {
    expect(estimateReadingMinutes("完整攻略内容")).toBe(1);
    expect(estimateReadingMinutes("姜岛".repeat(400))).toBeGreaterThan(1);
  });
});
