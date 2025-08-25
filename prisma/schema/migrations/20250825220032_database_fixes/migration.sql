/*
  Warnings:

  - Made the column `set` on table `gears` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."gears" ALTER COLUMN "code" DROP NOT NULL,
ALTER COLUMN "set" SET NOT NULL;
