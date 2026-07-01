import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import helmet from "helmet";
import { createRouter } from "./routes.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { renderPublicPage } from "./seo/render.js";
import { renderRobotsTxt, renderSitemapXml } from "./seo/sitemap.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function createApp(context) {
  fs.mkdirSync(context.config.uploadDir, { recursive: true });
  const app = express();
  app.disable("x-powered-by");
  app.set("env", context.config.nodeEnv);
  if (context.config.trustProxy !== false) app.set("trust proxy", context.config.trustProxy);
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: context.config.cookieSecure ? [] : null
      }
    },
    crossOriginResourcePolicy: { policy: "same-origin" }
  }));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.get("/sitemap.xml", (req, res) => res.type("application/xml").send(renderSitemapXml({ req, context })));
  app.get("/robots.txt", (req, res) => res.type("text/plain").send(renderRobotsTxt({ req, context })));
  app.use("/uploads", express.static(context.config.uploadDir, { fallthrough: false }));
  app.use("/design-system", express.static(path.join(root, "design-system"), { fallthrough: false }));
  app.use(express.static(path.join(root, "public"), { index: false }));
  app.use("/api", createRouter(context));
  app.get("*splat", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    if (path.extname(req.path) && !req.path.startsWith("/guides/")) return next();
    if (req.path.startsWith("/admin")) {
      res.set("X-Robots-Tag", "noindex, nofollow");
      return res.sendFile(path.join(root, "public", "admin.html"));
    }
    try {
      const page = renderPublicPage({ req, context });
      if (page.redirectPath) return res.redirect(page.status || 301, page.redirectPath);
      if (page.noindex) res.set("X-Robots-Tag", "noindex, nofollow");
      return res.status(page.status).type("html").send(page.html);
    } catch (error) {
      return next(error);
    }
  });
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
