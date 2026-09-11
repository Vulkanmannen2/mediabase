import Link from "next/link";
import ItemCover from "@/app/components/ItemCover";
import type { CoverAspect } from "@/lib/categories";

export type GridItem = {
  id: string;
  title: string;
  href: string;
  subtitle?: string | null;
  coverImageUrl?: string | null;
};

export default function GridPattern({ items, aspect }: { items: GridItem[]; aspect: CoverAspect }) {
  if (items.length === 0) {
    return <p className="text-sm text-neutral-500">Nothing here yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Link key={item.id} href={item.href} className="flex flex-col gap-2">
          <ItemCover coverImageUrl={item.coverImageUrl} label={item.title} aspect={aspect} />
          <div className="flex flex-col">
            <span className="truncate text-sm text-neutral-100">{item.title}</span>
            {item.subtitle && (
              <span className="truncate text-xs text-neutral-500">{item.subtitle}</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
