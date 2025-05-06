import { transliterate as tr } from "transliteration";

export function buildSafeFilename(originalName, userFullName) {
  const ext = originalName.split(".").pop();
  const ts = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15); // 20250505T181423
  const slug = tr(userFullName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return `${ts}_${slug}.${ext}`;
}
