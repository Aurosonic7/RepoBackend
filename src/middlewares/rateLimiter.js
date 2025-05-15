import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100000, // Máximo 100 peticiones por IP en el periodo
  standardHeaders: true, // Devuelve información de límite en cabeceras RateLimit-*
  legacyHeaders: false, // Desactiva cabeceras X-RateLimit-*
  message: {
    success: false,
    message:
      "Demasiadas solicitudes desde esta IP, por favor inténtalo más tarde.",
  },
});
