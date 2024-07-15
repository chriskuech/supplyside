-- AlterTable
ALTER TABLE "Field" ADD COLUMN     "defaultValueId" UUID;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_defaultValueId_fkey" FOREIGN KEY ("defaultValueId") REFERENCES "Value"("id") ON DELETE SET NULL ON UPDATE CASCADE;
