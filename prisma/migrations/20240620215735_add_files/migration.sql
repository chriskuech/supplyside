/*
  Warnings:

  - A unique constraint covering the columns `[logoBlobId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[imageBlobId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "logoBlobId" UUID;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "imageBlobId" UUID;

-- CreateTable
CREATE TABLE "Blob" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_logoBlobId_key" ON "Account"("logoBlobId");

-- CreateIndex
CREATE UNIQUE INDEX "User_imageBlobId_key" ON "User"("imageBlobId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_logoBlobId_fkey" FOREIGN KEY ("logoBlobId") REFERENCES "Blob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blob" ADD CONSTRAINT "Blob_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_imageBlobId_fkey" FOREIGN KEY ("imageBlobId") REFERENCES "Blob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
