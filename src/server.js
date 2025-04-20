// src/server.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import config from '../config/config.js';
import { openConnection, closeConnection } from '../config/databases/mysql.js';
import { connectMongo, disconnectMongo } from '../config/databases/mongo.js';
import logger, { notFoundHandler, errorHandler } from './utils/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API routes
app.use('/api', routes);

// 404 & error handlers
app.use(notFoundHandler);
app.use(errorHandler);

const dbServices = [
  {
    name: 'MySQL',
    connect: async () => {
      const conn = await openConnection();
      // test simple ping
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

async function initDatabases() {
  for (const svc of dbServices) {
    try {
      await svc.connect();
      logger.info(`✅ Conexión exitosa a ${svc.name}`);
    } catch (err) {
      logger.warn(`⚠️ No se pudo conectar a ${svc.name}: ${err.message}`);
    }
  }
}

async function startServer() {
  await initDatabases();
  app.listen(config.app.port, () => {
    logger.info(`🚀 Servidor iniciado en puerto ${config.app.port}`);
  });
}

startServer();

process.on('SIGINT', async () => {
  logger.info('🔌 Cerrando conexiones...');
  for (const svc of dbServices) {
    if (svc.disconnect) {
      try {
        await svc.disconnect();
      } catch (err) {
        // ignore
      }
    }
  }
  process.exit(0);
});