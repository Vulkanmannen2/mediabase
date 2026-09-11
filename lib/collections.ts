export type CollectionTag = { id: string; label: string; coverImageUrl: string | null };

type ItemForCollection = {
  id: string;
  tags: {
    role: string | null;
    tag: { id: string; label: string; kind: string | null; coverImageUrl: string | null };
  }[];
};

/**
 * A plain tag (kind: null) counts as an item's "collection" (album/show/book)
 * only if at least 2 items in the same category share it — a one-off mood or
 * genre tag on a single item shouldn't route through Collection Detail.
 */
export function collectionTagsForCategory(
  items: ItemForCollection[],
  grouped: boolean
): Map<string, CollectionTag | null> {
  const result = new Map<string, CollectionTag | null>();
  if (!grouped) {
    for (const item of items) result.set(item.id, null);
    return result;
  }

  const tagItemCounts = new Map<string, number>();
  for (const item of items) {
    for (const it of item.tags) {
      if (it.tag.kind !== null) continue;
      tagItemCounts.set(it.tag.id, (tagItemCounts.get(it.tag.id) ?? 0) + 1);
    }
  }

  for (const item of items) {
    let best: CollectionTag | null = null;
    let bestCount = 1;
    for (const it of item.tags) {
      if (it.tag.kind !== null) continue;
      const count = tagItemCounts.get(it.tag.id) ?? 0;
      if (count >= 2 && count > bestCount) {
        bestCount = count;
        best = { id: it.tag.id, label: it.tag.label, coverImageUrl: it.tag.coverImageUrl };
      }
    }
    result.set(item.id, best);
  }

  return result;
}
