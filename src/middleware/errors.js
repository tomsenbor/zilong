export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function notFound(req, res) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "请求的资源不存在" } });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const isValidation = error?.name === "ZodError";
  const isUploadError = error?.name === "MulterError";
  const uploadTooLarge = isUploadError && error.code === "LIMIT_FILE_SIZE";
  const status = error.status || (uploadTooLarge ? 413 : (isUploadError || isValidation ? 400 : 500));
  const body = {
    error: {
      code: uploadTooLarge ? "UPLOAD_TOO_LARGE" : (isUploadError ? "UPLOAD_ERROR" : (error.code || (isValidation ? "VALIDATION_ERROR" : "INTERNAL_ERROR"))),
      message: uploadTooLarge
        ? "图片大小超过上传限制"
        : (status === 500 ? "服务器处理请求时发生错误" : (isUploadError ? "图片上传失败" : (isValidation ? "提交的数据格式不正确" : error.message)))
    }
  };
  if (isValidation) body.error.details = error.issues;
  if (error.details) body.error.details = error.details;
  if (status === 500 && req.app.get("env") !== "test") console.error(error);
  res.status(status).json(body);
}
