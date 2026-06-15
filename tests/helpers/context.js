import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db/database.js";

export function createTestContext() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "stardew-guide-"));
  const config = loadConfig({
    NODE_ENV: "test",
    PORT: "0",
    SESSION_SECRET: "test-session-secret-with-more-than-32-chars",
    ADMIN_USERNAME: "admin",
    ADMIN_PASSWORD: "test-password",
    DATABASE_PATH: path.join(root, "test.db"),
    UPLOAD_DIR: path.join(root, "uploads"),
    MAX_UPLOAD_MB: "2"
  });
  const db = createDatabase(config.databasePath);

  return {
    config,
    db,
    close() {
      db.close();
      fs.rmSync(root, { recursive: true, force: true });
    }
  };
}
