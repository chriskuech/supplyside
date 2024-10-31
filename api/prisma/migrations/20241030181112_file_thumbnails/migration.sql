/*
  Warnings:

  - You are about to drop the column `mimeType` on the `Blob` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[thumbnailBlobId]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contentType` to the `Blob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Blob" RENAME COLUMN "mimeType"
TO     "contentType" ;

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "thumbnailBlobId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "File_thumbnailBlobId_key" ON "File"("thumbnailBlobId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_thumbnailBlobId_fkey" FOREIGN KEY ("thumbnailBlobId") REFERENCES "Blob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
