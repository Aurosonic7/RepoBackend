import { Router } from "express";
import authenticateToken from "../middlewares/auth.js";
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  disableStudent,
  enableStudent,
  forceDeleteStudent,
  getFacultyAndCareerStudent,
} from "../controllers/student.controller.js";

const router = Router();

router.post("/", authenticateToken, createStudent);
router.get("/", getStudents);
router.get("/:id", authenticateToken, getStudentById);
router.put("/:id", authenticateToken, updateStudent);

router.patch("/:id/disable", authenticateToken, disableStudent);
router.patch("/:id/enable", authenticateToken, enableStudent);
router.delete("/:id/force", authenticateToken, forceDeleteStudent);

router.get(
  "/faculty-and-career/:id",
  authenticateToken,
  getFacultyAndCareerStudent
);

export default router;
