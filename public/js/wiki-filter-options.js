import { formatCropDays } from "./wiki-days.js";

// Only the first four displayed fields are needed, never entry bodies or images.
export function collectLibraryFilterOptions(fields, attributes, datasetSlug) {
  return Object.fromEntries(fields.slice(0, 4).map(field => {
    const values = new Set();
    for (const item of attributes) {
      const raw = item[field];
      for (const value of Array.isArray(raw) ? raw : [raw]) {
        if (value !== undefined && value !== null && value !== "") {
          values.add(datasetSlug === "crops" && field === "days" ? formatCropDays(value) : String(value));
        }
      }
    }
    return [field, [...values].sort((a, b) => a < b ? -1 : a > b ? 1 : 0)];
  }));
}
