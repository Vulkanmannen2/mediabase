import "dotenv/config";
import { prisma } from "../lib/prisma";

/**
 * Manual account deletion. Refuses if the account has any uploads, payout
 * splits, or created tags attached — those need to be reassigned or removed
 * first, this script won't silently cascade-delete someone's content.
 * Usage: npx tsx prisma/delete-user.ts <email>
 */
async function main() {
  const [, , email] = process.argv;
  if (!email) {
    console.error("Usage: npx tsx prisma/delete-user.ts <email>");
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    console.error(`No account found for ${normalizedEmail}.`);
    process.exit(1);
  }

  const [mediaFiles, payoutSplits, createdTags] = await Promise.all([
    prisma.mediaFile.count({ where: { uploaderId: user.id } }),
    prisma.payoutSplit.count({ where: { userId: user.id } }),
    prisma.tag.count({ where: { createdById: user.id } }),
  ]);

  if (mediaFiles > 0 || payoutSplits > 0 || createdTags > 0) {
    console.error(
      `Refusing to delete ${normalizedEmail}: ${mediaFiles} uploaded file(s), ${payoutSplits} payout split(s), ${createdTags} created tag(s) still reference this account.`
    );
    process.exit(1);
  }

  await prisma.user.delete({ where: { id: user.id } });
  console.log(`Deleted account: ${normalizedEmail}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
