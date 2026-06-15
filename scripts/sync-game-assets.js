import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { entries } from "../src/db/seeds.js";
import { communityCenter } from "../src/features/tools/data/community-center.js";
import {
  buildAssetIndex,
  unresolvedGameAssets,
  wikiFileTitleFromAssetUrl,
  wikiImageUrlFromResponse
} from "../src/db/assets.js";

const assetDir = path.resolve("public/assets/game");
const reportPath = path.resolve("docs/game-assets-sources.json");
const apiUrl = "https://stardewvalleywiki.com/mediawiki/api.php";
const userAgent = "PixelHarvestWiki/1.0 (local asset maintenance)";
const wikiTitleAliases = {
  "Junimo.png": "Junimo_Bundle.png",
  "Danger_In_The_Deep.png": "MinesEntrance.png",
  "Soup.png": "Luau.png",
  "Star_Token.png": "Token.png",
  "Secret_Gift.png": "Gift_Icon.png",
  "Farmhouse.png": "Farm_Map_Selection.png",
  "Town.png": "Pelican_Town.png",
  "Beach.png": "BeachForageLocations.png",
  "Mountain.png": "MountainForageLocations.png",
  "Desert.png": "DesertForageLocations.png",
  "Volcano_Dungeon.png": "VolcanoDungeon_Entryway.png",
  "Large_White_Egg.png": "Large_Egg.png"
};

const communityEntries = communityCenter.flatMap((room) =>
  room.bundles.flatMap((bundle) =>
    bundle.items.map((item) => ({
      dataset: `community-center/${bundle.id}`,
      name: item.name,
      image: item.image
    }))
  )
);
const initialIndex = buildAssetIndex(fs.readdirSync(assetDir));
const missing = unresolvedGameAssets([...entries, ...communityEntries], initialIndex);
const previousReport = fs.existsSync(reportPath)
  ? JSON.parse(fs.readFileSync(reportPath, "utf8"))
  : { downloaded: [] };
const report = {
  generatedAt: new Date().toISOString(),
  source: "https://stardewvalleywiki.com/",
  downloaded: previousReport.downloaded || [],
  unresolved: []
};

async function normalizeLargeAsset(filename) {
  const filePath = path.join(assetDir, filename);
  if (!fs.existsSync(filePath)) return null;

  const sourceBuffer = fs.readFileSync(filePath);
  const metadata = await sharp(sourceBuffer).metadata();
  if (metadata.width <= 128 && metadata.height <= 128) return sourceBuffer.length;

  const buffer = await sharp(sourceBuffer)
    .resize(96, 96, { fit: "contain" })
    .png()
    .toBuffer();
  fs.writeFileSync(filePath, buffer);
  return buffer.length;
}

for (const entry of missing) {
  const defaultTitle = wikiFileTitleFromAssetUrl(entry.image);
  const originalFilename = defaultTitle.slice("File:".length);
  const title = `File:${wikiTitleAliases[originalFilename] || originalFilename}`;
  const query = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url",
    titles: title
  });

  try {
    const metadataResponse = await fetch(`${apiUrl}?${query}`, {
      headers: { "User-Agent": userAgent }
    });
    if (!metadataResponse.ok) throw new Error(`metadata HTTP ${metadataResponse.status}`);
    const imageUrl = wikiImageUrlFromResponse(await metadataResponse.json());
    if (!imageUrl) {
      report.unresolved.push({ dataset: entry.dataset, name: entry.name, title, reason: "wiki file not found" });
      continue;
    }

    const imageResponse = await fetch(imageUrl, {
      headers: { "User-Agent": userAgent }
    });
    if (!imageResponse.ok) throw new Error(`image HTTP ${imageResponse.status}`);
    const sourceBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const isPng = sourceBuffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    if (!isPng) throw new Error("downloaded file is not PNG");

    const filename = decodeURIComponent(entry.image.replace("/assets/game/", ""));
    const metadata = await sharp(sourceBuffer).metadata();
    const buffer = metadata.width > 128 || metadata.height > 128
      ? await sharp(sourceBuffer).resize(96, 96, { fit: "contain" }).png().toBuffer()
      : sourceBuffer;
    fs.writeFileSync(path.join(assetDir, filename), buffer, { flag: "wx" });
    report.downloaded.push({
      dataset: entry.dataset,
      name: entry.name,
      filename,
      source: imageUrl,
      bytes: buffer.length
    });
    console.log(`Downloaded ${entry.name}: ${filename}`);
  } catch (error) {
    if (error.code === "EEXIST") continue;
    report.unresolved.push({ dataset: entry.dataset, name: entry.name, title, reason: error.message });
    console.warn(`Skipped ${entry.name}: ${error.message}`);
  }
}

for (const asset of report.downloaded) {
  const bytes = await normalizeLargeAsset(asset.filename);
  if (bytes) asset.bytes = bytes;
}

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Downloaded ${report.downloaded.length}; unresolved ${report.unresolved.length}.`);
console.log(`Source report: ${reportPath}`);
