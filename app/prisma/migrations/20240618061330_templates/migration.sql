/*
  Warnings:

  - You are about to drop the `SchemaField` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[accountId,templateId]` on the table `Field` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountId,resourceType,isSystem]` on the table `Schema` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[schemaId,name]` on the table `Section` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isSystem` to the `Schema` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SchemaField" DROP CONSTRAINT "SchemaField_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "SchemaField" DROP CONSTRAINT "SchemaField_schemaId_fkey";

-- DropIndex
DROP INDEX "Schema_accountId_resourceType_key";

-- AlterTable
ALTER TABLE "Field" ADD COLUMN     "templateId" UUID;

DELETE FROM "Schema";

-- AlterTable
ALTER TABLE "Schema" ADD COLUMN     "isSystem" BOOLEAN NOT NULL;

-- DropTable
DROP TABLE "SchemaField";

-- CreateIndex
CREATE UNIQUE INDEX "Field_accountId_templateId_key" ON "Field"("accountId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "Schema_accountId_resourceType_isSystem_key" ON "Schema"("accountId", "resourceType", "isSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Section_schemaId_name_key" ON "Section"("schemaId", "name");
