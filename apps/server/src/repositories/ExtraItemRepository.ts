import { PrismaClient, ExtraItem } from '@prisma/client';

const prisma = new PrismaClient();

export const getActiveExtraItems = async (): Promise<ExtraItem[]> => {
  return prisma.extraItem.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });
};

export const getExtraItemsByIds = async (ids: number[]): Promise<ExtraItem[]> => {
  if (!ids.length) {
    return [];
  }

  return prisma.extraItem.findMany({
    where: {
      id: { in: ids },
    },
  });
};

export const getExtraItemById = async (id: number): Promise<ExtraItem | null> => {
  return prisma.extraItem.findUnique({ where: { id } });
};
