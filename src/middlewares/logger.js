import morgan from 'morgan';
import logger from '../utils/errorHandler.js';

morgan.token('id', (req) => req.id || '-');

// Formato de log: ID, IP remota, método, URL, status, longitud, tiempo
const morganFormat = ':id :remote-addr :method :url :status :res[content-length] - :response-time ms';

export const morganMiddleware = morgan(morganFormat, {
  stream: {
    write: (message) => {
      const trimmed = message.trim();
      if (trimmed.includes('/health')) return;

      const status = parseInt(trimmed.split(' ')[4], 10);
      const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
      logger[level](trimmed);
    }
  }
});