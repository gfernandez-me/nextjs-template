-- AlterTable
ALTER TABLE "public"."gears" ADD COLUMN     "set" TEXT;

-- CreateIndex
CREATE INDEX "gears_set_idx" ON "public"."gears"("set");
