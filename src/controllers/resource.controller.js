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

export async function createResource(req, res, next) {
  try {
    const {
      title,
      description,
      datePublication,
      isActive,
      filePath,
      idStudent,
      idCategory,
      idDirector,
      idRevisor1,
      idRevisor2,
    } = req.body;

    const newResource = await insertResource({
      title,
      description,
      datePublication,
      isActive,
      filePath,
      idStudent,
      idCategory,
      idDirector,
      idRevisor1,
      idRevisor2,
    });

    res.status(201).json({ success: true, resource: newResource });
  } catch (err) {
    logger.error(`Error en createResource: ${err.stack || err}`);
    next(err);
  }
}

export async function getResources(req, res, next) {
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
    if (!resource)
      return res
        .status(404)
        .json({ success: false, message: "Recurso no encontrado" });
    res.json({ success: true, resource });
  } catch (err) {
    logger.error(`Error en getResourceById: ${err.stack || err}`);
    next(err);
  }
}

export async function updateResource(req, res, next) {
  try {
    const id = Number(req.params.id);
    const updates = req.body; //! puede contener cualesquiera de los campos
    const updated = await updateResourceById(id, updates);
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Recurso no encontrado" });
    res.json({ success: true, resource: updated });
  } catch (err) {
    logger.error(`Error en updateResource: ${err.stack || err}`);
    next(err);
  }
}

export async function deleteResource(req, res, next) {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteResourceById(id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Recurso no encontrado" });
    res.json({ success: true, message: "Recurso eliminado correctamente" });
  } catch (err) {
    logger.error(`Error en deleteResource: ${err.stack || err}`);
    next(err);
  }
}

export async function getFacultyAndCareerResource(req, res, next) {
  try {
    const idResource = Number(req.params.id);
    const data = await getFacultyAndCareerByResource(idResource);

    if (!data)
      return res.status(404).json({
        success: false,
        message: "Facultad o carrera no encontrada para este recurso",
      });

    res.json({ success: true, data });
  } catch (err) {
    logger.error(`Error en getFacultyAndCareer: ${err.stack || err}`);
    next(err);
  }
}
