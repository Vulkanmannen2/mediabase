import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { categoryBySlug } from "@/lib/categories";
import { collectionTagsForCategory } from "@/lib/collections";
import { creditsLine } from "@/lib/format";
import BackLink from "@/app/components/BackLink";
import GridPattern from "@/app/components/patterns/GridPattern";
import ListPattern from "@/app/components/patterns/ListPattern";
import FeedPattern from "@/app/components/patterns/FeedPattern";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const meta = categoryBySlug(params.slug);
  if (!meta) notFound();

  const items = await prisma.item.findMany({
    where: { category: meta.value },
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

  const collectionTags = collectionTagsForCategory(items, meta.grouped);

  function hrefFor(itemId: string) {
    const tag = collectionTags.get(itemId);
    return tag ? `/collection/${tag.id}` : `/play/${itemId}`;
  }

  function subtitleFor(item: (typeof items)[number]) {
    return (
      creditsLine(item.tags) ??
      (item.mediaFile.uploader
        ? item.mediaFile.uploader.name ?? item.mediaFile.uploader.email
        : null)
    );
  }

  if (meta.pattern === "feed") {
    return (
      <div className="relative">
        <div className="absolute left-4 top-4 z-10 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur">
          <BackLink href="/" label="Home" />
        </div>
        <FeedPattern
          items={items.map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: subtitleFor(item),
          }))}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <BackLink href="/" label="Home" />
        <h1 className="text-lg font-semibold text-neutral-100">{meta.label}</h1>
        <span className="w-12" aria-hidden />
      </div>

      {meta.pattern === "grid" && (
        <GridPattern
          aspect={meta.aspect}
          items={items.map((item) => ({
            id: item.id,
            title: item.title,
            href: hrefFor(item.id),
            subtitle: subtitleFor(item),
            coverImageUrl: collectionTags.get(item.id)?.coverImageUrl ?? null,
          }))}
        />
      )}

      {meta.pattern === "list" && (
        <ListPattern
          items={items.map((item) => ({
            id: item.id,
            title: item.title,
            href: hrefFor(item.id),
            subtitle: subtitleFor(item),
            duration: item.mediaFile.durationSeconds,
            coverImageUrl: collectionTags.get(item.id)?.coverImageUrl ?? null,
          }))}
        />
      )}
    </div>
  );
}
