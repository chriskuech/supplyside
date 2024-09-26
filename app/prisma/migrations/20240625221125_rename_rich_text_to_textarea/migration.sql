/*
  Warnings:

  - The values [RichText] on the enum `FieldType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FieldType_new" AS ENUM ('Checkbox', 'Contact', 'Date', 'File', 'Money', 'MultiSelect', 'Number', 'Resource', 'Textarea', 'Select', 'Text', 'User');
ALTER TABLE "Field" ALTER COLUMN "type" TYPE "FieldType_new" USING (CASE WHEN "type" = 'RichText' THEN 'Textarea' ELSE "type"::text::"FieldType_new" END);
ALTER TYPE "FieldType" RENAME TO "FieldType_old";
ALTER TYPE "FieldType_new" RENAME TO "FieldType";
DROP TYPE "FieldType_old";
COMMIT;
