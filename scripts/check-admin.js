// Quick check for admin user and password validity
const { PrismaClient } = require("../prisma/generated/client");
const bcrypt = require("bcryptjs");

(async () => {
  const db = new PrismaClient();
  try {
    const user = await db.user.findUnique({
      where: { email: "admin@epic7optimizer.com" },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true,
      },
    });
    if (!user) {
      console.log(JSON.stringify({ exists: false }, null, 2));
      process.exit(0);
    }
    const ok = await bcrypt.compare("admin1234", user.password);
    console.log(
      JSON.stringify(
        {
          exists: true,
          id: user.id,
          email: user.email,
          hasPasswordHash: !!user.password,
          passwordValid: ok,
          createdAt: user.createdAt,
        },
        null,
        2
      )
    );
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
})();
