import {
  insertResource,
  findResourceByFilePath,
  selectAllActiveResources,
  selectResourceById,
  softDeleteResourceById,
  enableResourceById,
  hardDeleteResourceById,
  updateResourceById,
} from "../gateways/resource.gateway.js";
import {
  openConnection,
  closeConnection,
} from "../../config/databases/mysql.js";

import FileModel from "../models/file.model.js";
import { getTempLink, safeDelete } from "../utils/dropbox.js";
import logger from "../utils/errorHandler.js";
import { normalizeDropboxPath } from "../utils/normalizeDropboxPath.js";

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
        filePath: normalizeDropboxPath(original.dropbox.path),
        imagePath: normalizeDropboxPath(coverImage.dropbox.path),
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
      dropbox_path: normalizeDropboxPath(original.dropbox.path),
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
/* ─────────────── GET /api/resources ────────────────────────────── */
export async function getResources(req, res, next) {
  try {
    const list = await selectAllActiveResources();
    if (req.query.includeFile === "true") {
      await Promise.all(
        list.map(async (r) => {
          if (r.filePath?.startsWith("/files/")) {
            // URL de descarga (dl=0)
            r.downloadUrl = await getTempLink(r.filePath);
            // URL de preview/embed (raw=1)
            r.embedUrl = await getTempLink(r.filePath, true);
          }
          if (r.imagePath?.startsWith("/files/")) {
            // portada siempre como imagen (raw=1)
            r.imageUrl = await getTempLink(r.imagePath, true);
          }
        })
      );
    }

    return res.json({ success: true, resources: list });
  } catch (err) {
    return next(err);
  }
}
/*────────────────── GET /api/resources/:id ──────────────────────*/
export async function getResourceById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const rec = await selectResourceById(id);
    if (!rec)
      return res
        .status(404)
        .json({ success: false, message: "Recurso no encontrado" });
    if (req.query.includeFile === "true") {
      if (rec.filePath?.startsWith("/files/")) {
        rec.downloadUrl = await getTempLink(rec.filePath);
        rec.embedUrl = await getTempLink(rec.filePath, true);
      }
      if (rec.imagePath?.startsWith("/files/")) {
        rec.imageUrl = await getTempLink(rec.imagePath, true);
      }
    }
    return res.json({ success: true, resource: rec });
  } catch (err) {
    logger.error(`getResourceById FAILED ⇒ ${err.stack || err}`);
    return next(err);
  }
}
/* ───────── PATCH /api/resources/:id/disable ───────── */
export async function disableResource(req, res, next) {
  const id = Number(req.params.id);
  try {
    const current = await selectResourceById(id);
    if (!current) {
      return res
        .status(404)
        .json({ success: false, message: "Recurso no encontrado" });
    }
    if (!current.isActive) {
      return res.json({
        success: true,
        message: "Recurso ya estaba deshabilitado",
      });
    }
    await softDeleteResourceById(id); // ← MySQL
    await FileModel.updateMany(
      // ← Mongo
      { id_recurso: id },
      { $set: { eliminado: true, fecha_eliminado: new Date() } }
    );

    return res.json({ success: true, message: "Recurso deshabilitado" });
  } catch (err) {
    return next(err);
  }
}
/* ───────── PATCH /api/resources/:id/enable ───────── */
export async function enableResource(req, res, next) {
  const id = Number(req.params.id);

  try {
    const current = await selectResourceById(id);
    if (!current) {
      return res
        .status(404)
        .json({ success: false, message: "Recurso no encontrado" });
    }

    if (current.isActive) {
      return res.json({
        success: true,
        message: "Recurso ya estaba habilitado",
      });
    }

    await enableResourceById(id); // ← MySQL
    await FileModel.updateMany(
      // ← Mongo
      { id_recurso: id },
      { $set: { eliminado: false }, $unset: { fecha_eliminado: 1 } }
    );

    return res.json({ success: true, message: "Recurso habilitado" });
  } catch (err) {
    return next(err);
  }
}

/* ───────── DELETE /api/resources/:id/force ───────── */
export async function forceDeleteResource(req, res, next) {
  const id = +req.params.id;

  // 1) Traemos el recurso completo (para sacar imagePath)
  const recurso = await selectResourceById(id);
  if (!recurso) {
    return res
      .status(404)
      .json({ success: false, message: "Recurso no encontrado" });
  }

  // 2) Traemos TODAS las versiones/archivos en Mongo
  const docs = await FileModel.find({ id_recurso: id });

  try {
    /* 2-A)  Borramos **todos** los archivos asociados en Dropbox */
    //    a)  portada
    if (recurso.imagePath?.startsWith("/files/")) {
      await safeDelete(recurso.imagePath);
    }

    //    b)  cada versión del archivo principal
    await Promise.all(
      docs.map((d) => safeDelete(d.dropbox_path).catch(() => {}))
    );

    /* 2-B)  Eliminamos bitácora en Mongo               */
    await FileModel.deleteMany({ id_recurso: id });

    /* 2-C)  Eliminamos fila en MySQL (hard-delete)     */
    await hardDeleteResourceById(id);

    logger.info(`Recurso #${id} eliminado definitivamente`);
    res.json({ success: true, message: "Recurso eliminado definitivamente" });
  } catch (err) {
    logger.error(`forceDeleteResource FAILED ⇒ ${err.stack || err}`);
    next(err);
  }
}

export async function updateResource(req, res, next) {
  const id = +req.params.id;
  const current = await selectResourceById(id);
  if (!current)
    return res
      .status(404)
      .json({ success: false, message: "Recurso no encontrado" });

  /* ---------- 1.  Campos a modificar ---------------------------------- */
  const fields = {};
  const { title, description, datePublication, idStudent, idCategory } =
    req.body;

  if (title !== undefined) fields.title = title;
  if (description !== undefined) fields.description = description;
  if (datePublication !== undefined) fields.datePublication = datePublication;
  if (idStudent !== undefined) fields.idStudent = +idStudent;
  if (idCategory !== undefined) fields.idCategory = +idCategory;

  /* ---------- 2.  Sustitución opcional de archivos --------------------- */
  let newMainFilePath = null;
  let newCoverImagePath = null;

  const mainFile = req.files?.file?.[0];
  const coverFile = req.files?.image?.[0];

  const mainPathNorm = mainFile?.dropbox
    ? normalizeDropboxPath(mainFile.dropbox.path)
    : null;
  const coverPathNorm = coverFile?.dropbox
    ? normalizeDropboxPath(coverFile.dropbox.path)
    : null;

  if (mainPathNorm) {
    if (mainPathNorm !== current.filePath) {
      newMainFilePath = mainPathNorm;
      fields.filePath = mainPathNorm;
    }
  }
  if (coverPathNorm) {
    if (coverPathNorm !== current.imagePath) {
      newCoverImagePath = coverPathNorm;
      fields.imagePath = coverPathNorm;
    }
  }

  /* ---------- 3.  Nada que actualizar ------------------------------- */
  if (!Object.keys(fields).length)
    return res.json({
      success: true,
      resource: current,
      message: "Sin cambios",
    });

  /* ---------- 4.  Transacción MySQL + registro Mongo ----------------- */
  const conn = await openConnection();
  try {
    await conn.beginTransaction();
    const updated = await updateResourceById(id, fields, conn);

    /* (A) si cambió el archivo principal -> versionado en Mongo */
    if (newMainFilePath) {
      await FileModel.updateOne(
        { id_recurso: id, dropbox_path: current.filePath },
        {
          $set: { dropbox_path: newMainFilePath },
          $push: {
            versiones: {
              numero: (current.versiones?.length || 0) + 1,
              cambios: "Archivo sustituido",
              fecha: new Date(),
            },
          },
        }
      );
    }

    await conn.commit();

    /* (B) después de commit borramos en Dropbox los antiguos (ya no se usan) */
    if (newMainFilePath) await safeDelete(current.filePath);
    if (newCoverImagePath) await safeDelete(current.imagePath);

    logger.info(`Resource #${id} actualizado`);
    return res.json({ success: true, resource: updated });
  } catch (err) {
    await conn.rollback();
    // si habíamos subido archivos nuevos los eliminamos para que no queden huérfanos
    if (newMainFilePath) await safeDelete(newMainFilePath);
    if (newCoverImagePath) await safeDelete(newCoverImagePath);
    logger.error(`updateResource FAILED ⇒ ${err.stack || err}`);
    return next(err);
  } finally {
    closeConnection(conn);
  }
}
