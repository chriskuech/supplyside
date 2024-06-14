-- AlterEnum
ALTER TYPE "FieldType" ADD VALUE 'Resource';

-- AlterTable
ALTER TABLE "Field" ADD COLUMN     "resourceType" "ResourceType";

-- AlterTable
ALTER TABLE "Value" ADD COLUMN     "resourceId" UUID;

-- AddForeignKey
ALTER TABLE "Value" ADD CONSTRAINT "Value_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
