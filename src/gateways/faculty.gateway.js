import {
  openConnection,
  closeConnection,
} from "../../config/databases/mysql.js";

export async function insertFaculty({ name }) {
  const conn = await openConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO Faculty (name)
        VALUES (?)`,
      [name]
    );
    const insertId = result.insertId;
    const [rows] = await conn.query(
      `SELECT idFaculty, name
        FROM Faculty
        WHERE idFaculty = ?`,
      [insertId]
    );
    return rows[0] || null;
  } finally {
    closeConnection(conn);
  }
}

export async function selectAllFaculties() {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT idFaculty, name
            FROM Faculty`
    );
    return rows;
  } finally {
    closeConnection(conn);
  }
}

export async function selectFacultyById(id) {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT idFaculty, name
        FROM Faculty
        WHERE idFaculty = ?`,
      [id]
    );
    return rows[0] || null;
  } finally {
    closeConnection(conn);
  }
}

export async function updateFacultyById(id, { name }) {
  const conn = await openConnection();
  try {
    const fields = [];
    const params = [];
    if (name !== undefined) {
      fields.push("name = ?");
      params.push(name);
    }
    if (fields.length === 0) return await selectFacultyById(id);
    params.push(id);
    const [result] = await conn.query(
      `UPDATE Faculty
        SET ${fields.join(", ")}
        WHERE idFaculty = ?`,
      params
    );
    if (result.affectedRows === 0) return null;
    return await selectFacultyById(id);
  } finally {
    closeConnection(conn);
  }
}

export async function deleteFacultyById(id) {
  const conn = await openConnection();
  try {
    const [result] = await conn.query(
      `DELETE FROM Faculty
        WHERE idFaculty = ?`,
      [id]
    );
    return result.affectedRows > 0;
  } finally {
    closeConnection(conn);
  }
}
