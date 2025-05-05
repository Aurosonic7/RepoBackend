import { Router } from "express";
import authenticateToken from "../middlewares/auth.js";
import {
  createFaculty,
  getFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
} from "../controllers/faculty.controllers.js";

const router = Router();

router.post("/", authenticateToken, createFaculty);
router.get("/", getFaculties); //! No authentication needed
router.get("/:id", authenticateToken, getFacultyById);
router.put("/:id", authenticateToken, updateFaculty);
router.delete("/:id", authenticateToken, deleteFaculty);

export default router;
