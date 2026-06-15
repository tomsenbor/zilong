import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import {
  buildAssetIndex,
  resolveGameAssetUrl,
  unresolvedGameAssets,
  wikiFileTitleFromAssetUrl,
  wikiImageUrlFromResponse
} from "../src/db/assets.js";

describe("game asset resolver", () => {
  test("keeps an exact local asset when it exists", () => {
    const index = buildAssetIndex(["36px-Parsnip.png", "24px-Parsnip.png"]);

    expect(resolveGameAssetUrl("/assets/game/36px-Parsnip.png", index))
      .toBe("/assets/game/36px-Parsnip.png");
  });

  test("falls back to the best available size for the same object", () => {
    const index = buildAssetIndex(["20px-Sashimi.png", "24px-Sashimi.png"]);

    expect(resolveGameAssetUrl("/assets/game/36px-Sashimi.png", index))
      .toBe("/assets/game/24px-Sashimi.png");
  });

  test("matches URL-encoded filenames without double encoding them", () => {
    const index = buildAssetIndex(["24px-Miner%27s_Treat.png"]);

    expect(resolveGameAssetUrl("/assets/game/36px-Miner's_Treat.png", index))
      .toBe("/assets/game/24px-Miner%2527s_Treat.png");
  });

  test("converts a sized local path to the original wiki filename", () => {
    expect(wikiFileTitleFromAssetUrl("/assets/game/36px-Rabbit's_Foot.png"))
      .toBe("File:Rabbit's_Foot.png");
  });

  test("extracts a downloadable image URL from a MediaWiki response", () => {
    const response = {
      query: {
        pages: {
          42: {
            imageinfo: [{ url: "https://example.test/images/Sashimi.png" }]
          }
        }
      }
    };

    expect(wikiImageUrlFromResponse(response))
      .toBe("https://example.test/images/Sashimi.png");
    expect(wikiImageUrlFromResponse({ query: { pages: { "-1": { missing: true } } } }))
      .toBeNull();
  });

  test("every seeded entry resolves to an existing local file or the fallback", async () => {
    const { entries } = await import("../src/db/seeds.js");
    const filenames = fs.readdirSync(path.resolve("public/assets/game"));
    const index = buildAssetIndex(filenames);

    for (const entry of entries) {
      const resolved = resolveGameAssetUrl(entry.image, index);
      const filename = decodeURIComponent(resolved.replace("/assets/game/", ""));
      expect(
        fs.existsSync(path.resolve("public/assets/game", filename)),
        `${entry.dataset}: ${entry.name} -> ${resolved}`
      ).toBe(true);
    }
  });

  test("ships a real local asset for every built-in entry", async () => {
    const { entries } = await import("../src/db/seeds.js");
    const index = buildAssetIndex(fs.readdirSync(path.resolve("public/assets/game")));

    expect(unresolvedGameAssets(entries, index)).toEqual([]);
  });
});
