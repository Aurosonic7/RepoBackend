import express from "express";

import { corsMiddleware } from "./middlewares/cors.js";
import { securityMiddleware } from "./middlewares/security.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";
import { compressionMiddleware } from "./middlewares/compression.js";
import { requestIdMiddleware } from "./middlewares/requestId.js";
import { morganMiddleware } from "./middlewares/logger.js";
import cookieParser from "cookie-parser";

import config from "../config/config.js";
import { openConnection, closeConnection } from "../config/databases/mysql.js";
import { connectMongo, disconnectMongo } from "../config/databases/mongo.js";
import logger, { notFoundHandler, errorHandler } from "./utils/errorHandler.js";
import { ensureMigrationsDir, runMigrations } from "./utils/migrations.js";

import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import careerRoutes from "./routes/career.routes.js";
import resourceRoutes from "./routes/resource.routes.js";
import resourceUserRoutes from "./routes/resource-user.routes.js";

//! ─── Asegurar carpeta de migraciones ─────────────────────────────────────────────
ensureMigrationsDir();

const app = express();

//? ─── Middlewares ────────────────────────────────────────────────────────────────
app.use(corsMiddleware);
app.use(securityMiddleware);
app.use(rateLimiter);
app.use(cookieParser());
app.use(compressionMiddleware);
app.use(requestIdMiddleware);
app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//? ─── API Routes ─────────────────────────────────────────────────────────────────
app.get("/api", (req, res) => res.json({ message: "Server is running..." }));
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/resource-user", resourceUserRoutes);

//? ─── 404 & Error Handlers ───────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

//! ─── Database Services ──────────────────────────────────────────────────────────
const dbServices = [
  {
    name: "MySQL",
    connect: async () => {
      const conn = await openConnection();
      await conn.ping();
      closeConnection(conn);
    },
  },
  {
    name: "MongoDB",
    connect: connectMongo,
    disconnect: disconnectMongo,
  },
];

async function initDatabases() {
  for (const svc of dbServices) {
    try {
      await svc.connect();
      logger.info(`Conexión exitosa a ${svc.name}`);
    } catch (err) {
      logger.warn(`No se pudo conectar a ${svc.name}: ${err.message}`);
    }
  }
}

//! ─── Server Startup ─────────────────────────────────────────────────────────────
async function startServer() {
  try {
    //* 1) Ejecutar migraciones
    await runMigrations();
  } catch (err) {
    logger.error(`Error ejecutando migraciones: ${err.stack || err}`);
    process.exit(1);
  }

  //* 2) Conectar a las bases de datos
  await initDatabases();

  //* 3) Levantar el servidor HTTP
  app.listen(config.app.port, () => {
    logger.info(`Servidor iniciado en puerto ${config.app.port}`);
  });
}

startServer();

//! ─── Graceful Shutdown ──────────────────────────────────────────────────────────
process.on("SIGINT", async () => {
  logger.info("Cerrando conexiones y deteniendo servidor...");
  for (const svc of dbServices) {
    if (svc.disconnect) {
      try {
        await svc.disconnect();
      } catch {
        //? ignore
      }
    }
  }
  process.exit(0);
});

export default app;
