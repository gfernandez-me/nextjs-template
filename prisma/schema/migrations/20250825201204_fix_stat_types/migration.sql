/*
  Warnings:

  - A unique constraint covering the columns `[originalStatName]` on the table `stat_types` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `originalStatName` to the `stat_types` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."stat_types" ADD COLUMN     "originalStatName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "stat_types_originalStatName_key" ON "public"."stat_types"("originalStatName");
