// src/server.js
import express from 'express';
import { corsMiddleware } from './middlewares/cors.js';
import { securityMiddleware } from './middlewares/security.js';
import { rateLimiter } from './middlewares/rateLimiter.js';
import { compressionMiddleware } from './middlewares/compression.js';
import { requestIdMiddleware } from './middlewares/requestId.js';
import { morganMiddleware } from './middlewares/logger.js';

import config from '../config/config.js';
import { openConnection, closeConnection } from '../config/databases/mysql.js';
import { connectMongo, disconnectMongo } from '../config/databases/mongo.js';
import logger, { notFoundHandler, errorHandler } from './utils/errorHandler.js';
//! import routes from './routes/index.js';

const app = express();

// ─── Middlewares ────────────────────────────────────────────────────────────────
app.use(corsMiddleware);
app.use(securityMiddleware);
app.use(rateLimiter);
app.use(compressionMiddleware);
app.use(requestIdMiddleware);
app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ─────────────────────────────────────────────────────────────────
//! app.use('/api', routes);

// ─── 404 & Error Handlers ───────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Database Services ──────────────────────────────────────────────────────────
const dbServices = [
  {
    name: 'MySQL',
    connect: async () => {
      const conn = await openConnection();
      // Test simple ping
      await conn.ping();
      closeConnection(conn);
    }
  },
  {
    name: 'MongoDB',
    connect: connectMongo,
    disconnect: disconnectMongo
  }
];

// Initialize all DB connections (non‑blocking startup)
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

// ─── Server Startup ─────────────────────────────────────────────────────────────
async function startServer() {
  await initDatabases();
  app.listen(config.app.port, () => {
    logger.info(`Servidor iniciado en puerto ${config.app.port}`);
  });
}

startServer();

// ─── Graceful Shutdown ──────────────────────────────────────────────────────────
process.on('SIGINT', async () => {
  logger.info('Cerrando conexiones...');
  for (const svc of dbServices) {
    if (svc.disconnect) {
      try {
        await svc.disconnect();
      } catch {
        // ignore errors on shutdown
      }
    }
  }
  process.exit(0);
});

export default app;