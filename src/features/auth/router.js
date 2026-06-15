import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { AppError } from "../../middleware/errors.js";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export function requireAdmin(req, res, next) {
  if (!req.session.adminId) return next(new AppError(401, "UNAUTHORIZED", "请先登录后台"));
  next();
}

export function requireCsrf(req, res, next) {
  if (!req.session.csrfToken || req.get("x-csrf-token") !== req.session.csrfToken) {
    return next(new AppError(403, "INVALID_CSRF", "安全令牌无效，请刷新后重试"));
  }
  next();
}

export function createAuthRouter({ db }) {
  const router = Router();
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

  router.post("/login", limiter, async (req, res, next) => {
    try {
      const input = loginSchema.parse(req.body);
      const admin = db.prepare("SELECT * FROM admins WHERE username = ?").get(input.username);
      if (!admin || !(await bcrypt.compare(input.password, admin.password_hash))) {
        throw new AppError(401, "INVALID_CREDENTIALS", "用户名或密码错误");
      }
      req.session.regenerate((error) => {
        if (error) return next(error);
        req.session.adminId = admin.id;
        req.session.username = admin.username;
        req.session.csrfToken = crypto.randomBytes(24).toString("hex");
        db.prepare("UPDATE admins SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?").run(admin.id);
        res.json({ user: { id: admin.id, username: admin.username }, csrfToken: req.session.csrfToken });
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/session", (req, res) => {
    if (!req.session.adminId) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "未登录" } });
    res.json({ user: { id: req.session.adminId, username: req.session.username }, csrfToken: req.session.csrfToken });
  });

  router.post("/logout", requireAdmin, requireCsrf, (req, res, next) => {
    req.session.destroy((error) => {
      if (error) return next(error);
      res.status(204).end();
    });
  });
  return router;
}
