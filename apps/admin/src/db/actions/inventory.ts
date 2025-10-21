import axios from 'axios';
import { toast } from 'sonner';
import { Product, ProductFilters, InventoryTransaction, PaginatedInventoryTransactions, CreateInventoryTransactionForm } from '../../lib/interfaces';
import { serializeProduct } from '../serializer';
import { convertStrToCurrentTimezoneDate } from '../../lib/utils';

interface InventoryProductsResponse {
  products: Product[];
  totalPages: number;
  currentPage: number;
}

const buildQueryParams = (page: number, pageSize: number, filters?: ProductFilters) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());

  if (!filters) {
    return params;
  }

  if (filters.name) {
    params.append('name', filters.name);
  }

  if (filters.status) {
    params.append('status', filters.status);
  }

  if (filters.stockStatus) {
    params.append('stockStatus', filters.stockStatus);
  }

  if (typeof filters.minStock === 'number') {
    params.append('minStock', filters.minStock.toString());
  }

  if (typeof filters.maxStock === 'number') {
    params.append('maxStock', filters.maxStock.toString());
  }

  return params;
};

export const getInventoryProducts = async (
  token: string,
  page: number,
  pageSize: number,
  language: string,
  filters?: ProductFilters,
): Promise<InventoryProductsResponse | null> => {
  try {
    const params = buildQueryParams(page, pageSize, filters);

    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept-Language': language,
      },
    });

    return {
      products: response.data.products.map((product: any) => serializeProduct(product)).filter((product): product is Product => product !== null),
      currentPage: Number(response.data.currentPage ?? 0),
      totalPages: Number(response.data.totalPages ?? 0),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage = errorData?.error;

      if (Array.isArray(errorMessage)) {
        errorMessage.forEach((err) => {
          toast.error(err.msg || 'Validation error occurred');
        });
      } else {
        if (statusCode) {
          toast.error(`${errorData?.error || 'Error fetching inventory products.'} (Code: ${statusCode})`);
        } else {
          toast.error(errorData?.error || 'An error occurred.');
        }
      }
    } else {
      toast.error('An unexpected error occurred.');
    }
    console.error(error);
    return null;
  }
};

export const getProductLedger = async (
  token: string,
  productId: number,
  page: number,
  pageSize: number,
  options?: { type?: string; search?: string },
  language?: string,
): Promise<PaginatedInventoryTransactions | null> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());

    if (options?.type) {
      params.append('type', options.type);
    }

    if (options?.search) {
      params.append('search', options.search);
    }

    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/inventory/${productId}/transactions?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(language ? { 'Accept-Language': language } : {}),
      },
    });

    const transactions: InventoryTransaction[] = (response.data.transactions ?? []).map((transaction: any) => ({
      ...transaction,
      createdAt: convertStrToCurrentTimezoneDate(transaction.createdAt),
    }));

    return {
      transactions,
      currentPage: Number(response.data.currentPage ?? 0),
      totalPages: Number(response.data.totalPages ?? 0),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage = errorData?.error;

      if (Array.isArray(errorMessage)) {
        errorMessage.forEach((err) => {
          toast.error(err.msg || 'Validation error occurred');
        });
      } else {
        if (statusCode) {
          toast.error(`${errorData?.error || 'Error fetching inventory ledger.'} (Code: ${statusCode})`);
        } else {
          toast.error(errorData?.error || 'An error occurred.');
        }
      }
    } else {
      toast.error('An unexpected error occurred.');
    }
    console.error(error);
    return null;
  }
};

export const createInventoryTransaction = async (
  token: string,
  payload: CreateInventoryTransactionForm,
  language?: string,
): Promise<{ stock: number } | null> => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/inventory/transactions`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(language ? { 'Accept-Language': language } : {}),
      },
    });

    toast.success(response.data.message);
    return { stock: Number(response.data.stock ?? 0) };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage = errorData?.error;

      if (Array.isArray(errorMessage)) {
        errorMessage.forEach((err) => {
          toast.error(err.msg || 'Validation error occurred');
        });
      } else {
        if (statusCode) {
          toast.error(`${errorData?.error || 'Error creating inventory transaction.'} (Code: ${statusCode})`);
        } else {
          toast.error(errorData?.error || 'An error occurred.');
        }
      }
    } else {
      toast.error('An unexpected error occurred.');
    }
    console.error(error);
    return null;
  }
};
