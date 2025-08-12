-- CreateTable
CREATE TABLE "public"."gear_priority_heroes" (
    "id" SERIAL NOT NULL,
    "gearPriorityId" INTEGER NOT NULL,
    "heroIngameId" BIGINT NOT NULL,

    CONSTRAINT "gear_priority_heroes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gear_priority_heroes_heroIngameId_idx" ON "public"."gear_priority_heroes"("heroIngameId");

-- CreateIndex
CREATE UNIQUE INDEX "gear_priority_heroes_gearPriorityId_heroIngameId_key" ON "public"."gear_priority_heroes"("gearPriorityId", "heroIngameId");

-- AddForeignKey
ALTER TABLE "public"."gear_priority_heroes" ADD CONSTRAINT "gear_priority_heroes_gearPriorityId_fkey" FOREIGN KEY ("gearPriorityId") REFERENCES "public"."gear_priorities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gear_priority_heroes" ADD CONSTRAINT "gear_priority_heroes_heroIngameId_fkey" FOREIGN KEY ("heroIngameId") REFERENCES "public"."heroes"("ingameId") ON DELETE CASCADE ON UPDATE CASCADE;
