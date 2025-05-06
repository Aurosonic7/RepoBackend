// src/utils/dropbox.js
import { Dropbox } from "dropbox"; // SDK v11
import fetch from "node-fetch"; // ¡necesario en Node >= 18!

const dbx = new Dropbox({
  accessToken: process.env.DROPBOX_TOKEN, // define la var. en .env
  fetch,
});

/**
 * Sube un *buffer* a /repobackend/… y devuelve un link temporal.
 * @param {Buffer} buffer  –  req.file.buffer (multer memoryStorage)
 * @param {string} filename   –  ej. 1693923300_miArchivo.pdf
 * @returns {string}   –  URL temporal (válida 4 h)
 */
export async function uploadBuffer(buffer, filename) {
  const dropboxPath = `/file/${filename}`;

  /* 1. upload ------------------------------------------------------------- */
  const uploadRes = await dbx.filesUpload({
    path: dropboxPath,
    contents: buffer, // Buffer | Uint8Array
    mode: { ".tag": "add" },
    mute: true,
  });

  /* 2. link --------------------------------------------------------------- */
  //  dropbox SDK v11 → resultado está en .result
  const linkRes = await dbx.filesGetTemporaryLink({
    path: uploadRes.result.path_lower, // siempre lower‑case
  });

  return linkRes.result.link; // URL https://…
}
