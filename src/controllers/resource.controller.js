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
  const original = req.files?.file?.[0];
  const previewIMG = req.files?.image?.[0];

  if (!original?.dropbox || !previewIMG?.dropbox)
    return res.status(400).json({
      success: false,
      message: "Se requieren archivos: 'file' and 'image'",
    });

  if (!/^image\/(png|jpe?g)$/i.test(previewIMG.mimetype))
    return res.status(400).json({
      success: false,
      message: "La imagen debe ser PNG, JPG o JPEG",
    });

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

  const conn = await openConnection();
  try {
    await conn.beginTransaction();

    const newResource = await insertResource(
      {
        title,
        description,
        datePublication,
        isActive,
        filePath: original.dropbox.path,
        imagePath: previewIMG.dropbox.path,
        idStudent: +idStudent,
        idCategory: +idCategory,
        idDirector: +idDirector,
        idRevisor1: +idRevisor1,
        idRevisor2: +idRevisor2,
      },
      conn
    );

    await FileModel.create({
      id_recurso: newResource.idResource,
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
    res.status(201).json({ success: true, resource: newResource });
  } catch (err) {
    await conn.rollback();
    await safeDelete(original.dropbox.path);
    await safeDelete(previewIMG.dropbox.path);
    next(err);
  } finally {
    closeConnection(conn);
  }
}

/* GET /api/resources -------------------------------------------- */
export async function getResources(req, res, next) {
  try {
    const list = await selectAllResources();
    if (req.query.includeFile === "true") {
      await Promise.all(
        list.map(async (r) => {
          if (r.filePath?.startsWith("/files/"))
            try {
              r.tempFileUrl = await getTempLink(r.filePath);
            } catch {}
          if (r.imagePath?.startsWith("/files/"))
            try {
              r.tempImageUrl = await getTempLink(r.imagePath, true);
            } catch {}
        })
      );
    }
    res.json({ success: true, resources: list });
  } catch (err) {
    next(err);
  }
}

/* GET /api/resources/:id ---------------------------------------- */
export async function getResourceById(req, res, next) {
  try {
    const r = await selectActiveResourceById(+req.params.id);
    if (!r)
      return res.status(404).json({ success: false, message: "No encontrado" });

    if (req.query.includeFile === "true") {
      if (r.filePath?.startsWith("/files/"))
        try {
          r.tempFileUrl = await getTempLink(r.filePath);
        } catch {}
      if (r.imagePath?.startsWith("/files/"))
        try {
          r.tempImageUrl = await getTempLink(r.imagePath, true);
        } catch {}
    }
    res.json({ success: true, resource: r });
  } catch (err) {
    next(err);
  }
}

/* ─────────────── PUT /api/resources/:id ─────────────── */
export async function updateResource(req, res, next) {
  try {
    const body = { ...req.body };
    if (req.file?.dropbox) body.filePath = req.file.dropbox.path;

    const up = await updateResourceById(+req.params.id, body);
    if (!up) {
      return res
        .status(404)
        .json({ success: false, message: "Recurso no encontrado" });
    }
    res.json({ success: true, resource: up });
  } catch (e) {
    next(e);
  }
}

/* ─────────────── PATCH /resources/:id/disable ───── */
export async function disableResource(req, res, next) {
  try {
    const id = +req.params.id;
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

    await softDeleteResourceById(id);
    await FileModel.updateMany(
      { id_recurso: id },
      { $set: { eliminado: true, fecha_eliminado: new Date() } }
    );

    res.json({ success: true, message: "Recurso deshabilitado" });
  } catch (e) {
    next(e);
  }
}

/* ─────────────── PATCH /resources/:id/enable ───── */
export async function enableResource(req, res, next) {
  try {
    const id = +req.params.id;
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

    await enableResourceById(id);
    await FileModel.updateMany(
      { id_recurso: id },
      { $set: { eliminado: false }, $unset: { fecha_eliminado: 1 } }
    );

    res.json({ success: true, message: "Recurso habilitado" });
  } catch (err) {
    next(err);
  }
}

/* ─────────────── DELETE /resources/:id/force ────── */
export async function forceDeleteResource(req, res, next) {
  const id = +req.params.id;
  const doc = await FileModel.findOne({ id_recurso: id });
  if (!doc) {
    return res
      .status(404)
      .json({ success: false, message: "Recurso no encontrado" });
  }

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

/* ─────────────── EXTRA (fac-career) ─────────────── */
export async function getFacultyAndCareerResource(req, res, next) {
  try {
    const d = await getFacultyAndCareerByResource(+req.params.id);
    if (!d) {
      return res.status(404).json({ success: false, message: "No encontrado" });
    }
    res.json({ success: true, data: d });
  } catch (e) {
    next(e);
  }
}
