import path from "path";
import express from "express";

const filesDir = path.join(process.cwd(), "files");

/**
 * Sirve los archivos subidos con la política CORP = cross-origin
 *   GET /api/files/<uuid>.(png|jpg|pdf|mp4)
 */
export default function filesPolicy(app) {
  app.use(
    "/api/files",
    express.static(filesDir, {
      setHeaders: (res) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      },
    })
  );
}
