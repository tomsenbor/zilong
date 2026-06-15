import { z } from "zod";
import {
  fertilizers,
  fishCategories,
  fishSourceTypes,
  processingMethods,
  seasons,
  weathers
} from "./constants.js";

const optionalText = z.string().trim().max(100).optional();
const optionalEnum = (values) => z.enum(values).optional();

export const fishQuerySchema = z.object({
  q: optionalText,
  season: optionalEnum(seasons),
  weather: optionalEnum(weathers),
  time: z.coerce.number().int().min(0).max(2600).optional(),
  location: optionalText,
  sourceType: optionalEnum(fishSourceTypes),
  category: optionalEnum(fishCategories),
  bundleOnly: z.enum(["true", "false"]).optional()
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
  includeSeedCost: z.boolean().default(true)
}).strict().superRefine((value, context) => {
  if (value.locationMode !== "seasonal" && value.planningDays === undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["planningDays"],
      message: "温室或姜岛模式需要填写规划天数"
    });
  }
});
