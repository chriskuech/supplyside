/*
  Warnings:

  - A unique constraint covering the columns `[fieldId,templateId]` on the table `Option` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "templateId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Option_fieldId_templateId_key" ON "Option"("fieldId", "templateId");
