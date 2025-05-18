// utils/dropbox.js
import { Dropbox } from "dropbox";
export const dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN });

/**
 * Devuelve link temporal (≈4 h).
 *  - para download → asRaw = false
 *  - para <img>     → asRaw = true   (añade ?raw=1 ó &raw=1)
 */
export async function getTempLink(path, asRaw = false) {
  const { result } = await dbx.filesGetTemporaryLink({ path });

  if (!asRaw) return result.link; // descarga ⬇️

  const sep = result.link.includes("?") ? "&" : "?";
  return `${result.link}${sep}raw=1`; // embebido ⬅️
}

/** Sube un buffer y devuelve link temporal de descarga */
export async function uploadBuffer(buffer, path) {
  await dbx.filesUpload({
    path,
    contents: buffer,
    mode: { ".tag": "overwrite" },
    autorename: false,
    mute: true,
  });
  const { result } = await dbx.filesGetTemporaryLink({ path });
  return result.link; // sin raw
}

export async function safeDelete(path) {
  try {
    await dbx.filesDeleteV2({ path });
  } catch {
    /* ignore */
  }
}
