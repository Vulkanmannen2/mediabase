import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { categoryByValue } from "@/lib/categories";
import { creditsLine } from "@/lib/format";
import BackLink from "@/app/components/BackLink";
import Player from "@/app/components/Player";

export const dynamic = "force-dynamic";

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: { itemId: string };
  searchParams: { collection?: string };
}) {
  const item = await prisma.item.findUnique({
    where: { id: params.itemId },
    include: {
      mediaFile: {
        select: { mimeType: true, uploader: { select: { name: true, email: true } } },
      },
      tags: { include: { tag: true } },
    },
  });
  if (!item) notFound();

  const collectionTagId = searchParams.collection;
  let prevHref: string | null = null;
  let nextHref: string | null = null;
  let backHref = `/category/${categoryByValue(item.category).slug}`;
  let coverImageUrl: string | null = null;

  if (collectionTagId) {
    backHref = `/collection/${collectionTagId}`;
    const matchedTag = item.tags.find((it) => it.tag.id === collectionTagId)?.tag;
    coverImageUrl = matchedTag?.coverImageUrl ?? null;

    const siblings = await prisma.itemTag.findMany({
      where: { tagId: collectionTagId },
      select: { itemId: true },
      orderBy: [{ sequenceNumber: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
    });
    const ids = siblings.map((s) => s.itemId);
    const index = ids.indexOf(item.id);
    if (index > 0) prevHref = `/play/${ids[index - 1]}?collection=${collectionTagId}`;
    if (index >= 0 && index < ids.length - 1) {
      nextHref = `/play/${ids[index + 1]}?collection=${collectionTagId}`;
    }
  }

  const subtitle =
    creditsLine(item.tags) ??
    (item.mediaFile.uploader
      ? item.mediaFile.uploader.name ?? item.mediaFile.uploader.email
      : null);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-6">
      <BackLink href={backHref} label="Back" />
      <Player
        item={{
          id: item.id,
          title: item.title,
          subtitle,
          mimeType: item.mediaFile.mimeType,
          coverImageUrl,
        }}
        prevHref={prevHref}
        nextHref={nextHref}
      />
    </div>
  );
}
