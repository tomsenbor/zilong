import { describe, expect, test } from "vitest";
import { buildRequestOptions } from "../public/js/api.js";

describe("buildRequestOptions", () => {
  test("preserves JSON content type when custom headers are supplied", () => {
    const options = buildRequestOptions({
      method: "POST",
      headers: { "x-csrf-token": "token" },
      body: JSON.stringify({ username: "admin", password: "change-me-now" })
    });

    expect(options.headers).toMatchObject({
      "Content-Type": "application/json",
      "x-csrf-token": "token"
    });
  });
});
