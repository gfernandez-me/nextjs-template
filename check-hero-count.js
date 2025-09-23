#!/usr/bin/env node

/**
 * Check hero count in database
 */

import { PrismaClient } from "#prisma";

async function checkHeroCount() {
  const prisma = new PrismaClient();

  try {
    const count = await prisma.heroes.count();
    console.log(`Total heroes in database: ${count}`);

    const rinak = await prisma.heroes.findFirst({
      where: { name: "Rinak" },
    });

    if (rinak) {
      console.log("\nRinak details:");
      console.log(`  Element: ${rinak.element}`);
      console.log(`  Class: ${rinak.class}`);
      console.log(`  Rarity: ${rinak.rarity}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHeroCount();
