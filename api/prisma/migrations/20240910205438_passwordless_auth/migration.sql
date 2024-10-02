/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `requirePasswordReset` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordHash",
DROP COLUMN "requirePasswordReset",
ADD COLUMN     "tat" TEXT,
ADD COLUMN     "tatExpiresAt" TIMESTAMP(3);
