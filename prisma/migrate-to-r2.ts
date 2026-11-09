import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "../lib/prisma";

const MIME_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".flac": "audio/flac",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
const BUCKET = process.env.R2_BUCKET_NAME;

/**
 * One-time: uploads every existing local-disk MediaFile to R2 under its
 * EXISTING filePath as the object key — no DB writes, since the key scheme
 * is identical between the local and r2 storage drivers (see lib/storage.ts).
 * Safe to re-run; each PutObject just overwrites the same key.
 */
async function main() {
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_BUCKET_NAME) {
    throw new Error("R2_ACCOUNT_ID / R2_BUCKET_NAME / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY must be set");
  }

  const mediaFiles = await prisma.mediaFile.findMany();
  console.log(`Found ${mediaFiles.length} media file row(s).`);

  let uploaded = 0;
  for (const media of mediaFiles) {
    const absolutePath = path.join(process.cwd(), "public", media.filePath);
    let buffer: Buffer;
    try {
      buffer = await readFile(absolutePath);
    } catch (err) {
      console.warn(`  skip ${media.filePath}: not found on disk (${(err as Error).message})`);
      continue;
    }

    const mimeType = media.mimeType || MIME_TYPES[path.extname(absolutePath).toLowerCase()] || "application/octet-stream";
    await client.send(
      new PutObjectCommand({ Bucket: BUCKET, Key: media.filePath, Body: buffer, ContentType: mimeType })
    );
    console.log(`  uploaded: ${media.filePath} (${buffer.length} bytes)`);
    uploaded += 1;
  }

  console.log(`\nDone — ${uploaded}/${mediaFiles.length} file(s) uploaded to R2.`);
  console.log("Next: set STORAGE_DRIVER=r2 (plus the R2_* vars) in Coolify and redeploy.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
