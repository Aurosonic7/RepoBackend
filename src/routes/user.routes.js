import { Router } from "express";
import authenticateToken from "../middlewares/auth.js";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

const router = Router();

router.post("/", authenticateToken, createUser);
router.get("/", getUsers); //! No authentication needed
router.get("/:id", authenticateToken, getUserById);
router.put("/:id", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, deleteUser);

export default router;
