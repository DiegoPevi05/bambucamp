-- AlterTable
ALTER TABLE "ReserveTent" ADD COLUMN     "advanced" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ReserveProduct" ADD COLUMN     "advanced" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ReserveExperience" ADD COLUMN     "advanced" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ReserveExtraItem" ADD COLUMN     "advanced" DOUBLE PRECISION NOT NULL DEFAULT 0;
