/*
  Warnings:

  - You are about to drop the column `extraItemId` on the `ReserveExtraItem` table. All the data in the column will be lost.
  - You are about to drop the `ExtraItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReserveExtraItem" DROP CONSTRAINT "ReserveExtraItem_extraItemId_fkey";

-- AlterTable
ALTER TABLE "ReserveExtraItem" DROP COLUMN "extraItemId";

-- DropTable
DROP TABLE "ExtraItem";
