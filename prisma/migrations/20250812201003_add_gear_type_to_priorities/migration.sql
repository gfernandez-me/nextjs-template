-- AlterTable
ALTER TABLE "public"."gear_priorities" ADD COLUMN     "gearType" "public"."GearType";

-- CreateIndex
CREATE INDEX "gear_priorities_gearType_idx" ON "public"."gear_priorities"("gearType");
