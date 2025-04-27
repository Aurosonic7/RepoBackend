// src/controllers/resource-user.controller.js

import logger from "../utils/errorHandler.js";
import {
  insertResourceUser,
  selectResourcesByUser,
  selectUsersByResource,
  deleteResourceUserByIds,
} from "../gateways/resource-user.gateway.js";

export async function createResourceUser(req, res, next) {
  try {
    const { idUser, idResource } = req.body;
    const created = await insertResourceUser({ idUser, idResource });
    res.status(201).json({ success: true, resourceUser: created });
  } catch (err) {
    logger.error(`Error en createResourceUser: ${err.stack || err}`);
    next(err);
  }
}

export async function getResourcesByUser(req, res, next) {
  try {
    const idUser = Number(req.params.idUser);
    const resources = await selectResourcesByUser(idUser);
    res.json({ success: true, resources });
  } catch (err) {
    logger.error(`Error en getResourcesByUser: ${err.stack || err}`);
    next(err);
  }
}

export async function getUsersByResource(req, res, next) {
  try {
    const idResource = Number(req.params.idResource);
    const users = await selectUsersByResource(idResource);
    res.json({ success: true, users });
  } catch (err) {
    logger.error(`Error en getUsersByResource: ${err.stack || err}`);
    next(err);
  }
}

export async function deleteResourceUser(req, res, next) {
  try {
    const idUser = Number(req.params.idUser);
    const idResource = Number(req.params.idResource);
    const removed = await deleteResourceUserByIds(idUser, idResource);
    if (!removed) {
      return res
        .status(404)
        .json({ success: false, message: "Asociación no encontrada" });
    }
    res.json({ success: true, message: "Asociación eliminada correctamente" });
  } catch (err) {
    logger.error(`Error en deleteResourceUser: ${err.stack || err}`);
    next(err);
  }
}
