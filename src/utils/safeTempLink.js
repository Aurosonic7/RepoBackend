import { getTempLink } from "./dropbox.js";

export async function safeTempLink(path, raw = false) {
  try {
    return await getTempLink(path, raw);
  } catch {
    // → null   (no undefined)
    return null;
  }
}
