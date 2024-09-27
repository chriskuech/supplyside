/*
  Warnings:

  - A unique constraint covering the columns `[accountId,templateId]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Resource_accountId_templateId_key" ON "Resource"("accountId", "templateId");
