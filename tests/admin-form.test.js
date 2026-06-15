import { describe, expect, test } from "vitest";
import { buildArticlePayload } from "../public/js/admin-form.js";

describe("admin article form", () => {
  test("preserves selected categories and the chosen cover image", () => {
    const form = new FormData();
    form.set("title", "温室攻略");
    form.set("summary", "完整布局");
    form.set("body", "## 布局");
    form.set("status", "published");
    form.set("gameVersion", "1.6.15");
    form.set("featured", "on");
    form.set("coverImage", "/uploads/greenhouse.png");
    form.append("categoryIds", "2");
    form.append("categoryIds", "5");

    expect(buildArticlePayload(form)).toEqual({
      title: "温室攻略",
      summary: "完整布局",
      body: "## 布局",
      status: "published",
      gameVersion: "1.6.15",
      featured: true,
      coverImage: "/uploads/greenhouse.png",
      categoryIds: [2, 5]
    });
  });
});
