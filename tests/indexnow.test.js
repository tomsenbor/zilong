import fs from "node:fs";
import { describe, expect, test } from "vitest";
import { discoverIndexNowKey, selectIndexNowUrls } from "../scripts/submit-indexnow.js";

describe("IndexNow change submission", () => {
  test("discovers a root verification file whose content matches its key", () => {
    const keyFile = discoverIndexNowKey();

    expect(keyFile.fileName).toBe(`${keyFile.key}.txt`);
    expect(fs.readFileSync(keyFile.filePath, "utf8").trim()).toBe(keyFile.key);
  });

  test("submits only explicit changed public URLs and filters excluded or non-indexable pages", async () => {
    const baseUrl = "https://pixelharvestwiki.com";
    const requests = [];
    const responses = new Map([
      [`${baseUrl}/`, { status: 200, body: "<html><head></head><body>首页</body></html>" }],
      [`${baseUrl}/guides/sprinkler-unlock-and-ore-route`, { status: 200, body: "<html><body>攻略</body></html>" }],
      [`${baseUrl}/wiki/crops/strawberry`, { status: 200, body: '<meta name="robots" content="noindex,follow">' }],
      [`${baseUrl}/guides/missing`, { status: 404, body: "未找到" }]
    ]);
    const fetchImpl = async (url) => {
      requests.push(String(url));
      const result = responses.get(String(url));
      return new Response(result?.body || "", { status: result?.status || 500 });
    };

    const prepared = await selectIndexNowUrls({
      baseUrl,
      changes: {
        added: ["/", "/admin", "/wiki/catalog/abigail-icon", "/wiki/crops/strawberry"],
        modified: ["/guides/sprinkler-unlock-and-ore-route", "/guides/missing", "https://other.example/guide"],
        deleted: ["/guides/retired-guide", "/admin/retired-guide"]
      },
      fetchImpl
    });

    expect(prepared.urls).toEqual([
      `${baseUrl}/`,
      `${baseUrl}/guides/sprinkler-unlock-and-ore-route`,
      `${baseUrl}/guides/retired-guide`
    ]);
    expect(prepared.skipped.map((item) => item.reason)).toEqual(expect.arrayContaining([
      "admin",
      "catalog-detail",
      "noindex",
      "status-404",
      "different-origin"
    ]));
    expect(requests).not.toContain(`${baseUrl}/admin`);
    expect(requests).not.toContain(`${baseUrl}/wiki/catalog/abigail-icon`);
  });
});
