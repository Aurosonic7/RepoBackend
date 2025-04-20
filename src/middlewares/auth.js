import jwt from 'jsonwebtoken';
import config from '../../config/config.js';

export default function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Token no proporcionado' });
  }

  jwt.verify(token, config.app.jwtSecret, (err, payload) => {
    if (err) {
      return res
        .status(403)
        .json({ success: false, message: 'Token inválido' });
    }
    req.user = payload;
    next();
  });
}