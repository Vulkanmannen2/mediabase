import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "asc" },
    include: { uploader: { select: { name: true, email: true } } },
  });

  return NextResponse.json(media);
}
