import Link from "next/link";

export default function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-100"
    >
      <span aria-hidden>←</span>
      {label}
    </Link>
  );
}
