import { Dropbox } from "dropbox";
export const dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN });

export async function getTempLink(path, asRaw = false) {
  const { result } = await dbx.filesGetTemporaryLink({ path });
  if (!asRaw) return result.link;
  const sep = result.link.includes("?") ? "&" : "?";
  return `${result.link}${sep}raw=1`;
}

export async function uploadBuffer(buffer, path) {
  await dbx.filesUpload({
    path,
    contents: buffer,
    mode: { ".tag": "overwrite" },
    autorename: false,
    mute: true,
  });
  const { result } = await dbx.filesGetTemporaryLink({ path });
  return result.link;
}

export async function safeDelete(path) {
  try {
    await dbx.filesDeleteV2({ path });
  } catch {
    /* ignore */
  }
}
