/*
  Warnings:

  - You are about to drop the column `quickBooksConnectionId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the `QuickBooksConnection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_quickBooksConnectionId_fkey";

-- DropIndex
DROP INDEX "Account_quickBooksConnectionId_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "quickBooksConnectionId",
ADD COLUMN     "quickBooksToken" JSONB;

-- DropTable
DROP TABLE "QuickBooksConnection";
