export const STORAGE_KEY = "pixelharvest.community-center.v1";
export const SCHEMA_VERSION = 1;
export const DATA_VERSION = 1;

export function createProgress(completedItemIds = [], date = new Date()) {
  return {
    schemaVersion: SCHEMA_VERSION,
    dataVersion: DATA_VERSION,
    updatedAt: date.toISOString(),
    completedItemIds: [...new Set(completedItemIds)]
  };
}

function parseValue(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new Error("进度文件不是有效的 JSON");
  }
}

export function migrateProgress(value, knownIds) {
  const parsed = parseValue(value);
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.completedItemIds)) {
    throw new Error("进度文件格式不正确");
  }
  const completedItemIds = [...new Set(parsed.completedItemIds)]
    .filter((id) => typeof id === "string" && knownIds.has(id));
  return createProgress(completedItemIds, new Date(parsed.updatedAt || Date.now()));
}

export function parseProgress(value, knownIds) {
  return migrateProgress(value, knownIds);
}

export function loadProgress(storage, knownIds) {
  try {
    const value = storage?.getItem(STORAGE_KEY);
    return value ? parseProgress(value, knownIds) : createProgress([]);
  } catch {
    return createProgress([]);
  }
}

export function saveProgress(storage, progress) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(progress));
    return { persistent: true };
  } catch {
    return { persistent: false };
  }
}

export function exportProgress(progress, date = new Date()) {
  const day = date.toISOString().slice(0, 10);
  return {
    filename: `pixelharvest-community-center-${day}.json`,
    text: JSON.stringify(progress, null, 2)
  };
}

export function importProgress(text, knownIds) {
  return parseProgress(text, knownIds);
}
