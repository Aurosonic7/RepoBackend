import logger from "../utils/errorHandler.js";
import {
  insertStudent,
  selectAllStudents,
  selectStudentById,
  updateStudentById,
  softDeleteStudentById,
  enableStudentById,
  hardDeleteStudentById,
  getFacultyAndCareerByStudent,
} from "../gateways/student.gateway.js";

/* create ---------------------------------------------------- */
export async function createStudent(req, res, next) {
  try {
    const { name, idCareer } = req.body;
    const s = await insertStudent({ name, idCareer });
    res.status(201).json({ success: true, student: s });
  } catch (e) {
    logger.error(e);
    next(e);
  }
}

/* list (todos) ---------------------------------------------- */
export async function getStudents(_req, res, next) {
  try {
    res.json({ success: true, students: await selectAllStudents() });
  } catch (e) {
    logger.error(e);
    next(e);
  }
}

/* single (activo) ------------------------------------------ */
export async function getStudentById(req, res, next) {
  try {
    const st = await selectStudentById(+req.params.id);
    if (!st)
      return res
        .status(404)
        .json({ success: false, message: "Estudiante no encontrado" });
    res.json({ success: true, student: st });
  } catch (e) {
    logger.error(e);
    next(e);
  }
}

/* update --------------------------------------------------- */
export async function updateStudent(req, res, next) {
  try {
    const up = await updateStudentById(+req.params.id, req.body);
    if (!up)
      return res
        .status(404)
        .json({ success: false, message: "Estudiante no encontrado" });
    res.json({ success: true, student: up });
  } catch (e) {
    logger.error(e);
    next(e);
  }
}

/* SOFT-DELETE ---------------------------------------------- */
export async function disableStudent(req, res, next) {
  try {
    const ok = await softDeleteStudentById(+req.params.id);
    if (!ok)
      return res.status(404).json({
        success: false,
        message: "Estudiante no encontrado o ya inactivo",
      });
    res.json({ success: true, message: "Estudiante deshabilitado" });
  } catch (e) {
    logger.error(e);
    next(e);
  }
}

/* ENABLE ---------------------------------------------------- */
export async function enableStudent(req, res, next) {
  try {
    const ok = await enableStudentById(+req.params.id);
    if (!ok)
      return res.status(404).json({
        success: false,
        message: "Estudiante no encontrado o ya activo",
      });
    res.json({ success: true, message: "Estudiante habilitado" });
  } catch (e) {
    logger.error(e);
    next(e);
  }
}

/* HARD-DELETE ---------------------------------------------- */
export async function forceDeleteStudent(req, res, next) {
  try {
    const ok = await hardDeleteStudentById(+req.params.id);
    if (!ok)
      return res
        .status(404)
        .json({ success: false, message: "Estudiante no encontrado" });
    res.json({
      success: true,
      message: "Estudiante eliminado definitivamente",
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
}

/* extra ----------------------------------------------------- */
export async function getFacultyAndCareerStudent(req, res, next) {
  try {
    const d = await getFacultyAndCareerByStudent(+req.params.id);
    if (!d)
      return res.status(404).json({ success: false, message: "No encontrado" });
    res.json({ success: true, facultyAndCareer: d });
  } catch (e) {
    logger.error(e);
    next(e);
  }
}
