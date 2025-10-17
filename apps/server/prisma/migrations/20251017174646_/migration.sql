-- CreateTable
CREATE TABLE "ExtraItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtraItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReserveExtraItem" (
    "id" SERIAL NOT NULL,
    "reserveId" INTEGER NOT NULL,
    "extraItemId" INTEGER,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReserveExtraItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReserveExtraItem" ADD CONSTRAINT "ReserveExtraItem_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "Reserve"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReserveExtraItem" ADD CONSTRAINT "ReserveExtraItem_extraItemId_fkey" FOREIGN KEY ("extraItemId") REFERENCES "ExtraItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
