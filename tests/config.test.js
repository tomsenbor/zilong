import { describe, expect, test } from "vitest";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  test("normalizes numeric and path settings", () => {
    const config = loadConfig({
      NODE_ENV: "test",
      PORT: "4100",
      SESSION_SECRET: "a-secure-session-secret-with-32-chars",
      ADMIN_USERNAME: "farmer",
      ADMIN_PASSWORD: "strong-password",
      DATABASE_PATH: "./tmp/test.db",
      UPLOAD_DIR: "./tmp/uploads",
      MAX_UPLOAD_MB: "7"
    });

    expect(config.port).toBe(4100);
    expect(config.maxUploadBytes).toBe(7 * 1024 * 1024);
    expect(config.databasePath).toMatch(/tmp[\\/]test\.db$/);
  });

  test("rejects an unsafe production secret", () => {
    expect(() =>
      loadConfig({
        NODE_ENV: "production",
        SESSION_SECRET: "short",
        ADMIN_USERNAME: "admin",
        ADMIN_PASSWORD: "password"
      })
    ).toThrow(/SESSION_SECRET/);
  });

  test("requires explicit production credentials", () => {
    expect(() =>
      loadConfig({
        NODE_ENV: "production"
      })
    ).toThrow(/SESSION_SECRET/);

    expect(() =>
      loadConfig({
        NODE_ENV: "production",
        SESSION_SECRET: "a-secure-session-secret-with-32-chars"
      })
    ).toThrow(/ADMIN_PASSWORD/);
  });

  test("loads reverse proxy and secure cookie settings", () => {
    const config = loadConfig({
      NODE_ENV: "production",
      SESSION_SECRET: "a-secure-session-secret-with-32-chars",
      ADMIN_USERNAME: "farmer",
      ADMIN_PASSWORD: "a-strong-production-password",
      TRUST_PROXY: "1",
      COOKIE_SECURE: "true"
    });

    expect(config.trustProxy).toBe(1);
    expect(config.cookieSecure).toBe(true);
  });
});
