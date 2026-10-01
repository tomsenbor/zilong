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
