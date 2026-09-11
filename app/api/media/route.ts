import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await prisma.item.findMany({
    orderBy: { createdAt: "asc" },
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

  return NextResponse.json(items);
}
