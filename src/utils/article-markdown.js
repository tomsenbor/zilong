export function stripDuplicateArticleTitleHeading(body = "", title = "") {
  const expectedTitle = String(title || "").trim();
  const source = String(body || "");
  if (!expectedTitle || !source) return source;

  const lines = source.split(/\r?\n/);
  const headingIndex = lines.findIndex((line) => line.trim() !== "");
  if (headingIndex < 0) return source;

  const match = lines[headingIndex].match(/^\s*#(?!#)\s+(.+?)\s*#*\s*$/);
  if (!match || match[1].trim() !== expectedTitle) return source;

  return [
    ...lines.slice(0, headingIndex),
    ...lines.slice(headingIndex + 1)
  ].join("\n");
}
