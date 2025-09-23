import { PrismaClient, StatCategory, GearType } from "./generated/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Admin seed credentials (override via env if desired)
    const adminEmail =
      process.env.SEED_ADMIN_EMAIL || "admin@epic7optimizer.com";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin1234";

    // Create admin user if it doesn't exist
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          id: "admin-user",
          name: "Admin User",
          email: adminEmail,
          emailVerified: true,
          image: null,
        },
      });
      console.log("✅ Admin user created successfully!");
      console.log(`   Email: ${adminUser.email}`);
    } else {
      console.log("✅ Admin user already exists, skipping...");
    }

    // Ensure Better Auth credential account exists for the admin user
    // Following Better Auth docs: account providerId should be "credential",
    // accountId can be the user's id, and password must be hashed using Better Auth's hasher
    const existingCredentialAccount = await prisma.account.findFirst({
      where: { userId: adminUser.id, providerId: "credential" },
    });

    if (!existingCredentialAccount) {
      const passwordHash = await hashPassword(adminPassword);
      await prisma.account.create({
        data: {
          userId: adminUser.id,
          providerId: "credential",
          accountId: adminUser.id,
          password: passwordHash,
        },
      });
      console.log("✅ Credentials account created for admin user");
      console.log("   You can login with:");
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    } else {
      console.log("✅ Admin credentials account exists, skipping...");
    }

    // Create default settings for admin user if they don't exist
    const existingSettings = await prisma.settings.findUnique({
      where: { userId: adminUser.id },
    });

    if (!existingSettings) {
      await prisma.settings.create({
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

    // Create default stat types with proper gear restrictions
    // Based on Epic 7 game rules from .cursor/rules/stat-rules.mdc
    const statTypes = [
      {
        originalStatName: "Speed",
        statName: "Speed",
        statCategory: StatCategory.FLAT,
        weight: 2.0,
        allowedMainStatFor: [GearType.BOOTS], // Speed can only be main stat on boots
        allowedSubstatFor: [
          GearType.WEAPON,
          GearType.ARMOR,
          GearType.HELM,
          GearType.NECK,
          GearType.RING,
          GearType.BOOTS,
        ], // Speed can be substat on any gear
      },
      {
        originalStatName: "Attack",
        statName: "Attack",
        statCategory: StatCategory.FLAT,
        weight: 0.3,
        allowedMainStatFor: [
          GearType.WEAPON,
          GearType.NECK,
          GearType.RING,
          GearType.BOOTS,
        ], // Attack can be main stat on variable gear + fixed on weapon
        allowedSubstatFor: [
          GearType.WEAPON,
          GearType.ARMOR,
          GearType.HELM,
          GearType.NECK,
          GearType.RING,
          GearType.BOOTS,
        ], // Attack can be substat on any gear
      },
      {
        originalStatName: "AttackPercent",
        statName: "Attack %",
        statCategory: StatCategory.PERCENTAGE,
        weight: 1.2,
        allowedMainStatFor: [GearType.NECK, GearType.RING, GearType.BOOTS], // Attack % can only be main stat on variable gear
        allowedSubstatFor: [
          GearType.WEAPON,
          GearType.ARMOR,
          GearType.HELM,
          GearType.NECK,
          GearType.RING,
          GearType.BOOTS,
        ], // Attack % can be substat on any gear
      },
      {
        originalStatName: "Defense",
        statName: "Defense",
        statCategory: StatCategory.FLAT,
        weight: 0.2,
        allowedMainStatFor: [GearType.ARMOR, GearType.NECK], // Defense can be main stat on armor (fixed) + necklace only
        allowedSubstatFor: [
          GearType.WEAPON,
          GearType.ARMOR,
          GearType.HELM,
          GearType.NECK,
          GearType.RING,
          GearType.BOOTS,
        ], // Defense can be substat on any gear
      },
      {
        originalStatName: "DefensePercent",
        statName: "Defense %",
        statCategory: StatCategory.PERCENTAGE,
        weight: 0.8,
        allowedMainStatFor: [GearType.NECK, GearType.RING, GearType.BOOTS], // Defense % can only be main stat on variable gear
        allowedSubstatFor: [
          GearType.WEAPON,
          GearType.ARMOR,
          GearType.HELM,
          GearType.NECK,
          GearType.RING,
          GearType.BOOTS,
        ], // Defense % can be substat on any gear
      },
      {
        originalStatName: "Health",
        statName: "Health",
        statCategory: StatCategory.FLAT,
        weight: 0.2,
        allowedMainStatFor: [
          GearType.HELM,
          GearType.NECK,
          GearType.RING,
          GearType.BOOTS,
        ], // Health can be main stat on helm (fixed) + variable gear
        allowedSubstatFor: [
          GearType.WEAPON,
          GearType.ARMOR,
          GearType.HELM,
          GearType.NECK,
          GearType.RING,
          GearType.BOOTS,
        ], // Health can be substat on any gear
      },
      {
        originalStatName: "HealthPercent",
        statName: "Health %",
        statCategory: StatCategory.PERCENTAGE,
        weight: 0.8,
        allowedMainStatFor: [GearType.NECK, GearType.RING, GearType.BOOTS], // Health % can only be main stat on variable gear
        allowedSubstatFor: [
          GearType.WEAPON,
          GearType.ARMOR,
          GearType.HELM,
          GearType.NECK,
          GearType.RING,
          GearType.BOOTS,
        ], // Health % can be substat on any gear
      },
      {
        originalStatName: "CriticalHitChancePercent",
        statName: "Crit %",
        statCategory: StatCategory.PERCENTAGE,
        weight: 1.5,
        allowedMainStatFor: [GearType.NECK], // Crit % can only be main stat on necklace
        allowedSubstatFor: [
          GearType.WEAPON,
          GearType.ARMOR,
          GearType.HELM,
          GearType.NECK,
          GearType.RING,
          GearType.BOOTS,
        ], // Crit % can be substat on any gear
      },
      {
        originalStatName: "CriticalHitDamagePercent",
        statName: "Crit Dmg %",
        statCategory: StatCategory.PERCENTAGE,
        weight: 1.3,
        allowedMainStatFor: [GearType.NECK], // Crit Dmg % can only be main stat on necklace
        allowedSubstatFor: [
          GearType.WEAPON,
          GearType.ARMOR,
          GearType.HELM,
          GearType.NECK,
          GearType.RING,
          GearType.BOOTS,
        ], // Crit Dmg % can be substat on any gear
      },
      {
        originalStatName: "EffectivenessPercent",
        statName: "Effectiveness %",
        statCategory: StatCategory.PERCENTAGE,
        weight: 0.7,
        allowedMainStatFor: [GearType.RING], // Effectiveness % can only be main stat on ring
        allowedSubstatFor: [
          GearType.WEAPON,
          GearType.ARMOR,
          GearType.HELM,
          GearType.NECK,
          GearType.RING,
          GearType.BOOTS,
        ], // Effectiveness % can be substat on any gear
      },
      {
        originalStatName: "EffectResistancePercent",
        statName: "Effect Resist %",
        statCategory: StatCategory.PERCENTAGE,
        weight: 0.6,
        allowedMainStatFor: [GearType.RING], // Effect Resist % can only be main stat on ring
        allowedSubstatFor: [
          GearType.WEAPON,
          GearType.ARMOR,
          GearType.HELM,
          GearType.NECK,
          GearType.RING,
          GearType.BOOTS,
        ], // Effect Resist % can be substat on any gear
      },
    ];

    for (const statType of statTypes) {
      await prisma.statTypes.upsert({
        where: { statName: statType.statName },
        create: statType,
        update: statType,
      });
    }
    console.log("✅ Stat types created/updated with proper gear restrictions!");
    console.log(
      "   Note: Stat restrictions are defined in .cursor/rules/stat-rules.mdc"
    );

    // Create default gear sets if they don't exist
    const gearSets = [
      {
        setName: "SpeedSet",
        piecesRequired: 4,
        effectDescription: "+25% Speed",
        icon: "⚡",
      },
      {
        setName: "AttackSet",
        piecesRequired: 4,
        effectDescription: "+35% Attack",
        icon: "⚔️",
      },
      {
        setName: "HealthSet",
        piecesRequired: 2,
        effectDescription: "+15% Health",
        icon: "❤️",
      },
      {
        setName: "DefenseSet",
        piecesRequired: 2,
        effectDescription: "+15% Defense",
        icon: "🛡️",
      },
      {
        setName: "CriticalSet",
        piecesRequired: 2,
        effectDescription: "+12% Crit Chance",
        icon: "🎯",
      },
      {
        setName: "HitSet",
        piecesRequired: 2,
        effectDescription: "+20% Effectiveness",
        icon: "🎯",
      },
      {
        setName: "DestructionSet",
        piecesRequired: 4,
        effectDescription: "+40% Crit Damage",
        icon: "💥",
      },
      {
        setName: "LifestealSet",
        piecesRequired: 4,
        effectDescription: "Heal 20% of damage dealt",
        icon: "🩸",
      },
      {
        setName: "CounterSet",
        piecesRequired: 4,
        effectDescription: "20% chance to counterattack",
        icon: "🔄",
      },
      {
        setName: "ImmunitySet",
        piecesRequired: 2,
        effectDescription: "Grants Immunity for 1 turn",
        icon: "💪",
      },
      {
        setName: "ResistSet",
        piecesRequired: 2,
        effectDescription: "+20% Effect Resistance",
        icon: "🛡️",
      },
      {
        setName: "TorrentSet",
        piecesRequired: 2,
        effectDescription: "+10% Atk, -10% HP",
        icon: "🌊",
      },
      {
        setName: "InjurySet",
        piecesRequired: 4,
        effectDescription: "Reduces enemy max HP",
        icon: "💀",
      },
      {
        setName: "PenetrationSet",
        piecesRequired: 2,
        effectDescription: "Ignores 15% Defense",
        icon: "⚡",
      },
      {
        setName: "UnitySet",
        piecesRequired: 2,
        effectDescription: "+4% Ally Dual Attack Chance",
        icon: "🤝",
      },
      {
        setName: "RageSet",
        piecesRequired: 4,
        effectDescription: "+30% Crit Dmg vs debuffed targets",
        icon: "😠",
      },
      {
        setName: "ProtectionSet",
        piecesRequired: 4,
        effectDescription: "+15% Barrier strength",
        icon: "🛡️",
      },
      {
        setName: "RevengeSet",
        piecesRequired: 4,
        effectDescription:
          "15% chance to decrease buff duration by 1 turn when attacking",
        icon: "⚡",
      },
      {
        setName: "ReversalSet",
        piecesRequired: 4,
        effectDescription:
          "Increases Speed by 15%. Upon reviving, increases Combat Readiness by 50%",
        icon: "🔄",
      },
      {
        setName: "RiposteSet",
        piecesRequired: 4,
        effectDescription:
          "When successfully evading, has a 70% chance to counterattack",
        icon: "⚔️",
      },
    ];

    for (const set of gearSets) {
      await prisma.gearSets.upsert({
        where: { setName: set.setName },
        create: { ...set, isActive: true },
        update: { ...set, isActive: true },
      });
    }
    console.log("✅ Gear sets created/updated!");

    console.log("🎉 Database seeding completed successfully!");
    console.log("");
    console.log("📝 Next steps:");
    console.log("   1. The admin user has been created");
    console.log("   2. Use the signup/login pages to set a password");
    console.log("   3. Default settings and gear data are configured");
    console.log(
      "   4. Stat rules are documented in .cursor/rules/stat-rules.mdc"
    );
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
