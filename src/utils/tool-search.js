const toolSearchCatalog = [
  {
    slug: "crops",
    href: "/tools/crops",
    title: "作物收益计算器",
    snippet: "按季节剩余天数、种子成本、成熟天数、重复收获和加工路线估算作物净收益。",
    keywords: ["作物", "收益", "计算器", "种子成本", "成熟天数", "重复收获", "季节剩余", "农场赚钱"]
  },
  {
    slug: "fish",
    href: "/tools/fish",
    title: "鱼类条件查询器",
    snippet: "按季节、天气、时间、地点和钓鱼等级筛选可捕获鱼类，适合补鱼缸和雨天鱼。",
    keywords: ["鱼类", "钓鱼", "鱼缸", "雨天鱼", "夜间鱼", "季节", "天气", "地点", "钓鱼等级"]
  },
  {
    slug: "community-center",
    href: "/tools/community-center",
    title: "社区中心进度清单",
    snippet: "按房间、季节和当前可获取物品跟踪收集包进度，避免误卖季节限定物品。",
    keywords: ["社区中心", "收集包", "献祭", "季节限定", "房间", "当前可获取", "进度清单"]
  }
];

function normalize(value = "") {
  return String(value).trim().toLowerCase();
}

export function searchToolResults(query, limit = 6) {
  const q = normalize(query);
  if (!q) return [];

  return toolSearchCatalog
    .filter((tool) => {
      const haystack = normalize([tool.title, tool.snippet, ...tool.keywords].join(" "));
      return haystack.includes(q) || tool.keywords.some((keyword) => q.includes(normalize(keyword)));
    })
    .slice(0, limit)
    .map((tool) => ({
      type: "tool",
      title: tool.title,
      slug: tool.slug,
      snippet: tool.snippet,
      href: tool.href
    }));
}
