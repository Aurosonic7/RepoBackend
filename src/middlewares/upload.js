import multer from "multer";
import logger from "../utils/errorHandler.js";

const storage = multer.memoryStorage();

export default multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^(image\/|application\/pdf)/.test(file.mimetype);
    if (!ok) logger.warn(`upload.js: mimetype rechazado → ${file.mimetype}`);
    cb(null, ok);
  },
});
