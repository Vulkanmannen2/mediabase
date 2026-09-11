import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { categoryByValue } from "@/lib/categories";
import { creditsLine } from "@/lib/format";
import BackLink from "@/app/components/BackLink";
import ItemCover from "@/app/components/ItemCover";
import CollectionList from "@/app/components/CollectionList";

export const dynamic = "force-dynamic";

export default async function CollectionPage({ params }: { params: { tagId: string } }) {
  const tag = await prisma.tag.findUnique({ where: { id: params.tagId } });
  if (!tag) notFound();

  const itemTags = await prisma.itemTag.findMany({
    where: { tagId: tag.id },
    include: {
      item: {
        include: {
          mediaFile: { select: { durationSeconds: true } },
          tags: { include: { tag: true } },
        },
      },
    },
    orderBy: [{ sequenceNumber: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
  });

  const items = itemTags.map((it) => it.item);
  const category = items[0] ? categoryByValue(items[0].category) : null;
  const subtitle = items[0] ? creditsLine(items[0].tags) : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-8">
      <BackLink href={category ? `/category/${category.slug}` : "/"} label={category?.label ?? "Home"} />

      <div className="flex flex-col items-center gap-3 text-center">
        <ItemCover
          coverImageUrl={tag.coverImageUrl}
          label={tag.label}
          aspect="square"
          className="w-40"
        />
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">{tag.label}</h1>
          {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
        </div>
      </div>

      <CollectionList
        items={items.map((item) => ({
          id: item.id,
          title: item.title,
          href: `/play/${item.id}?collection=${tag.id}`,
          duration: item.mediaFile.durationSeconds,
        }))}
      />
    </div>
  );
}
