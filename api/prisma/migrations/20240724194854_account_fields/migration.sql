/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "address" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "key" TEXT;

UPDATE "Account" SET "key" = 'id';
UPDATE "Account" SET "key" = 'chris' WHERE "name" LIKE 'Chris%';
UPDATE "Account" SET "key" = 'matt' WHERE "name" LIKE 'Matt%';
UPDATE "Account" SET "key" = 'system' WHERE "name" = 'SYSTEM';

ALTER TABLE "Account" ALTER COLUMN "key" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Account_key_key" ON "Account"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Account_name_key" ON "Account"("name");
