import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(media);
}
