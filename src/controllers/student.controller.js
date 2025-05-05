import logger from "../utils/errorHandler.js";
import {
  insertStudent,
  selectAllStudents,
  selectStudentById,
  updateStudentById,
  deleteStudentById,
} from "../gateways/student.gateway.js";

export async function createStudent(req, res, next) {
  try {
    const { name, isActive, idCareer } = req.body;
    const newStudent = await insertStudent({ name, isActive, idCareer });
    res.status(201).json({ success: true, student: newStudent });
  } catch (err) {
    logger.error(`Error en createStudent: ${err.stack || err}`);
    next(err);
  }
}

export async function getStudents(req, res, next) {
  try {
    const students = await selectAllStudents();
    res.json({ success: true, students });
  } catch (err) {
    logger.error(`Error en getStudents: ${err.stack || err}`);
    next(err);
  }
}

export async function getStudentById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const student = await selectStudentById(id);
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Estudiante no encontrado" });
    res.json({ success: true, student });
  } catch (err) {
    logger.error(`Error en getStudentById: ${err.stack || err}`);
    next(err);
  }
}

export async function updateStudent(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { name, isActive, idCareer } = req.body;
    const updated = await updateStudentById(id, { name, isActive, idCareer });
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Estudiante no encontrado" });
    res.json({ success: true, student: updated });
  } catch (err) {
    logger.error(`Error en updateStudent: ${err.stack || err}`);
    next(err);
  }
}

export async function deleteStudent(req, res, next) {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteStudentById(id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Estudiante no encontrado" });
    res.json({ success: true, message: "Estudiante eliminado" });
  } catch (err) {
    logger.error(`Error en deleteStudent: ${err.stack || err}`);
    next(err);
  }
}
