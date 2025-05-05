import { Router } from "express";
import authenticateToken from "../middlewares/auth.js";
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller.js";

const router = Router();

router.post("/", authenticateToken, createStudent);
router.get("/", getStudents); //! No authentication needed
router.get("/:id", authenticateToken, getStudentById);
router.put("/:id", authenticateToken, updateStudent);
router.delete("/:id", authenticateToken, deleteStudent);

export default router;
