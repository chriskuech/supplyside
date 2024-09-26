/*
  Warnings:

  - The primary key for the `Contact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `valueId` on the `Contact` table. All the data in the column will be lost.
  - The required column `id` was added to the `Contact` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_valueId_fkey";

-- AlterTable
ALTER TABLE "Value" ADD COLUMN     "contactId" UUID;

-- AlterTable
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_pkey",
ADD COLUMN     "id" UUID;

UPDATE "Contact" SET "id" = uuid_generate_v4();
UPDATE "Value" SET "contactId" = "Contact"."id" FROM "Contact" WHERE "Value"."id" = "Contact"."valueId";

ALTER TABLE "Contact" DROP COLUMN "valueId";

ALTER TABLE "Contact" ALTER COLUMN "id" SET NOT NULL,
ADD CONSTRAINT "Contact_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Value" ADD CONSTRAINT "Value_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
