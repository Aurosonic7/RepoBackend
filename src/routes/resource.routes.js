import { Router } from "express";
import authenticateToken from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";
import { uploadToDropbox } from "../middlewares/uploadToDropbox.js";
import { createResource } from "../controllers/resource.controller.js";

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

export default router;
