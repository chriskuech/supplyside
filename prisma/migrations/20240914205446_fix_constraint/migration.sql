/*
  Warnings:

  - You are about to drop the column `revision` on the `Resource` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId,type,key]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Resource_accountId_type_key_revision_key";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "revision";

-- CreateIndex
CREATE UNIQUE INDEX "Resource_accountId_type_key_key" ON "Resource"("accountId", "type", "key");
