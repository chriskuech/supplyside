-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "plaidConnectedAt" TIMESTAMP(3),
ADD COLUMN     "plaidToken" JSONB;
