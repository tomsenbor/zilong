const speedReduction = {
  none: 0,
  "speed-gro": 0.1,
  "deluxe-speed-gro": 0.25,
  "hyper-speed-gro": 0.33
};

function totalGrowthDays(crop) {
  return crop.growthStages.reduce((total, days) => total + days, 0);
}

export function getGrowthDays(crop, { fertilizer = "none", agriculturist = false } = {}) {
  const baseDays = totalGrowthDays(crop);
  const reduction = Math.min(0.9, (speedReduction[fertilizer] ?? 0) + (agriculturist ? 0.1 : 0));
  const targetDays = Math.max(1, Math.floor(baseDays * (1 - reduction)));
  const phases = [...crop.growthStages];
  let remove = baseDays - targetDays;
  let index = 0;

  while (remove > 0 && phases.some((days) => days > 1)) {
    if (phases[index] > 1) {
      phases[index] -= 1;
      remove -= 1;
    }
    index = (index + 1) % phases.length;
  }

  return phases.reduce((total, days) => total + days, 0);
}

export function getHarvestSchedule(crop, {
  startDay = 1,
  planningDays = 28,
  growthDays = totalGrowthDays(crop)
} = {}) {
  const harvestDays = [];
  const firstHarvest = startDay + growthDays;
  if (firstHarvest > planningDays) {
    return { harvests: 0, harvestDays, seedRounds: 0 };
  }

  if (crop.regrowDays) {
    for (let day = firstHarvest; day <= planningDays; day += crop.regrowDays) {
      harvestDays.push(day);
    }
    return { harvests: harvestDays.length, harvestDays, seedRounds: 1 };
  }

  for (let day = firstHarvest; day <= planningDays; day += growthDays) {
    harvestDays.push(day);
  }
  return {
    harvests: harvestDays.length,
    harvestDays,
    seedRounds: harvestDays.length
  };
}

export function getProcessedPrice(crop, method) {
  if (method === "sell") return crop.baseSellPrice;
  const process = crop.processing?.[method];
  if (!process) return null;
  if (process.unitPrice !== undefined) return process.unitPrice;
  if (process.formula === "fruit-wine") return crop.baseSellPrice * 3;
  if (process.formula === "jelly") return crop.baseSellPrice * 2 + 50;
  if (process.formula === "vegetable-juice") return Math.floor(crop.baseSellPrice * 2.25);
  if (process.formula === "pickles") return crop.baseSellPrice * 2 + 50;
  return null;
}

function inSeason(crop, input) {
  return input.locationMode !== "seasonal" || crop.seasons.includes(input.season);
}

export function calculateCropProfit(crop, input) {
  if (!crop.calculationSupported) {
    return { id: crop.id, name: crop.name, eligible: false, reason: crop.restrictions[0] || "暂不支持精确计算" };
  }
  if (!inSeason(crop, input)) {
    return { id: crop.id, name: crop.name, eligible: false, reason: "当前种植环境或季节不可种植" };
  }

  const unitPrice = getProcessedPrice(crop, input.method);
  if (unitPrice === null) {
    return { id: crop.id, name: crop.name, eligible: false, reason: "该作物不支持所选加工方式" };
  }

  const growthDays = getGrowthDays(crop, input);
  const schedule = getHarvestSchedule(crop, {
    startDay: input.startDay,
    planningDays: input.planningDays,
    growthDays
  });
  if (schedule.harvests === 0) {
    return { id: crop.id, name: crop.name, eligible: false, reason: "在规划结束前无法成熟" };
  }

  const seedCostPerTile = input.includeSeedCost ? crop.seedPrice * schedule.seedRounds : 0;
  const budgetTiles = input.budget === null || input.budget === undefined || seedCostPerTile === 0
    ? input.plots
    : Math.floor(input.budget / seedCostPerTile);
  const plantedTiles = Math.min(input.plots, budgetTiles);
  if (plantedTiles < 1) {
    return { id: crop.id, name: crop.name, eligible: false, reason: "可用资金不足以购买种子" };
  }

  const expectedPerHarvest = crop.harvestYield + crop.extraYieldChance;
  const totalYield = plantedTiles * schedule.harvests * expectedPerHarvest;
  const rawProfessionMultiplier = input.method === "sell" && input.tiller ? 1.1 : 1;
  const revenue = totalYield * unitPrice * rawProfessionMultiplier;
  const cost = plantedTiles * seedCostPerTile;
  const profit = revenue - cost;
  const activeDays = input.planningDays - input.startDay + 1;

  return {
    id: crop.id,
    name: crop.name,
    image: crop.image,
    eligible: true,
    plantedTiles,
    growthDays,
    harvests: schedule.harvests,
    harvestDays: schedule.harvestDays,
    seedRounds: schedule.seedRounds,
    totalYield,
    estimatedYield: crop.extraYieldChance > 0,
    unitPrice,
    cost,
    revenue,
    profit,
    profitPerTile: profit / plantedTiles,
    dailyProfit: profit / activeDays,
    roi: cost > 0 ? profit / cost : null,
    restrictions: crop.restrictions,
    steps: [
      `实际种植 ${plantedTiles} 格`,
      `生长 ${growthDays} 天，收获 ${schedule.harvests} 次`,
      `预期产量 ${totalYield.toFixed(2)} 个`,
      `总收入 ${revenue.toFixed(2)} 金，种子成本 ${cost.toFixed(2)} 金`
    ]
  };
}

export function rankCropProfits(items, input) {
  const calculated = items.map((crop) => calculateCropProfit(crop, input));
  const eligible = calculated
    .filter((item) => item.eligible)
    .sort((a, b) => b.profit - a.profit || b.dailyProfit - a.dailyProfit || a.name.localeCompare(b.name, "zh-CN"));
  const excluded = calculated.filter((item) => !item.eligible);

  return {
    items: eligible,
    excluded,
    highlights: {
      bestProfit: eligible[0] || null,
      bestDaily: [...eligible].sort((a, b) => b.dailyProfit - a.dailyProfit)[0] || null,
      lowestStartup: [...eligible].sort((a, b) => a.cost - b.cost || b.profit - a.profit)[0] || null
    }
  };
}
