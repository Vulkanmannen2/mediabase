import { auth } from "@/auth";
import { logout } from "@/lib/actions/auth";
import HamburgerMenu from "@/app/components/HamburgerMenu";

export default async function Header() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <header className="mx-auto flex max-w-2xl justify-end px-6 pt-6">
      <HamburgerMenu email={session.user.email ?? ""} logout={logout} />
    </header>
  );
}
