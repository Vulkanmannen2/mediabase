import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { baseUrl } from "@/lib/base-url";
import { saveFile, fileExists } from "@/lib/storage";
import { isMediaKey, mimeTypeFor, newMediaKey } from "@/lib/upload";
import { MediaCategory } from "@/app/generated/prisma/client";

function parseCategory(value: FormDataEntryValue | null): MediaCategory | null {
  const v = String(value || "").toUpperCase();
  return (Object.values(MediaCategory) as string[]).includes(v) ? (v as MediaCategory) : null;
}

function parseTagList(value: FormDataEntryValue | null): string[] {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

type CreditInput = { role: string; label: string };

function parseCredits(value: FormDataEntryValue | null): CreditInput[] {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pair) => {
      const [role, ...rest] = pair.split(":");
      return { role: (role || "").trim(), label: rest.join(":").trim() };
    })
    .filter((c) => c.role && c.label);
}

type CollaboratorInput = { email: string; percentage: number };

/** Returns null if the field is present but malformed — distinct from an empty list. */
function parseCollaborators(value: FormDataEntryValue | null): CollaboratorInput[] | null {
  const raw = String(value || "").trim();
  if (!raw) return [];

  const result: CollaboratorInput[] = [];
  for (const part of raw.split(",").map((s) => s.trim()).filter(Boolean)) {
    const [email, pctStr] = part.split(":").map((s) => (s || "").trim());
    const percentage = Number(pctStr);
    if (!email || !Number.isInteger(percentage) || percentage <= 0 || percentage > 100) {
      return null;
    }
    result.push({ email: email.toLowerCase(), percentage });
  }
  return result;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", baseUrl(request)), 303);
  }
  const uploaderId = session.user.id;

  const formData = await request.formData();
  const title = String(formData.get("title") || "").trim();
  const file = formData.get("file");
  // Set when the browser already uploaded the file straight to R2 (see /api/upload/presign).
  const uploadedKey = String(formData.get("key") || "");
  const category = parseCategory(formData.get("category"));
  const tagLabels = parseTagList(formData.get("tags"));
  const credits = parseCredits(formData.get("credits"));
  const collaborators = parseCollaborators(formData.get("collaborators"));

  const hasFile = file instanceof File && file.size > 0;
  if (!title || (!hasFile && !uploadedKey)) {
    return NextResponse.redirect(new URL("/upload?error=missing", baseUrl(request)), 303);
  }
  if (!category) {
    return NextResponse.redirect(new URL("/upload?error=category", baseUrl(request)), 303);
  }

  const mimeType = mimeTypeFor(uploadedKey || (file as File).name);
  if (!mimeType) {
    return NextResponse.redirect(new URL("/upload?error=type", baseUrl(request)), 303);
  }

  if (collaborators === null) {
    return NextResponse.redirect(new URL("/upload?error=collaborators", baseUrl(request)), 303);
  }
  const collaboratorTotal = collaborators.reduce((sum, c) => sum + c.percentage, 0);
  if (collaboratorTotal > 100) {
    return NextResponse.redirect(new URL("/upload?error=split", baseUrl(request)), 303);
  }

  let collaboratorUsers: { id: string; email: string }[] = [];
  if (collaborators.length > 0) {
    collaboratorUsers = await prisma.user.findMany({
      where: { email: { in: collaborators.map((c) => c.email) } },
      select: { id: true, email: true },
    });
    if (collaboratorUsers.length !== collaborators.length) {
      // At least one collaborator email doesn't have a Mercito account yet.
      return NextResponse.redirect(new URL("/upload?error=collaborators", baseUrl(request)), 303);
    }
  }

  let filePath: string;
  if (uploadedKey) {
    if (!isMediaKey(uploadedKey) || !(await fileExists(uploadedKey))) {
      return NextResponse.redirect(new URL("/upload?error=upload", baseUrl(request)), 303);
    }
    filePath = uploadedKey;
  } else {
    // Local driver only — buffers the whole file, fine for dev, not for hour-long uploads.
    const upload = file as File;
    filePath = newMediaKey(upload.name, mimeType);
    await saveFile(filePath, Buffer.from(await upload.arrayBuffer()), mimeType);
  }

  const uploaderPercentage = 100 - collaboratorTotal;

  await prisma.$transaction(async (tx) => {
    const mediaFile = await tx.mediaFile.create({
      data: {
        filePath,
        mimeType,
        uploaderId,
      },
    });

    const item = await tx.item.create({
      data: { mediaFileId: mediaFile.id, category, title },
    });

    // Every item always has an explicit payout split — the uploader keeps
    // whatever percentage collaborators didn't take (possibly 0).
    await tx.payoutSplit.create({
      data: { itemId: item.id, userId: uploaderId, percentage: uploaderPercentage },
    });
    for (const c of collaborators) {
      const user = collaboratorUsers.find((u) => u.email === c.email)!;
      await tx.payoutSplit.create({
        data: { itemId: item.id, userId: user.id, percentage: c.percentage },
      });
    }

    for (const label of tagLabels) {
      let tag = await tx.tag.findFirst({ where: { label, kind: null } });
      if (!tag) {
        tag = await tx.tag.create({ data: { label, createdById: uploaderId } });
      }
      await tx.itemTag.create({ data: { itemId: item.id, tagId: tag.id } });
    }

    for (const credit of credits) {
      let tag = await tx.tag.findFirst({ where: { label: credit.label, kind: "credit" } });
      if (!tag) {
        tag = await tx.tag.create({ data: { label: credit.label, kind: "credit", createdById: uploaderId } });
      }
      await tx.itemTag.create({ data: { itemId: item.id, tagId: tag.id, role: credit.role } });
    }
  });

  return NextResponse.redirect(new URL("/", baseUrl(request)), 303);
}
