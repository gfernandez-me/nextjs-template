/*
  Warnings:

  - You are about to drop the column `isMainStat` on the `stat_types` table. All the data in the column will be lost.
  - You are about to drop the column `isSubstat` on the `stat_types` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."stat_types" DROP COLUMN "isMainStat",
DROP COLUMN "isSubstat",
ADD COLUMN     "allowedMainStatFor" "public"."GearType"[],
ADD COLUMN     "allowedSubstatFor" "public"."GearType"[];
