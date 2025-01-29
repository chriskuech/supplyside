-- CreateTable
CREATE TABLE "Cost" (
    "id" UUID NOT NULL,
    "resourceId" UUID NOT NULL,
    "name" VARCHAR NOT NULL DEFAULT '',
    "isPercentage" BOOLEAN NOT NULL DEFAULT false,
    "value" REAL NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cost" ADD CONSTRAINT "Cost_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
