import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const DRIVER = process.env.STORAGE_DRIVER === "r2" ? "r2" : "local";
const BUCKET = process.env.R2_BUCKET_NAME;

let r2Client: S3Client | undefined;

function getR2Client(): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
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

export const storageDriver = DRIVER;
