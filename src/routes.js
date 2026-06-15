import session from "express-session";
import { Router } from "express";
import { createAuthRouter, requireAdmin, requireCsrf } from "./features/auth/router.js";
import { SQLiteSessionStore } from "./features/auth/session-store.js";
import { createContentRouter } from "./features/content/router.js";
import { createAdminRouter } from "./features/admin/router.js";
import { createMediaRouter } from "./features/media/router.js";
import { createToolsRouter } from "./features/tools/router.js";

export function createRouter(context) {
  const router = Router();
  router.use(session({
    store: new SQLiteSessionStore(context.db),
    secret: context.config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: "stardew.sid",
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: context.config.cookieSecure,
      maxAge: 24 * 60 * 60 * 1000
    }
  }));
  router.get("/health", (req, res) => {
    context.db.prepare("SELECT 1").get();
    res.json({ status: "ok", database: "ready", version: "1.6.15" });
  });
  router.use("/admin/auth", createAuthRouter(context));
  router.use("/admin/media", requireAdmin, (req, res, next) => ["GET", "HEAD"].includes(req.method) ? next() : requireCsrf(req, res, next), createMediaRouter(context));
  router.use("/admin", createAdminRouter(context));
  router.use("/tools", createToolsRouter(context));
  router.use("/", createContentRouter(context));
  return router;
}
