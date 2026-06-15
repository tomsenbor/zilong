import { describe, expect, test } from "vitest";
import { classMap, uiClass } from "../public/js/ui-class.js";

describe("uiClass compatibility helper", () => {
  test("maps legacy card classes to design-system cards", () => {
    expect(classMap["old-card"]).toContain("card");
    expect(classMap["base-card"]).toContain("card");
    expect(classMap["ui-card"]).toContain("card");
    expect(uiClass("old-card featured")).toBe("old-card card featured");
  });

  test("maps legacy and semantic button classes to design-system buttons", () => {
    expect(uiClass("pixel-button")).toBe("pixel-button btn btn-primary");
    expect(uiClass("ui-button ghost")).toBe("ui-button btn btn-secondary ghost btn-ghost");
    expect(uiClass("btn secondary small")).toBe("btn secondary btn-secondary small");
  });

  test("maps search and form controls without duplicating classes", () => {
    expect(uiClass("search-input")).toBe("search-input form-control input");
    expect(uiClass("input", "input")).toBe("input form-control");
    expect(uiClass(["select", { active: true, hidden: false }])).toBe("select form-control active");
  });
});
