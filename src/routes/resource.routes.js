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
  (req, _res, next) => {
    console.log("req.files keys ⇒", Object.keys(req.files || {}));
    next();
  },
  uploadToDropbox,
  createResource
);

export default router;
