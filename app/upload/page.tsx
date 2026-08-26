import { auth } from "@/auth";

const ERROR_MESSAGES: Record<string, string> = {
  missing: "Title and a file are both required.",
  type: "That file type isn't supported yet (audio: mp3, wav, m4a, flac — video: mp4, mov, webm).",
};

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
        <input
          name="file"
          type="file"
          accept="audio/*,video/*"
          required
          className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 file:mr-3 file:rounded file:border-0 file:bg-neutral-800 file:px-3 file:py-1.5 file:text-neutral-100"
        />
        <button
          type="submit"
          className="rounded bg-amber-500 px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-amber-400"
        >
          Upload
        </button>
      </form>
    </div>
  );
}
