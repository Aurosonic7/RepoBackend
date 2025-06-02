import {
  openConnection,
  closeConnection,
} from "../../config/databases/mysql.js";

/* ─────────────── helpers ─────────────────────────────────────────────────── */
/** Devuelve el recurso cuyo filePath coincide (o `null`). */
export async function findResourceByFilePath(filePath) {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT * FROM Resource WHERE filePath = ? LIMIT 1`,
      [filePath]
    );
    return rows[0] ?? null;
  } finally {
    closeConnection(conn);
  }
}
/* ─────────── UPDATE helpers ─────────── */
export async function updateResourceById(id, fields, conn = null) {
  const own = !conn;
  if (own) conn = await openConnection();

  try {
    if (!Object.keys(fields).length)
      // nada que hacer
      return await selectResourceById(id);

    const setSQL = Object.keys(fields)
      .map((k) => `${k} = ?`)
      .join(", ");
    const params = [...Object.values(fields), id];

    const [r] = await conn.query(
      `UPDATE Resource SET ${setSQL} WHERE idResource = ?`,
      params
    );
    if (r.affectedRows === 0) return null;
    const [rows] = await conn.query(
      `SELECT * FROM Resource WHERE idResource = ?`,
      [id]
    );
    return rows[0] ?? null;
  } finally {
    if (own) closeConnection(conn);
  }
}
/* ─────────────── INSERT ──────────────────────────────────────────────────── */
export async function insertResource(data, conn = null) {
  const own = !conn;
  if (own) conn = await openConnection();

  try {
    const {
      title,
      description,
      datePublication,
      filePath,
      imagePath,
      idStudent,
      idCategory,
    } = data;

    const [res] = await conn.query(
      `INSERT INTO Resource (title, description, datePublication, filePath, imagePath, idStudent, idCategory)
        VALUES (?,?,?,?,?,?,?)`,
      [
        title,
        description,
        datePublication,
        filePath,
        imagePath,
        idStudent,
        idCategory,
      ]
    );

    const [rows] = await conn.query(
      `SELECT * FROM Resource WHERE idResource = ?`,
      [res.insertId]
    );
    return rows[0] ?? null;
  } finally {
    if (own) closeConnection(conn);
  }
}
/* ─────────────── SELECT (solo activos) ────────────────────────────── */
/** Devuelve TODOS los recursos activos. */
export async function selectAllActiveResources() {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT * FROM Resource WHERE isActive = 1 ORDER BY idResource DESC`
    );
    return rows;
  } finally {
    closeConnection(conn);
  }
}

/** Devuelve UN recurso activo por id (o `null`). */
export async function selectResourceById(id) {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT * FROM Resource WHERE idResource = ?`,
      [id]
    );
    return rows[0] ?? null;
  } finally {
    closeConnection(conn);
  }
}
/* ─────────── SOFT DELETE / RE-ENABLE ─────────── */
export async function softDeleteResourceById(id, conn = null) {
  return !!(await updateResourceById(id, { isActive: 0 }, conn));
}
export async function enableResourceById(id, conn = null) {
  return !!(await updateResourceById(id, { isActive: 1 }, conn));
}
/* ─────────── HARD DELETE ─────────── */
export async function hardDeleteResourceById(id) {
  const conn = await openConnection();
  try {
    const [r] = await conn.query(`DELETE FROM Resource WHERE idResource = ?`, [
      id,
    ]);
    return r.affectedRows > 0;
  } finally {
    closeConnection(conn);
  }
}
