import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUploadUrl } from "@/lib/storage";
import { mimeTypeFor, newMediaKey } from "@/lib/upload";

/**
 * Step 1 of an upload: hands the browser a key and (on R2) a presigned PUT URL to send the file to
 * directly. uploadUrl is null on the local driver, meaning "post the file to /api/upload as before".
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { fileName } = await request.json().catch(() => ({}));
  const mimeType = typeof fileName === "string" ? mimeTypeFor(fileName) : undefined;
  if (!mimeType) {
    return NextResponse.json({ error: "type" }, { status: 400 });
  }

  const key = newMediaKey(fileName, mimeType);
  const uploadUrl = await getUploadUrl(key, mimeType);
  return NextResponse.json({ key, mimeType, uploadUrl });
}
