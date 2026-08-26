import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MediaType } from "@/app/generated/prisma/client";

const MIME_TYPES: Record<string, { type: MediaType; mime: string }> = {
  ".mp3": { type: MediaType.AUDIO, mime: "audio/mpeg" },
  ".wav": { type: MediaType.AUDIO, mime: "audio/wav" },
  ".m4a": { type: MediaType.AUDIO, mime: "audio/mp4" },
  ".flac": { type: MediaType.AUDIO, mime: "audio/flac" },
  ".mp4": { type: MediaType.VIDEO, mime: "video/mp4" },
  ".mov": { type: MediaType.VIDEO, mime: "video/quicktime" },
  ".webm": { type: MediaType.VIDEO, mime: "video/webm" },
};

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const formData = await request.formData();
  const title = String(formData.get("title") || "").trim();
  const file = formData.get("file");

  if (!title || !(file instanceof File) || file.size === 0) {
    return NextResponse.redirect(new URL("/upload?error=missing", request.url), 303);
  }

  const ext = path.extname(file.name).toLowerCase();
  const kind = MIME_TYPES[ext];
  if (!kind) {
    return NextResponse.redirect(new URL("/upload?error=type", request.url), 303);
  }

  const subdir = kind.type === MediaType.AUDIO ? "sound" : "video";
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_ åäöÅÄÖ]/g, "_")}`;
  const relDir = `/media/${subdir}`;
  const absoluteDir = path.join(process.cwd(), "public", relDir);
  await mkdir(absoluteDir, { recursive: true });

  const absolutePath = path.join(absoluteDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  await prisma.media.create({
    data: {
      title,
      type: kind.type,
      filePath: `${relDir}/${safeName}`,
      mimeType: kind.mime,
      uploaderId: session.user.id,
    },
  });

  return NextResponse.redirect(new URL("/", request.url), 303);
}
