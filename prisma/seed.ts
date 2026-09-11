import "dotenv/config";
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { MediaCategory } from "../app/generated/prisma/client";
import { prisma } from "../lib/prisma";

const MEDIA_ROOT = path.join(__dirname, "..", "public", "media");

const MIME_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".flac": "audio/flac",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

const CATEGORY_BY_DIR: Record<string, MediaCategory> = {
  sound: MediaCategory.MUSIC,
  video: MediaCategory.VIDEO,
};

function titleFromFilename(fileName: string): string {
  return path.basename(fileName, path.extname(fileName));
}

function durationSeconds(filePath: string): number | null {
  try {
    const out = execFileSync(
      "ffprobe",
      [
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        filePath,
      ],
      { encoding: "utf8" }
    ).trim();
    const seconds = Math.round(parseFloat(out));
    return Number.isFinite(seconds) ? seconds : null;
  } catch {
    console.warn(`  ffprobe unavailable or failed for ${path.basename(filePath)} — leaving duration empty`);
    return null;
  }
}

async function main() {
  const seedUser = await prisma.user.upsert({
    where: { email: "seed@mediabase.local" },
    update: {},
    create: {
      email: "seed@mediabase.local",
      passwordHash: await bcrypt.hash(`seed-${Date.now()}-not-for-login`, 10),
      name: "Mediabase Seed",
    },
  });

  const subdirs = readdirSync(MEDIA_ROOT, { withFileTypes: true }).filter((e) => e.isDirectory());

  let seeded = 0;

  for (const dir of subdirs) {
    const category = CATEGORY_BY_DIR[dir.name];
    if (!category) continue;

    const dirPath = path.join(MEDIA_ROOT, dir.name);
    const files = readdirSync(dirPath).filter((f) => MIME_TYPES[path.extname(f).toLowerCase()]);

    for (const file of files) {
      const absPath = path.join(dirPath, file);
      const filePath = `/media/${dir.name}/${file}`;
      const mimeType = MIME_TYPES[path.extname(file).toLowerCase()];

      const mediaFile = await prisma.mediaFile.upsert({
        where: { filePath },
        update: {},
        create: {
          filePath,
          mimeType,
          durationSeconds: durationSeconds(absPath),
          uploaderId: seedUser.id,
        },
      });

      const item = await prisma.item.upsert({
        where: { mediaFileId: mediaFile.id },
        update: {},
        create: {
          mediaFileId: mediaFile.id,
          category,
          title: titleFromFilename(file),
        },
      });

      await prisma.payoutSplit.upsert({
        where: { itemId_userId: { itemId: item.id, userId: seedUser.id } },
        update: {},
        create: { itemId: item.id, userId: seedUser.id, percentage: 100 },
      });

      console.log(`  seeded: ${item.title} (${item.category}, ${mediaFile.durationSeconds ?? "?"}s)`);
      seeded += 1;
    }
  }

  console.log(`\nDone — ${seeded} item(s) in sync.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
