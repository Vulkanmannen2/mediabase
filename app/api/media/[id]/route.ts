import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const item = await prisma.item.findUnique({
    where: { id: params.id },
    include: {
      mediaFile: {
        select: {
          mimeType: true,
          durationSeconds: true,
          uploader: { select: { name: true, email: true } },
        },
      },
      tags: { include: { tag: true } },
      payoutSplits: { include: { user: { select: { name: true, email: true } } } },
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}
