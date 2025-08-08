-- DropForeignKey
ALTER TABLE "public"."gears" DROP CONSTRAINT "gears_equippedBy_fkey";

-- AlterTable
ALTER TABLE "public"."gears" ALTER COLUMN "ingameId" SET DATA TYPE BIGINT,
ALTER COLUMN "equippedBy" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "public"."heroes" ALTER COLUMN "ingameId" SET DATA TYPE BIGINT;

-- AddForeignKey
ALTER TABLE "public"."gears" ADD CONSTRAINT "gears_equippedBy_fkey" FOREIGN KEY ("equippedBy") REFERENCES "public"."heroes"("ingameId") ON DELETE SET NULL ON UPDATE CASCADE;
