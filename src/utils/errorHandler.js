import fs from 'fs';
import path from 'path';
import winston from 'winston';

//! Asegurar existencia de carpeta de logs
const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

//! Configuración de Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, stack }) => 
      `${timestamp} [${level.toUpperCase()}]: ${stack || message}`
    )
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') })
  ],
  exitOnError: false
});

//! En desarrollo, además imprimir en consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

//* Middleware de Express: captura errores y devuelve JSON genérico.
export function errorHandler(err, req, res, next) {
  logger.error(err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Ha ocurrido un error interno.'
      : err.message
  });
}

//* Middleware de Express: rutas no encontradas (404).
export function notFoundHandler(req, res, next) {
  const msg = `Ruta ${req.originalUrl} no encontrada`;
  logger.warn(msg);
  res.status(404).json({ success: false, message: msg });
}

export default logger;