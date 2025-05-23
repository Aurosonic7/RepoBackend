// src/controllers/resource-user.controller.js

import logger from "../utils/errorHandler.js";
import {
  insertResourceUser,
  selectAllResourceUser,
  selectResourcesByUser,
  selectUsersByResource,
  selectAllResourcesByUser,
  selectAllUserByResource,
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

export async function getAllResourceUser(req, res, next) {
  try {
    const resourceUsers = await selectAllResourceUser();

    if (req.query.includeFile === "true") {
      await Promise.all(
        resourceUsers.map(async (rel) => {
          // PDF / archivo principal: downloadUrl (dl=0) + embedUrl (raw=1)
          if (rel.filePath?.startsWith("/files/")) {
            rel.downloadUrl = await getTempLink(rel.filePath, false);
            rel.embedUrl = await getTempLink(rel.filePath, true);
          }
          // imagen de portada: siempre raw=1
          if (rel.imagePath?.startsWith("/files/")) {
            rel.imageUrl = await getTempLink(rel.imagePath, true);
          }
        })
      );
    }

    return res.json({ success: true, resourceUsers });
  } catch (err) {
    logger.error(`Error en getAllResourceUser: ${err.stack || err}`);
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

export async function getAllResourcesByUser(req, res, next) {
  try {
    const resources = await selectAllResourcesByUser();
    res.json({ success: true, resources });
  } catch (err) {
    logger.error(`Error en getAllResourcesByUser: ${err.stack || err}`);
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

export async function getAllUsersByResource(req, res, next) {
  try {
    const users = await selectAllUserByResource();
    res.json({ success: true, users });
  } catch (err) {
    logger.error(`Error en getAllUsersByResource: ${err.stack || err}`);
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
