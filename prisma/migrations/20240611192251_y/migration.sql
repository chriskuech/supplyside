/*
  Warnings:

  - Added the required column `name` to the `Option` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `Option` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "name" VARCHAR NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Schema" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,

    CONSTRAINT "Schema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" UUID NOT NULL,
    "schemaId" UUID NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemaSection" (
    "schemaId" UUID NOT NULL,
    "sectionId" UUID NOT NULL,

    CONSTRAINT "SchemaSection_pkey" PRIMARY KEY ("schemaId","sectionId")
);

-- CreateTable
CREATE TABLE "SchemaField" (
    "schemaId" UUID NOT NULL,
    "fieldId" UUID NOT NULL,

    CONSTRAINT "SchemaField_pkey" PRIMARY KEY ("schemaId","fieldId")
);

-- AddForeignKey
ALTER TABLE "Schema" ADD CONSTRAINT "Schema_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "Schema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaSection" ADD CONSTRAINT "SchemaSection_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "Schema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaSection" ADD CONSTRAINT "SchemaSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaField" ADD CONSTRAINT "SchemaField_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "Schema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaField" ADD CONSTRAINT "SchemaField_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
