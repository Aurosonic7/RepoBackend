// src/routes/resource-user.routes.js
import { Router } from "express";
import authenticateToken from "../middlewares/auth.js";
import {
  createResourceUser,
  getResourcesByUser,
  getUsersByResource,
  deleteResourceUser,
} from "../controllers/resource-user.controller.js";

const router = Router();

router.post("/", authenticateToken, createResourceUser);
router.get("/user/:idUser", authenticateToken, getResourcesByUser);
router.get("/resource/:idResource", authenticateToken, getUsersByResource);
router.delete("/:idUser/:idResource", authenticateToken, deleteResourceUser);

export default router;
