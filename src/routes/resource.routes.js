import { Router } from "express";
import authenticateToken from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";
import { uploadToDropbox } from "../middlewares/uploadToDropbox.js";
import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  enableResource, //* (soft‑delete)
  disableResource, //* (soft‑delete)
  forceDeleteResource, //* (hard‑delete)
  getFacultyAndCareerResource,
} from "../controllers/resource.controller.js";

const router = Router();

router.post(
  "/",
  authenticateToken,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  uploadToDropbox,
  createResource
);
router.get("/", getResources); //! No authentication needed
router.get("/:id", authenticateToken, getResourceById);
router.put("/:id", authenticateToken, updateResource);

router.patch("/:id/enable", authenticateToken, enableResource);
router.patch("/:id/disable", authenticateToken, disableResource); //! borrado lógico
router.delete("/:id/force", authenticateToken, forceDeleteResource); //! borrado definitivo

router.get(
  "/facultyAndCareer/:id",
  authenticateToken,
  getFacultyAndCareerResource
);

export default router;
