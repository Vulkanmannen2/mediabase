import Link from "next/link";
import { login } from "@/lib/actions/auth";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Wrong email or password.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; from?: string };
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold text-neutral-100">Log in</h1>
      {searchParams.error && (
        <p className="rounded border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {ERROR_MESSAGES[searchParams.error] ?? "Something went wrong."}
        </p>
      )}
      <form action={login} className="flex flex-col gap-3">
        <input type="hidden" name="from" value={searchParams.from ?? "/"} />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
        />
        <button
          type="submit"
          className="rounded bg-amber-500 px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-amber-400"
        >
          Log in
        </button>
      </form>
      <p className="text-sm text-neutral-500">
        No account?{" "}
        <Link href="/signup" className="text-amber-500">
          Sign up
        </Link>
      </p>
    </div>
  );
}
