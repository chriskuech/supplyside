-- AlterEnum
ALTER TYPE "FieldType" ADD VALUE 'Contact';

-- CreateTable
CREATE TABLE "Contact" (
    "valueId" UUID NOT NULL,
    "name" TEXT,
    "title" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("valueId")
);

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "Value"("id") ON DELETE CASCADE ON UPDATE CASCADE;
