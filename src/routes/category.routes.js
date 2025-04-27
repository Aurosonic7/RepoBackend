import { Router } from "express";
import authenticateToken from "../middlewares/auth.js";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = Router();

router.post("/", authenticateToken, createCategory);
router.get("/", authenticateToken, getCategories);
router.get("/:id", authenticateToken, getCategoryById);
router.put("/:id", authenticateToken, updateCategory);
router.delete("/:id", authenticateToken, deleteCategory);

export default router;
