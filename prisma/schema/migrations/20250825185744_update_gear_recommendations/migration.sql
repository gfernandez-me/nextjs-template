/*
  Warnings:

  - You are about to drop the column `statType1Id` on the `gear_recommendation_items` table. All the data in the column will be lost.
  - You are about to drop the column `statType2Id` on the `gear_recommendation_items` table. All the data in the column will be lost.
  - You are about to drop the column `statType3Id` on the `gear_recommendation_items` table. All the data in the column will be lost.
  - You are about to drop the column `statType4Id` on the `gear_recommendation_items` table. All the data in the column will be lost.
  - You are about to drop the column `heroIngameId` on the `gear_recommendations` table. All the data in the column will be lost.
  - You are about to drop the `gear_priorities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gear_priority_heroes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `gear_recommendations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."gear_priorities" DROP CONSTRAINT "gear_priorities_gearSetId_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_priorities" DROP CONSTRAINT "gear_priorities_heroIngameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_priorities" DROP CONSTRAINT "gear_priorities_prioritySub1Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_priorities" DROP CONSTRAINT "gear_priorities_prioritySub2Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_priorities" DROP CONSTRAINT "gear_priorities_prioritySub3Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_priorities" DROP CONSTRAINT "gear_priorities_prioritySub4Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_priorities" DROP CONSTRAINT "gear_priorities_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_priority_heroes" DROP CONSTRAINT "gear_priority_heroes_gearPriorityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_priority_heroes" DROP CONSTRAINT "gear_priority_heroes_heroIngameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_recommendation_items" DROP CONSTRAINT "gear_recommendation_items_statType1Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_recommendation_items" DROP CONSTRAINT "gear_recommendation_items_statType2Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_recommendation_items" DROP CONSTRAINT "gear_recommendation_items_statType3Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_recommendation_items" DROP CONSTRAINT "gear_recommendation_items_statType4Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_recommendations" DROP CONSTRAINT "gear_recommendations_heroIngameId_fkey";

-- AlterTable
ALTER TABLE "public"."gear_recommendation_items" DROP COLUMN "statType1Id",
DROP COLUMN "statType2Id",
DROP COLUMN "statType3Id",
DROP COLUMN "statType4Id";

-- AlterTable
ALTER TABLE "public"."gear_recommendations" DROP COLUMN "heroIngameId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."gear_priorities";

-- DropTable
DROP TABLE "public"."gear_priority_heroes";

-- CreateTable
CREATE TABLE "public"."gear_recommendation_set_links" (
    "id" SERIAL NOT NULL,
    "gearRecommendationItemId" INTEGER NOT NULL,
    "gearSetId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gear_recommendation_set_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gear_recommendation_priority_stats" (
    "id" SERIAL NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "gearRecommendationItemId" INTEGER NOT NULL,
    "statTypeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gear_recommendation_priority_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gear_recommendation_hero_links" (
    "id" SERIAL NOT NULL,
    "gearRecommendationId" INTEGER NOT NULL,
    "heroIngameId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gear_recommendation_hero_links_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."gear_recommendation_set_links" ADD CONSTRAINT "gear_recommendation_set_links_gearRecommendationItemId_fkey" FOREIGN KEY ("gearRecommendationItemId") REFERENCES "public"."gear_recommendation_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_recommendation_set_links" ADD CONSTRAINT "gear_recommendation_set_links_gearSetId_fkey" FOREIGN KEY ("gearSetId") REFERENCES "public"."gear_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_recommendation_priority_stats" ADD CONSTRAINT "gear_recommendation_priority_stats_gearRecommendationItemI_fkey" FOREIGN KEY ("gearRecommendationItemId") REFERENCES "public"."gear_recommendation_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_recommendation_priority_stats" ADD CONSTRAINT "gear_recommendation_priority_stats_statTypeId_fkey" FOREIGN KEY ("statTypeId") REFERENCES "public"."stat_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_recommendation_hero_links" ADD CONSTRAINT "gear_recommendation_hero_links_gearRecommendationId_fkey" FOREIGN KEY ("gearRecommendationId") REFERENCES "public"."gear_recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_recommendation_hero_links" ADD CONSTRAINT "gear_recommendation_hero_links_heroIngameId_fkey" FOREIGN KEY ("heroIngameId") REFERENCES "public"."heroes"("ingameId") ON DELETE RESTRICT ON UPDATE CASCADE;
