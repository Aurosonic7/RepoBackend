import bcrypt from "bcryptjs";
import logger from "../utils/errorHandler.js";
import {
  findUserByEmail,
  insertUser,
  selectAllUsers,
  selectUserById,
  updateUserById,
  deleteUserById,
} from "../gateways/user.gateway.js";

export async function createUser(req, res, next) {
  try {
    const { name, email, password, rol } = req.body;

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
    const newUser = await insertUser({
      name,
      email,
      password: hashed,
      rol: rol || "user",
      isActive: 1,
    });

    // 4) Responder con el usuario creado (sin password)
    return res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    logger.error(`Error en createUser: ${error.stack || error}`);
    return next(error);
  }
}

export async function getUsers(req, res, next) {
  try {
    const users = await selectAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    logger.error(`Error en getUsers: ${error.stack || error}`);
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const user = await selectUserById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario  no encontrado" });
    }
    res.json({ success: true, user });
  } catch (error) {
    logger.error(`Error en getUserById: ${error.stack || error}`);
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    const updates = req.body;
    const updated = await updateUserById(id, updates);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }
    res.json({ success: true, user: updated });
  } catch (error) {
    logger.error(`Error en updateUser: ${error.stack || error}`);
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteUserById(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }
    res.json({ success: true, message: "Usuario eliminado" });
  } catch (error) {
    logger.error(`Error en deleteUser: ${error.stack || error}`);
    next(error);
  }
}
