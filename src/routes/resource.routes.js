import { Router } from "express";
import authenticateToken from "../middlewares/auth.js";
import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
} from "../controllers/resource.controller.js";

const router = Router();

router.post("/", authenticateToken, createResource);
router.get("/", authenticateToken, getResources);
router.get("/:id", authenticateToken, getResourceById);
router.put("/:id", authenticateToken, updateResource);
router.delete("/:id", authenticateToken, deleteResource);

export default router;
