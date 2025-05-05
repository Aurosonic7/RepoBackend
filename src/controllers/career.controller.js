import logger from "../utils/errorHandler.js";
import {
  insertCareer,
  selectAllCareers,
  selectCareerById,
  updateCareerById,
  deleteCareerById,
} from "../gateways/career.gateway.js";

export async function createCareer(req, res, next) {
  try {
    const { name, idFaculty } = req.body;
    const newCareer = await insertCareer({ name, idFaculty });
    res.status(201).json({ success: true, career: newCareer });
  } catch (err) {
    logger.error(`Error en createCareer: ${err.stack || err}`);
    next(err);
  }
}

export async function getCareers(req, res, next) {
  try {
    const careers = await selectAllCareers();
    res.json({ success: true, careers });
  } catch (err) {
    logger.error(`Error en getCareers: ${err.stack || err}`);
    next(err);
  }
}

export async function getCareerById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const career = await selectCareerById(id);
    if (!career)
      return res
        .status(404)
        .json({ success: false, message: "Carrera no encontrada" });
    res.json({ success: true, career });
  } catch (err) {
    logger.error(`Error en getCareerById: ${err.stack || err}`);
    next(err);
  }
}

export async function updateCareer(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { name, idFaculty } = req.body;
    const updated = await updateCareerById(id, { name, idFaculty });
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Carrera no encontrada" });
    res.json({ success: true, career: updated });
  } catch (err) {
    logger.error(`Error en updateCareer: ${err.stack || err}`);
    next(err);
  }
}

export async function deleteCareer(req, res, next) {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteCareerById(id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Carrera no encontrada" });
    res.json({ success: true, message: "Carrera eliminada correctamente" });
  } catch (err) {
    logger.error(`Error en deleteCareer: ${err.stack || err}`);
    next(err);
  }
}
