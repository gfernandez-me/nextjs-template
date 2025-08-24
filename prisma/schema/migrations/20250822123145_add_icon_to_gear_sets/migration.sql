-- CreateEnum
CREATE TYPE "public"."GearType" AS ENUM ('WEAPON', 'ARMOR', 'HELM', 'NECK', 'RING', 'BOOTS');

-- CreateEnum
CREATE TYPE "public"."GearRank" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'HEROIC');

-- CreateEnum
CREATE TYPE "public"."MainStatType" AS ENUM ('ATT', 'DEF', 'MAX_HP', 'ATT_RATE', 'DEF_RATE', 'MAX_HP_RATE', 'CRI', 'CRI_DMG', 'SPEED', 'ACC', 'RES');

-- CreateEnum
CREATE TYPE "public"."StatCategory" AS ENUM ('FLAT', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "public"."HeroElement" AS ENUM ('FIRE', 'ICE', 'EARTH', 'LIGHT', 'DARK');

-- CreateEnum
CREATE TYPE "public"."HeroRarity" AS ENUM ('THREE_STAR', 'FOUR_STAR', 'FIVE_STAR', 'SIX_STAR');

-- CreateEnum
CREATE TYPE "public"."HeroClass" AS ENUM ('WARRIOR', 'KNIGHT', 'RANGER', 'MAGE', 'SOUL_WEAVER', 'THIEF');

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stat_types" (
    "id" SERIAL NOT NULL,
    "statName" TEXT NOT NULL,
    "statCategory" "public"."StatCategory" NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL,
    "allowedMainStatFor" "public"."GearType"[],
    "allowedSubstatFor" "public"."GearType"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stat_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gear_sets" (
    "id" SERIAL NOT NULL,
    "setName" TEXT NOT NULL,
    "piecesRequired" INTEGER NOT NULL,
    "effectDescription" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gear_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gear_substats" (
    "id" SERIAL NOT NULL,
    "gearId" INTEGER NOT NULL,
    "statTypeId" INTEGER NOT NULL,
    "statValue" DECIMAL(10,2) NOT NULL,
    "rolls" INTEGER NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL,
    "isModified" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gear_substats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gears" (
    "id" SERIAL NOT NULL,
    "ingameId" BIGINT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "public"."GearType" NOT NULL,
    "rank" "public"."GearRank" NOT NULL,
    "level" INTEGER NOT NULL,
    "enhance" INTEGER NOT NULL,
    "fScore" DOUBLE PRECISION,
    "score" DOUBLE PRECISION,
    "mainStatType" "public"."MainStatType" NOT NULL,
    "mainStatValue" DOUBLE PRECISION NOT NULL,
    "mainStatBaseValue" DOUBLE PRECISION NOT NULL,
    "statMultiplier" DOUBLE PRECISION NOT NULL,
    "tierMultiplier" DOUBLE PRECISION NOT NULL,
    "storage" BOOLEAN NOT NULL DEFAULT true,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "equippedBy" BIGINT,
    "ingameEquippedId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gears_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."heroes" (
    "id" SERIAL NOT NULL,
    "ingameId" BIGINT NOT NULL,
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
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "heroes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gear_priorities" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gearType" "public"."GearType",
    "gearSetId" INTEGER,
    "mainStatType" "public"."MainStatType",
    "prioritySub1Id" INTEGER,
    "prioritySub2Id" INTEGER,
    "prioritySub3Id" INTEGER,
    "prioritySub4Id" INTEGER,
    "heroIngameId" BIGINT,
    "heroName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gear_priorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gear_priority_heroes" (
    "id" SERIAL NOT NULL,
    "gearPriorityId" INTEGER NOT NULL,
    "heroIngameId" BIGINT NOT NULL,

    CONSTRAINT "gear_priority_heroes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gear_recommendations" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "heroIngameId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gear_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gear_recommendation_items" (
    "id" SERIAL NOT NULL,
    "gearRecommendationId" INTEGER NOT NULL,
    "type" "public"."GearType" NOT NULL,
    "mainStatType" "public"."MainStatType" NOT NULL,
    "statType1Id" INTEGER NOT NULL,
    "statType2Id" INTEGER,
    "statType3Id" INTEGER,
    "statType4Id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gear_recommendation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."settings" (
    "id" SERIAL NOT NULL,
    "fScoreIncludeMainStat" BOOLEAN NOT NULL DEFAULT true,
    "fScoreSubstatWeights" JSONB,
    "fScoreMainStatWeights" JSONB,
    "substatThresholds" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "public"."sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "stat_types_statName_key" ON "public"."stat_types"("statName");

-- CreateIndex
CREATE UNIQUE INDEX "gear_sets_setName_key" ON "public"."gear_sets"("setName");

-- CreateIndex
CREATE UNIQUE INDEX "gears_ingameId_key" ON "public"."gears"("ingameId");

-- CreateIndex
CREATE INDEX "gears_createdAt_idx" ON "public"."gears"("createdAt");

-- CreateIndex
CREATE INDEX "gears_rank_idx" ON "public"."gears"("rank");

-- CreateIndex
CREATE INDEX "gears_enhance_idx" ON "public"."gears"("enhance");

-- CreateIndex
CREATE INDEX "gears_equipped_idx" ON "public"."gears"("equipped");

-- CreateIndex
CREATE INDEX "gears_userId_idx" ON "public"."gears"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "heroes_ingameId_key" ON "public"."heroes"("ingameId");

-- CreateIndex
CREATE INDEX "heroes_userId_idx" ON "public"."heroes"("userId");

-- CreateIndex
CREATE INDEX "gear_priorities_userId_idx" ON "public"."gear_priorities"("userId");

-- CreateIndex
CREATE INDEX "gear_priorities_gearType_idx" ON "public"."gear_priorities"("gearType");

-- CreateIndex
CREATE INDEX "gear_priorities_gearSetId_idx" ON "public"."gear_priorities"("gearSetId");

-- CreateIndex
CREATE INDEX "gear_priorities_heroIngameId_idx" ON "public"."gear_priorities"("heroIngameId");

-- CreateIndex
CREATE UNIQUE INDEX "gear_priorities_userId_name_key" ON "public"."gear_priorities"("userId", "name");

-- CreateIndex
CREATE INDEX "gear_priority_heroes_heroIngameId_idx" ON "public"."gear_priority_heroes"("heroIngameId");

-- CreateIndex
CREATE UNIQUE INDEX "gear_priority_heroes_gearPriorityId_heroIngameId_key" ON "public"."gear_priority_heroes"("gearPriorityId", "heroIngameId");

-- CreateIndex
CREATE INDEX "settings_userId_idx" ON "public"."settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "settings_userId_key" ON "public"."settings"("userId");

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_substats" ADD CONSTRAINT "gear_substats_gearId_fkey" FOREIGN KEY ("gearId") REFERENCES "public"."gears"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_substats" ADD CONSTRAINT "gear_substats_statTypeId_fkey" FOREIGN KEY ("statTypeId") REFERENCES "public"."stat_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_substats" ADD CONSTRAINT "gear_substats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gears" ADD CONSTRAINT "gears_equippedBy_fkey" FOREIGN KEY ("equippedBy") REFERENCES "public"."heroes"("ingameId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gears" ADD CONSTRAINT "gears_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."heroes" ADD CONSTRAINT "heroes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_priorities" ADD CONSTRAINT "gear_priorities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_priorities" ADD CONSTRAINT "gear_priorities_gearSetId_fkey" FOREIGN KEY ("gearSetId") REFERENCES "public"."gear_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_priorities" ADD CONSTRAINT "gear_priorities_prioritySub1Id_fkey" FOREIGN KEY ("prioritySub1Id") REFERENCES "public"."stat_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_priorities" ADD CONSTRAINT "gear_priorities_prioritySub2Id_fkey" FOREIGN KEY ("prioritySub2Id") REFERENCES "public"."stat_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_priorities" ADD CONSTRAINT "gear_priorities_prioritySub3Id_fkey" FOREIGN KEY ("prioritySub3Id") REFERENCES "public"."stat_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_priorities" ADD CONSTRAINT "gear_priorities_prioritySub4Id_fkey" FOREIGN KEY ("prioritySub4Id") REFERENCES "public"."stat_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_priorities" ADD CONSTRAINT "gear_priorities_heroIngameId_fkey" FOREIGN KEY ("heroIngameId") REFERENCES "public"."heroes"("ingameId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_priority_heroes" ADD CONSTRAINT "gear_priority_heroes_gearPriorityId_fkey" FOREIGN KEY ("gearPriorityId") REFERENCES "public"."gear_priorities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_priority_heroes" ADD CONSTRAINT "gear_priority_heroes_heroIngameId_fkey" FOREIGN KEY ("heroIngameId") REFERENCES "public"."heroes"("ingameId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_recommendations" ADD CONSTRAINT "gear_recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_recommendations" ADD CONSTRAINT "gear_recommendations_heroIngameId_fkey" FOREIGN KEY ("heroIngameId") REFERENCES "public"."heroes"("ingameId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_recommendation_items" ADD CONSTRAINT "gear_recommendation_items_gearRecommendationId_fkey" FOREIGN KEY ("gearRecommendationId") REFERENCES "public"."gear_recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_recommendation_items" ADD CONSTRAINT "gear_recommendation_items_statType1Id_fkey" FOREIGN KEY ("statType1Id") REFERENCES "public"."stat_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_recommendation_items" ADD CONSTRAINT "gear_recommendation_items_statType2Id_fkey" FOREIGN KEY ("statType2Id") REFERENCES "public"."stat_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_recommendation_items" ADD CONSTRAINT "gear_recommendation_items_statType3Id_fkey" FOREIGN KEY ("statType3Id") REFERENCES "public"."stat_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_recommendation_items" ADD CONSTRAINT "gear_recommendation_items_statType4Id_fkey" FOREIGN KEY ("statType4Id") REFERENCES "public"."stat_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."settings" ADD CONSTRAINT "settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
