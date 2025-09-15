/*
  Warnings:

  - You are about to drop the column `count` on the `heroes` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."heroes_name_userId_idx";

-- AlterTable
ALTER TABLE "public"."heroes" DROP COLUMN "count",
ADD COLUMN     "duplicateCount" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "heroes_ingameId_userId_idx" ON "public"."heroes"("ingameId", "userId");
