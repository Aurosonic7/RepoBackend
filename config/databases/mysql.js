import mysql from "mysql2/promise";
import config from "../config.js";
import logger from "../../src/utils/errorHandler.js";

const pool = mysql.createPool({
  host: config.mysql.HOST,
  user: config.mysql.USER,
  password: config.mysql.PASSWORD,
  database: config.mysql.DATABASE,
  port: config.mysql.PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10_000,
});

pool.on("error", (err) => {
  // Ej.: ECONNRESET, PROTOCOL_CONNECTION_LOST, ETIMEDOUT…
  logger.warn(`MySQL pool error: ${err.code}`);
});

export async function openConnection() {
  try {
    const connection = await pool.getConnection();
    try {
      await connection.ping();
    } catch {
      connection.destroy();
      return await pool.getConnection();
    }
    return connection;
  } catch (err) {
    logger.error(`Error al abrir conexión MySQL: ${err.stack || err}`);
    throw err;
  }
}

export function closeConnection(connection) {
  if (!connection) return;
  try {
    connection.release();
  } catch (err) {
    logger.error(`Error al liberar conexión MySQL: ${err.stack || err}`);
  }
}
