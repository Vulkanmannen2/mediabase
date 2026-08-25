import { prisma } from "@/lib/prisma";
import MediaLibrary from "@/app/components/MediaLibrary";

export const dynamic = "force-dynamic";

export default async function Home() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "asc" },
  });

  return <MediaLibrary media={media} />;
}
