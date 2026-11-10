import { auth } from "@/auth";
import UploadForm from "./UploadForm";

const ERROR_MESSAGES: Record<string, string> = {
  missing: "Title and a file are both required.",
  type: "That file type isn't supported yet (audio: mp3, wav, m4a, flac — video: mp4, mov, webm).",
  category: "Pick a category.",
  collaborators:
    "Collaborators must be \"email:percent\" pairs, and each email needs an existing Mercito account.",
  split: "Collaborator percentages can't add up to more than 100.",
  upload: "The file didn't finish uploading. Please try again.",
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
      <UploadForm />
    </div>
  );
}
