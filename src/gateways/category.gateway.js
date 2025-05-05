import {
  openConnection,
  closeConnection,
} from "../../config/databases/mysql.js";

export async function insertCategory({ name, description }) {
  const conn = await openConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO Category (name, description)
       VALUES (?, ?)`,
      [name, description]
    );
    const insertId = result.insertId;
    const [rows] = await conn.query(
      `SELECT idCategory, name, description
       FROM Category
       WHERE idCategory = ?`,
      [insertId]
    );
    return rows[0] || null;
  } finally {
    closeConnection(conn);
  }
}

export async function selectAllCategories() {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT idCategory, name, description
       FROM Category`
    );
    return rows;
  } finally {
    closeConnection(conn);
  }
}

export async function selectCategoryById(id) {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT idCategory, name, description
       FROM Category
       WHERE idCategory = ?`,
      [id]
    );
    return rows[0] || null;
  } finally {
    closeConnection(conn);
  }
}

export async function updateCategoryById(id, { name, description }) {
  const conn = await openConnection();
  try {
    const fields = [];
    const params = [];
    if (name !== undefined) {
      fields.push("name = ?");
      params.push(name);
    }
    if (description !== undefined) {
      fields.push("description = ?");
      params.push(description);
    }
    if (fields.length === 0) return await selectCategoryById(id);
    params.push(id);
    const [result] = await conn.query(
      `UPDATE Category
       SET ${fields.join(", ")}
       WHERE idCategory = ?`,
      params
    );
    if (result.affectedRows === 0) return null;
    return await selectCategoryById(id);
  } finally {
    closeConnection(conn);
  }
}

export async function deleteCategoryById(id) {
  const conn = await openConnection();
  try {
    const [result] = await conn.query(
      `DELETE FROM Category
       WHERE idCategory = ?`,
      [id]
    );
    return result.affectedRows > 0;
  } finally {
    closeConnection(conn);
  }
}
