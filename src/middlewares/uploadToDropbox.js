import crypto from "node:crypto";
import { uploadBuffer, getTempLink } from "../utils/dropbox.js";

export async function uploadToDropbox(req, _res, next) {
  if (!req.file) return next();

  try {
    /* 1) Hash SHA‑256 → nombre de archivo único y determinístico */
    const hash = crypto
      .createHash("sha256")
      .update(req.file.buffer)
      .digest("hex");
    const ext = req.file.originalname.split(".").pop()?.toLowerCase() || "bin";
    const path = `/files/${hash}.${ext}`; // carpeta fija

    /* 2) Comprueba si ya existe pidiendo un link temporal.
          Si falla, lo sube; si no, reutiliza. */
    let tempLink;
    try {
      tempLink = await getTempLink(path); // existe – sólo link
    } catch {
      tempLink = await uploadBuffer(req.file.buffer, path); // se acaba de subir
    }

    /* 3) Guarda la info para que el controller la use */
    req.file.dropbox = { path, tmp: tempLink, hash };
    return next();
  } catch (err) {
    return next(err); // lo atrapará tu errorHandler
  }
}
