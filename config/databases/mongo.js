import mongoose from 'mongoose';
import config from '../config.js';
import logger from '../../src/utils/errorHandler.js';

export async function connectMongo() {
  try {
    await mongoose.connect(config.mongo.URI);
    logger.info('Conexión establecida con MongoDB');
  } catch (err) {
    logger.error(`Error al conectar a MongoDB: ${err.stack || err}`);
    process.exit(1);
  }
}

export async function disconnectMongo() {
  try {
    await mongoose.disconnect();
    logger.info('Desconectado de MongoDB');
  } catch (err) {
    logger.error(`Error al desconectar MongoDB: ${err.stack || err}`);
  }
}