import crypto from "node:crypto";
import { uploadBuffer, getTempLink } from "../utils/dropbox.js";
import logger from "../utils/errorHandler.js";

export async function uploadToDropbox(req, _res, next) {
  if (!req.files) return next(); // no llegaron archivos

  try {
    for (const field of ["file", "image"]) {
      const fileArr = req.files?.[field];
      if (!fileArr?.length) continue; // este campo no vino

      const file = fileArr[0];

      const hash = crypto
        .createHash("sha256")
        .update(file.buffer)
        .digest("hex");

      const ext = file.originalname.split(".").pop()?.toLowerCase() || "bin";
      const path = `/files/${hash}.${ext}`;

      let info;
      try {
        // Intentamos obtener el link temporal por si el archivo ya existía
        info = {
          path,
          link: await getTempLink(path), // descarga
          rawLink: await getTempLink(path, true), // raw (img/pdf embed)
        };
        logger.info(`Archivo ya existía en Dropbox → ${path}`);
      } catch (err) {
        // Cuando el archivo aún no existe Dropbox responde 409 (path/not_found)
        if (err?.status === 409)
          logger.warn(`getTempLink ↺ nuevo archivo, se subirá → ${path}`);
        else logger.error(`getTempLink fallo inesperado: ${err}`);

        // Subimos el archivo y obtenemos ambos enlaces
        info = await uploadBuffer(file.buffer, path);
        logger.info(`Subido a Dropbox → ${path}`);
      }

      // Guardamos la info para que el controller la use
      file.dropbox = info;
    }

    next();
  } catch (err) {
    logger.error(`uploadToDropbox middleware ⇒ ${err.stack || err}`);
    next(err);
  }
}
