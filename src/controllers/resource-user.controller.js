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

if (req.query.includeFile === "true") {
  await Promise.all(
    resourceUsers.map(async (r) => {
      // si tiene archivo en Dropbox, creamos URL de descarga y de embed
      if (r.filePath?.startsWith("/files/")) {
        // dl=0
        r.downloadUrl = await getTempLink(r.filePath);
        // raw=1
        r.embedUrl = await getTempLink(r.filePath, true);
      }
      // si tiene imagen de portada, siempre la mostramos como raw=1
      if (r.imagePath?.startsWith("/files/")) {
        r.imageUrl = await getTempLink(r.imagePath, true);
      }
    })
  );
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
