import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  logout,
  verifyToken,
} from "../controllers/auth.controller.js";
import authenticateToken from "../middlewares/auth.js";
import validationMiddleware from "../middlewares/validator.js";

const router = Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("Debes proporcionar un email válido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    validationMiddleware,
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Debes proporcionar un email válido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
    validationMiddleware,
  ],
  login
);

router.post("/logout", authenticateToken, logout);
router.get("/verify", verifyToken);

export default router;
