
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config/config.js";
import logger from "../utils/errorHandler.js";
import { findUserByEmail, createUser } from "../gateways/auth.gateway.js";

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // 1) Verificar que no exista ya
    const existing = await findUserByEmail(email);
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email ya registrado" });
    }

    // 2) Hash de la contraseña
    const hashed = await bcrypt.hash(password, 10);

    // 3) Crear usuario
    const newUser = await createUser({ name, email, password: hashed });

    // 4) Responder con el usuario creado (sin password)
    return res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    logger.error(`Error en register: ${err.stack || err}`);
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // 1) Buscar usuario y estado activo
    const user = await findUserByEmail(email);
    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Usuario o contraseña incorrectos" });
    }

    // 2) Verificar contraseña
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res
        .status(401)
        .json({ success: false, message: "Usuario o contraseña incorrectos" });
    }

    // 3) Firmar JWT
    const payload = {
      idUser: user.idUser,
      email: user.email,
      name: user.name,
      rol: user.rol,
    };
    const token = jwt.sign(payload, config.app.jwtSecret, {
      expiresIn: "8h",
    });

    // 4) Enviar cookie con el token (no lo devolvemos en JSON)
    res
      .cookie("token", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 8 * 60 * 60 * 1000, // 8 horas
      })
      .json({
        success: true,
        user: {
          idUser: user.idUser,
          name: user.name,
          email: user.email,
          rol: user.rol,
        },
      });
  } catch (err) {
    logger.error(`Error en login: ${err.stack || err}`);
    return next(err);
  }
}

export const verifyToken = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No se proporcionó token" 
      });
    }

    jwt.verify(token, config.app.jwtSecret, async (error, user) => {
      console.log("Verificando token:", user);
      if (error) {
        return res.status(401).json({ 
          success: false, 
          message: "Token inválido o caducado" 
        });
      }

      const userFound = await findUserByEmail(user.email || '');
      if (!userFound || !userFound.isActive) {
        return res.status(401).json({ 
          success: false, 
          message: "Usuario no encontrado o inactivo" 
        });
      }

      return res.json({
        success: true,
        user: {
          idUser: userFound.idUser,
          name: userFound.name,
          email: userFound.email,
          rol: userFound.rol
        }
      });
    });
  } catch (err) {
    logger.error(`Error en verifyToken: ${err.stack || err}`);
    return next(err);
  }
};

export function logout(req, res) {
  // 1) Limpia la cookie 'token'
  res
    .clearCookie("token", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
    .json({ success: true, message: "Logout exitoso" });
}
