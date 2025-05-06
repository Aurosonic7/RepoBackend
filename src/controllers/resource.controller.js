import logger from "../utils/errorHandler.js";
import FileModel from "../models/file.model.js";
import {
  insertResource,
  selectAllResources,
  selectResourceById,
  selectActiveResourceById,
  updateResourceById,
  softDeleteResourceById,
  enableResourceById,
  hardDeleteResourceById,
  getFacultyAndCareerByResource,
} from "../gateways/resource.gateway.js";
import {
  openConnection,
  closeConnection,
} from "../../config/databases/mysql.js";
import { safeDelete, getTempLink } from "../utils/dropbox.js";

/* ─────────────── POST /api/resources ─────────────── */
export async function createResource(req, res, next) {
  if (!req.file?.dropbox)
    return res
      .status(400)
      .json({ success: false, message: "Archivo requerido" });

  const {
    title,
    description,
    datePublication,
    isActive = true,
    idStudent,
    idCategory,
    idDirector,
    idRevisor1,
    idRevisor2,
  } = req.body;

  const { path: dropboxPath } = req.file.dropbox;

  const conn = await openConnection();
  try {
    await conn.beginTransaction();

    /* 1) MySQL */
    const newResource = await insertResource(
      {
        title,
        description,
        datePublication,
        isActive,
        filePath: dropboxPath,
        idStudent: +idStudent,
        idCategory: +idCategory,
        idDirector: +idDirector,
        idRevisor1: +idRevisor1,
        idRevisor2: +idRevisor2,
      },
      conn
    );

    /* 2) Mongo */
    await FileModel.create({
      id_recurso: newResource.idResource,
      archivo: req.file.originalname,
      tipo: req.file.mimetype.includes("pdf")
        ? "pdf"
        : req.file.mimetype.startsWith("image/")
        ? "imagen"
        : "video",
      versiones: [
        {
          numero: 1,
          cambios: "Primera versión",
          fecha: new Date(datePublication || Date.now()),
        },
      ],
      dropbox_path: dropboxPath,
    });

    await conn.commit();
    return res.status(201).json({ success: true, resource: newResource });
  } catch (err) {
    await conn.rollback();
    await safeDelete(dropboxPath);
    next(err);
  } finally {
    closeConnection(conn);
  }
}

/* ─────────────── GETs ─────────────── */
export async function getResources(req, res, next) {
  try {
    const list = await selectAllResources();
    if (req.query.includeFile === "true") {
      await Promise.all(
        list.map(async (r) => {
          r.tempFileUrl = await getTempLink(r.filePath);
        })
      );
    }
    return res.json({ success: true, resources: list });
  } catch (e) {
    next(e);
  }
}

export async function getResourceById(req, res, next) {
  try {
    const r = await selectActiveResourceById(+req.params.id);
    if (!r)
      return res
        .status(404)
        .json({ success: false, message: "Recurso no encontrado" });
    if (req.query.includeFile === "true")
      r.tempFileUrl = await getTempLink(r.filePath);
    return res.json({ success: true, resource: r });
  } catch (e) {
    next(e);
  }
}

/* ─────────────── PUT /resources/:id ─────────────── */
export async function updateResource(req, res, next) {
  try {
    const body = { ...req.body };
    if (req.file?.dropbox) body.filePath = req.file.dropbox.path;
    const up = await updateResourceById(+req.params.id, body);
    if (!up)
      return res
        .status(404)
        .json({ success: false, message: "Recurso no encontrado" });
    res.json({ success: true, resource: up });
  } catch (e) {
    next(e);
  }
}

/* ─────────────── PATCH /resources/:id/disable ───── */
export async function disableResource(req, res, next) {
  try {
    const id = +req.params.id;
    /* ¿existe?  */
    const current = await selectResourceById(id);
    if (!current)
      return res
        .status(404)
        .json({ success: false, message: "Recurso no encontrado" });
    /* ya inactivo ⇒ nada que hacer  */
    if (!current.isActive)
      return res.json({
        success: true,
        message: "Recurso ya estaba deshabilitado",
      });
    /* soft‑delete en MySQL  */
    await softDeleteResourceById(id);
    /* marca en Mongo  */
    await FileModel.updateMany(
      { id_recurso: id },
      { $set: { eliminado: true, fecha_eliminado: new Date() } }
    );
    return res.json({ success: true, message: "Recurso deshabilitado" });
  } catch (e) {
    next(e);
  }
}

/* ───────────── PATCH /api/resources/:id/enable ───── */
export async function enableResource(req, res, next) {
  try {
    const id = +req.params.id;
    /* ¿existe? */
    const current = await selectResourceById(id);
    if (!current)
      return res
        .status(404)
        .json({ success: false, message: "Recurso no encontrado" });
    /* ya activo */
    if (current.isActive)
      return res.json({
        success: true,
        message: "Recurso ya estaba habilitado",
      });
    /* reactiva en MySQL  */
    await enableResourceById(id);
    /* des‑marca en Mongo  */
    await FileModel.updateMany(
      { id_recurso: id },
      { $set: { eliminado: false }, $unset: { fecha_eliminado: 1 } }
    );
    return res.json({ success: true, message: "Recurso habilitado" });
  } catch (err) {
    next(err);
  }
}

/* ─────────────── DELETE /resources/:id/force ────── */
export async function forceDeleteResource(req, res, next) {
  const id = +req.params.id;
  const doc = await FileModel.findOne({ id_recurso: id });
  if (!doc)
    return res
      .status(404)
      .json({ success: false, message: "Recurso no encontrado" });

  try {
    await safeDelete(doc.dropbox_path);
    await FileModel.deleteOne({ _id: doc._id });
    const ok = await hardDeleteResourceById(id);
    if (!ok) throw new Error("No se pudo eliminar en MySQL");
    res.json({ success: true, message: "Recurso eliminado definitivamente" });
  } catch (e) {
    next(e);
  }
}

/* ─────────────── EXTRA (fac‑career) ─────────────── */
export async function getFacultyAndCareerResource(req, res, next) {
  try {
    const d = await getFacultyAndCareerByResource(+req.params.id);
    if (!d)
      return res.status(404).json({ success: false, message: "No encontrado" });
    res.json({ success: true, data: d });
  } catch (e) {
    next(e);
  }
}
