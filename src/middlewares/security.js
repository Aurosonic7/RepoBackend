// src/middlewares/security.js
import helmet from 'helmet';

export const securityMiddleware = helmet({
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  },
  hidePoweredBy: true
});