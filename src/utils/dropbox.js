import { Dropbox } from "dropbox";

export const dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN });

export async function uploadBuffer(buffer, path) {
  await dbx.filesUpload({
    path,
    contents: buffer,
    mode: { ".tag": "overwrite" }, // overwrite pero mantiene versionado interno
    autorename: false,
    mute: true,
  });
  const { result } = await dbx.filesGetTemporaryLink({ path });
  return result.link;
}

/** Obtiene un link temporal para un path ya existente */
export async function getTempLink(path) {
  const { result } = await dbx.filesGetTemporaryLink({ path });
  return result.link; // expira en ≈4 h
}

/** Elimina el fichero de Dropbox (ignora cualquier fallo) */
export async function safeDelete(path) {
  try {
    await dbx.filesDeleteV2({ path });
  } catch {
    /* noop */
  }
}
