import { makeSlug } from "./slug.js";

const stableSlugByChineseName = new Map([
  ["草莓", "strawberry"],
  ["上古水果", "ancient-fruit"],
  ["远古水果", "ancient-fruit"],
  ["青花鱼", "albacore"]
]);

function hasCjk(value = "") {
  return /[\u3400-\u9fff]/.test(String(value));
}

function isStableSlug(value = "") {
  const slug = String(value || "").trim();
  return Boolean(slug) && !hasCjk(slug) && /[a-z0-9]/i.test(slug);
}

function hashSlug(value = "") {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function stableSlugFromImage(image = "") {
  const filename = String(image || "").split(/[\\/]/).pop() || "";
  if (!filename) return "";

  let decoded = filename;
  try {
    decoded = decodeURIComponent(filename);
  } catch {
    decoded = filename;
  }

  const basename = decoded
    .replace(/\.(png|gif|jpe?g|webp|svg)$/i, "")
    .replace(/^\d+px-/i, "");
  const slug = makeSlug(basename);
  return isStableSlug(slug) ? slug : "";
}

export function makeEntrySlug(entry = {}) {
  if (isStableSlug(entry.slug)) return makeSlug(entry.slug);

  const mapped = stableSlugByChineseName.get(String(entry.name || "").trim());
  if (mapped) return mapped;

  const imageSlug = stableSlugFromImage(entry.image);
  if (imageSlug) return imageSlug;

  if (entry.id) return `entry-${entry.id}`;

  return `entry-${hashSlug(entry.name || entry.summary || "item")}`;
}
