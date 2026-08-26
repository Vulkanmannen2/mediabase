import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "@/lib/actions/auth";

export default async function NavBar() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 pt-6 text-sm">
      <div className="flex gap-4">
        <Link href="/" className="text-neutral-300 hover:text-neutral-100">
          Library
        </Link>
        <Link href="/upload" className="text-neutral-300 hover:text-neutral-100">
          Upload
        </Link>
      </div>
      <form action={logout} className="flex items-center gap-3">
        <span className="text-neutral-500">{session.user.email}</span>
        <button type="submit" className="text-amber-500 hover:text-amber-400">
          Log out
        </button>
      </form>
    </nav>
  );
}
