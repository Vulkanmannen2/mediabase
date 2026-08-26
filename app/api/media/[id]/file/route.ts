import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const media = await prisma.media.findUnique({ where: { id: params.id } });
  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const absolutePath = path.join(process.cwd(), "public", media.filePath);

  let fileSize: number;
  try {
    fileSize = statSync(absolutePath).size;
  } catch {
    return NextResponse.json({ error: "File missing on disk" }, { status: 404 });
  }

  const range = request.headers.get("range");

  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match?.[1] ? parseInt(match[1], 10) : 0;
    const end = match?.[2] ? parseInt(match[2], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const stream = createReadStream(absolutePath, { start, end });
    const webStream = Readable.toWeb(stream) as ReadableStream;

    return new NextResponse(webStream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunkSize),
        "Content-Type": media.mimeType,
      },
    });
  }

  const stream = createReadStream(absolutePath);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Length": String(fileSize),
      "Content-Type": media.mimeType,
      "Accept-Ranges": "bytes",
    },
  });
}
