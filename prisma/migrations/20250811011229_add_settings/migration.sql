-- AlterEnum
ALTER TYPE "public"."HeroRarity" ADD VALUE 'SIX_STAR';

-- CreateTable
CREATE TABLE "public"."settings" (
    "id" SERIAL NOT NULL,
    "fScoreIncludeMainStat" BOOLEAN NOT NULL DEFAULT true,
    "fScoreSubstatWeights" JSONB,
    "fScoreMainStatWeights" JSONB,
    "substatThresholds" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "singleton" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_singleton_key" ON "public"."settings"("singleton");
