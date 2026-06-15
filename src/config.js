import path from "node:path";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(0).max(65535).default(3000),
  SESSION_SECRET: z.string().default("development-only-session-secret-change-me"),
  ADMIN_USERNAME: z.string().min(3).default("admin"),
  ADMIN_PASSWORD: z.string().min(8).default("change-me-now"),
  DATABASE_PATH: z.string().default("./data/stardew.db"),
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_UPLOAD_MB: z.coerce.number().positive().max(50).default(5),
  SITE_URL: z.string().url().optional(),
  TRUST_PROXY: z.string().default("false"),
  COOKIE_SECURE: z.enum(["true", "false"]).optional()
});

export function loadConfig(env = process.env) {
  const parsed = schema.parse(env);
  if (parsed.NODE_ENV === "production") {
    if (!env.SESSION_SECRET || parsed.SESSION_SECRET.length < 32) {
      throw new Error("SESSION_SECRET must be explicitly set to at least 32 characters in production");
    }
    if (!env.ADMIN_PASSWORD || parsed.ADMIN_PASSWORD.length < 12 || parsed.ADMIN_PASSWORD === "change-me-now") {
      throw new Error("ADMIN_PASSWORD must be explicitly set to a strong password in production");
    }
  }
  const trustProxy = parsed.TRUST_PROXY === "false" ? false : Number.parseInt(parsed.TRUST_PROXY, 10);
  if (trustProxy !== false && (!Number.isInteger(trustProxy) || trustProxy < 1 || trustProxy > 10)) {
    throw new Error("TRUST_PROXY must be false or an integer between 1 and 10");
  }

  return {
    nodeEnv: parsed.NODE_ENV,
    port: parsed.PORT,
    sessionSecret: parsed.SESSION_SECRET,
    adminUsername: parsed.ADMIN_USERNAME,
    adminPassword: parsed.ADMIN_PASSWORD,
    databasePath: path.resolve(parsed.DATABASE_PATH),
    uploadDir: path.resolve(parsed.UPLOAD_DIR),
    maxUploadBytes: parsed.MAX_UPLOAD_MB * 1024 * 1024,
    siteUrl: parsed.SITE_URL?.replace(/\/+$/, ""),
    trustProxy,
    cookieSecure: parsed.COOKIE_SECURE ? parsed.COOKIE_SECURE === "true" : parsed.NODE_ENV === "production"
  };
}

export const config = loadConfig();
