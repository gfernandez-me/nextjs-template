/*
  Warnings:

  - You are about to drop the column `singleton` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the `substats` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `gears` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `heroes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `settings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."substats" DROP CONSTRAINT "substats_gearId_fkey";

-- DropForeignKey
ALTER TABLE "public"."substats" DROP CONSTRAINT "substats_statTypeId_fkey";

-- DropIndex
DROP INDEX "public"."settings_singleton_key";

-- AlterTable
ALTER TABLE "public"."gears" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."heroes" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."settings" DROP COLUMN "singleton",
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."substats";

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

    CONSTRAINT "gear_substats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gear_priorities" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
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

-- CreateIndex
CREATE INDEX "gear_priorities_userId_idx" ON "public"."gear_priorities"("userId");

-- CreateIndex
CREATE INDEX "gear_priorities_gearSetId_idx" ON "public"."gear_priorities"("gearSetId");

-- CreateIndex
CREATE INDEX "gear_priorities_heroIngameId_idx" ON "public"."gear_priorities"("heroIngameId");

-- CreateIndex
CREATE UNIQUE INDEX "gear_priorities_userId_name_key" ON "public"."gear_priorities"("userId", "name");

-- CreateIndex
CREATE INDEX "gears_userId_idx" ON "public"."gears"("userId");

-- CreateIndex
CREATE INDEX "heroes_userId_idx" ON "public"."heroes"("userId");

-- CreateIndex
CREATE INDEX "settings_userId_idx" ON "public"."settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "settings_userId_key" ON "public"."settings"("userId");

-- AddForeignKey
ALTER TABLE "public"."gear_substats" ADD CONSTRAINT "gear_substats_gearId_fkey" FOREIGN KEY ("gearId") REFERENCES "public"."gears"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_substats" ADD CONSTRAINT "gear_substats_statTypeId_fkey" FOREIGN KEY ("statTypeId") REFERENCES "public"."stat_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_substats" ADD CONSTRAINT "gear_substats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "public"."settings" ADD CONSTRAINT "settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
