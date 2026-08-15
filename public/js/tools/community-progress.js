export const STORAGE_KEY = "pixelharvest.community-center.v1";
export const SCHEMA_VERSION = 1;
export const DATA_VERSION = 2;
export const MAX_IMPORT_BYTES = 256 * 1024;

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

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizeVersion(value, currentVersion) {
  const version = value ?? 0;
  if (!Number.isInteger(version) || version < 0) {
    throw new Error("进度文件格式不正确：版本必须是非负整数");
  }
  if (version > currentVersion) {
    throw new Error("进度文件版本过新，当前版本无法安全导入");
  }
  return version;
}

function validDate(value) {
  return typeof value === "string" && value.trim() !== "" && !Number.isNaN(Date.parse(value));
}

function byteLength(value) {
  return new TextEncoder().encode(value).byteLength;
}

export function migrateProgress(value, knownIds) {
  const parsed = parseValue(value);
  if (!isPlainObject(parsed) || !Array.isArray(parsed.completedItemIds)) {
    throw new Error("进度文件格式不正确");
  }
  normalizeVersion(parsed.schemaVersion, SCHEMA_VERSION);
  normalizeVersion(parsed.dataVersion, DATA_VERSION);
  const completedItemIds = [...new Set(parsed.completedItemIds)]
    .filter((id) => typeof id === "string" && knownIds.has(id));
  const updatedAt = validDate(parsed.updatedAt) ? new Date(parsed.updatedAt) : new Date();
  return createProgress(completedItemIds, updatedAt);
}

export function parseProgress(value, knownIds) {
  return migrateProgress(value, knownIds);
}

export function loadProgress(storage, knownIds) {
  try {
    const value = storage?.getItem(STORAGE_KEY);
    return value ? parseProgress(value, knownIds) : createProgress([]);
  } catch (error) {
    if (error instanceof Error && error.message.includes("版本过新")) {
      throw error;
    }
    return createProgress([]);
  }
}

export function saveProgress(storage, progress) {
  try {
    if (!storage || typeof storage.setItem !== "function") {
      return { persistent: false };
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return { persistent: true };
  } catch {
    return { persistent: false };
  }
}

export function exportProgress(progress, date = new Date()) {
  const day = date.toISOString().slice(0, 10);
  const normalized = {
    schemaVersion: SCHEMA_VERSION,
    dataVersion: DATA_VERSION,
    updatedAt: validDate(progress.updatedAt) ? new Date(progress.updatedAt).toISOString() : date.toISOString(),
    completedItemIds: [...new Set(
      Array.isArray(progress.completedItemIds)
        ? progress.completedItemIds.filter((id) => typeof id === "string")
        : []
    )].sort()
  };
  return {
    filename: `pixelharvest-community-center-${day}.json`,
    text: JSON.stringify(normalized, null, 2)
  };
}

export function importProgress(text, knownIds) {
  if (typeof text !== "string") {
    throw new Error("进度文件格式不正确");
  }
  if (byteLength(text) > MAX_IMPORT_BYTES) {
    throw new Error("进度文件过大，最大允许 256 KiB");
  }

  const parsed = parseValue(text);
  if (!isPlainObject(parsed) || !Array.isArray(parsed.completedItemIds)) {
    throw new Error("进度文件格式不正确");
  }
  if (parsed.completedItemIds.length > 1000) {
    throw new Error("进度文件格式不正确：完成项目数量超过 1000");
  }

  normalizeVersion(parsed.schemaVersion, SCHEMA_VERSION);
  normalizeVersion(parsed.dataVersion, DATA_VERSION);
  if (!validDate(parsed.updatedAt)) {
    throw new Error("进度文件日期无效");
  }
  if (parsed.completedItemIds.some((id) => typeof id !== "string")) {
    throw new Error("进度文件格式不正确：项目 ID 必须是字符串");
  }

  const uniqueIds = new Set(parsed.completedItemIds);
  if (uniqueIds.size !== parsed.completedItemIds.length) {
    throw new Error("进度文件包含重复项目");
  }
  if (parsed.completedItemIds.some((id) => !knownIds.has(id))) {
    throw new Error("进度文件包含未知项目");
  }

  return createProgress(parsed.completedItemIds, new Date(parsed.updatedAt));
}
