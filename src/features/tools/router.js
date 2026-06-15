import { Router } from "express";
import { AppError } from "../../middleware/errors.js";
import { DATA_VERSION, GAME_VERSION } from "./constants.js";
import { fish } from "./data/fish.js";
import { crops } from "./data/crops.js";
import { communityCenter } from "./data/community-center.js";
import { rankCropProfits } from "./crops.js";
import { getCommunitySlotIds, getCommunityTotals } from "./community-center.js";
import { filterFish, getFishFilterOptions } from "./fish.js";
import { cropCalculationSchema, fishQuerySchema } from "./schemas.js";

const envelope = (payload) => ({
  gameVersion: GAME_VERSION,
  dataVersion: DATA_VERSION,
  ...payload
});

function parseOrThrow(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new AppError(
      400,
      "INVALID_TOOL_INPUT",
      "输入条件不正确",
      result.error.issues
    );
  }
  return result.data;
}

export function createToolsRouter() {
  const router = Router();

  router.get("/fish", (req, res) => {
    const filters = parseOrThrow(fishQuerySchema, req.query);
    const items = filterFish(fish, {
      ...filters,
      bundleOnly: filters.bundleOnly === "true"
    });
    res.json(envelope({
      items,
      total: items.length,
      filters: getFishFilterOptions(fish)
    }));
  });

  router.get("/crops", (req, res) => {
    res.json(envelope({
      items: crops,
      filters: {
        seasons: ["春季", "夏季", "秋季", "冬季"],
        methods: ["sell", "jar", "keg"]
      }
    }));
  });

  router.post("/crops/calculate", (req, res) => {
    const input = parseOrThrow(cropCalculationSchema, req.body);
    const planningDays = input.locationMode === "seasonal"
      ? 28
      : input.startDay + input.planningDays - 1;
    const result = rankCropProfits(crops, { ...input, planningDays });
    res.json(envelope({ input, ...result }));
  });

  router.get("/community-center", (req, res) => {
    res.json(envelope({
      rooms: communityCenter,
      knownSlotIds: getCommunitySlotIds(communityCenter),
      totals: getCommunityTotals(communityCenter)
    }));
  });

  return router;
}
