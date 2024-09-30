-- AlterEnum
ALTER TYPE "FieldType" ADD VALUE 'Files';

-- CreateTable
CREATE TABLE "ValueFile" (
    "valueId" UUID NOT NULL,
    "fileId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ValueFile_pkey" PRIMARY KEY ("valueId","fileId")
);

-- AddForeignKey
ALTER TABLE "ValueFile" ADD CONSTRAINT "ValueFile_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "Value"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValueFile" ADD CONSTRAINT "ValueFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
