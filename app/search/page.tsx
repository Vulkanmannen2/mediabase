import { prisma } from "@/lib/prisma";
import { categoryByValue } from "@/lib/categories";
import { creditsLine } from "@/lib/format";
import BackLink from "@/app/components/BackLink";
import SearchBar from "@/app/components/SearchBar";
import ListPattern from "@/app/components/patterns/ListPattern";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();

  const items = q
    ? await prisma.item.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { tags: { some: { tag: { label: { contains: q, mode: "insensitive" } } } } },
          ],
        },
        orderBy: { createdAt: "asc" },
        include: {
          mediaFile: {
            select: {
              durationSeconds: true,
              uploader: { select: { name: true, email: true } },
            },
          },
          tags: { include: { tag: true } },
        },
      })
    : [];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-8">
      <div className="flex items-center gap-4">
        <BackLink href="/" label="Home" />
        <SearchBar initialQuery={q} />
      </div>

      {q && (
        <ListPattern
          items={items.map((item) => {
            const credit = creditsLine(item.tags);
            const uploader = item.mediaFile.uploader
              ? item.mediaFile.uploader.name ?? item.mediaFile.uploader.email
              : null;
            return {
              id: item.id,
              title: item.title,
              href: `/play/${item.id}`,
              subtitle: `${categoryByValue(item.category).label}${
                credit || uploader ? " · " + (credit ?? uploader) : ""
              }`,
              duration: item.mediaFile.durationSeconds,
            };
          })}
        />
      )}
    </div>
  );
}
