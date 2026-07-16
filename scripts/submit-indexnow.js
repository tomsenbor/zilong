import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultPublicDir = path.join(projectRoot, "public");
const indexNowEndpoint = "https://api.indexnow.org/indexnow";
const indexNowKeyFilePattern = /^([A-Za-z0-9-]{8,128})\.txt$/;
const changeTypes = ["added", "modified", "deleted"];

function normalizeChangeList(value, fieldName) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`IndexNow change manifest field "${fieldName}" must be an array of URL strings.`);
  }
  return value;
}

export function parseIndexNowChanges(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("IndexNow change manifest must be a JSON object.");
  }
  return Object.fromEntries(changeTypes.map((type) => [type, normalizeChangeList(value[type], type)]));
}

export function discoverIndexNowKey({ publicDir = defaultPublicDir, keyFileName = process.env.INDEXNOW_KEY_FILE } = {}) {
  const candidates = fs.readdirSync(publicDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const match = entry.name.match(indexNowKeyFilePattern);
      if (!match) return null;
      const filePath = path.join(publicDir, entry.name);
      const key = match[1];
      return fs.readFileSync(filePath, "utf8").trim() === key ? { key, fileName: entry.name, filePath } : null;
    })
    .filter(Boolean);
  const selected = keyFileName ? candidates.find((candidate) => candidate.fileName === keyFileName) : candidates[0];

  if (!selected || (!keyFileName && candidates.length !== 1)) {
    throw new Error("Could not find exactly one valid root IndexNow key file.");
  }
  return selected;
}

function toSiteUrl(value, baseUrl) {
  let url;
  try {
    url = new URL(value, `${baseUrl}/`);
  } catch {
    return { reason: "invalid-url" };
  }
  const site = new URL(baseUrl);
  if (url.origin !== site.origin) return { reason: "different-origin" };
  url.hash = "";
  return { url };
}

function excludedReason(url) {
  if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) return "admin";
  if (url.pathname.startsWith("/wiki/catalog/")) return "catalog-detail";
  return "";
}

function isNoindexResponse(response, html) {
  if (/\bnoindex\b/i.test(response.headers.get("x-robots-tag") || "")) return true;
  return [...html.matchAll(/<meta\b[^>]*>/gi)].some(([tag]) => (
    /\bname\s*=\s*["']robots["']/i.test(tag)
    && /\bcontent\s*=\s*["'][^"']*\bnoindex\b/i.test(tag)
  ));
}

export async function selectIndexNowUrls({ baseUrl, changes, fetchImpl = fetch }) {
  const site = new URL(baseUrl);
  const normalizedChanges = parseIndexNowChanges(changes);
  const candidates = new Map();
  const skipped = [];

  for (const type of changeTypes) {
    for (const value of normalizedChanges[type]) {
      const normalized = toSiteUrl(value, site.href);
      if (!normalized.url) {
        skipped.push({ value, reason: normalized.reason });
        continue;
      }
      const reason = excludedReason(normalized.url);
      if (reason) {
        skipped.push({ value: normalized.url.href, reason });
        continue;
      }
      candidates.set(normalized.url.href, type);
    }
  }

  const urls = [];
  for (const [url, type] of candidates) {
    if (type === "deleted") {
      urls.push(url);
      continue;
    }
    try {
      const response = await fetchImpl(url, { headers: { accept: "text/html" } });
      if (response.status !== 200) {
        skipped.push({ value: url, reason: `status-${response.status}` });
        continue;
      }
      const html = await response.text();
      if (isNoindexResponse(response, html)) {
        skipped.push({ value: url, reason: "noindex" });
        continue;
      }
      urls.push(url);
    } catch {
      skipped.push({ value: url, reason: "request-failed" });
    }
  }
  return { urls, skipped };
}

function readCliOptions(argv) {
  const options = { changesFile: "", baseUrl: process.env.SITE_URL || "", submit: false, keyFileName: "" };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--submit") options.submit = true;
    else if (argument === "--changes") options.changesFile = argv[++index] || "";
    else if (argument === "--site-url") options.baseUrl = argv[++index] || "";
    else if (argument === "--key-file") options.keyFileName = argv[++index] || "";
    else if (argument === "--help" || argument === "-h") options.help = true;
    else throw new Error(`Unknown IndexNow option: ${argument}`);
  }
  return options;
}

function printUsage() {
  console.log("Usage: node scripts/submit-indexnow.js --changes <changes.json> --site-url <https://example.com> [--submit]");
  console.log("Manifest fields: added, modified, deleted. Each field is an array of same-host URL paths or absolute URLs.");
  console.log("Without --submit the script only validates and reports the eligible URL count.");
}

async function runCli() {
  const options = readCliOptions(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }
  if (!options.changesFile || !options.baseUrl) {
    printUsage();
    throw new Error("Both --changes and --site-url are required.");
  }
  const baseUrl = new URL(options.baseUrl).origin;
  const changes = parseIndexNowChanges(JSON.parse(fs.readFileSync(path.resolve(options.changesFile), "utf8")));
  const prepared = await selectIndexNowUrls({ baseUrl, changes });

  if (!prepared.urls.length) {
    console.log(`IndexNow: no eligible URLs to submit (${prepared.skipped.length} skipped).`);
    return;
  }
  if (!options.submit) {
    console.log(`IndexNow dry run: ${prepared.urls.length} eligible URL(s), ${prepared.skipped.length} skipped. Re-run with --submit to send.`);
    return;
  }

  const keyFile = discoverIndexNowKey({ keyFileName: options.keyFileName || undefined });
  const response = await fetch(indexNowEndpoint, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(baseUrl).host,
      key: keyFile.key,
      keyLocation: new URL(`/${keyFile.fileName}`, `${baseUrl}/`).href,
      urlList: prepared.urls
    })
  });
  if (![200, 202].includes(response.status)) {
    throw new Error(`IndexNow submission failed with HTTP ${response.status}.`);
  }
  console.log(`IndexNow accepted ${prepared.urls.length} URL(s) with HTTP ${response.status}.`);
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) {
  runCli().catch((error) => {
    console.error(`IndexNow: ${error.message}`);
    process.exitCode = 1;
  });
}
