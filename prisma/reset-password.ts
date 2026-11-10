import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

/**
 * Manual password reset — there's no self-service "forgot password" flow.
 * Usage: npx tsx prisma/reset-password.ts <email> <newPassword>
 */
async function main() {
  const [, , email, password] = process.argv;

  if (!email || !password) {
    console.error("Usage: npx tsx prisma/reset-password.ts <email> <newPassword>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    console.error(`No account found for ${normalizedEmail}.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  console.log(`Password reset for ${normalizedEmail}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
