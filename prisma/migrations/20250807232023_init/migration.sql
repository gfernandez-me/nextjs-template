-- CreateEnum
CREATE TYPE "public"."GearType" AS ENUM ('weapon', 'armor', 'helm', 'neck', 'ring', 'boot');

-- CreateEnum
CREATE TYPE "public"."GearDisplayName" AS ENUM ('Weapon', 'Armor', 'Helmet', 'Necklace', 'Ring', 'Boots');

-- CreateEnum
CREATE TYPE "public"."GearRank" AS ENUM ('Common', 'Uncommon', 'Rare', 'Epic', 'Heroic');

-- CreateEnum
CREATE TYPE "public"."MainStatType" AS ENUM ('att', 'def', 'max_hp', 'att_rate', 'def_rate', 'max_hp_rate', 'cri', 'cri_dmg', 'speed', 'acc', 'res');

-- CreateEnum
CREATE TYPE "public"."StatCategory" AS ENUM ('flat', 'percentage');

-- CreateEnum
CREATE TYPE "public"."HeroElement" AS ENUM ('Fire', 'Ice', 'Earth', 'Light', 'Dark');

-- CreateEnum
CREATE TYPE "public"."HeroRarity" AS ENUM ('THREE_STAR', 'FOUR_STAR', 'FIVE_STAR');

-- CreateEnum
CREATE TYPE "public"."HeroClass" AS ENUM ('Warrior', 'Knight', 'Ranger', 'Mage', 'SoulWeaver', 'Thief');

-- CreateTable
CREATE TABLE "public"."stat_types" (
    "id" SERIAL NOT NULL,
    "statName" TEXT NOT NULL,
    "statCategory" "public"."StatCategory" NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL,
    "isMainStat" BOOLEAN NOT NULL DEFAULT false,
    "isSubstat" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stat_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gear_sets" (
    "id" SERIAL NOT NULL,
    "setName" TEXT NOT NULL,
    "piecesRequired" INTEGER NOT NULL,
    "effectDescription" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gear_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."substats" (
    "id" SERIAL NOT NULL,
    "gearId" INTEGER NOT NULL,
    "statTypeId" INTEGER NOT NULL,
    "statValue" DECIMAL(10,2) NOT NULL,
    "rolls" INTEGER NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL,
    "isModified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "substats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gears" (
    "id" SERIAL NOT NULL,
    "ingameId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Unknown',
    "type" "public"."GearType" NOT NULL,
    "gear" "public"."GearDisplayName" NOT NULL,
    "rank" "public"."GearRank" NOT NULL,
    "level" INTEGER NOT NULL,
    "enhance" INTEGER NOT NULL,
    "mainStatType" "public"."MainStatType" NOT NULL,
    "mainStatValue" DOUBLE PRECISION NOT NULL,
    "mainStatBaseValue" DOUBLE PRECISION NOT NULL,
    "statMultiplier" DOUBLE PRECISION NOT NULL,
    "tierMultiplier" DOUBLE PRECISION NOT NULL,
    "storage" BOOLEAN NOT NULL DEFAULT true,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "equippedBy" INTEGER,
    "ingameEquippedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gears_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."heroes" (
    "id" SERIAL NOT NULL,
    "ingameId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "element" "public"."HeroElement",
    "rarity" "public"."HeroRarity",
    "class" "public"."HeroClass",
    "attack" INTEGER,
    "defense" INTEGER,
    "health" INTEGER,
    "speed" INTEGER,
    "criticalHitChance" INTEGER,
    "criticalHitDamage" INTEGER,
    "effectiveness" INTEGER,
    "effectResistance" INTEGER,
    "weaponId" INTEGER,
    "armorId" INTEGER,
    "helmetId" INTEGER,
    "necklaceId" INTEGER,
    "ringId" INTEGER,
    "bootId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "heroes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stat_types_statName_key" ON "public"."stat_types"("statName");

-- CreateIndex
CREATE UNIQUE INDEX "gear_sets_setName_key" ON "public"."gear_sets"("setName");

-- CreateIndex
CREATE UNIQUE INDEX "gears_ingameId_key" ON "public"."gears"("ingameId");

-- CreateIndex
CREATE UNIQUE INDEX "heroes_ingameId_key" ON "public"."heroes"("ingameId");

-- AddForeignKey
ALTER TABLE "public"."substats" ADD CONSTRAINT "substats_gearId_fkey" FOREIGN KEY ("gearId") REFERENCES "public"."gears"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."substats" ADD CONSTRAINT "substats_statTypeId_fkey" FOREIGN KEY ("statTypeId") REFERENCES "public"."stat_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gears" ADD CONSTRAINT "gears_equippedBy_fkey" FOREIGN KEY ("equippedBy") REFERENCES "public"."heroes"("ingameId") ON DELETE SET NULL ON UPDATE CASCADE;
