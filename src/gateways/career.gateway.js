import {
  openConnection,
  closeConnection,
} from "../../config/databases/mysql.js";

export async function insertCareer({ name, idFaculty }) {
  const conn = await openConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO Career (name, idFaculty)
       VALUES (?, ?)`,
      [name, idFaculty]
    );
    const insertId = result.insertId;
    const [rows] = await conn.query(
      `SELECT idCareer, name, idFaculty
       FROM Career
       WHERE idCareer = ?`,
      [insertId]
    );
    return rows[0] || null;
  } finally {
    closeConnection(conn);
  }
}

export async function selectAllCareers() {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT idCareer, name, idFaculty
       FROM Career`
    );
    return rows;
  } finally {
    closeConnection(conn);
  }
}

export async function selectCareerById(id) {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT idCareer, name, idFaculty
       FROM Career
       WHERE idCareer = ?`,
      [id]
    );
    return rows[0] || null;
  } finally {
    closeConnection(conn);
  }
}

export async function updateCareerById(id, { name, idFaculty }) {
  const conn = await openConnection();
  try {
    const fields = [];
    const params = [];
    if (name !== undefined) {
      fields.push("name = ?");
      params.push(name);
    }
    if (idFaculty !== undefined) {
      fields.push("idFaculty = ?");
      params.push(idFaculty);
    }
    if (fields.length === 0) return await selectCareerById(id);
    params.push(id);
    const [result] = await conn.query(
      `UPDATE Career
       SET ${fields.join(", ")}
       WHERE idCareer = ?`,
      params
    );
    if (result.affectedRows === 0) return null;
    return await selectCareerById(id);
  } finally {
    closeConnection(conn);
  }
}

export async function deleteCareerById(id) {
  const conn = await openConnection();
  try {
    const [result] = await conn.query(
      `DELETE FROM Career
       WHERE idCareer = ?`,
      [id]
    );
    return result.affectedRows > 0;
  } finally {
    closeConnection(conn);
  }
}
