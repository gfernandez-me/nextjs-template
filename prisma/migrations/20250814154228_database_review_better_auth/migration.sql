/*
  Warnings:

  - The values [Common,Uncommon,Rare,Epic,Heroic] on the enum `GearRank` will be removed. If these variants are still used in the database, this will fail.
  - The values [weapon,armor,helm,neck,ring,boot] on the enum `GearType` will be removed. If these variants are still used in the database, this will fail.
  - The values [Warrior,Knight,Ranger,Mage,SoulWeaver,Thief] on the enum `HeroClass` will be removed. If these variants are still used in the database, this will fail.
  - The values [Fire,Ice,Earth,Light,Dark] on the enum `HeroElement` will be removed. If these variants are still used in the database, this will fail.
  - The values [att,def,max_hp,att_rate,def_rate,max_hp_rate,cri,cri_dmg,speed,acc,res] on the enum `MainStatType` will be removed. If these variants are still used in the database, this will fail.
  - The values [flat,percentage] on the enum `StatCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `gear` on the `gears` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `gear_sets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `gear_substats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `stat_types` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."GearRank_new" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'HEROIC');
ALTER TABLE "public"."gears" ALTER COLUMN "rank" TYPE "public"."GearRank_new" USING ("rank"::text::"public"."GearRank_new");
ALTER TYPE "public"."GearRank" RENAME TO "GearRank_old";
ALTER TYPE "public"."GearRank_new" RENAME TO "GearRank";
DROP TYPE "public"."GearRank_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."GearType_new" AS ENUM ('WEAPON', 'ARMOR', 'HELM', 'NECK', 'RING', 'BOOTS');
ALTER TABLE "public"."gears" ALTER COLUMN "type" TYPE "public"."GearType_new" USING ("type"::text::"public"."GearType_new");
ALTER TABLE "public"."gear_priorities" ALTER COLUMN "gearType" TYPE "public"."GearType_new" USING ("gearType"::text::"public"."GearType_new");
ALTER TYPE "public"."GearType" RENAME TO "GearType_old";
ALTER TYPE "public"."GearType_new" RENAME TO "GearType";
DROP TYPE "public"."GearType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."HeroClass_new" AS ENUM ('WARRIOR', 'KNIGHT', 'RANGER', 'MAGE', 'SOUL_WEAVER', 'THIEF');
ALTER TABLE "public"."heroes" ALTER COLUMN "class" TYPE "public"."HeroClass_new" USING ("class"::text::"public"."HeroClass_new");
ALTER TYPE "public"."HeroClass" RENAME TO "HeroClass_old";
ALTER TYPE "public"."HeroClass_new" RENAME TO "HeroClass";
DROP TYPE "public"."HeroClass_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."HeroElement_new" AS ENUM ('FIRE', 'ICE', 'EARTH', 'LIGHT', 'DARK');
ALTER TABLE "public"."heroes" ALTER COLUMN "element" TYPE "public"."HeroElement_new" USING ("element"::text::"public"."HeroElement_new");
ALTER TYPE "public"."HeroElement" RENAME TO "HeroElement_old";
ALTER TYPE "public"."HeroElement_new" RENAME TO "HeroElement";
DROP TYPE "public"."HeroElement_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."MainStatType_new" AS ENUM ('ATT', 'DEF', 'MAX_HP', 'ATT_RATE', 'DEF_RATE', 'MAX_HP_RATE', 'CRI', 'CRI_DMG', 'SPEED', 'ACC', 'RES');
ALTER TABLE "public"."gears" ALTER COLUMN "mainStatType" TYPE "public"."MainStatType_new" USING ("mainStatType"::text::"public"."MainStatType_new");
ALTER TABLE "public"."gear_priorities" ALTER COLUMN "mainStatType" TYPE "public"."MainStatType_new" USING ("mainStatType"::text::"public"."MainStatType_new");
ALTER TYPE "public"."MainStatType" RENAME TO "MainStatType_old";
ALTER TYPE "public"."MainStatType_new" RENAME TO "MainStatType";
DROP TYPE "public"."MainStatType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."StatCategory_new" AS ENUM ('FLAT', 'PERCENTAGE');
ALTER TABLE "public"."stat_types" ALTER COLUMN "statCategory" TYPE "public"."StatCategory_new" USING ("statCategory"::text::"public"."StatCategory_new");
ALTER TYPE "public"."StatCategory" RENAME TO "StatCategory_old";
ALTER TYPE "public"."StatCategory_new" RENAME TO "StatCategory";
DROP TYPE "public"."StatCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."gear_sets" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."gear_substats" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."gears" DROP COLUMN "gear";

-- AlterTable
ALTER TABLE "public"."stat_types" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "password",
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "image" TEXT,
ALTER COLUMN "name" SET NOT NULL;

-- DropEnum
DROP TYPE "public"."GearDisplayName";

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "public"."sessions"("token");

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
