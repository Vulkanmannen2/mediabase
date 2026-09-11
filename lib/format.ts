export type TagLike = {
  role: string | null;
  tag: { id: string; label: string; kind: string | null };
};

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function creditsLine(tags: TagLike[]): string | null {
  const credits = tags.filter((t) => t.role);
  if (credits.length === 0) return null;
  return credits.map((t) => `${t.role}: ${t.tag.label}`).join(" · ");
}
