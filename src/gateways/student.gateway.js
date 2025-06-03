import {
  openConnection,
  closeConnection,
} from "../../config/databases/mysql.js";

/* ───── helpers ───── */
async function baseQuery(conn, sql, params = []) {
  const [rows] = await conn.query(sql, params);
  return rows;
}

/* ───── CRUD ───── */
export async function insertStudent({ idStudent, name, idCareer }) {
  const conn = await openConnection();
  try {
    const cols = [],
      vals = [],
      params = [];
    if (idStudent !== undefined && idStudent !== null) {
      cols.push("idStudent");
      vals.push("?");
      params.push(idStudent);
    }
    cols.push("name", "idCareer");
    vals.push("?", "?");
    params.push(name, idCareer);

    const [res] = await conn.query(
      `INSERT INTO Student (${cols.join(", ")}) VALUES (${vals.join(", ")})`,
      params
    );
    const newId = idStudent ?? res.insertId;
    return (
      (
        await baseQuery(
          conn,
          `SELECT idStudent, name, isActive, idCareer
              FROM Student WHERE idStudent = ?`,
          [newId]
        )
      )[0] ?? null
    );
  } finally {
    closeConnection(conn);
  }
}

export async function selectAllStudents() {
  const conn = await openConnection();
  try {
    return await baseQuery(
      conn,
      `SELECT idStudent, name, isActive, idCareer
        FROM Student`
    );
  } finally {
    closeConnection(conn);
  }
}

export async function selectStudentById(id) {
  const conn = await openConnection();
  try {
    return (
      (
        await baseQuery(
          conn,
          `SELECT idStudent, name, isActive, idCareer
            FROM Student WHERE idStudent = ?`,
          [id]
        )
      )[0] ?? null
    );
  } finally {
    closeConnection(conn);
  }
}

export async function updateStudentById(id, { name, idCareer, isActive }) {
  const conn = await openConnection();
  try {
    const fields = [];
    const params = [];
    if (name !== undefined) {
      fields.push("name = ?");
      params.push(name);
    }
    if (idCareer !== undefined) {
      fields.push("idCareer = ?");
      params.push(idCareer);
    }
    if (isActive !== undefined) {
      fields.push("isActive = ?");
      params.push(isActive ? 1 : 0);
    }
    if (!fields.length) return await selectStudentById(id);

    params.push(id);
    const [r] = await conn.query(
      `UPDATE Student SET ${fields.join(", ")} WHERE idStudent = ?`,
      params
    );
    if (r.affectedRows === 0) return null;
    return await selectStudentById(id);
  } finally {
    closeConnection(conn);
  }
}

/* ───── Soft-delete & enable ───── */
export async function softDeleteStudentById(id) {
  const conn = await openConnection();
  try {
    const [r] = await conn.query(
      `UPDATE Student SET isActive = 0 WHERE idStudent = ? AND isActive = 1`,
      [id]
    );
    return r.affectedRows > 0;
  } finally {
    closeConnection(conn);
  }
}

export async function enableStudentById(id) {
  const conn = await openConnection();
  try {
    const [r] = await conn.query(
      `UPDATE Student SET isActive = 1 WHERE idStudent = ? AND isActive = 0`,
      [id]
    );
    return r.affectedRows > 0;
  } finally {
    closeConnection(conn);
  }
}

/* ───── Hard-delete ───── */
export async function hardDeleteStudentById(id) {
  const conn = await openConnection();
  try {
    const [r] = await conn.query(`DELETE FROM Student WHERE idStudent = ?`, [
      id,
    ]);
    return r.affectedRows > 0;
  } finally {
    closeConnection(conn);
  }
}

/* ───── Extra (facultad & carrera) ───── */
export async function getFacultyAndCareerByStudent(idStudent) {
  const conn = await openConnection();
  try {
    return (
      (
        await baseQuery(
          conn,
          `
      SELECT f.idFaculty, f.name AS facultyName, c.idCareer, c.name AS careerName
      FROM Student s
      JOIN Career c ON s.idCareer = c.idCareer
      JOIN Faculty f ON c.idFaculty = f.idFaculty
      WHERE s.idStudent = ?`,
          [idStudent]
        )
      )[0] ?? null
    );
  } finally {
    closeConnection(conn);
  }
}
