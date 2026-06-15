import { afterEach, describe, expect, test } from "vitest";
import { SQLiteSessionStore } from "../src/features/auth/session-store.js";
import { createTestContext } from "./helpers/context.js";

let context;
afterEach(() => context?.close());

describe("SQLiteSessionStore", () => {
  test("removes expired sessions when they are read", async () => {
    context = createTestContext();
    const store = new SQLiteSessionStore(context.db);
    context.db.prepare("INSERT INTO sessions(sid,data,expires_at) VALUES (?,?,?)")
      .run("expired", "{}", Date.now() - 1000);

    const value = await new Promise((resolve, reject) =>
      store.get("expired", (error, session) => error ? reject(error) : resolve(session))
    );

    expect(value).toBeNull();
    expect(context.db.prepare("SELECT COUNT(*) count FROM sessions WHERE sid=?").get("expired").count).toBe(0);
  });

  test("touch extends an active session expiry", async () => {
    context = createTestContext();
    const store = new SQLiteSessionStore(context.db);
    const initialExpiry = Date.now() + 1000;
    context.db.prepare("INSERT INTO sessions(sid,data,expires_at) VALUES (?,?,?)")
      .run("active", "{}", initialExpiry);

    await new Promise((resolve, reject) =>
      store.touch("active", { cookie: { expires: new Date(Date.now() + 60000) } }, (error) => error ? reject(error) : resolve())
    );

    expect(context.db.prepare("SELECT expires_at FROM sessions WHERE sid=?").get("active").expires_at).toBeGreaterThan(initialExpiry);
  });
});
