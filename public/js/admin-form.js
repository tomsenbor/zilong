export function buildArticlePayload(form) {
  return {
    title: form.get("title"),
    summary: form.get("summary"),
    body: form.get("body"),
    status: form.get("status"),
    gameVersion: form.get("gameVersion"),
    featured: form.get("featured") === "on",
    coverImage: form.get("coverImage") || "",
    categoryIds: form.getAll("categoryIds").map(Number)
  };
}
