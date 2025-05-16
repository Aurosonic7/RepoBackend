import crypto from "node:crypto";
import { uploadBuffer, getTempLink } from "../utils/dropbox.js";

export async function uploadToDropbox(req, _res, next) {
  const filesMap = req.files;
  // Esperamos req.files.file y req.files.image
  if (!filesMap || !filesMap.file || !filesMap.image) {
    return next();
  }

  try {
    // Itera sobre los dos campos, pero podrías generalizar
    for (const field of ["file", "image"]) {
      // multer.fields siempre devuelve arrays
      const arr = filesMap[field];
      if (!arr || !arr.length) continue;

      const file = arr[0];
      // 1) Hash + extensión
      const hash = crypto
        .createHash("sha256")
        .update(file.buffer)
        .digest("hex");
      const ext = file.originalname.split(".").pop()?.toLowerCase() || "bin";
      const path = `/files/${hash}.${ext}`;

      // 2) Intenta obtener link temporal
      let tmp;
      try {
        tmp = await getTempLink(path);
      } catch {
        // si no existe, lo sube y luego link
        tmp = await uploadBuffer(file.buffer, path);
      }

      // 3) Guarda info para el controller
      file.dropbox = { path, tmp, hash };
    }
    return next();
  } catch (err) {
    return next(err); // lo atrapará tu errorHandler
  }
}
