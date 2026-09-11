import type { CoverAspect } from "@/lib/categories";

const ASPECT_CLASS: Record<CoverAspect, string> = {
  square: "aspect-square",
  portrait: "aspect-[2/3]",
  landscape: "aspect-video",
};

export default function ItemCover({
  coverImageUrl,
  label,
  aspect,
  className = "",
}: {
  coverImageUrl?: string | null;
  label: string;
  aspect: CoverAspect;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 ${ASPECT_CLASS[aspect]} ${className}`}
    >
      {coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverImageUrl} alt={label} className="h-full w-full object-cover" />
      ) : (
        <span className="text-2xl font-semibold text-neutral-700">
          {label.charAt(0).toUpperCase() || "?"}
        </span>
      )}
    </div>
  );
}
