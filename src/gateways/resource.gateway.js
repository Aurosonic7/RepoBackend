import {
  openConnection,
  closeConnection,
} from "../../config/databases/mysql.js";

/* ───────────────────────── INSERT ───────────────────────── */
export async function insertResource(data, conn = null) {
  const own = !conn;
  if (own) conn = await openConnection();

  try {
    const {
      title,
      description,
      datePublication,
      isActive = true,
      filePath,
      idStudent,
      idCategory,
      idDirector,
      idRevisor1,
      idRevisor2,
    } = data;

    const [result] = await conn.query(
      `INSERT INTO Resource
       (title, description, datePublication, isActive, filePath,
        idStudent, idCategory, idDirector, idRevisor1, idRevisor2)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        title,
        description,
        datePublication,
        Number(isActive) ? 1 : 0,
        filePath,
        idStudent,
        idCategory,
        idDirector,
        idRevisor1,
        idRevisor2,
      ]
    );

    const [rows] = await conn.query(
      `SELECT * FROM Resource WHERE idResource = ?`,
      [result.insertId]
    );
    return rows[0] || null;
  } finally {
    if (own) closeConnection(conn);
  }
}

/* ───────────────────────── SELECTS ──────────────────────── */
export async function selectAllResources() {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT * FROM Resource WHERE isActive = 1`
    );
    return rows;
  } finally {
    closeConnection(conn);
  }
}

export async function selectResourceById(id) {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT * FROM Resource WHERE idResource = ?`,
      [id]
    );
    return rows[0] || null;
  } finally {
    closeConnection(conn);
  }
}

export async function selectActiveResourceById(id) {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT * FROM Resource WHERE idResource = ? AND isActive = 1`,
      [id]
    );
    return rows[0] || null;
  } finally {
    closeConnection(conn);
  }
}

/* ─────────────────── UPDATE & PHYSICAL DELETE ───────────── */
export async function updateResourceById(id, fields, conn = null) {
  const own = !conn;
  if (own) conn = await openConnection();

  try {
    const keys = Object.keys(fields);
    if (!keys.length) return await selectResourceById(id);

    const set = keys.map((k) => `${k} = ?`).join(", ");
    const params = [...keys.map((k) => fields[k]), id];

    const [r] = await conn.query(
      `UPDATE Resource SET ${set} WHERE idResource = ?`,
      params
    );
    if (r.affectedRows === 0) return null;
    return await selectResourceById(id);
  } finally {
    if (own) closeConnection(conn);
  }
}

export async function hardDeleteResourceById(id, conn = null) {
  const own = !conn;
  if (own) conn = await openConnection();

  try {
    const [r] = await conn.query(`DELETE FROM Resource WHERE idResource = ?`, [
      id,
    ]);
    return r.affectedRows > 0;
  } finally {
    if (own) closeConnection(conn);
  }
}

/* ─────────────────────── SOFT DELETE ────────────────────── */
export async function softDeleteResourceById(id, conn = null) {
  const result = await updateResourceById(id, { isActive: 0 }, conn);
  return !!result;
}

/* ─────────────────────── RE‑ENABLE ──────────────────────── */
export async function enableResourceById(id, conn = null) {
  const result = await updateResourceById(id, { isActive: 1 }, conn);
  return !!result;
}

/* ───────────────────────── EXTRA ────────────────────────── */
export async function getFacultyAndCareerByResource(idResource) {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT f.idFaculty, f.name facultyName,
              c.idCareer, c.name careerName
       FROM Resource r
       JOIN Student s ON r.idStudent = s.idStudent
       JOIN Career  c ON s.idCareer  = c.idCareer
       JOIN Faculty f ON c.idFaculty = f.idFaculty
       WHERE r.idResource = ?`,
      [idResource]
    );
    return rows[0] || null;
  } finally {
    closeConnection(conn);
  }
}
