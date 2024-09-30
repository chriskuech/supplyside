-- AlterEnum
ALTER TYPE "FieldType" ADD VALUE 'Address';

-- AlterTable
ALTER TABLE "Value" ADD COLUMN "addressId" UUID;

-- CreateTable
CREATE TABLE "Address" (
    "id" UUID NOT NULL,
    "streetAddress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Value" ADD CONSTRAINT "Value_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
