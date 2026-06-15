export function makeSlug(value) {
  const source = String(value || "").trim();
  const latin = source
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return latin || source.replace(/\s+/g, "-");
}
