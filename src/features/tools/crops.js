const speedReduction = {
  none: 0,
  "speed-gro": 0.1,
  "deluxe-speed-gro": 0.25,
  "hyper-speed-gro": 0.33
};

const seasonOrder = ["春季", "夏季", "秋季", "冬季"];
const scenarioOrder = ["sell", "jar", "keg"];
const minutesPerDay = 1600;

const defaultInput = {
  season: "春季",
  startDay: 1,
  planningDays: 28,
  plots: 1,
  budget: null,
  fertilizer: "none",
  agriculturist: false,
  tiller: false,
  method: "sell",
  locationMode: "seasonal",
  includeSeedCost: true,
  yearStage: "year1",
  farmingLevel: 0,
  desertUnlocked: false,
  greenhouseUnlocked: false,
  islandUnlocked: false,
  ownedSeeds: {},
  jarCount: 0,
  kegCount: 0,
  includeFertilizerCost: false,
  ownedFertilizerCount: 0
};

function normalizeInput(crop, input = {}) {
  return {
    ...defaultInput,
    season: crop?.seasons?.[0] ?? defaultInput.season,
    ...input,
    ownedSeeds: { ...(input.ownedSeeds ?? {}) }
  };
}

function totalGrowthDays(crop) {
  return crop.growthStages.reduce((total, days) => total + days, 0);
}

export function getGrowthDays(crop, { fertilizer = "none", agriculturist = false } = {}) {
  const phases = [...crop.growthStages];
  const baseDays = totalGrowthDays(crop);
  const reduction = Math.min(0.9, (speedReduction[fertilizer] ?? 0) + (agriculturist ? 0.1 : 0));
  let daysToRemove = Math.ceil(baseDays * reduction);

  // Stardew applies speed bonuses to the phase array in at most three passes.
  for (let pass = 0; pass < 3 && daysToRemove > 0; pass += 1) {
    for (let index = 0; index < phases.length && daysToRemove > 0; index += 1) {
      if (phases[index] > 0 && (index > 0 || phases[index] > 1)) {
        phases[index] -= 1;
        daysToRemove -= 1;
      }
    }
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
  return { harvests: harvestDays.length, harvestDays, seedRounds: harvestDays.length };
}

export function getProcessedPrice(crop, method) {
  if (method === "sell") return crop.baseSellPrice;
  const process = crop.processing?.[method];
  if (!process) return null;
  if (process.unitPrice !== null && process.unitPrice !== undefined) return process.unitPrice;
  if (process.formula === "fruit-wine") return crop.baseSellPrice * 3;
  if (process.formula === "jelly") return crop.baseSellPrice * 2 + 50;
  if (process.formula === "vegetable-juice") return Math.floor(crop.baseSellPrice * 2.25);
  if (process.formula === "pickles") return crop.baseSellPrice * 2 + 50;
  return null;
}

function currentYear(input) {
  return input.yearStage === "year1" ? 1 : 2;
}

function unlockAvailable(name, input) {
  return Boolean(input[name]);
}

function calendarAt(day, input) {
  const startSeason = Math.max(0, seasonOrder.indexOf(input.season));
  const absoluteDay = startSeason * 28 + day - 1;
  return {
    season: seasonOrder[Math.floor(absoluteDay / 28) % seasonOrder.length],
    day: absoluteDay % 28 + 1,
    year: currentYear(input) + Math.floor(absoluteDay / (28 * seasonOrder.length))
  };
}

function offerMeetsPermanentConditions(offer, input, day = input.startDay) {
  const conditions = offer.conditions ?? {};
  if ((conditions.minimumYear ?? 1) > calendarAt(day, input).year) return false;
  return (conditions.requiredUnlocks ?? []).every((unlock) => unlockAvailable(unlock, input));
}

function offerAvailableOnDay(offer, day, input) {
  if (!offer.unlimited || offer.currency !== "gold" || !offerMeetsPermanentConditions(offer, input, day)) {
    return false;
  }
  const conditions = offer.conditions ?? {};
  const calendar = calendarAt(day, input);
  if (conditions.seasons?.length && !conditions.seasons.includes(calendar.season)) return false;
  return calendar.day >= (conditions.startDay ?? 1) && calendar.day <= (conditions.endDay ?? 28);
}

function firstOfferDay(crop, input) {
  for (let day = input.startDay; day <= input.planningDays; day += 1) {
    if (crop.seedOffers.some((offer) => offerAvailableOnDay(offer, day, input))) return day;
  }
  return null;
}

function locationAndSeasonReasons(crop, input) {
  const reasons = [];
  if (!crop.growth.allowedLocations.includes(input.locationMode)) {
    reasons.push("当前种植环境不允许种植");
  }
  if (input.locationMode === "greenhouse" && !input.greenhouseUnlocked) reasons.push("需要解锁温室");
  if (input.locationMode === "island" && !input.islandUnlocked) reasons.push("需要解锁姜岛农场");
  if (input.locationMode === "seasonal" && !crop.seasons.includes(input.season)) reasons.push("当前季节不可种植");
  return reasons;
}

export function getCropAvailability(crop, rawInput = {}) {
  const input = normalizeInput(crop, rawInput);
  const ownedQuantity = input.ownedSeeds[crop.id] ?? 0;
  const environmentReasons = locationAndSeasonReasons(crop, input);
  const locationUnlockReasons = environmentReasons.filter((reason) => reason.startsWith("需要解锁"));
  const hardEnvironmentReasons = environmentReasons.filter((reason) => !reason.startsWith("需要解锁"));
  const goldOffers = crop.seedOffers.filter((offer) => offer.unlimited && offer.currency === "gold");
  const hasLockedOffer = goldOffers.some((offer) => {
    const conditions = offer.conditions ?? {};
    return (conditions.minimumYear ?? 1) > currentYear(input)
      || (conditions.requiredUnlocks ?? []).some((unlock) => !unlockAvailable(unlock, input));
  });

  const supplyReasons = [];
  if (hasLockedOffer && ownedQuantity === 0) {
    for (const offer of goldOffers) {
      const conditions = offer.conditions ?? {};
      if ((conditions.minimumYear ?? 1) > currentYear(input)) supplyReasons.push("需要后续年度商店库存");
      for (const unlock of conditions.requiredUnlocks ?? []) {
        if (!unlockAvailable(unlock, input)) {
          supplyReasons.push(unlock === "desertUnlocked" ? "需要解锁沙漠商店" : `需要解锁 ${unlock}`);
        }
      }
    }
  }

  const noAccessibleSupply = ownedQuantity === 0 && firstOfferDay(crop, input) === null;
  if (noAccessibleSupply && supplyReasons.length === 0) supplyReasons.push("需要已有种子");

  if (!crop.calculationSupported) {
    return {
      status: "excluded",
      blockingReasons: [...new Set([
        crop.unsupportedReason ?? crop.restrictions[0] ?? "暂不支持精确计算",
        ...environmentReasons,
        ...supplyReasons
      ])]
    };
  }

  if (hardEnvironmentReasons.length > 0) {
    return { status: "excluded", blockingReasons: [...new Set([...environmentReasons, ...supplyReasons])] };
  }
  if (locationUnlockReasons.length > 0) {
    return { status: "unlockRequired", blockingReasons: [...new Set([...locationUnlockReasons, ...supplyReasons])] };
  }
  if (ownedQuantity > 0 || firstOfferDay(crop, input) !== null) {
    return { status: "executable", blockingReasons: [] };
  }
  if (supplyReasons.length > 0 && !supplyReasons.includes("需要已有种子")) {
    return { status: "unlockRequired", blockingReasons: [...new Set(supplyReasons)] };
  }

  return { status: "inventoryRequired", blockingReasons: ["需要已有种子"] };
}

function rawUnitPrice(crop, input) {
  return input.tiller ? Math.floor(crop.baseSellPrice * 1.1) : crop.baseSellPrice;
}

function expectedYieldPerPlant(crop) {
  const chance = crop.yield.repeatedExtraChance ?? 0;
  return crop.yield.minStack + (chance > 0 && chance < 1 ? chance / (1 - chance) : 0);
}

function seedUnitPriceOnDay(crop, day, input) {
  const offer = crop.seedOffers.find((candidate) => offerAvailableOnDay(candidate, day, input));
  return offer?.unitPrice ?? null;
}

function fertilizerOffer(input, day) {
  if (input.fertilizer === "none") return { available: true, unitPrice: 0 };
  if (input.fertilizer === "speed-gro") {
    const available = currentYear(input) > 1 || input.season !== "春季" || day >= 15;
    return { available, unitPrice: 100 };
  }
  if (input.fertilizer === "deluxe-speed-gro") {
    if (input.desertUnlocked) return { available: true, unitPrice: 80 };
    return { available: currentYear(input) > 1, unitPrice: 150 };
  }
  return { available: false, unitPrice: 0 };
}

function getTargetCapacity(crop, input, firstPlantDay) {
  const ownedSeeds = input.ownedSeeds[crop.id] ?? 0;
  let futureOffer = null;
  for (let day = firstPlantDay; day <= input.planningDays && !futureOffer; day += 1) {
    futureOffer = crop.seedOffers.find((offer) => offerAvailableOnDay(offer, day, input)) ?? null;
  }
  const fertilizer = fertilizerOffer(input, firstPlantDay);

  for (let quantity = input.plots; quantity >= 1; quantity -= 1) {
    if (!futureOffer && quantity > ownedSeeds) continue;
    if (input.fertilizer !== "none" && !fertilizer.available && quantity > input.ownedFertilizerCount) continue;

    const seedsToBuy = futureOffer ? Math.max(0, quantity - ownedSeeds) : 0;
    const seedPrice = futureOffer?.unitPrice ?? 0;
    const seedCost = input.includeSeedCost ? seedsToBuy * seedPrice : 0;
    const fertilizerToBuy = Math.max(0, quantity - input.ownedFertilizerCount);
    const fertilizerCost = input.includeFertilizerCost ? fertilizerToBuy * fertilizer.unitPrice : 0;
    if (input.budget === null || input.budget === undefined || seedCost + fertilizerCost <= input.budget) {
      return { quantity };
    }
  }
  return { quantity: 0 };
}

function nextSeasonCanContinue(crop, input) {
  if (!crop.growth.carriesAcrossSeason || input.locationMode !== "seasonal") return false;
  const index = seasonOrder.indexOf(input.season);
  return index >= 0 && crop.seasons.includes(seasonOrder[(index + 1) % seasonOrder.length]);
}

function simulatePlanting(crop, input, availability) {
  const growthDays = getGrowthDays(crop, input);
  const ownedAtStart = input.ownedSeeds[crop.id] ?? 0;
  const firstPlantDay = ownedAtStart > 0 ? input.startDay : firstOfferDay(crop, input);
  if (availability.status !== "executable" || firstPlantDay === null) {
    return {
      growthDays,
      plantedTiles: 0,
      plantingBatches: [],
      harvestBatches: [],
      seedCost: 0,
      fertilizerCost: 0,
      seedPlan: { ownedSeedsUsed: 0, purchasedSeeds: 0, totalSeedsUsed: 0 },
      seasonEndState: "notPlanted"
    };
  }

  const target = getTargetCapacity(crop, input, firstPlantDay);
  if (target.quantity < 1) {
    return {
      growthDays,
      plantedTiles: 0,
      plantingBatches: [],
      harvestBatches: [],
      seedCost: 0,
      fertilizerCost: 0,
      seedPlan: { ownedSeedsUsed: 0, purchasedSeeds: 0, totalSeedsUsed: 0 },
      seasonEndState: "notPlanted",
      budgetBlocked: true
    };
  }

  let ownedSeeds = ownedAtStart;
  let remainingBudget = input.budget;
  let occupied = 0;
  let plantedTiles = 0;
  let ownedSeedsUsed = 0;
  let purchasedSeeds = 0;
  let seedCost = 0;
  const plantingBatches = [];
  const harvestBatches = [];
  const events = new Map();
  let hasEverPlanted = false;

  const fertilizer = fertilizerOffer(input, firstPlantDay);
  const ownedFertilizerUsed = input.fertilizer === "none" ? 0 : Math.min(target.quantity, input.ownedFertilizerCount);
  const purchasedFertilizer = input.fertilizer === "none" ? 0 : target.quantity - ownedFertilizerUsed;
  const fertilizerCost = input.includeFertilizerCost ? purchasedFertilizer * fertilizer.unitPrice : 0;
  if (remainingBudget !== null && remainingBudget !== undefined) remainingBudget -= fertilizerCost;

  function scheduleHarvest(day, quantity) {
    const batches = events.get(day) ?? [];
    batches.push(quantity);
    events.set(day, batches);
  }

  function buyAndPlant(day, requestedQuantity) {
    if (requestedQuantity <= 0) return 0;
    const fromInventory = Math.min(ownedSeeds, requestedQuantity);
    let remaining = requestedQuantity - fromInventory;
    const unitPrice = seedUnitPriceOnDay(crop, day, input);
    let bought = 0;
    if (remaining > 0 && unitPrice !== null) {
      const effectiveUnitPrice = input.includeSeedCost ? unitPrice : 0;
      const affordable = remainingBudget === null || remainingBudget === undefined || effectiveUnitPrice === 0
        ? remaining
        : Math.floor(remainingBudget / effectiveUnitPrice);
      bought = Math.min(remaining, affordable);
    }
    const quantity = fromInventory + bought;
    if (quantity < 1) return 0;

    ownedSeeds -= fromInventory;
    ownedSeedsUsed += fromInventory;
    purchasedSeeds += bought;
    const purchaseCost = input.includeSeedCost ? bought * (unitPrice ?? 0) : 0;
    seedCost += purchaseCost;
    if (remainingBudget !== null && remainingBudget !== undefined) remainingBudget -= purchaseCost;
    occupied += quantity;
    plantedTiles = Math.max(plantedTiles, occupied);
    hasEverPlanted = true;
    plantingBatches.push({ day, quantity, ownedQuantity: fromInventory, purchasedQuantity: bought });
    scheduleHarvest(day + growthDays, quantity);
    return quantity;
  }

  for (let day = input.startDay; day <= input.planningDays; day += 1) {
    const due = events.get(day) ?? [];
    for (const quantity of due) {
      const expectedQuantity = quantity * expectedYieldPerPlant(crop);
      harvestBatches.push({
        day,
        plantedQuantity: quantity,
        minimumQuantity: quantity * crop.yield.minStack,
        quantity: expectedQuantity
      });
      if (crop.regrowDays) {
        scheduleHarvest(day + crop.regrowDays, quantity);
      } else {
        occupied -= quantity;
      }
    }

    const openSlots = target.quantity - occupied;
    const canFinishOrContinue = day + growthDays <= input.planningDays || nextSeasonCanContinue(crop, input);
    if (openSlots > 0 && (!hasEverPlanted || canFinishOrContinue)) buyAndPlant(day, openSlots);
  }

  const activeAtEnd = occupied > 0;
  let seasonEndState = "harvested";
  if (activeAtEnd && input.locationMode !== "seasonal") seasonEndState = "stillGrowing";
  if (activeAtEnd && input.locationMode === "seasonal") {
    seasonEndState = nextSeasonCanContinue(crop, input) ? "continuesNextSeason" : "withers";
  }

  return {
    growthDays,
    plantedTiles,
    plantingBatches,
    harvestBatches,
    seedCost,
    fertilizerCost,
    seedPlan: {
      ownedSeedsUsed,
      purchasedSeeds,
      totalSeedsUsed: ownedSeedsUsed + purchasedSeeds,
      ownedFertilizerUsed,
      purchasedFertilizer
    },
    seasonEndState,
    budgetBlocked: plantedTiles < 1
  };
}

export function simulateProcessing(crop, harvestBatches, method, machineCount, input) {
  const totalYield = harvestBatches.reduce((total, batch) => total + batch.quantity, 0);
  const rawPrice = rawUnitPrice(crop, input);
  const baseCost = input.seedCost + input.fertilizerCost;
  if (method === "sell") {
    const revenue = totalYield * rawPrice;
    return {
      method,
      supported: true,
      machineCount: 0,
      completedBatches: 0,
      processedInputQuantity: 0,
      processedOutputQuantity: 0,
      inProcessQuantity: 0,
      queuedQuantity: 0,
      unallocatedQuantity: totalYield,
      remainingRawQuantity: totalYield,
      revenue,
      cost: baseCost,
      profit: revenue - baseCost,
      assumptions: ["按普通品质原作物售价结算"]
    };
  }

  const recipe = crop.processing?.[method];
  if (!recipe) {
    const revenue = totalYield * rawPrice;
    return {
      method,
      supported: false,
      machineCount,
      completedBatches: 0,
      processedInputQuantity: 0,
      processedOutputQuantity: 0,
      inProcessQuantity: 0,
      queuedQuantity: totalYield,
      unallocatedQuantity: 0,
      remainingRawQuantity: totalYield,
      revenue,
      cost: baseCost,
      profit: revenue - baseCost,
      assumptions: ["该作物不支持所选加工方式"]
    };
  }

  const arrivals = harvestBatches
    .map((batch) => ({ time: (batch.day - input.startDay) * minutesPerDay, quantity: batch.quantity }))
    .sort((a, b) => a.time - b.time);
  const deadline = (input.planningDays - input.startDay + 1) * minutesPerDay;
  const completions = [];
  let freeMachines = machineCount;
  let inventory = 0;
  let arrivalIndex = 0;
  let completedBatches = 0;
  let inProcessQuantity = 0;
  let time = 0;

  while (time <= deadline) {
    const nextArrival = arrivals[arrivalIndex]?.time ?? Infinity;
    const nextCompletion = completions.length > 0 ? Math.min(...completions) : Infinity;
    const nextTime = Math.min(nextArrival, nextCompletion);
    if (!Number.isFinite(nextTime) || nextTime > deadline) break;
    time = nextTime;

    for (let index = completions.length - 1; index >= 0; index -= 1) {
      if (completions[index] === time) {
        completions.splice(index, 1);
        completedBatches += 1;
        freeMachines += 1;
      }
    }
    while (arrivals[arrivalIndex]?.time === time) {
      inventory += arrivals[arrivalIndex].quantity;
      arrivalIndex += 1;
    }

    while (freeMachines > 0 && inventory + Number.EPSILON >= recipe.inputQuantity && time < deadline) {
      inventory -= recipe.inputQuantity;
      freeMachines -= 1;
      const finish = time + recipe.durationMinutes;
      if (finish <= deadline) {
        completions.push(finish);
      } else {
        inProcessQuantity += recipe.inputQuantity;
      }
    }
  }

  for (; arrivalIndex < arrivals.length; arrivalIndex += 1) inventory += arrivals[arrivalIndex].quantity;
  const processedInputQuantity = completedBatches * recipe.inputQuantity;
  const processedOutputQuantity = completedBatches * recipe.outputQuantity;
  const remainingRawQuantity = Math.max(0, totalYield - processedInputQuantity);
  const waitingQuantity = Math.max(0, remainingRawQuantity - inProcessQuantity);
  const queuedQuantity = Math.floor((waitingQuantity + Number.EPSILON) / recipe.inputQuantity) * recipe.inputQuantity;
  const unallocatedQuantity = Math.max(0, waitingQuantity - queuedQuantity);
  const unitPrice = getProcessedPrice(crop, method);
  const revenue = processedOutputQuantity * unitPrice + remainingRawQuantity * rawPrice;
  const assumptions = [];
  if (machineCount === 0) assumptions.push(`未填写${method === "jar" ? "罐头瓶" : "小桶"}数量，按 0 台计算`);
  assumptions.push("只计入规划期截止前完成的加工品；其余原料按原作物售价出售");

  return {
    method,
    supported: true,
    machineCount,
    completedBatches,
    processedInputQuantity,
    processedOutputQuantity,
    inProcessQuantity,
    queuedQuantity,
    unallocatedQuantity,
    remainingRawQuantity,
    revenue,
    cost: baseCost,
    profit: revenue - baseCost,
    processingMinutes: recipe.durationMinutes,
    inputQuantityPerBatch: recipe.inputQuantity,
    unitPrice,
    assumptions
  };
}

function emptyScenarios(crop, input) {
  const simulationInput = { ...input, seedCost: 0, fertilizerCost: 0 };
  return Object.fromEntries(scenarioOrder.map((method) => [
    method,
    simulateProcessing(crop, [], method, method === "jar" ? input.jarCount : method === "keg" ? input.kegCount : 0, simulationInput)
  ]));
}

export function calculateCropProfit(crop, rawInput = {}) {
  const input = normalizeInput(crop, rawInput);
  let availability = getCropAvailability(crop, input);
  const planting = simulatePlanting(crop, input, availability);

  if (availability.status === "executable" && planting.budgetBlocked) {
    availability = { status: "excluded", blockingReasons: ["可用资金不足以购买种子或肥料"] };
  }
  if (availability.status === "executable" && planting.seasonEndState === "withers" && planting.harvestBatches.length === 0) {
    availability = { status: "excluded", blockingReasons: ["换季前无法成熟，普通作物会枯萎"] };
  }

  const totalYield = planting.harvestBatches.reduce((total, batch) => total + batch.quantity, 0);
  const minimumYield = planting.harvestBatches.reduce((total, batch) => total + batch.minimumQuantity, 0);
  const simulationInput = {
    ...input,
    seedCost: planting.seedCost,
    fertilizerCost: planting.fertilizerCost
  };
  const scenarios = availability.status === "executable"
    ? {
        sell: simulateProcessing(crop, planting.harvestBatches, "sell", 0, simulationInput),
        jar: simulateProcessing(crop, planting.harvestBatches, "jar", input.jarCount, simulationInput),
        keg: simulateProcessing(crop, planting.harvestBatches, "keg", input.kegCount, simulationInput)
      }
    : emptyScenarios(crop, input);
  const selected = scenarios[input.method];
  const activeDays = Math.max(1, input.planningDays - input.startDay + 1);
  const eligible = availability.status === "executable" && selected.supported;
  const harvestDays = [...new Set(planting.harvestBatches.map((batch) => batch.day))].sort((a, b) => a - b);
  const seedRounds = crop.regrowDays ? (planting.plantedTiles > 0 ? 1 : 0) : planting.plantingBatches.length;
  const reason = availability.blockingReasons[0]
    ?? (!selected.supported ? "该作物不支持所选加工方式" : null);

  return {
    id: crop.id,
    name: crop.name,
    image: crop.image,
    eligible,
    reason,
    availability,
    plantedTiles: planting.plantedTiles,
    plantingBatches: planting.plantingBatches,
    harvestBatches: planting.harvestBatches,
    growthDays: planting.growthDays,
    harvests: harvestDays.length,
    harvestDays,
    seedRounds,
    seedPlan: planting.seedPlan,
    seasonEndState: planting.seasonEndState,
    minimumYield,
    totalYield,
    estimatedYield: crop.yield.repeatedExtraChance > 0,
    scenarios,
    unitPrice: selected.unitPrice ?? rawUnitPrice(crop, input),
    cost: selected.cost,
    revenue: selected.revenue,
    profit: selected.profit,
    profitPerTile: planting.plantedTiles > 0 ? selected.profit / planting.plantedTiles : 0,
    dailyProfit: selected.profit / activeDays,
    roi: selected.cost > 0 ? selected.profit / selected.cost : null,
    restrictions: crop.restrictions,
    steps: [
      `实际种植峰值 ${planting.plantedTiles} 格`,
      `生长 ${planting.growthDays} 天，收获 ${harvestDays.length} 个日期批次`,
      `预期产量 ${totalYield.toFixed(2)} 个`,
      `种子成本 ${planting.seedCost.toFixed(2)} 金，肥料成本 ${planting.fertilizerCost.toFixed(2)} 金`,
      `${input.method === "sell" ? "直接出售" : input.method === "jar" ? "罐头瓶" : "小桶"}方案收入 ${selected.revenue.toFixed(2)} 金，净利润 ${selected.profit.toFixed(2)} 金`
    ]
  };
}

function stableProfitSort(a, b) {
  return b.profit - a.profit
    || b.dailyProfit - a.dailyProfit
    || a.cost - b.cost
    || compareStableText(a.name, b.name)
    || compareStableText(a.id, b.id);
}

function compareStableText(a, b) {
  return a === b ? 0 : a < b ? -1 : 1;
}

function forScenario(result, method, activeDays) {
  const scenario = result.scenarios[method];
  return {
    ...result,
    method,
    eligible: result.availability.status === "executable" && scenario.supported,
    unitPrice: scenario.unitPrice ?? result.unitPrice,
    cost: scenario.cost,
    revenue: scenario.revenue,
    profit: scenario.profit,
    profitPerTile: result.plantedTiles > 0 ? scenario.profit / result.plantedTiles : 0,
    dailyProfit: scenario.profit / activeDays,
    roi: scenario.cost > 0 ? scenario.profit / scenario.cost : null
  };
}

export function rankCropProfits(items, rawInput = {}) {
  const normalized = { ...defaultInput, ...rawInput, ownedSeeds: { ...(rawInput.ownedSeeds ?? {}) } };
  const calculated = items.map((crop) => calculateCropProfit(crop, normalized));
  const activeDays = Math.max(1, normalized.planningDays - normalized.startDay + 1);
  const rankings = Object.fromEntries(scenarioOrder.map((method) => [
    method,
    calculated
      .map((result) => forScenario(result, method, activeDays))
      .filter((result) => result.eligible)
      .sort(stableProfitSort)
  ]));
  const eligible = rankings[normalized.method];
  const excluded = calculated.filter((result) => !result.eligible);
  const groups = {
    executable: calculated.filter((result) => result.availability.status === "executable"),
    unlockRequired: calculated.filter((result) => result.availability.status === "unlockRequired"),
    inventoryRequired: calculated.filter((result) => result.availability.status === "inventoryRequired"),
    excluded: calculated.filter((result) => result.availability.status === "excluded")
  };

  return {
    items: eligible,
    excluded,
    groups,
    rankings,
    highlights: {
      bestProfit: eligible[0] || null,
      bestDaily: [...eligible].sort((a, b) => b.dailyProfit - a.dailyProfit || stableProfitSort(a, b))[0] || null,
      lowestStartup: [...eligible].sort((a, b) => a.cost - b.cost || b.profit - a.profit || compareStableText(a.name, b.name) || compareStableText(a.id, b.id))[0] || null
    }
  };
}
