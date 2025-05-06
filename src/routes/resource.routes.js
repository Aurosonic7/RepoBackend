import { Router } from "express";
import authenticateToken from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";
import { uploadToDropbox } from "../middlewares/uploadToDropbox.js";
import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
  getFacultyAndCareerResource,
} from "../controllers/resource.controller.js";

const router = Router();

router.post(
  "/",
  authenticateToken,
  upload.single("file"),
  uploadToDropbox,
  createResource
);
router.get("/", getResources); //! No authentication needed
router.get("/:id", authenticateToken, getResourceById);
router.put("/:id", authenticateToken, updateResource);
router.delete("/:id", authenticateToken, deleteResource);
router.get(
  "/faculty-and-career/:id",
  authenticateToken,
  getFacultyAndCareerResource
);

export default router;
