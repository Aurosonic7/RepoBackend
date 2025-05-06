// src/middlewares/uploadToDropbox.js
import { uploadBuffer } from "../utils/dropbox.js";

export async function uploadToDropbox(req, _res, next) {
  if (!req.file) return next(); // no llevaba archivo

  try {
    const filename = `${Date.now()}_${req.file.originalname}`;
    const url = await uploadBuffer(req.file.buffer, filename);

    req.file.dropboxUrl = url; // ← controlador lo usará
    return next();
  } catch (err) {
    return next(err); // lo captura errorHandler
  }
}
