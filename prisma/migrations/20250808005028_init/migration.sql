/*
  Warnings:

  - You are about to drop the column `name` on the `gears` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."gears" DROP COLUMN "name";

-- CreateIndex
CREATE INDEX "gears_createdAt_idx" ON "public"."gears"("createdAt");

-- CreateIndex
CREATE INDEX "gears_rank_idx" ON "public"."gears"("rank");

-- CreateIndex
CREATE INDEX "gears_enhance_idx" ON "public"."gears"("enhance");

-- CreateIndex
CREATE INDEX "gears_equipped_idx" ON "public"."gears"("equipped");
