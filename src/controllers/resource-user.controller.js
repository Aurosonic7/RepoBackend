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
import { getTempLink } from "../utils/dropbox.js"; // ← NUEVO

/* ───────── Helper: agrega downloadUrl / embedUrl / imageUrl ───────── */
async function attachFileLinks(obj) {
  // Algunas consultas devuelven columnas con estos nombres;
  // asegúrate de que los SELECT incluyan filePath / imagePath. 🔎
  if (obj.filePath?.startsWith("/files/")) {
    obj.downloadUrl = await getTempLink(obj.filePath, false); // dl=0
    obj.embedUrl = await getTempLink(obj.filePath, true); // raw=1
  }
  if (obj.imagePath?.startsWith("/files/")) {
    obj.imageUrl = await getTempLink(obj.imagePath, true); // raw=1
  }
  return obj;
}

/*────────────────────  POST /api/resource-user  ────────────────────*/
export async function createResourceUser(req, res, next) {
  try {
    const { idUser, idResource } = req.body;
    const created = await insertResourceUser({ idUser, idResource });
    res.status(201).json({ success: true, resourceUser: created });
  } catch (err) {
    logger.error(`createResourceUser FAILED ⇒ ${err.stack || err}`);
    next(err);
  }
}

/*────────────────────  GET /api/resource-user  ─────────────────────*/
export async function getAllResourceUser(req, res, next) {
  try {
    let list = await selectAllResourceUser();

    if (req.query.includeFile === "true") {
      list = await Promise.all(list.map(attachFileLinks));
    }
    res.json({ success: true, resourceUsers: list });
  } catch (err) {
    logger.error(`getAllResourceUser FAILED ⇒ ${err.stack || err}`);
    next(err);
  }
}

/*────────────  GET /api/resource-user/user/:idUser  ────────────────*/
export async function getResourcesByUser(req, res, next) {
  try {
    const idUser = +req.params.idUser;
    let resources = await selectResourcesByUser(idUser);

    if (req.query.includeFile === "true") {
      resources = await Promise.all(resources.map(attachFileLinks));
    }
    res.json({ success: true, resources });
  } catch (err) {
    logger.error(`getResourcesByUser FAILED ⇒ ${err.stack || err}`);
    next(err);
  }
}

/*────────────  GET /api/resource-user/all-resources  ───────────────*/
export async function getAllResourcesByUser(req, res, next) {
  try {
    let resources = await selectAllResourcesByUser();

    if (req.query.includeFile === "true") {
      resources = await Promise.all(resources.map(attachFileLinks));
    }
    res.json({ success: true, resources });
  } catch (err) {
    logger.error(`getAllResourcesByUser FAILED ⇒ ${err.stack || err}`);
    next(err);
  }
}

/*────────────  GET /api/resource-user/resource/:idResource/users  ──*/
export async function getUsersByResource(req, res, next) {
  try {
    const idResource = +req.params.idResource;
    const users = await selectUsersByResource(idResource); // no devuelve paths
    res.json({ success: true, users });
  } catch (err) {
    logger.error(`getUsersByResource FAILED ⇒ ${err.stack || err}`);
    next(err);
  }
}

/*────────────  GET /api/resource-user/all-users  ───────────────────*/
export async function getAllUsersByResource(req, res, next) {
  try {
    const users = await selectAllUserByResource();
    res.json({ success: true, users });
  } catch (err) {
    logger.error(`getAllUsersByResource FAILED ⇒ ${err.stack || err}`);
    next(err);
  }
}

/*────────────  DELETE /api/resource-user/:idUser/:idResource  ──────*/
export async function deleteResourceUser(req, res, next) {
  try {
    const idUser = +req.params.idUser;
    const idResource = +req.params.idResource;

    const removed = await deleteResourceUserByIds(idUser, idResource);
    if (!removed)
      return res
        .status(404)
        .json({ success: false, message: "Asociación no encontrada" });

    res.json({ success: true, message: "Asociación eliminada correctamente" });
  } catch (err) {
    logger.error(`deleteResourceUser FAILED ⇒ ${err.stack || err}`);
    next(err);
  }
}
