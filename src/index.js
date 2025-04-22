import expressApp from "./server.js";
import config from "../config/config.js";
import { openConnection, closeConnection } from "../config/databases/mysql.js";
import { connectMongo } from "../config/databases/mongo.js";
import logger from "./utils/errorHandler.js";

expressApp.get("/api", (req, res) => {
  res.json({ message: "Server is running..." });
});

async function main() {
  try {
    const conn = await openConnection();
    await conn.ping();
    closeConnection(conn);
    logger.info("Conexión exitosa a MySQL");
  } catch (err) {
    logger.warn(`No se pudo conectar a MySQL: ${err.message}`);
  }

  try {
    await connectMongo();
    logger.info("Conexión exitosa a MongoDB");
  } catch (err) {
    logger.warn(`No se pudo conectar a MongoDB: ${err.message}`);
  }

  expressApp.listen(config.app.port, () => {
    logger.info(
      `Servidor escuchando en http://localhost:${config.app.port}/api`
    );
  });
}

main();
