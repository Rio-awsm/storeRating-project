import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";

async function main() {
  const email = "admin@platform.local";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists:", email);
    return;
  }
  const passwordHash = await bcrypt.hash("Admin@1234", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Platform Administrator Account",
      email,
      address: "HQ - Platform Admin Office",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("Created admin:", admin.email, "password: Admin@1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
