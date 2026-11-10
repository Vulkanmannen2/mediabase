import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  console.log(JSON.stringify(users, null, 2));
}

main().finally(async () => {
  await prisma.$disconnect();
});
