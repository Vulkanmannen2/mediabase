import Link from "next/link";
import { formatDuration } from "@/lib/format";

export type CollectionItem = {
  id: string;
  title: string;
  href: string;
  duration?: number | null;
};

export default function CollectionList({ items }: { items: CollectionItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-neutral-500">No items in this collection.</p>;
  }

  return (
    <ol className="flex flex-col divide-y divide-neutral-800 rounded-lg border border-neutral-800">
      {items.map((item, index) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-900"
          >
            <span className="w-5 shrink-0 text-right text-xs tabular-nums text-neutral-500">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-neutral-100">{item.title}</span>
            <span className="shrink-0 text-xs tabular-nums text-neutral-500">
              {formatDuration(item.duration)}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
