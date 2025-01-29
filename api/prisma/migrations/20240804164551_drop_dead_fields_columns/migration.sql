/*
  Warnings:

  - You are about to drop the column `isEditable` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `isVersioned` on the `Field` table. All the data in the column will be lost.
  - Made the column `defaultValueId` on table `Field` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Field" DROP CONSTRAINT "Field_defaultValueId_fkey";

INSERT INTO "Value" ("id", "createdAt", "updatedAt")
SELECT "id", now(), now()
FROM "Field" WHERE "defaultValueId" IS NULL;

UPDATE "Field" SET "defaultValueId" = "id" WHERE "defaultValueId" IS NULL;

-- AlterTable
ALTER TABLE "Field" DROP COLUMN "isEditable",
DROP COLUMN "isVersioned",
ALTER COLUMN "defaultValueId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_defaultValueId_fkey" FOREIGN KEY ("defaultValueId") REFERENCES "Value"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
