import { Dropbox } from "dropbox";
import logger from "./errorHandler.js";

export const dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN });

export async function uploadBuffer(buffer, path) {
  try {
    await dbx.filesUpload({
      path,
      contents: buffer,
      mode: { ".tag": "overwrite" },
      autorename: false,
      mute: true,
    });
    const { result } = await dbx.filesGetTemporaryLink({ path });
    const sep = result.link.includes("?") ? "&" : "?";
    return {
      path,
      link: result.link,
      rawLink: `${result.link}${sep}raw=1`,
    };
  } catch (err) {
    logger.error(`Dropbox uploadBuffer(${path}) ⇒ ${err.stack || err}`);
    throw err;
  }
}

export async function getTempLink(path, asRaw = false) {
  try {
    const { result } = await dbx.filesGetTemporaryLink({ path });
    if (!asRaw) return result.link;
    const sep = result.link.includes("?") ? "&" : "?";
    return `${result.link}${sep}raw=1`;
  } catch (err) {
    logger.error(`Dropbox getTempLink(${path}) ⇒ ${err.stack || err}`);
    throw err;
  }
}

export async function safeDelete(path) {
  try {
    await dbx.filesDeleteV2({ path });
    logger.info(`Dropbox safeDelete(${path}) OK`);
  } catch (err) {
    logger.warn(`Dropbox safeDelete(${path}) fallo: ${err.message}`);
  }
}
