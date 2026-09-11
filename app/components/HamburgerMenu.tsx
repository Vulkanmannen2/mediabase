"use client";

import Link from "next/link";
import { useState } from "react";

export default function HamburgerMenu({
  email,
  logout,
}: {
  email: string;
  logout: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded border border-neutral-800"
      >
        <span className="h-0.5 w-4 bg-neutral-300" />
        <span className="h-0.5 w-4 bg-neutral-300" />
        <span className="h-0.5 w-4 bg-neutral-300" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav className="flex w-64 flex-col gap-1 border-l border-neutral-800 bg-neutral-950 p-5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="mb-4 self-end text-neutral-500 hover:text-neutral-100"
            >
              ✕
            </button>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="rounded px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
            >
              Home
            </Link>
            <Link
              href="/upload"
              onClick={() => setOpen(false)}
              className="rounded px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
            >
              Upload
            </Link>
            <div className="mt-4 border-t border-neutral-800 pt-4">
              <p className="truncate px-3 text-xs text-neutral-500">{email}</p>
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full rounded px-3 py-2 text-left text-sm text-amber-500 hover:bg-neutral-900"
                >
                  Log out
                </button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
