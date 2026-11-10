"use client";

import { useState, type FormEvent } from "react";

const CATEGORIES = [
  "MUSIC",
  "PODCAST",
  "MOVIE",
  "SHORT",
  "SERIES",
  "AUDIOBOOK",
  "NEWS",
  "VIDEO",
] as const;

/** PUTs the file straight to the presigned R2 URL, reporting progress (fetch can't report upload progress). */
function putFile(url: string, file: File, mimeType: string, onProgress: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", mimeType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.floor((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)));
    xhr.onerror = () => reject(new Error("network error"));
    xhr.send(file);
  });
}

export default function UploadForm() {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const file = data.get("file") as File;

    try {
      setProgress(0);
      const presign = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name }),
      });
      if (!presign.ok) {
        const { error: code } = await presign.json().catch(() => ({ error: "" }));
        window.location.href = `/upload?error=${code || "upload"}`;
        return;
      }
      const { key, mimeType, uploadUrl } = await presign.json();

      // On R2 the file goes straight to the bucket; only the metadata is posted to the app.
      if (uploadUrl) {
        await putFile(uploadUrl, file, mimeType, setProgress);
        data.delete("file");
        data.set("key", key);
      }
      setProgress(100);

      const res = await fetch("/api/upload", { method: "POST", body: data });
      window.location.href = res.url;
    } catch (err) {
      setProgress(null);
      setError(`Upload failed (${(err as Error).message}). Please try again.`);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input
        name="title"
        type="text"
        placeholder="Title"
        required
        className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
      />

      <select
        name="category"
        required
        defaultValue=""
        className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
      >
        <option value="" disabled>
          Category
        </option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c.charAt(0) + c.slice(1).toLowerCase()}
          </option>
        ))}
      </select>

      <input
        name="file"
        type="file"
        accept="audio/*,video/*,.mp3,.wav,.m4a,.flac,.mp4,.mov,.webm"
        required
        className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 file:mr-3 file:rounded file:border-0 file:bg-neutral-800 file:px-3 file:py-1.5 file:text-neutral-100"
      />

      <div className="mt-2 flex flex-col gap-1">
        <label className="text-xs text-neutral-500">Tags (optional)</label>
        <input
          name="tags"
          type="text"
          placeholder="e.g. Summer 2024, Rock"
          className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
        />
        <p className="text-xs text-neutral-600">Comma-separated. Anything — an album, a season, a mood.</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-500">Credits (optional)</label>
        <input
          name="credits"
          type="text"
          placeholder="e.g. Artist: Jane Doe, Producer: John Smith"
          className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
        />
        <p className="text-xs text-neutral-600">
          Comma-separated <code>Role: Name</code> pairs. Can name anyone — doesn&apos;t require an account.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-500">Split payment with collaborators (optional)</label>
        <input
          name="collaborators"
          type="text"
          placeholder="e.g. friend@example.com:40"
          className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
        />
        <p className="text-xs text-neutral-600">
          Comma-separated <code>email:percent</code> pairs. Each person needs a Mercito account already. You
          keep whatever&apos;s left over.
        </p>
      </div>

      <button
        type="submit"
        disabled={progress !== null}
        className="mt-2 rounded bg-amber-500 px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-amber-400 disabled:opacity-60"
      >
        {progress === null ? "Upload" : progress < 100 ? `Uploading… ${progress}%` : "Saving…"}
      </button>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </form>  );
}
