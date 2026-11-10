import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const DRIVER = process.env.STORAGE_DRIVER === "r2" ? "r2" : "local";
const BUCKET = process.env.R2_BUCKET_NAME;

let r2Client: S3Client | undefined;

function getR2Client(): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      // EU-jurisdiction bucket (GDPR): data stays in the EU, and it is only reachable via the .eu. endpoint.
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return r2Client;
}

/**
 * `key` is the same string stored as MediaFile.filePath, e.g. "/media/sound/123-song.mp3" —
 * kept identical across drivers so switching STORAGE_DRIVER never requires touching existing rows.
 */
export async function saveFile(key: string, buffer: Buffer, mimeType: string): Promise<void> {
  if (DRIVER === "r2") {
    await getR2Client().send(
      new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: mimeType })
    );
    return;
  }
  const absolutePath = path.join(process.cwd(), "public", key);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);
}

/** Returns a URL the browser can play directly — a presigned R2 URL, or the local streaming route. */
export async function getFileUrl(itemId: string, key: string): Promise<string> {
  if (DRIVER === "r2") {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    return getSignedUrl(getR2Client(), command, { expiresIn: 3600 });
  }
  return `/api/media/${itemId}/file`;
}

/**
 * R2 only: a presigned PUT URL so the browser uploads straight to the bucket and the file never
 * passes through this server (a ~1h WAV buffered in memory is enough to get the app OOM-killed).
 * Returns null for the local driver, where the file has to come through /api/upload instead.
 */
export async function getUploadUrl(key: string, mimeType: string): Promise<string | null> {
  if (DRIVER !== "r2") return null;
  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: mimeType });
  return getSignedUrl(getR2Client(), command, { expiresIn: 3600 });
}

/** R2 only: whether the browser's direct upload actually landed. */
export async function fileExists(key: string): Promise<boolean> {
  try {
    await getR2Client().send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export const storageDriver = DRIVER;
