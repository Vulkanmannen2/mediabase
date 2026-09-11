import { auth } from "@/auth";

const ERROR_MESSAGES: Record<string, string> = {
  missing: "Title and a file are both required.",
  type: "That file type isn't supported yet (audio: mp3, wav, m4a, flac — video: mp4, mov, webm).",
  category: "Pick a category.",
  collaborators:
    "Collaborators must be \"email:percent\" pairs, and each email needs an existing Mediabase account.",
  split: "Collaborator percentages can't add up to more than 100.",
};

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

export default async function UploadPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await auth();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold text-neutral-100">Upload</h1>
      <p className="text-sm text-neutral-500">Uploading as {session?.user?.email}</p>
      {searchParams.error && (
        <p className="rounded border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {ERROR_MESSAGES[searchParams.error] ?? "Something went wrong."}
        </p>
      )}
      <form
        action="/api/upload"
        method="post"
        encType="multipart/form-data"
        className="flex flex-col gap-3"
      >
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
            Comma-separated <code>email:percent</code> pairs. Each person needs a Mediabase account already. You
            keep whatever&apos;s left over.
          </p>
        </div>

        <button
          type="submit"
          className="mt-2 rounded bg-amber-500 px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-amber-400"
        >
          Upload
        </button>
      </form>
    </div>
  );
}
