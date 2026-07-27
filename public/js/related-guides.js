const relatedGuideTopics = [
  "新手", "第一年", "春季", "夏季", "秋季", "冬季", "赚钱", "收益",
  "作物", "钓鱼", "鱼类", "矿洞", "资源", "社区中心", "温室", "姜岛",
  "村民", "礼物", "工具", "解锁", "精通", "专题"
];

function compareStableArticleOrder(left, right) {
  const featured = Number(right.featured || 0) - Number(left.featured || 0);
  if (featured) return featured;

  const leftUpdatedAt = String(left.updated_at || "");
  const rightUpdatedAt = String(right.updated_at || "");
  if (leftUpdatedAt !== rightUpdatedAt) return leftUpdatedAt < rightUpdatedAt ? 1 : -1;

  const leftId = Number(left.id);
  const rightId = Number(right.id);
  if (Number.isFinite(leftId) && Number.isFinite(rightId) && leftId !== rightId) {
    return leftId - rightId;
  }

  return left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0;
}

export function selectRelatedGuides(current, articles, limit = 4) {
  const currentText = `${current.title} ${current.summary || ""}`;
  const seen = new Set([current.slug]);

  return articles
    .filter((article) => article?.slug && article.slug !== current.slug)
    .map((article) => {
      const text = `${article.title} ${article.summary || ""}`;
      const score = relatedGuideTopics.reduce((total, topic) => (
        total + (currentText.includes(topic) && text.includes(topic) ? 1 : 0)
      ), 0);
      return { article, score };
    })
    .sort((a, b) => b.score - a.score || compareStableArticleOrder(a.article, b.article))
    .filter(({ article }) => {
      if (seen.has(article.slug)) return false;
      seen.add(article.slug);
      return true;
    })
    .slice(0, limit)
    .map(({ article }) => article);
}
