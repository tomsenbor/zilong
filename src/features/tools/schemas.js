import { z } from "zod";
import {
  fertilizers,
  fishCategories,
  fishSourceTypes,
  processingMethods,
  seasons,
  weathers
} from "./constants.js";
import { crops } from "./data/crops.js";
import { isValidGameTime } from "./fish.js";

const optionalText = z.string().trim().max(100).optional();
const optionalEnum = (values) => z.enum(values).optional();

export const fishQuerySchema = z.object({
  q: optionalText,
  season: optionalEnum(seasons),
  weather: optionalEnum(weathers),
  time: z.coerce.number().int().min(0).max(2600).refine(isValidGameTime, {
    message: "游戏时间必须为 00:00-02:00 或 06:00-26:00，分钟仅支持 10 分钟刻度"
  }).optional(),
  location: optionalText,
  sourceType: optionalEnum(fishSourceTypes),
  category: optionalEnum(fishCategories),
  bundleOnly: z.enum(["true", "false"]).optional(),
  magicBait: z.enum(["true", "false"]).optional()
}).strict();

export const cropCalculationSchema = z.object({
  season: z.enum(seasons),
  startDay: z.number().int().min(1).max(28),
  plots: z.number().int().min(1).max(9999),
  budget: z.number().min(0).nullable().optional(),
  fertilizer: z.enum(fertilizers).default("none"),
  agriculturist: z.boolean().default(false),
  tiller: z.boolean().default(false),
  method: z.enum(processingMethods).default("sell"),
  locationMode: z.enum(["seasonal", "greenhouse", "island"]).default("seasonal"),
  planningDays: z.number().int().min(1).max(365).optional(),
  includeSeedCost: z.boolean().default(true),
  yearStage: z.enum(["year1", "later"]).default("year1"),
  farmingLevel: z.number().int().min(0).max(10).default(0),
  desertUnlocked: z.boolean().default(false),
  greenhouseUnlocked: z.boolean().default(false),
  islandUnlocked: z.boolean().default(false),
  ownedSeeds: z.record(z.string(), z.number().int().min(0).max(9999)).default({}),
  jarCount: z.number().int().min(0).max(9999).default(0),
  kegCount: z.number().int().min(0).max(9999).default(0),
  includeFertilizerCost: z.boolean().default(false),
  ownedFertilizerCount: z.number().int().min(0).max(9999).default(0)
}).strict().superRefine((value, context) => {
  if (value.locationMode !== "seasonal" && value.planningDays === undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["planningDays"],
      message: "温室或姜岛模式需要填写规划天数"
    });
  }
  const knownCropIds = new Set(crops.map((crop) => crop.id));
  for (const id of Object.keys(value.ownedSeeds)) {
    if (!knownCropIds.has(id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ownedSeeds", id],
        message: "种子库存包含未知作物"
      });
    }
  }
});
