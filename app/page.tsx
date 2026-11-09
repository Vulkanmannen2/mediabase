import Link from "next/link";
import SearchBar from "@/app/components/SearchBar";
import { CATEGORIES } from "@/lib/categories";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 px-6 py-10">
      <div className="flex items-center gap-3">
        <SearchBar />
      </div>

      <div>
        <h1 className="mb-1">
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, nothing for next/image to optimize */}
          <img src="/mercito-logo.svg" alt="Mercito" className="h-8 w-auto" />
        </h1>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 text-center hover:bg-neutral-800"
          >
            <span className="text-sm font-medium text-neutral-100">{category.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
