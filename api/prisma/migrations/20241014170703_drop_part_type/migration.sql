/*
  Warnings:

  - The values [Part] on the enum `ResourceType` will be removed. If these variants are still used in the database, this will fail.

*/

DELETE FROM "Resource" WHERE "type" = 'Part';
DELETE FROM "Field" WHERE "resourceType" = 'Part';
DELETE FROM "Schema" WHERE "resourceType" = 'Part';

-- AlterEnum
BEGIN;
CREATE TYPE "ResourceType_new" AS ENUM ('Bill', 'Customer', 'Item', 'Job', 'JobLine', 'Purchase', 'PurchaseLine', 'Vendor');
ALTER TABLE "Resource" ALTER COLUMN "type" TYPE "ResourceType_new" USING ("type"::text::"ResourceType_new");
ALTER TABLE "Field" ALTER COLUMN "resourceType" TYPE "ResourceType_new" USING ("resourceType"::text::"ResourceType_new");
ALTER TABLE "Schema" ALTER COLUMN "resourceType" TYPE "ResourceType_new" USING ("resourceType"::text::"ResourceType_new");
ALTER TYPE "ResourceType" RENAME TO "ResourceType_old";
ALTER TYPE "ResourceType_new" RENAME TO "ResourceType";
DROP TYPE "ResourceType_old";
COMMIT;
