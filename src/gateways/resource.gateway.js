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
