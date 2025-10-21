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

export interface InventoryReportEntry {
  id: number;
  productId: number;
  type: InventoryMovementType;
  quantity: number;
  note: string | null;
  reference: string | null;
  createdAt: Date;
  createdBy: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  } | null;
}

export interface InventoryReportProductRow {
  id: number;
  name: string;
  categoryName: string | null;
  stock: number;
  totalMovement: number;
  transactions: InventoryReportEntry[];
}

export const getInventoryReportProducts = async (
  params: { productIds?: number[]; dateFrom: Date; dateTo: Date },
): Promise<InventoryReportProductRow[]> => {
  const productWhere: Prisma.ProductWhereInput = {};

  if (params.productIds && params.productIds.length > 0) {
    productWhere.id = { in: params.productIds };
  }

  const products = await prisma.product.findMany({
    where: productWhere,
    select: {
      id: true,
      name: true,
      category: {
        select: { name: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  if (products.length === 0) {
    return [];
  }

  const productIds = products.map((product) => product.id);

  const [transactions, stockMap] = await Promise.all([
    prisma.inventoryTransaction.findMany({
      where: {
        productId: { in: productIds },
        createdAt: {
          gte: params.dateFrom,
          lte: params.dateTo,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    getStockForProductIds(productIds),
  ]);

  const grouped = new Map<number, InventoryReportEntry[]>();

  for (const transaction of transactions) {
    const entry: InventoryReportEntry = {
      id: transaction.id,
      productId: transaction.productId,
      type: transaction.type,
      quantity: transaction.quantity,
      note: transaction.note ?? null,
      reference: transaction.reference ?? null,
      createdAt: transaction.createdAt,
      createdBy: transaction.createdBy
        ? {
            firstName: transaction.createdBy.firstName ?? null,
            lastName: transaction.createdBy.lastName ?? null,
            email: transaction.createdBy.email ?? null,
          }
        : null,
    };

    if (!grouped.has(transaction.productId)) {
      grouped.set(transaction.productId, []);
    }

    grouped.get(transaction.productId)!.push(entry);
  }

  return products.map((product) => {
    const productTransactions = grouped.get(product.id) ?? [];
    const totalMovement = productTransactions.reduce((sum, entry) => sum + Math.abs(entry.quantity), 0);

    return {
      id: product.id,
      name: product.name,
      categoryName: product.category?.name ?? null,
      stock: stockMap.get(product.id) ?? 0,
      transactions: productTransactions,
      totalMovement,
    };
  });
};
