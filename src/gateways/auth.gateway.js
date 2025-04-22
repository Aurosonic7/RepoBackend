import {
  openConnection,
  closeConnection,
} from "../../config/databases/mysql.js";

export async function findUserByEmail(email) {
  const conn = await openConnection();
  try {
    const [rows] = await conn.execute(
      `SELECT idUser, name, email, password, rol, isActive
       FROM User
       WHERE email = ?`,
      [email]
    );
    return rows.length ? rows[0] : null;
  } finally {
    closeConnection(conn);
  }
}

export async function createUser({ name, email, password }) {
  const conn = await openConnection();
  try {
    const [result] = await conn.execute(
      `INSERT INTO User (name, email, password, rol, isActive)
       VALUES (?, ?, ?, 'user', TRUE)`,
      [name, email, password]
    );
    return {
      idUser: result.insertId,
      name,
      email,
      rol: "user",
      isActive: true,
    };
  } finally {
    closeConnection(conn);
  }
}
