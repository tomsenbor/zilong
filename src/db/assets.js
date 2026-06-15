const FALLBACK_FILENAME = "36px-Prismatic_Shard.png";
const sizePriority = [36, 40, 48, 32, 30, 28, 27, 25, 24, 22, 20, 18];

const decode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const assetUrl = (filename) =>
  `/assets/game/${filename.replaceAll("%", "%25")}`;

export function buildAssetIndex(filenames) {
  const exact = new Set(filenames);
  const byName = new Map();

  for (const filename of filenames) {
    const match = decode(filename).match(/^(\d+)px-(.+)\.(png|gif)$/i);
    if (!match) continue;
    const [, size, rawName] = match;
    const key = rawName.toLocaleLowerCase("en-US");
    const candidates = byName.get(key) || [];
    candidates.push({ filename, size: Number(size) });
    candidates.sort((a, b) => {
      const aPriority = sizePriority.indexOf(a.size);
      const bPriority = sizePriority.indexOf(b.size);
      return (aPriority < 0 ? 999 : aPriority) - (bPriority < 0 ? 999 : bPriority);
    });
    byName.set(key, candidates);
  }

  return { exact, byName };
}

export function resolveGameAssetUrl(url, index) {
  if (!url?.startsWith("/assets/game/")) return url || assetUrl(FALLBACK_FILENAME);

  const requestedFilename = decode(url.slice("/assets/game/".length));
  if (index.exact.has(requestedFilename)) return assetUrl(requestedFilename);

  const match = requestedFilename.match(/^\d+px-(.+)\.(png|gif)$/i);
  if (match) {
    const candidates = index.byName.get(match[1].toLocaleLowerCase("en-US"));
    if (candidates?.length) return assetUrl(candidates[0].filename);
  }

  return assetUrl(FALLBACK_FILENAME);
}

export function unresolvedGameAssets(entries, index) {
  return entries.filter((entry) =>
    entry.image &&
    resolveGameAssetUrl(entry.image, index) === assetUrl(FALLBACK_FILENAME) &&
    !decode(entry.image).endsWith(`/${FALLBACK_FILENAME}`)
  );
}

export function wikiFileTitleFromAssetUrl(url) {
  const filename = decode(url.slice("/assets/game/".length));
  return `File:${filename.replace(/^\d+px-/i, "")}`;
}

export function wikiImageUrlFromResponse(response) {
  const pages = Object.values(response?.query?.pages || {});
  return pages.find((page) => page.imageinfo?.[0]?.url)?.imageinfo[0].url || null;
}
