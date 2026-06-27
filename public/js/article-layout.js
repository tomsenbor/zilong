export function createArticleOutline(titles = []) {
  return titles.map((title, index) => ({
    id: `guide-section-${index + 1}`,
    title: String(title).trim(),
    number: String(index + 1).padStart(2, "0")
  }));
}

export function formatArticleSectionLabel(section = {}) {
  return [section.number, section.title]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ");
}

export function estimateReadingMinutes(text = "") {
  const characterCount = String(text).replace(/\s+/g, "").length;
  return Math.max(1, Math.ceil(characterCount / 350));
}
