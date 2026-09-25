// Normalize only plain day counts; preserve conditional harvesting descriptions.
export function formatCropDays(value) {
  const text = String(value ?? "").trim();
  const count = text.match(/^(\d+)\s*天?$/);
  return count ? `${Number(count[1])} 天` : text;
}
