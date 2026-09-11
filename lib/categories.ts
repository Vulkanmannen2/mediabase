import { MediaCategory } from "@/app/generated/prisma/client";

export type Pattern = "grid" | "list" | "feed";
export type CoverAspect = "square" | "portrait" | "landscape";

export type CategoryMeta = {
  slug: string;
  value: MediaCategory;
  label: string;
  pattern: Pattern;
  aspect: CoverAspect;
  grouped: boolean;
};

export const CATEGORIES: CategoryMeta[] = [
  { slug: "music", value: MediaCategory.MUSIC, label: "Music", pattern: "grid", aspect: "square", grouped: true },
  { slug: "podcasts", value: MediaCategory.PODCAST, label: "Podcasts", pattern: "list", aspect: "square", grouped: true },
  { slug: "movies", value: MediaCategory.MOVIE, label: "Movies", pattern: "grid", aspect: "portrait", grouped: false },
  { slug: "shorts", value: MediaCategory.SHORT, label: "Shorts", pattern: "feed", aspect: "portrait", grouped: false },
  { slug: "series", value: MediaCategory.SERIES, label: "Series", pattern: "grid", aspect: "portrait", grouped: true },
  { slug: "audio-books", value: MediaCategory.AUDIOBOOK, label: "Audio Books", pattern: "list", aspect: "square", grouped: true },
  { slug: "news", value: MediaCategory.NEWS, label: "News", pattern: "list", aspect: "landscape", grouped: false },
  { slug: "videos", value: MediaCategory.VIDEO, label: "Videos", pattern: "grid", aspect: "landscape", grouped: false },
];

export function categoryBySlug(slug: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryByValue(value: MediaCategory): CategoryMeta {
  const meta = CATEGORIES.find((c) => c.value === value);
  if (!meta) throw new Error(`Unknown category: ${value}`);
  return meta;
}
