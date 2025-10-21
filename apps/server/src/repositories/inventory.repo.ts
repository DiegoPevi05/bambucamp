import { Prisma, PrismaClient } from '@prisma/client';
import { CreateInventoryTransactionForm, InventoryMovementType, InventoryTransactionFilters, PaginatedInventoryTransactions } from '../dto/inventory';
import { BadRequestError } from '../middleware/errors';

const prisma = new PrismaClient();

const MOVEMENT_SIGN: Record<InventoryMovementType, number> = {
  IN: 1,
  OUT: -1,
  ADJUSTMENT: 1,
};

type PrismaClientOrTx = PrismaClient | Prisma.TransactionClient;

const groupTransactionsByProduct = async (
  client: PrismaClientOrTx,
  productIds: number[],
) => {
  if (productIds.length === 0) {
    return [];
  }

  return client.inventoryTransaction.groupBy({
    by: ['productId', 'type'],
    where: {
      productId: {
        in: productIds,
      },
    },
    _sum: {
      quantity: true,
    },
  });
};

const computeStockMap = (
  groups: Array<{ productId: number; type: InventoryMovementType; _sum: { quantity: number | null } }>,
  productIds: number[],
) => {
  const map = new Map<number, number>();

  for (const { productId, type, _sum } of groups) {
    const quantity = _sum.quantity ?? 0;
    const current = map.get(productId) ?? 0;
    map.set(productId, current + MOVEMENT_SIGN[type] * quantity);
  }

  for (const id of productIds) {
    if (!map.has(id)) {
      map.set(id, 0);
    }
  }

  return map;
};

const computeStockForProduct = async (client: PrismaClientOrTx, productId: number) => {
  const [stock] = computeStockMap(
    await groupTransactionsByProduct(client, [productId]),
    [productId],
  ).values();

  return stock ?? 0;
};

export const getStockForProductIds = async (productIds: number[]): Promise<Map<number, number>> => {
  const groups = await groupTransactionsByProduct(prisma, productIds);
  return computeStockMap(groups, productIds);
};

export const getStockForProduct = async (productId: number): Promise<number> => {
  return computeStockForProduct(prisma, productId);
};

interface Pagination {
  page: number;
  pageSize: number;
}

export const getTransactionsByProduct = async (
  productId: number,
  pagination: Pagination,
  filters?: InventoryTransactionFilters,
): Promise<PaginatedInventoryTransactions> => {
  const { page, pageSize } = pagination;
  const skip = (page - 1) * pageSize;

  const where: Prisma.InventoryTransactionWhereInput = {
    productId,
  };

  if (filters?.type) {
    where.type = filters.type;
  }

  if (filters?.search) {
    where.OR = [
      { note: { contains: filters.search, mode: 'insensitive' } },
      { reference: { contains: filters.search, mode: 'insensitive' } },
      {
        createdBy: {
          OR: [
            { firstName: { contains: filters.search, mode: 'insensitive' } },
            { lastName: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
          ],
        },
      },
    ];
  }

  const [transactions, totalCount] = await prisma.$transaction([
    prisma.inventoryTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: { createdBy: true },
    }),
    prisma.inventoryTransaction.count({ where }),
  ]);

  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);

  const currentPage = totalPages === 0 ? 0 : Math.min(page, totalPages);

  return {
    transactions,
    totalPages,
    currentPage,
  };
};

interface CreateTransactionInput extends CreateInventoryTransactionForm {
  createdById?: number;
}

export const createTransaction = async (
  input: CreateTransactionInput,
) => {
  const quantity = Math.abs(input.quantity);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new BadRequestError('error.invalidInventoryQuantity');
  }

  return prisma.$transaction(async (tx) => {
    const currentStock = await computeStockForProduct(tx, input.productId);

    if (input.type === 'OUT' && currentStock < quantity) {
      throw new BadRequestError('error.noProductsFoundInStock');
    }

    const transaction = await tx.inventoryTransaction.create({
      data: {
        productId: input.productId,
        type: input.type,
        quantity,
        note: input.note,
        reference: input.reference,
        createdById: input.createdById,
      },
      include: {
        createdBy: true,
      },
    });

    const stockAfter = currentStock + MOVEMENT_SIGN[input.type] * quantity;

    return {
      transaction,
      stock: stockAfter,
    };
  });
};
