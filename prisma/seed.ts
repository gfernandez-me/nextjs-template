import { PrismaClient } from "./generated/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create admin user if it doesn't exist
    let adminUser = await prisma.user.findUnique({
      where: { email: "admin@epic7optimizer.com" },
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("admin1234", 12);
      adminUser = await prisma.user.create({
        data: {
          id: "admin-user",
          name: "Admin User",
          email: "admin@epic7optimizer.com",
          password: hashedPassword,
        },
      });
      console.log("✅ Admin user created successfully!");
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Password: admin1234`);
    } else {
      console.log("✅ Admin user already exists, skipping...");
    }

    // Create default settings for admin user if they don't exist
    const existingSettings = await prisma.settings.findUnique({
      where: { userId: adminUser.id },
    });

    if (!existingSettings) {
      const defaultSettings = await prisma.settings.create({
        data: {
          userId: adminUser.id,
          fScoreIncludeMainStat: true,
          fScoreSubstatWeights: {
            Speed: 2.0,
            "Crit %": 1.5,
            "Crit Dmg %": 1.3,
            "Attack %": 1.2,
            "Defense %": 0.8,
            "Health %": 0.8,
            "Effectiveness %": 0.7,
            "Effect Resist %": 0.6,
            Attack: 0.3,
            Defense: 0.2,
            Health: 0.2,
          },
          fScoreMainStatWeights: {
            att: 0,
            def: 0,
            max_hp: 0,
            att_rate: 0.5,
            def_rate: 0.3,
            max_hp_rate: 0.3,
            cri: 0.6,
            cri_dmg: 0.6,
            speed: 1.0,
            acc: 0.4,
            res: 0.4,
          },
          substatThresholds: {
            Speed: { plus15: [4, 8, 12, 18] },
            "Crit %": { plus15: [4, 8, 12, 16] },
            "Crit Dmg %": { plus15: [4, 8, 12, 20] },
            "Attack %": { plus15: [4, 8, 12, 16] },
            "Defense %": { plus15: [4, 8, 12, 16] },
            "Health %": { plus15: [4, 8, 12, 16] },
            "Effectiveness %": { plus15: [4, 8, 12, 16] },
            "Effect Resist %": { plus15: [4, 8, 12, 16] },
            Attack: { plus15: [20, 40, 60, 90] },
            Defense: { plus15: [10, 20, 30, 45] },
            Health: { plus15: [50, 100, 150, 220] },
          },
        },
      });
      console.log("✅ Default settings created for admin user!");
    } else {
      console.log("✅ Settings already exist for admin user, skipping...");
    }

    // Create default stat types if they don't exist
    const statTypes = [
      {
        statName: "Speed",
        statCategory: "flat" as const,
        weight: 2.0,
        isMainStat: false,
        isSubstat: true,
      },
      {
        statName: "Attack",
        statCategory: "flat" as const,
        weight: 0.3,
        isMainStat: false,
        isSubstat: true,
      },
      {
        statName: "Attack %",
        statCategory: "percentage" as const,
        weight: 1.2,
        isMainStat: false,
        isSubstat: true,
      },
      {
        statName: "Defense",
        statCategory: "flat" as const,
        weight: 0.2,
        isMainStat: false,
        isSubstat: true,
      },
      {
        statName: "Defense %",
        statCategory: "percentage" as const,
        weight: 0.8,
        isMainStat: false,
        isSubstat: true,
      },
      {
        statName: "Health",
        statCategory: "flat" as const,
        weight: 0.2,
        isMainStat: false,
        isSubstat: true,
      },
      {
        statName: "Health %",
        statCategory: "percentage" as const,
        weight: 0.8,
        isMainStat: false,
        isSubstat: true,
      },
      {
        statName: "Crit %",
        statCategory: "percentage" as const,
        weight: 1.5,
        isMainStat: false,
        isSubstat: true,
      },
      {
        statName: "Crit Dmg %",
        statCategory: "percentage" as const,
        weight: 1.3,
        isMainStat: false,
        isSubstat: true,
      },
      {
        statName: "Effectiveness %",
        statCategory: "percentage" as const,
        weight: 0.7,
        isMainStat: false,
        isSubstat: true,
      },
      {
        statName: "Effect Resist %",
        statCategory: "percentage" as const,
        weight: 0.6,
        isMainStat: false,
        isSubstat: true,
      },
    ];

    for (const statType of statTypes) {
      await prisma.statTypes.upsert({
        where: { statName: statType.statName },
        create: statType,
        update: statType,
      });
    }
    console.log("✅ Stat types created/updated!");

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
