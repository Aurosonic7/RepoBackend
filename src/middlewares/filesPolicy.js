export default function filesPolicy(req, res, next) {
  /* Cubre dos casos:
      1)  /files/…              (cuando sirves estático)
      2)  /api/…/files/…        (cuando expones /files dentro de la API)
      */
  if (req.path.startsWith("/files/") || req.originalUrl.includes("/files/")) {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  }
  next();
}
