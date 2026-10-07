export const datasetTopics = {
  crops: "季节、生长与售价", fish: "季节、时间与捕获条件",
  villagers: "生日、住址与礼物", cooking: "配方、材料与效果",
  items: "获取方式与用途", skills: "等级与职业", quests: "条件与奖励",
  festivals: "日期与活动", locations: "地点与开放条件", catalog: "分类条目索引"
};

export function datasetMetadata(dataset, page, total) {
  const topics = datasetTopics[dataset.slug] || "条目与基础信息";
  return {
    title: `${dataset.name}：${topics}${page > 1 ? `（第${page}页）` : ''} - 星露谷资料库`,
    description: `${dataset.description || dataset.name}。按名称查找${topics}，浏览条目并进入详情核对具体条件。当前第${page}页，共${total}条已发布资料。`
  };
}

const metadataLabels = {
  season: "季节", days: "生长天数", sellPrice: "售价", source: "来源",
  location: "地点", weather: "天气", time: "时间", birthday: "生日",
  address: "住址", loves: "最爱礼物", ingredients: "材料", energy: "能量",
  type: "类型", skill: "技能", level: "等级", effect: "效果", reward: "奖励",
  date: "日期", area: "区域", open: "开放", features: "特色"
};

function stripMarkdown(value = "") {
  return String(value)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ").trim();
}

// Keep the existing SSR guide description rule identical on every client navigation.
export function articleMetadata(article) {
  const summary = stripMarkdown(article.summary || "");
  const headings = [...String(article.body || "").matchAll(/^#{2,3}\s+(.+)$/gm)]
    .map(match => stripMarkdown(match[1]));
  const text = stripMarkdown(summary.length >= 70 || !headings.length
    ? (summary || article.body || "作物 / 鱼类 / NPC / 任务 / 社区中心一站查询，覆盖星露谷物语 1.6.15 的中文资料与攻略。")
    : `${summary} 本文包括：${headings.join("、")}。`);
  return {
    title: `${article.title} - 星露谷攻略`,
    description: text.length > 160 ? `${text.slice(0, 159)}…` : text
  };
}

// Shared by SSR and client rendering so opening a dialog keeps entry semantics.
export function entryMetadata(entry, datasetSlug) {
  const summary = stripMarkdown(entry.summary || "");
  const parts = [summary.includes(entry.name) ? summary : `${entry.name}：${summary || entry.dataset_name}`];
  for (const [key, value] of Object.entries(entry.attributes || {})) {
    const label = metadataLabels[key] || (/^[\u3400-\u9fff]/.test(key) ? key : null);
    if (!label || value === null || value === undefined || value === '' || typeof value === 'object' && !Array.isArray(value)) continue;
    parts.push(`${label}：${Array.isArray(value) ? value.join('、') : stripMarkdown(String(value))}`);
    if (parts.join('；').length >= 140) break;
  }
  const description = stripMarkdown(parts.join('；'));
  return {
    title: `${entry.name}：${datasetTopics[datasetSlug] || entry.dataset_name} - 星露谷资料库`,
    description: description.length > 160 ? `${description.slice(0, 159)}…` : description
  };
}
