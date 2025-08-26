/*
  Warnings:

  - You are about to drop the column `heroId` on the `gear_recommendations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."gear_recommendations" DROP CONSTRAINT "gear_recommendations_heroId_fkey";

-- AlterTable
ALTER TABLE "public"."gear_recommendations" DROP COLUMN "heroId",
ADD COLUMN     "heroName" TEXT;
