// Elimina el prefijo “undefined/” (o “/undefined”) si aparece
export function normalizeDropboxPath(p = "") {
  if (!p) return "";
  return p
    .replace(/^\/?undefined\/?/, "/") // ↩️  quita “undefined/”
    .replace(/^\/?files\//, "/files/"); //   asegura “/files/…”
}
