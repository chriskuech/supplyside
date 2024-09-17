-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "mcMasterCarrConnectedAt" TIMESTAMP(3),
ADD COLUMN     "mcMasterCarrPassword" TEXT,
ADD COLUMN     "mcMasterCarrUsername" TEXT;
