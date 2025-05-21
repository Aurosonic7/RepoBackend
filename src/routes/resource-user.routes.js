// src/routes/resource-user.routes.js
import { Router } from "express";
import authenticateToken from "../middlewares/auth.js";
import {
  createResourceUser,
  getAllResourceUser,
  getResourcesByUser,
  getUsersByResource,
  deleteResourceUser,
  getAllResourcesByUser,
  getAllUsersByResource,
} from "../controllers/resource-user.controller.js";

const router = Router();

router.post("/", authenticateToken, createResourceUser);
router.get("/", getAllResourceUser);
router.get("/user/:idUser", authenticateToken, getResourcesByUser);
router.get("/resource/:idResource", getUsersByResource);
router.delete("/:idUser/:idResource", deleteResourceUser);
router.get("/user", getAllResourcesByUser);
router.get("/resource", getAllUsersByResource);

export default router;
