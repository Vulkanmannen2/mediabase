import Link from "next/link";
import { signup } from "@/lib/actions/auth";

const ERROR_MESSAGES: Record<string, string> = {
  missing: "Email and password are required.",
  weak: "Password must be at least 8 characters.",
  exists: "An account with that email already exists.",
};

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold text-neutral-100">Sign up</h1>
      {searchParams.error && (
        <p className="rounded border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {ERROR_MESSAGES[searchParams.error] ?? "Something went wrong."}
        </p>
      )}
      <form action={signup} className="flex flex-col gap-3">
        <input
          name="name"
          type="text"
          placeholder="Name (optional)"
          className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
        />
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
          placeholder="Password (min 8 characters)"
          required
          minLength={8}
          className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
        />
        <button
          type="submit"
          className="rounded bg-amber-500 px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-amber-400"
        >
          Create account
        </button>
      </form>
      <p className="text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="text-amber-500">
          Log in
        </Link>
      </p>
    </div>
  );
}
