import jwt from 'jsonwebtoken';
import config from '../../config/config.js';
import logger from '../utils/errorHandler.js';

export default function authenticateToken(req, res, next) {
  let token;
  const authHeader = req.headers['authorization'];

  //! Obtener token de Authorization header (Bearer)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }
  //! Fallback: obtener token de cookies si existe
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    logger.warn('Token no proporcionado');
    return res.status(401).json({ success: false, message: 'Token no proporcionado' });
  }

  jwt.verify(token, config.app.jwtSecret, (err, payload) => {
    if (err) {
      logger.warn(`Token inválido: ${err.message}`);
      return res.status(403).json({ success: false, message: 'Token inválido' });
    }
    //! Adjuntar información del usuario al request
    req.user = payload;
    next();
  });
}
