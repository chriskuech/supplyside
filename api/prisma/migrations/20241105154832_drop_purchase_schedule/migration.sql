/*
  Warnings:

  - The values [PurchaseSchedule] on the enum `ResourceType` will be removed. If these variants are still used in the database, this will fail.

*/

DELETE FROM "Resource" WHERE "type" = 'PurchaseSchedule';
DELETE FROM "Field" WHERE "resourceType" = 'PurchaseSchedule';
DELETE FROM "Schema" WHERE "resourceType" = 'PurchaseSchedule';

-- AlterEnum
BEGIN;
CREATE TYPE "ResourceType_new" AS ENUM ('Bill', 'Customer', 'Job', 'JobLine', 'Purchase', 'PurchaseLine', 'Vendor', 'WorkCenter');
ALTER TABLE "Resource" ALTER COLUMN "type" TYPE "ResourceType_new" USING ("type"::text::"ResourceType_new");
ALTER TABLE "Field" ALTER COLUMN "resourceType" TYPE "ResourceType_new" USING ("resourceType"::text::"ResourceType_new");
ALTER TABLE "Schema" ALTER COLUMN "resourceType" TYPE "ResourceType_new" USING ("resourceType"::text::"ResourceType_new");
ALTER TYPE "ResourceType" RENAME TO "ResourceType_old";
ALTER TYPE "ResourceType_new" RENAME TO "ResourceType";
DROP TYPE "ResourceType_old";
COMMIT;
