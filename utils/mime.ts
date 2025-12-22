const EXT_TO_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export function guessMimeType(name?: string, mimeType?: string) {
  if (mimeType) return mimeType;

  const lower = (name ?? "").toLowerCase();
  const ext = Object.keys(EXT_TO_MIME).find((e) => lower.endsWith(e));

  return ext ? EXT_TO_MIME[ext] : "application/octet-stream";
}
