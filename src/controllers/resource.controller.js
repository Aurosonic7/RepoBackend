// src/controllers/resource.controller.js
import logger from "../utils/errorHandler.js";
import {
  insertResource,
  selectAllResources,
  selectResourceById,
  updateResourceById,
  deleteResourceById,
  getFacultyAndCareerByResource,
} from "../gateways/resource.gateway.js";
import FileModel from "../models/file.model.js";

/* -------------------------------------------------------------------------- */
/*  CREATE ─ POST /api/resources                                              */
/* -------------------------------------------------------------------------- */
/*  Este handler asume que en el *route* se ejecutan, **en este orden**:      *
 *    1)  `upload.single("file")`  (multer – pone el archivo en `req.file`)   *
 *    2)  `uploadToDropbox`        (añade `req.file.dropboxUrl`)              */
export async function createResource(req, res, next) {
  try {
    /* ------------------------------- payload ------------------------------ */
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

    /* ---------------------------- archivo check --------------------------- */
    if (!req.file?.dropboxUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Archivo requerido" });
    }

    /* ------------------------------ MySQL --------------------------------- */
    const newResource = await insertResource({
      title,
      description,
      datePublication,
      isActive: Number(isActive) ? 1 : 0,
      filePath: req.file.dropboxUrl,
      idStudent: Number(idStudent),
      idCategory: Number(idCategory),
      idDirector: Number(idDirector),
      idRevisor1: Number(idRevisor1),
      idRevisor2: Number(idRevisor2),
    });

    /* ------------------------------ Mongo --------------------------------- */
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
    });

    return res.status(201).json({ success: true, resource: newResource });
  } catch (err) {
    logger.error(`Error en createResource: ${err.stack || err}`);
    return next(err);
  }
}

/* -------------------------------------------------------------------------- */
/*  READ – GET                                                                */
/* -------------------------------------------------------------------------- */
export async function getResources(_req, res, next) {
  try {
    const resources = await selectAllResources();
    res.json({ success: true, resources });
  } catch (err) {
    logger.error(`Error en getResources: ${err.stack || err}`);
    next(err);
  }
}

export async function getResourceById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const resource = await selectResourceById(id);
    if (!resource) {
      return res
        .status(404)
        .json({ success: false, message: "Recurso no encontrado" });
    }
    res.json({ success: true, resource });
  } catch (err) {
    logger.error(`Error en getResourceById: ${err.stack || err}`);
    next(err);
  }
}

/* -------------------------------------------------------------------------- */
/*  UPDATE – PUT /api/resources/:id                                           */
/* -------------------------------------------------------------------------- */
export async function updateResource(req, res, next) {
  try {
    const id = Number(req.params.id);

    /*  Si el *route* incluye `upload.single("file")` + `uploadToDropbox`,
        podríamos permitir actualizar el fichero.         */
    const updates = { ...req.body };

    if (req.file?.dropboxUrl) {
      updates.filePath = req.file.dropboxUrl;
    }

    const updated = await updateResourceById(id, updates);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Recurso no encontrado" });
    }
    res.json({ success: true, resource: updated });
  } catch (err) {
    logger.error(`Error en updateResource: ${err.stack || err}`);
    next(err);
  }
}

/* -------------------------------------------------------------------------- */
/*  DELETE – DELETE /api/resources/:id                                        */
/* -------------------------------------------------------------------------- */
export async function deleteResource(req, res, next) {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteResourceById(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Recurso no encontrado" });
    }
    res.json({ success: true, message: "Recurso eliminado correctamente" });
  } catch (err) {
    logger.error(`Error en deleteResource: ${err.stack || err}`);
    next(err);
  }
}

/* -------------------------------------------------------------------------- */
/*  EXTRA – GET /api/resources/faculty-and-career/:id                         */
/* -------------------------------------------------------------------------- */
export async function getFacultyAndCareerResource(req, res, next) {
  try {
    const idResource = Number(req.params.id);
    const data = await getFacultyAndCareerByResource(idResource);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Facultad o carrera no encontrada para este recurso",
      });
    }

    res.json({ success: true, data });
  } catch (err) {
    logger.error(`Error en getFacultyAndCareer: ${err.stack || err}`);
    next(err);
  }
}
