import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Each integration file seeds an isolated SQLite database and hashes an
    // admin password. CPU-count concurrency oversubscribes these fixtures.
    // Keep test isolation and timeout/assertion budgets unchanged.
    maxWorkers: 2
  }
});
