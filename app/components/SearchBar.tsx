"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = q.trim();
        if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      }}
      className="flex-1"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search"
        className="w-full rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
      />
    </form>
  );
}
