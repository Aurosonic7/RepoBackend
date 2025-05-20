import {
  insertResource,
  findResourceByFilePath,
} from "../gateways/resource.gateway.js";
import {
  openConnection,
  closeConnection,
} from "../../config/databases/mysql.js";

import FileModel from "../models/file.model.js";
import { safeDelete } from "../utils/dropbox.js";
import logger from "../utils/errorHandler.js";

/*────────────────────── POST /api/resources ──────────────────────*/
export async function createResource(req, res, next) {
  /* 1) Validaciones mínimas */
  if (!req.files?.file || !req.files?.image) {
    logger.warn("createResource: faltan 'file' o 'image'");
    return res.status(400).json({
      success: false,
      message: "Se requieren campos 'file' y 'image'",
    });
  }
  const original = req.files.file[0]; // PDF / archivo
  const coverImage = req.files.image[0]; // portada

  if (!original.dropbox || !coverImage.dropbox)
    return res.status(400).json({
      success: false,
      message: "Error al subir a Dropbox; intenta de nuevo",
    });

  if (!/^image\/(png|jpe?g)$/i.test(coverImage.mimetype))
    return res.status(400).json({
      success: false,
      message: "La portada debe ser PNG, JPG o JPEG",
    });

  /* 2)  ¿Duplicado? — mismo SHA → mismo path en Dropbox */
  try {
    const dup = await findResourceByFilePath(original.dropbox.path);
    if (dup) {
      logger.info(`Archivo duplicado → Recurso #${dup.idResource}`);
      return res.json({ success: true, duplicate: true, resource: dup });
    }
  } catch (err) {
    logger.error(`findResourceByFilePath FAILED ⇒ ${err.stack || err}`);
    return next(err);
  }

  /* 3)  Insertamos */
  const { title, description, datePublication, idStudent, idCategory } =
    req.body;

  const conn = await openConnection();
  try {
    await conn.beginTransaction();

    /* 3-A) MySQL */
    const nuevo = await insertResource(
      {
        title,
        description,
        datePublication,
        filePath: original.dropbox.path,
        imagePath: coverImage.dropbox.path,
        idStudent: +idStudent,
        idCategory: +idCategory,
      },
      conn
    );

    /* 3-B) Mongo (bitácora de versiones) */
    await FileModel.create({
      id_recurso: nuevo.idResource,
      archivo: original.originalname,
      tipo: original.mimetype.includes("pdf")
        ? "pdf"
        : original.mimetype.startsWith("image/")
        ? "imagen"
        : "video",
      dropbox_path: original.dropbox.path,
      versiones: [
        {
          numero: 1,
          cambios: "Primera versión",
          fecha: new Date(datePublication || Date.now()),
        },
      ],
    });

    await conn.commit();
    logger.info(`Resource #${nuevo.idResource} creado OK`);
    return res.status(201).json({ success: true, resource: nuevo });
  } catch (err) {
    await conn.rollback();
    await safeDelete(original.dropbox.path);
    await safeDelete(coverImage.dropbox.path);
    logger.error(`createResource FAILED ⇒ ${err.stack || err}`);
    return next(err);
  } finally {
    closeConnection(conn);
  }
}
