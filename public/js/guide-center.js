export const GUIDE_CENTER_TOPICS = Object.freeze([
  Object.freeze({
    slug: "beginner-guide",
    title: "新手完整指南",
    description: "从第一天到姜岛与后期发展的完整成长路线。"
  }),
  Object.freeze({
    slug: "beginner",
    title: "新手成长路线",
    description: "按第一周、第一年和关键节点安排农场进度。"
  }),
  Object.freeze({
    slug: "money-making",
    title: "赚钱攻略",
    description: "按季节规划作物、钓鱼、加工与现金流。"
  }),
  Object.freeze({
    slug: "community-center",
    title: "社区中心攻略",
    description: "集中查看献祭、温室和关键区域解锁路线。"
  }),
  Object.freeze({
    slug: "resources",
    title: "资源获取攻略",
    description: "整理矿石、硬木、稀有资源与后期补给。"
  })
]);

export const GUIDE_CENTER_GROUPS = Object.freeze([
  Object.freeze({
    title: "新手与第一年",
    slugs: Object.freeze([
      "beginner-guide",
      "beginner",
      "beginner-year-one-route-overview",
      "year-one-first-week-complete-route",
      "year-one-spring-complete-route",
      "beginner-backpack-and-energy-route",
      "beginner-common-mistakes",
      "seasonal-items-to-keep"
    ])
  }),
  Object.freeze({
    title: "四季与赚钱",
    slugs: Object.freeze([
      "money-making",
      "year-one-spring-money-route",
      "year-one-summer-money-route",
      "year-one-fall-money-route",
      "winter-prep-year-two-route",
      "spring-season-topic-guide",
      "summer-season-topic-guide",
      "fall-season-topic-guide",
      "winter-season-topic-guide"
    ])
  }),
  Object.freeze({
    title: "社区中心与解锁",
    slugs: Object.freeze([
      "community-center",
      "early-community-center-priority-route",
      "community-center-fish-tank-route",
      "community-center-seasonal-items-checklist",
      "community-center-topic-guide",
      "greenhouse-unlock-year-round-layout"
    ])
  }),
  Object.freeze({
    title: "钓鱼",
    slugs: Object.freeze([
      "all-fish-season-weather-reference",
      "beginner-fishing-guide-and-fish-search",
      "fishing-topic-guide",
      "fish-wiki-and-query-tool-route"
    ])
  }),
  Object.freeze({
    title: "矿洞与资源",
    slugs: Object.freeze([
      "resources",
      "mines-floor-40-preparation-route",
      "sprinkler-unlock-and-ore-route",
      "mines-drops-and-floor-resource-route",
      "mines-floor-120-resource-monster-route",
      "mines-topic-guide"
    ])
  }),
  Object.freeze({
    title: "村民与动物",
    slugs: Object.freeze([
      "villager-gifts-and-birthdays-guide",
      "villager-gift-birthday-recommendation",
      "all-villager-birthdays-and-gifts",
      "villager-gift-topic-guide",
      "coop-barn-animal-products-route",
      "quest-board-special-orders-route"
    ])
  }),
  Object.freeze({
    title: "姜岛与后期",
    slugs: Object.freeze([
      "mastery-system-guide-1-6",
      "ginger-island-golden-walnut-route",
      "greenhouse-fruit-tree-planning"
    ])
  }),
  Object.freeze({
    title: "工具与资料使用",
    slugs: Object.freeze([
      "crop-profit-calculator-guide",
      "crop-wiki-and-profit-tool-planning",
      "community-center-checklist-and-wiki-route",
      "wiki-item-detail-reading-guide",
      "tool-first-new-player-workflow",
      "greenhouse-crops-processing-route"
    ])
  })
]);

export function groupGuideArticles(articles = []) {
  const articleBySlug = new Map();
  for (const article of articles) {
    if (article?.slug && !articleBySlug.has(article.slug)) articleBySlug.set(article.slug, article);
  }

  return GUIDE_CENTER_GROUPS.map((group) => ({
    title: group.title,
    articles: group.slugs.map((slug) => articleBySlug.get(slug)).filter(Boolean)
  }));
}
