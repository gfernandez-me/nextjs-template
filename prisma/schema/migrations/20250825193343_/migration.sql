/*
  Warnings:

  - You are about to drop the column `description` on the `gear_recommendations` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `gear_recommendations` table. All the data in the column will be lost.
  - You are about to drop the column `equippedBy` on the `gears` table. All the data in the column will be lost.
  - The `ingameEquippedId` column on the `gears` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `gear_recommendation_hero_links` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gear_recommendation_priority_stats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gear_recommendation_set_links` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `statType1Id` to the `gear_recommendation_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."gear_recommendation_hero_links" DROP CONSTRAINT "gear_recommendation_hero_links_gearRecommendationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_recommendation_hero_links" DROP CONSTRAINT "gear_recommendation_hero_links_heroIngameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_recommendation_priority_stats" DROP CONSTRAINT "gear_recommendation_priority_stats_gearRecommendationItemI_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_recommendation_priority_stats" DROP CONSTRAINT "gear_recommendation_priority_stats_statTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_recommendation_set_links" DROP CONSTRAINT "gear_recommendation_set_links_gearRecommendationItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."gear_recommendation_set_links" DROP CONSTRAINT "gear_recommendation_set_links_gearSetId_fkey";

-- DropForeignKey
ALTER TABLE "public"."gears" DROP CONSTRAINT "gears_equippedBy_fkey";

-- AlterTable
ALTER TABLE "public"."gear_recommendation_items" ADD COLUMN     "statType1Id" INTEGER NOT NULL,
ADD COLUMN     "statType2Id" INTEGER,
ADD COLUMN     "statType3Id" INTEGER,
ADD COLUMN     "statType4Id" INTEGER;

-- AlterTable
ALTER TABLE "public"."gear_recommendations" DROP COLUMN "description",
DROP COLUMN "isActive",
ADD COLUMN     "heroId" INTEGER;

-- AlterTable
ALTER TABLE "public"."gears" DROP COLUMN "equippedBy",
ADD COLUMN     "heroId" INTEGER,
DROP COLUMN "ingameEquippedId",
ADD COLUMN     "ingameEquippedId" BIGINT;

-- DropTable
DROP TABLE "public"."gear_recommendation_hero_links";

-- DropTable
DROP TABLE "public"."gear_recommendation_priority_stats";

-- DropTable
DROP TABLE "public"."gear_recommendation_set_links";

-- AddForeignKey
ALTER TABLE "public"."gears" ADD CONSTRAINT "gears_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "public"."heroes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_recommendations" ADD CONSTRAINT "gear_recommendations_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "public"."heroes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_recommendation_items" ADD CONSTRAINT "gear_recommendation_items_statType1Id_fkey" FOREIGN KEY ("statType1Id") REFERENCES "public"."stat_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_recommendation_items" ADD CONSTRAINT "gear_recommendation_items_statType2Id_fkey" FOREIGN KEY ("statType2Id") REFERENCES "public"."stat_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_recommendation_items" ADD CONSTRAINT "gear_recommendation_items_statType3Id_fkey" FOREIGN KEY ("statType3Id") REFERENCES "public"."stat_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_recommendation_items" ADD CONSTRAINT "gear_recommendation_items_statType4Id_fkey" FOREIGN KEY ("statType4Id") REFERENCES "public"."stat_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
