import {
  openConnection,
  closeConnection,
} from "../../config/databases/mysql.js";

export async function insertResourceUser({ idUser, idResource }) {
  const conn = await openConnection();
  try {
    await conn.query(
      `INSERT INTO ResourceUser (idUser, idResource)
       VALUES (?, ?)`,
      [idUser, idResource]
    );
    return { idUser, idResource };
  } finally {
    closeConnection(conn);
  }
}

export async function selectResourcesByUser(idUser) {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT r.*
       FROM ResourceUser ru
       JOIN Resource r ON ru.idResource = r.idResource
       WHERE ru.idUser = ?`,
      [idUser]
    );
    return rows;
  } finally {
    closeConnection(conn);
  }
}

export async function selectUsersByResource(idResource) {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT u.idUser, u.name, u.email, u.rol, u.isActive
       FROM ResourceUser ru
       JOIN \`User\` u ON ru.idUser = u.idUser
       WHERE ru.idResource = ?`,
      [idResource]
    );
    return rows;
  } finally {
    closeConnection(conn);
  }
}

export async function deleteResourceUserByIds(idUser, idResource) {
  const conn = await openConnection();
  try {
    const [result] = await conn.query(
      `DELETE FROM ResourceUser
       WHERE idUser = ? AND idResource = ?`,
      [idUser, idResource]
    );
    return result.affectedRows > 0;
  } finally {
    closeConnection(conn);
  }
}
