import { prisma } from "@/lib/prisma";
import MediaLibrary from "@/app/components/MediaLibrary";

export const dynamic = "force-dynamic";

export default async function Home() {
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
    },
  });

  return <MediaLibrary items={items} />;
}
