import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { fileTypeFromFile } from "file-type";
import { AppError } from "../../middleware/errors.js";

const allowed = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export function createMediaRouter({ db, config }) {
  const router = Router();
  const upload = multer({
    dest: config.uploadDir,
    limits: { fileSize: config.maxUploadBytes, files: 1 }
  });

  router.get("/", (req, res) => res.json({ items: db.prepare("SELECT * FROM media ORDER BY created_at DESC").all() }));
  router.post("/", upload.single("image"), async (req, res, next) => {
    try {
      if (!req.file) throw new AppError(400, "IMAGE_REQUIRED", "请选择图片");
      const detected = await fileTypeFromFile(req.file.path);
      if (!detected || !allowed.has(detected.mime)) {
        fs.rmSync(req.file.path, { force: true });
        throw new AppError(415, "INVALID_IMAGE", "仅支持 PNG、JPEG、WebP 和 GIF 图片");
      }
      const filename = `${crypto.randomUUID()}.${detected.ext}`;
      const target = path.join(config.uploadDir, filename);
      fs.renameSync(req.file.path, target);
      const metadata = await sharp(target, { animated: true }).metadata();
      const result = db.prepare(`
        INSERT INTO media(filename,original_name,mime_type,size,width,height) VALUES (?,?,?,?,?,?)
      `).run(filename, req.file.originalname, detected.mime, req.file.size, metadata.width || null, metadata.height || null);
      res.status(201).json({ item: { ...db.prepare("SELECT * FROM media WHERE id=?").get(result.lastInsertRowid), url: `/uploads/${filename}` } });
    } catch (error) {
      if (req.file?.path) fs.rmSync(req.file.path, { force: true });
      next(error);
    }
  });
  router.delete("/:id", (req, res, next) => {
    const media = db.prepare("SELECT * FROM media WHERE id=?").get(req.params.id);
    if (!media) return next(new AppError(404, "MEDIA_NOT_FOUND", "图片不存在"));
    const url = `/uploads/${media.filename}`;
    const articleRefs = db.prepare("SELECT id,title FROM articles WHERE cover_image=? OR body LIKE ?").all(url, `%${url}%`);
    const entryRefs = db.prepare("SELECT id,name FROM dataset_entries WHERE image=?").all(url);
    if (articleRefs.length || entryRefs.length) {
      return next(new AppError(409, "MEDIA_IN_USE", "图片正在被内容引用", { articles: articleRefs, entries: entryRefs }));
    }
    db.prepare("DELETE FROM media WHERE id=?").run(req.params.id);
    fs.rmSync(path.join(config.uploadDir, media.filename), { force: true });
    res.status(204).end();
  });
  return router;
}
