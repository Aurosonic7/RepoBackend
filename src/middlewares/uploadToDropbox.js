import crypto from "node:crypto";
import { uploadBuffer, getTempLink } from "../utils/dropbox.js";

export async function uploadToDropbox(req, _res, next) {
  console.log("req.files keys ⇒", Object.keys(req.files || {}));
  // Esperamos req.files.file y req.files.image
  if (!req.files) return next();

  try {
    for (const field of ["file", "image"]) {
      const file = req.files?.[field]?.[0];
      if (!file) continue; // ese campo no vino

      const hash = crypto
        .createHash("sha256")
        .update(file.buffer)
        .digest("hex");

      const ext = file.originalname.split(".").pop()?.toLowerCase() || "bin";
      const path = `/files/${hash}.${ext}`;

      let tmp;
      try {
        tmp = await getTempLink(path); // ¿ya existía?
      } catch {
        tmp = await uploadBuffer(file.buffer, path);
      }
      file.dropbox = { path, tmp, hash };
    }
    return next();
  } catch (err) {
    return next(err);
  }
}
