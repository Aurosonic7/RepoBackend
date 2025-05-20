import { Router } from "express";
import authenticateToken from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";
import { uploadToDropbox } from "../middlewares/uploadToDropbox.js";
import {
  createResource,
  getResources,
  getResourceById,
  disableResource,
  enableResource,
  forceDeleteResource,
} from "../controllers/resource.controller.js";

const router = Router();

router.get("/", getResources);
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
router.get("/:id", authenticateToken, getResourceById);
router.patch("/:id/disable", authenticateToken, disableResource);
router.patch("/:id/enable", authenticateToken, enableResource);
router.delete("/:id/force", authenticateToken, forceDeleteResource);

export default router;
