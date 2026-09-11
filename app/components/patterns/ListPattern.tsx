import Link from "next/link";
import ItemCover from "@/app/components/ItemCover";
import { formatDuration } from "@/lib/format";

export type ListItem = {
  id: string;
  title: string;
  href: string;
  subtitle?: string | null;
  duration?: number | null;
  coverImageUrl?: string | null;
};

export default function ListPattern({ items }: { items: ListItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-neutral-500">Nothing here yet.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-neutral-800 rounded-lg border border-neutral-800">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-900"
          >
            <ItemCover
              coverImageUrl={item.coverImageUrl}
              label={item.title}
              aspect="square"
              className="h-11 w-11 shrink-0"
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm text-neutral-100">{item.title}</span>
              {item.subtitle && (
                <span className="truncate text-xs text-neutral-500">{item.subtitle}</span>
              )}
            </span>
            <span className="shrink-0 text-xs tabular-nums text-neutral-500">
              {formatDuration(item.duration)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
