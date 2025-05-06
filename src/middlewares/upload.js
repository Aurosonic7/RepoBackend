import multer from "multer";

const storage = multer.memoryStorage();

export default multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máx
  fileFilter: (_req, file, cb) => {
    const ok = /^(image\/|application\/pdf)/.test(file.mimetype);
    cb(null, ok);
  },
});
