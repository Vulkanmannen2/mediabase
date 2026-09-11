"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ItemCover from "@/app/components/ItemCover";
import { formatDuration } from "@/lib/format";

export type PlayerItem = {
  id: string;
  title: string;
  subtitle: string | null;
  mimeType: string;
  coverImageUrl: string | null;
};

export default function Player({
  item,
  prevHref,
  nextHref,
}: {
  item: PlayerItem;
  prevHref: string | null;
  nextHref: string | null;
}) {
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const isVideo = item.mimeType.startsWith("video/");

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [item.id]);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;
    media.play().catch(() => {});
  }, [item.id]);

  function togglePlay() {
    const media = mediaRef.current;
    if (!media) return;
    if (media.paused) {
      media.play().catch(() => {});
    } else {
      media.pause();
    }
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const media = mediaRef.current;
    if (!media) return;
    media.currentTime = Number(e.target.value);
    setCurrentTime(media.currentTime);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-6 py-10">
      <div className="w-full max-w-xs">
        {isVideo ? (
          <video
            ref={(el) => {
              mediaRef.current = el;
            }}
            src={`/api/media/${item.id}/file`}
            className="aspect-square w-full rounded-lg border border-neutral-800 object-cover"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          />
        ) : (
          <>
            <ItemCover coverImageUrl={item.coverImageUrl} label={item.title} aspect="square" />
            <audio
              ref={(el) => {
                mediaRef.current = el;
              }}
              src={`/api/media/${item.id}/file`}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            />
          </>
        )}
      </div>

      <div className="w-full text-center">
        <p className="truncate text-lg font-medium text-neutral-100">{item.title}</p>
        {item.subtitle && <p className="truncate text-sm text-neutral-500">{item.subtitle}</p>}
      </div>

      <div className="flex w-full flex-col gap-1.5">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={seek}
          className="w-full accent-amber-500"
        />
        <div className="flex justify-between text-xs tabular-nums text-neutral-500">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {prevHref ? (
          <Link href={prevHref} className="text-2xl text-neutral-300 hover:text-neutral-100">
            ⏮
          </Link>
        ) : (
          <span className="text-2xl text-neutral-700">⏮</span>
        )}
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-neutral-300 text-xl text-neutral-100"
        >
          {playing ? "⏸" : "▶"}
        </button>
        {nextHref ? (
          <Link href={nextHref} className="text-2xl text-neutral-300 hover:text-neutral-100">
            ⏭
          </Link>
        ) : (
          <span className="text-2xl text-neutral-700">⏭</span>
        )}
      </div>
    </div>
  );
}
