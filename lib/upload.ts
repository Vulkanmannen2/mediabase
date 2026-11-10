import path from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".flac": "audio/flac",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

export function mimeTypeFor(fileName: string): string | undefined {
  return MIME_TYPES[path.extname(fileName).toLowerCase()];
}

/** The storage key (= MediaFile.filePath) for a new upload, e.g. "/media/sound/1787943603937-song.mp3". */
export function newMediaKey(fileName: string, mimeType: string): string {
  const subdir = mimeType.startsWith("audio/") ? "sound" : "video";
  const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.\-_ åäöÅÄÖ]/g, "_")}`;
  return `/media/${subdir}/${safeName}`;
}

/** Guards keys coming back from the browser after a direct upload: only fresh upload keys are accepted. */
export function isMediaKey(key: string): boolean {
  return /^\/media\/(sound|video)\/\d+-[^/]+$/.test(key);
}
