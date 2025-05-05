import { Router } from "express";
import authenticateToken from "../middlewares/auth.js";
import {
  createCareer,
  getCareers,
  getCareerById,
  updateCareer,
  deleteCareer,
} from "../controllers/career.controller.js";

const router = Router();

router.post("/", authenticateToken, createCareer);
router.get("/", getCareers); //! No authentication needed
router.get("/:id", authenticateToken, getCareerById);
router.put("/:id", authenticateToken, updateCareer);
router.delete("/:id", authenticateToken, deleteCareer);

export default router;
