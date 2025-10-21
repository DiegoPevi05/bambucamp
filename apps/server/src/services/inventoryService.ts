import { CreateInventoryTransactionForm, InventoryTransactionFilters, PaginatedInventoryTransactions } from '../dto/inventory';
import * as inventoryRepository from '../repositories/InventoryRepository';

interface Pagination {
  page: number;
  pageSize: number;
}

interface CreateTransactionInput extends CreateInventoryTransactionForm {
  createdById?: number;
}

export const getProductLedger = async (
  productId: number,
  pagination: Pagination,
  filters?: InventoryTransactionFilters,
): Promise<PaginatedInventoryTransactions> => {
  return inventoryRepository.getTransactionsByProduct(productId, pagination, filters);
};

export const createTransaction = async (input: CreateTransactionInput) => {
  return inventoryRepository.createTransaction(input);
};

export const getProductStock = async (productId: number) => {
  return inventoryRepository.getStockForProduct(productId);
};

export const getStocksForProducts = async (productIds: number[]) => {
  return inventoryRepository.getStockForProductIds(productIds);
};


