import {
  openConnection,
  closeConnection,
} from "../../config/databases/mysql.js";

export async function findUserByEmail(email) {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT idUser, name, email, isActive
      FROM User
      WHERE email = ?`,
      [email]
    );
    return rows.length ? rows[0] : null;
  } finally {
    closeConnection(conn);
  }
}

export async function insertUser({ name, email, password, rol, isActive }) {
  const conn = await openConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO User (name, email, password, rol, isActive)
        VALUES (?, ?, ?, ?, ?)`,
      [name, email, password, rol, isActive]
    );
    const insertId = result.insertId;
    const [rows] = await conn.query(
      `SELECT idUser, name, email, password, rol, isActive
        FROM User
        WHERE idUser = ?`,
      [insertId]
    );
    return rows[0] || null;
  } finally {
    closeConnection(conn);
  }
}

export async function selectAllUsers() {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT idUser, name, email, password, rol, isActive
        FROM User`
    );
    return rows;
  } finally {
    closeConnection(conn);
  }
}

export async function selectUserById(id) {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT idUser, name, email, password, rol, isActive
        FROM User
        WHERE idUser = ?`,
      [id]
    );
    return rows[0] || null;
  } finally {
    closeConnection(conn);
  }
}

export async function updateUserById(
  id,
  { name, email, password, rol, isActive }
) {
  const conn = await openConnection();
  try {
    const fields = [];
    const params = [];
    if (name !== undefined) {
      fields.push("name = ?");
      params.push(name);
    }
    if (email !== undefined) {
      fields.push("email = ?");
      params.push(email);
    }
    if (password !== undefined) {
      fields.push("password = ?");
      params.push(password);
    }
    if (rol !== undefined) {
      fields.push("rol = ?");
      params.push(rol);
    }
    if (isActive !== undefined) {
      fields.push("isActive = ?");
      params.push(isActive);
    }
    if (fields.length === 0) return await selectUserById(id);
    params.push(id);
    const [result] = await conn.query(
      `UPDATE User
        SET ${fields.join(", ")}
        WHERE idUser = ?`,
      params
    );
    if (result.affectedRows === 0) return null;
    return await selectUserById(id);
  } finally {
    closeConnection(conn);
  }
}

export async function deleteUserById(id) {
  const conn = await openConnection();
  try {
    const [result] = await conn.query(
      `DELETE FROM User
        WHERE idUser = ?`,
      [id]
    );
    return result.affectedRows > 0;
  } finally {
    closeConnection(conn);
  }
}
