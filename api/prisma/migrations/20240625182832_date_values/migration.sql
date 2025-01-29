-- AlterEnum
ALTER TYPE "FieldType" ADD VALUE 'Date';

-- AlterTable
ALTER TABLE "Value" ADD COLUMN     "date" DATE;
