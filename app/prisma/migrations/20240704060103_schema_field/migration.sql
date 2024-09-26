-- CreateTable
CREATE TABLE "SchemaField" (
    "schemaId" UUID NOT NULL,
    "fieldId" UUID NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "SchemaField_pkey" PRIMARY KEY ("schemaId","fieldId")
);

-- AddForeignKey
ALTER TABLE "SchemaField" ADD CONSTRAINT "SchemaField_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "Schema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaField" ADD CONSTRAINT "SchemaField_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
