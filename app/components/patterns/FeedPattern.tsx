"use client";

import { useEffect, useRef } from "react";

export type FeedItem = {
  id: string;
  title: string;
  subtitle?: string | null;
};

function FeedSlide({ item }: { item: FeedItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative flex h-screen w-full shrink-0 snap-start items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={`/api/media/${item.id}/file`}
        className="h-full w-full object-cover"
        loop
        muted
        playsInline
        controls
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent p-5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{item.title}</p>
          {item.subtitle && <p className="truncate text-xs text-white/70">{item.subtitle}</p>}
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-9 w-9 rounded-full border border-white/40" />
          <div className="h-9 w-9 rounded-full border border-white/40" />
          <div className="h-9 w-9 rounded-full border border-white/40" />
        </div>
      </div>
    </div>
  );
}

export default function FeedPattern({ items }: { items: FeedItem[] }) {
  if (items.length === 0) {
    return <p className="px-6 py-16 text-sm text-neutral-500">Nothing here yet.</p>;
  }

  return (
    <div className="h-screen w-full snap-y snap-mandatory overflow-y-scroll">
      {items.map((item) => (
        <FeedSlide key={item.id} item={item} />
      ))}
    </div>
  );
}
