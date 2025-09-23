-- CreateEnum
CREATE TYPE "public"."ScoreGrade" AS ENUM ('EXCELLENT', 'GOOD', 'AVERAGE', 'POOR', 'TERRIBLE');

-- AlterTable
ALTER TABLE "public"."gear_substats" ADD COLUMN     "grade" "public"."ScoreGrade";

-- AlterTable
ALTER TABLE "public"."gears" ADD COLUMN     "fScoreGrade" "public"."ScoreGrade",
ADD COLUMN     "scoreGrade" "public"."ScoreGrade";

-- CreateIndex
CREATE INDEX "gear_substats_grade_idx" ON "public"."gear_substats"("grade");

-- CreateIndex
CREATE INDEX "gears_fScoreGrade_idx" ON "public"."gears"("fScoreGrade");

-- CreateIndex
CREATE INDEX "gears_scoreGrade_idx" ON "public"."gears"("scoreGrade");
