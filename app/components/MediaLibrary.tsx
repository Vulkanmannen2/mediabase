"use client";

import { useState } from "react";

type MediaItem = {
  id: string;
  title: string;
  type: "AUDIO" | "VIDEO";
  filePath: string;
  mimeType: string;
  durationSeconds: number | null;
  uploader: { name: string | null; email: string } | null;
};

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MediaLibrary({ media }: { media: MediaItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(media[0]?.id ?? null);
  const selected = media.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Mediabase</h1>
        <p className="mt-1 text-sm text-neutral-400">
          {media.length} item{media.length === 1 ? "" : "s"}
        </p>
      </header>

      {selected && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <p className="mb-3 truncate text-sm font-medium text-neutral-200">
            {selected.title}
          </p>
          {selected.type === "VIDEO" ? (
            <video
              key={selected.id}
              className="w-full rounded"
              src={`/api/media/${selected.id}/file`}
              controls
              autoPlay
            />
          ) : (
            <audio
              key={selected.id}
              className="w-full"
              src={`/api/media/${selected.id}/file`}
              controls
              autoPlay
            />
          )}
        </div>
      )}

      <ul className="flex flex-col divide-y divide-neutral-800 rounded-lg border border-neutral-800">
        {media.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setSelectedId(item.id)}
              className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-neutral-900 ${
                item.id === selectedId ? "bg-neutral-900" : ""
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                    item.type === "VIDEO"
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-neutral-700/50 text-neutral-300"
                  }`}
                >
                  {item.type}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm text-neutral-100">{item.title}</span>
                  <span className="truncate text-xs text-neutral-500">
                    {item.uploader ? item.uploader.name ?? item.uploader.email : "seed data"}
                  </span>
                </span>
              </span>
              <span className="shrink-0 text-xs tabular-nums text-neutral-500">
                {formatDuration(item.durationSeconds)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
