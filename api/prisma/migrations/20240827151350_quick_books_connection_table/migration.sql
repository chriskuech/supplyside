/*
  Warnings:

  - You are about to drop the column `quickbooksEnabled` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `quickbooksToken` on the `Account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[quickBooksConnectionId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "quickbooksEnabled",
DROP COLUMN "quickbooksToken",
ADD COLUMN     "quickBooksConnectionId" UUID,
ADD COLUMN     "quickBooksEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "QuickBooksConnection" (
    "id" UUID NOT NULL,
    "latency" DOUBLE PRECISION NOT NULL,
    "access_token" TEXT NOT NULL,
    "createdAt" DOUBLE PRECISION NOT NULL,
    "expires_in" DOUBLE PRECISION NOT NULL,
    "id_token" TEXT NOT NULL,
    "realmId" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "token_type" TEXT NOT NULL,
    "x_refresh_token_expires_in" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "QuickBooksConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_quickBooksConnectionId_key" ON "Account"("quickBooksConnectionId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_quickBooksConnectionId_fkey" FOREIGN KEY ("quickBooksConnectionId") REFERENCES "QuickBooksConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
