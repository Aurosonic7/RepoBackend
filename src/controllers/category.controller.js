import logger from "../utils/errorHandler.js";
import {
  insertCategory,
  selectAllCategories,
  selectCategoryById,
  updateCategoryById,
  deleteCategoryById,
} from "../gateways/category.gateway.js";

export async function createCategory(req, res, next) {
  try {
    const { name, description } = req.body;
    const newCategory = await insertCategory({ name, description });
    res.status(201).json({ success: true, category: newCategory });
  } catch (err) {
    logger.error(`Error en createCategory: ${err.stack || err}`);
    next(err);
  }
}

export async function getCategories(req, res, next) {
  try {
    const categories = await selectAllCategories();
    res.json({ success: true, categories });
  } catch (err) {
    logger.error(`Error en getCategories: ${err.stack || err}`);
    next(err);
  }
}

export async function getCategoryById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const category = await selectCategoryById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Categoría no encontrada" });
    }
    res.json({ success: true, category });
  } catch (err) {
    logger.error(`Error en getCategoryById: ${err.stack || err}`);
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;
    const updated = await updateCategoryById(id, { name, description });
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Categoría no encontrada" });
    }
    res.json({ success: true, category: updated });
  } catch (err) {
    logger.error(`Error en updateCategory: ${err.stack || err}`);
    next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteCategoryById(id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Categoría no encontrada" });
    res.json({ success: true, message: "Categoría eliminada correctamente" });
  } catch (err) {
    logger.error(`Error en deleteCategory: ${err.stack || err}`);
    next(err);
  }
}
