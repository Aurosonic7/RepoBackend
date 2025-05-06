import logger from "../utils/errorHandler.js";
import {
  insertFaculty,
  selectAllFaculties,
  selectFacultyById,
  updateFacultyById,
  deleteFacultyById,
} from "../gateways/faculty.gateway.js";

export async function createFaculty(req, res, next) {
  try {
    const { name } = req.body;
    const newFaculty = await insertFaculty({ name });
    res.status(201).json({ sucess: true, faculty: newFaculty });
  } catch (error) {
    logger.error(`Error en createFaculty: ${error.stack || error}`);
    return next(error);
  }
}

export async function getFaculties(req, res, next) {
  try {
    const faculties = await selectAllFaculties();
    res.json({ success: true, faculties });
  } catch (error) {
    logger.error(`Error en getFaculties: ${error.stack || error}`);
    next(error);
  }
}

export async function getFacultyById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const faculty = await selectFacultyById(id);
    if (!faculty)
      return res
        .status(404)
        .json({ success: false, message: "Facultad no encontrada" });
    res.json({ success: true, faculty });
  } catch (error) {
    logger.error(`Error en getFacultyById: ${error.stack || error}`);
    next(error);
  }
}

export async function updateFaculty(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;
    const updated = await updateFacultyById(id, { name });
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Facultad no encontrada" });
    res.json({ success: true, faculty: updated });
  } catch (error) {
    logger.error(`Error en updateFaculty: ${error.stack || error}`);
    next(error);
  }
}

export async function deleteFaculty(req, res, next) {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteFacultyById(id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Facultad no encontrada" });
    res.json({ success: true, message: "Facultad eliminada" });
  } catch (error) {
    logger.error(`Error en deleteFaculty: ${error.stack || error}`);
    next(error);
  }
}
