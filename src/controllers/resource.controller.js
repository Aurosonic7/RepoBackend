import {
  insertResource,
  findResourceByFilePath,
} from "../gateways/resource.gateway.js";
import {
  openConnection,
  closeConnection,
} from "../../config/databases/mysql.js";
import { safeDelete } from "../utils/dropbox.js";
import logger from "../utils/errorHandler.js";
import FileModel from "../models/file.model.js";

export async function createResource(req, res, next) {
  /* 1) Validaciones básicas ------------------------------------------------- */
  if (!req.files?.file || !req.files?.image) {
    logger.warn("createResource: faltan 'file' o 'image' en multipart");
    return res.status(400).json({
      success: false,
      message: "Se requieren campos 'file' y 'image'",
    });
  }

  const original = req.files.file[0]; // PDF / archivo principal
  const coverImage = req.files.image[0]; // portada

  if (!original.dropbox || !coverImage.dropbox) {
    return res.status(400).json({
      success: false,
      message: "Error al subir a Dropbox; intenta de nuevo",
    });
  }

  if (!/^image\/(png|jpe?g)$/i.test(coverImage.mimetype)) {
    return res.status(400).json({
      success: false,
      message: "La portada debe ser PNG, JPG o JPEG",
    });
  }

  /* 2)  ¿Ya existía un recurso con ese mismo archivo? ----------------------- */
  try {
    const duplicate = await findResourceByFilePath(original.dropbox.path);
    if (duplicate) {
      logger.info(
        `Archivo duplicado → se devolverá recurso #${duplicate.idResource}`
      );
      return res.json({
        success: true,
        duplicate: true,
        resource: duplicate,
      });
    }
  } catch (err) {
    logger.error(`findResourceByFilePath FAILED ⇒ ${err.stack || err}`);
    return next(err); // deja que el manejador global responda
  }

  /* 3)  Datos del formulario ------------------------------------------------ */
  const { title, description, datePublication, idStudent, idCategory } =
    req.body;

  const conn = await openConnection();
  try {
    await conn.beginTransaction();

    /* 3-A) Inserta en MySQL */
    const newRes = await insertResource(
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

    /* 3-B) Guarda versión 1 en Mongo (solo archivo principal) */
    await FileModel.create({
      id_recurso: newRes.idResource,
      archivo: original.originalname,
      tipo: original.mimetype.includes("pdf")
        ? "pdf"
        : original.mimetype.startsWith("image/")
        ? "imagen"
        : "video",
      versiones: [
        {
          numero: 1,
          cambios: "Primera versión",
          fecha: new Date(datePublication || Date.now()),
        },
      ],
      dropbox_path: original.dropbox.path,
    });

    await conn.commit();
    logger.info(`Resource #${newRes.idResource} creado OK`);
    return res.status(201).json({ success: true, resource: newRes });
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
