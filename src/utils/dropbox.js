// utils/dropbox.js
import { Dropbox } from "dropbox";

const dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN });

// 👇  nombre EXACTO de tu App Folder
const APP_FOLDER = "/repobackend"; // <- cámbialo si tu carpeta se llama distinto

/** Asegura que la ruta incluya la carpeta de la app */
function withAppFolder(path) {
  return path.startsWith(APP_FOLDER) ? path : APP_FOLDER + path;
}

export async function uploadBuffer(buffer, path) {
  path = withAppFolder(path);
  await dbx.filesUpload({
    path,
    contents: buffer,
    mode: { ".tag": "overwrite" },
    autorename: false,
    mute: true,
  });
  const { result } = await dbx.filesGetTemporaryLink({ path });
  return result.link + "&raw=1";
}

export async function getTempLink(path) {
  path = withAppFolder(path);
  const { result } = await dbx.filesGetTemporaryLink({ path });
  return result.link + "&raw=1"; // ⬅️ link directo (raw)
}

export async function safeDelete(path) {
  try {
    await dbx.filesDeleteV2({ path: withAppFolder(path) });
  } catch {
    /* ignore */
  }
}
