-- AlterEnum
ALTER TYPE "FieldType" ADD VALUE 'File';

-- AlterTable
ALTER TABLE "Value" ADD COLUMN     "fileId" UUID;

-- CreateTable
CREATE TABLE "File" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "blobId" UUID NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_blobId_key" ON "File"("blobId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_blobId_fkey" FOREIGN KEY ("blobId") REFERENCES "Blob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Value" ADD CONSTRAINT "Value_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
