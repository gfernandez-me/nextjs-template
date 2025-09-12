/*
  Warnings:

  - A unique constraint covering the columns `[ingameId,userId]` on the table `gears` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ingameId,userId]` on the table `heroes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."gears_ingameId_key";

-- DropIndex
DROP INDEX "public"."heroes_ingameId_key";

-- AlterTable
ALTER TABLE "public"."heroes" ADD COLUMN     "count" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "gears_ingameId_userId_key" ON "public"."gears"("ingameId", "userId");

-- CreateIndex
CREATE INDEX "heroes_name_userId_idx" ON "public"."heroes"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "heroes_ingameId_userId_key" ON "public"."heroes"("ingameId", "userId");
