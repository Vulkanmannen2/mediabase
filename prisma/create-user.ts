import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

/**
 * Manual account creation — the public /signup route was removed deliberately.
 * Usage: npx tsx prisma/create-user.ts <email> <password> [name]
 */
async function main() {
  const [, , email, password, name] = process.argv;

  if (!email || !password) {
    console.error("Usage: npx tsx prisma/create-user.ts <email> <password> [name]");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    console.error(`An account with ${normalizedEmail} already exists.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email: normalizedEmail, passwordHash, name: name?.trim() || null },
  });

  console.log(`Created account: ${user.email} (id ${user.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
