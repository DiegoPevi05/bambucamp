import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Dashboard from '../../components/ui/Dashboard';
import Button from '../../components/ui/Button';
import Modal from '../../components/Modal';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ClipboardList, RefreshCw, Scale, PlusCircle } from 'lucide-react';
import { Product, InventoryTransaction, InventoryMovementType, ProductFilters } from '../../lib/interfaces';
import { getInventoryProducts, getProductLedger, createInventoryTransaction } from '../../db/actions/inventory';
import { InventoryTransactionSchema } from '../../lib/schemas/inventory';
import { ZodError } from 'zod';
import { formatDate, formatPrice } from '../../lib/utils';

interface ProductFiltersState {
  name: string;
  stockStatus: string;
  minStock: string;
  maxStock: string;
}

interface LedgerFiltersState {
  type: string;
  search: string;
}

const PAGE_SIZE = 10;
const LEDGER_PAGE_SIZE = 10;

const InventoryPage = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const [products, setProducts] = useState<Product[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [totalProductPages, setTotalProductPages] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [filters, setFilters] = useState<ProductFiltersState>({ name: '', stockStatus: '', minStock: '', maxStock: '' });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [ledger, setLedger] = useState<InventoryTransaction[]>([]);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [totalLedgerPages, setTotalLedgerPages] = useState(0);
  const [ledgerFilters, setLedgerFilters] = useState<LedgerFiltersState>({ type: '', search: '' });
  const [loadingLedger, setLoadingLedger] = useState(false);

  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<InventoryMovementType>('IN');
  const [transactionQuantity, setTransactionQuantity] = useState('');
  const [transactionNote, setTransactionNote] = useState('');
  const [transactionReference, setTransactionReference] = useState('');
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const appliedProductFilters = useMemo<ProductFilters>(() => {
    const filterPayload: ProductFilters = {};

    const trimmedName = filters.name.trim();
    if (trimmedName) {
      filterPayload.name = trimmedName;
    }

    if (filters.stockStatus === 'in' || filters.stockStatus === 'out') {
      filterPayload.stockStatus = filters.stockStatus;
    }

    const minStockValue = Number(filters.minStock);
    if (!Number.isNaN(minStockValue) && filters.minStock !== '') {
      filterPayload.minStock = minStockValue;
    }

    const maxStockValue = Number(filters.maxStock);
    if (!Number.isNaN(maxStockValue) && filters.maxStock !== '') {
      filterPayload.maxStock = maxStockValue;
    }

    return filterPayload;
  }, [filters]);

  const fetchProducts = async (page: number) => {
    if (!user) return;

    setLoadingProducts(true);
    const response = await getInventoryProducts(user.token, page, PAGE_SIZE, i18n.language, appliedProductFilters);
    if (response) {
      setProducts(response.products);
      setProductPage(response.currentPage || 1);
      setTotalProductPages(response.totalPages || 0);
    }
    setLoadingProducts(false);
  };

  const fetchLedger = async (page: number, productId?: number) => {
    if (!user) return;
    const id = productId ?? selectedProduct?.id;
    if (!id) return;

    setLoadingLedger(true);
    const response = await getProductLedger(user.token, id, page, LEDGER_PAGE_SIZE, {
      type: ledgerFilters.type || undefined,
      search: ledgerFilters.search.trim() || undefined,
    }, i18n.language);

    if (response) {
      setLedger(response.transactions);
      setLedgerPage(response.currentPage || 1);
      setTotalLedgerPages(response.totalPages || 0);
    }
    setLoadingLedger(false);
  };

  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, i18n.language, appliedProductFilters]);

  useEffect(() => {
    if (selectedProduct) {
      setLedgerPage(1);
      fetchLedger(1, selectedProduct.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct, ledgerFilters.type]);

  useEffect(() => {
    if (selectedProduct && !products.some(product => product.id === selectedProduct.id)) {
      setSelectedProduct(null);
      setLedger([]);
      setLedgerPage(1);
      setTotalLedgerPages(0);
    }
  }, [products, selectedProduct]);

  const resetTransactionForm = () => {
    setTransactionType('IN');
    setTransactionQuantity('');
    setTransactionNote('');
    setTransactionReference('');
    setFormErrors({});
  };

  const handleCreateTransaction = async () => {
    if (!user || !selectedProduct) return;

    const quantityValue = Number(transactionQuantity);

    if (Number.isNaN(quantityValue)) {
      setFormErrors({ quantity: 'inventory.validation.quantityPositive' });
      return;
    }

    try {
      setFormErrors({});
      const parsed = InventoryTransactionSchema.parse({
        productId: selectedProduct.id,
        type: transactionType,
        quantity: quantityValue,
        note: transactionNote,
        reference: transactionReference,
      });

      setTransactionLoading(true);
      const result = await createInventoryTransaction(user.token, parsed, i18n.language);
      if (result) {
        const updatedStock = result.stock;
        setProducts(prev => prev.map(product => product.id === selectedProduct.id ? { ...product, stock: updatedStock } : product));
        setSelectedProduct(prev => (prev ? { ...prev, stock: updatedStock } : prev));
        await fetchLedger(1, selectedProduct.id);
        resetTransactionForm();
        setTransactionModalOpen(false);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const zodErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const field = err.path[0];
          if (typeof field === 'string') {
            zodErrors[field] = err.message;
          }
        });
        setFormErrors(zodErrors);
      }
      console.error(error);
    } finally {
      setTransactionLoading(false);
    }
  };

  const movementLabel = (type: InventoryMovementType) => {
    if (type === 'IN') return t('inventory.transaction.in');
    if (type === 'OUT') return t('inventory.transaction.out');
    return t('inventory.transaction.adjustment');
  };

  const quantityWithSign = (transaction: InventoryTransaction) => {
    const sign = transaction.type === 'OUT' ? -1 : 1;
    return sign * transaction.quantity;
  };

  const clearFilters = () => {
    setFilters({ name: '', stockStatus: '', minStock: '', maxStock: '' });
  };

  return (
    <Dashboard>
      <div className="w-full h-auto flex flex-col gap-6">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-primary text-secondary">{t('inventory.title')}</h1>
          <Button
            onClick={() => fetchProducts(productPage)}
            variant="ghostLight"
            size="sm"
            isRound
            rightIcon={<RefreshCw className="h-4 w-4" />}
          >
            {t('inventory.refresh')}
          </Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-primary text-secondary mb-3">{t('inventory.filters.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-secondary" htmlFor="inventory-filter-name">{t('inventory.filters.name')}</label>
              <input
                id="inventory-filter-name"
                className="border-b-2 border-secondary focus:outline-none focus:border-b-primary px-2 py-1 text-sm"
                value={filters.name}
                onChange={(event) => setFilters(prev => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-secondary" htmlFor="inventory-filter-status">{t('inventory.filters.stock_status')}</label>
              <select
                id="inventory-filter-status"
                className="border-b-2 border-secondary focus:outline-none focus:border-b-primary px-2 py-1 text-sm"
                value={filters.stockStatus}
                onChange={(event) => setFilters(prev => ({ ...prev, stockStatus: event.target.value }))}
              >
                <option value="">{t('inventory.filters.stock_status_all')}</option>
                <option value="in">{t('inventory.filters.stock_status_in')}</option>
                <option value="out">{t('inventory.filters.stock_status_out')}</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-secondary" htmlFor="inventory-filter-min">{t('inventory.filters.min_stock')}</label>
              <input
                id="inventory-filter-min"
                className="border-b-2 border-secondary focus:outline-none focus:border-b-primary px-2 py-1 text-sm"
                value={filters.minStock}
                onChange={(event) => setFilters(prev => ({ ...prev, minStock: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-secondary" htmlFor="inventory-filter-max">{t('inventory.filters.max_stock')}</label>
              <input
                id="inventory-filter-max"
                className="border-b-2 border-secondary focus:outline-none focus:border-b-primary px-2 py-1 text-sm"
                value={filters.maxStock}
                onChange={(event) => setFilters(prev => ({ ...prev, maxStock: event.target.value }))}
              />
            </div>
            <div className="flex flex-row gap-2 items-end justify-end">
              <Button onClick={() => fetchProducts(1)} variant="default" size="sm" isRound>
                {t('inventory.filters.apply')}
              </Button>
              <Button onClick={clearFilters} variant="ghostLight" size="sm" isRound>
                {t('inventory.filters.reset')}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider">{t('inventory.table.product')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider">{t('inventory.table.category')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider">{t('inventory.table.price')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider">{t('inventory.table.stock')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-secondary uppercase tracking-wider">{t('inventory.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-secondary">{product.name}</span>
                      <span className="text-xs text-gray-400">#{product.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary">{product.category?.name}</td>
                  <td className="px-4 py-3 text-sm text-secondary">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-secondary">{product.stock}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-row justify-end gap-2">
                      <Button
                        variant="ghostLight"
                        size="sm"
                        isRound
                        onClick={() => {
                          setSelectedProduct(product);
                          setLedgerFilters({ type: '', search: '' });
                          setLedgerPage(1);
                        }}
                      >
                        <ClipboardList className="h-4 w-4" />
                        {t('inventory.actions.view_ledger')}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        isRound
                        onClick={() => {
                          setSelectedProduct(product);
                          resetTransactionForm();
                          setTransactionModalOpen(true);
                        }}
                      >
                        <PlusCircle className="h-4 w-4" />
                        {t('inventory.actions.add_transaction')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && !loadingProducts && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-secondary">
                    {t('inventory.table.empty')}
                  </td>
                </tr>
              )}
              {loadingProducts && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-secondary">
                    {t('inventory.loading')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex flex-row items-center justify-between px-4 py-3 border-t border-gray-200">
            <span className="text-xs text-secondary">{t('inventory.pagination.page', { current: totalProductPages === 0 ? 0 : productPage, total: totalProductPages })}</span>
            <div className="flex flex-row gap-2">
              <Button
                variant="ghostLight"
                size="sm"
                isRound
                disabled={productPage <= 1}
                onClick={() => fetchProducts(productPage - 1)}
                rightIcon={<ChevronLeft className="h-4 w-4" />}
              >
                {t('inventory.pagination.previous')}
              </Button>
              <Button
                variant="ghostLight"
                size="sm"
                isRound
                disabled={totalProductPages === 0 || productPage >= totalProductPages}
                onClick={() => fetchProducts(productPage + 1)}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                {t('inventory.pagination.next')}
              </Button>
            </div>
          </div>
        </div>

        {selectedProduct && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
              <div>
                <h2 className="text-lg font-primary text-secondary">{t('inventory.ledger.title', { name: selectedProduct.name })}</h2>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  {t('inventory.ledger.current_stock', { stock: selectedProduct.stock })}
                </p>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <select
                  className="border-b-2 border-secondary focus:outline-none focus:border-b-primary px-2 py-1 text-sm"
                  value={ledgerFilters.type}
                  onChange={(event) => setLedgerFilters(prev => ({ ...prev, type: event.target.value }))}
                >
                  <option value="">{t('inventory.ledger.filters.all')}</option>
                  <option value="IN">{t('inventory.transaction.in')}</option>
                  <option value="OUT">{t('inventory.transaction.out')}</option>
                  <option value="ADJUSTMENT">{t('inventory.transaction.adjustment')}</option>
                </select>
                <input
                  className="border-b-2 border-secondary focus:outline-none focus:border-b-primary px-2 py-1 text-sm"
                  value={ledgerFilters.search}
                  onChange={(event) => setLedgerFilters(prev => ({ ...prev, search: event.target.value }))}
                  placeholder={t('inventory.ledger.filters.search')}
                />
                <Button variant="ghostLight" size="sm" isRound onClick={() => { setLedgerPage(1); fetchLedger(1); }}>
                  {t('inventory.ledger.filters.apply')}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider">{t('inventory.ledger.columns.date')}</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider">{t('inventory.ledger.columns.type')}</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider">{t('inventory.ledger.columns.quantity')}</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider">{t('inventory.ledger.columns.note')}</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider">{t('inventory.ledger.columns.reference')}</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider">{t('inventory.ledger.columns.user')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ledger.map(transaction => (
                    <tr key={transaction.id}>
                      <td className="px-4 py-3 text-sm text-secondary">{formatDate(new Date(transaction.createdAt))}</td>
                      <td className="px-4 py-3 text-sm text-secondary">{movementLabel(transaction.type)}</td>
                      <td className={`px-4 py-3 text-sm font-semibold ${transaction.type === 'OUT' ? 'text-tertiary' : 'text-green-600'}`}>
                        {quantityWithSign(transaction)}
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary">{transaction.note || '-'}</td>
                      <td className="px-4 py-3 text-sm text-secondary">{transaction.reference || '-'}</td>
                      <td className="px-4 py-3 text-sm text-secondary">
                        {transaction.createdBy ? `${transaction.createdBy.firstName ?? ''} ${transaction.createdBy.lastName ?? ''}`.trim() || transaction.createdBy.email || '-' : '-'}
                      </td>
                    </tr>
                  ))}
                  {ledger.length === 0 && !loadingLedger && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-sm text-secondary">
                        {t('inventory.ledger.empty')}
                      </td>
                    </tr>
                  )}
                  {loadingLedger && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-sm text-secondary">
                        {t('inventory.loading')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-row items-center justify-between">
              <span className="text-xs text-secondary">{t('inventory.pagination.page', { current: totalLedgerPages === 0 ? 0 : ledgerPage, total: totalLedgerPages })}</span>
              <div className="flex flex-row gap-2">
                <Button
                  variant="ghostLight"
                  size="sm"
                  isRound
                  disabled={ledgerPage <= 1}
                  onClick={() => fetchLedger(ledgerPage - 1)}
                  rightIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  {t('inventory.pagination.previous')}
                </Button>
                <Button
                  variant="ghostLight"
                  size="sm"
                  isRound
                  disabled={totalLedgerPages === 0 || ledgerPage >= totalLedgerPages}
                  onClick={() => fetchLedger(ledgerPage + 1)}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  {t('inventory.pagination.next')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={transactionModalOpen && !!selectedProduct} onClose={() => { setTransactionModalOpen(false); resetTransactionForm(); }}>
        {selectedProduct && (
          <div className="w-full max-w-lg p-6 flex flex-col gap-4">
            <h3 className="text-xl font-primary text-secondary">{t('inventory.transaction.modal_title', { name: selectedProduct.name })}</h3>
            <p className="text-xs text-gray-500">{t('inventory.transaction.current_stock', { stock: selectedProduct.stock })}</p>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary">{t('inventory.transaction.type')}</label>
              <select
                className="border-b-2 border-secondary focus:outline-none focus:border-b-primary px-2 py-1 text-sm"
                value={transactionType}
                onChange={(event) => setTransactionType(event.target.value as InventoryMovementType)}
              >
                <option value="IN">{t('inventory.transaction.in')}</option>
                <option value="OUT">{t('inventory.transaction.out')}</option>
                <option value="ADJUSTMENT">{t('inventory.transaction.adjustment')}</option>
              </select>
              {formErrors.type && <span className="text-[10px] text-tertiary">{t(formErrors.type)}</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary">{t('inventory.transaction.quantity')}</label>
              <input
                className="border-b-2 border-secondary focus:outline-none focus:border-b-primary px-2 py-1 text-sm"
                value={transactionQuantity}
                onChange={(event) => setTransactionQuantity(event.target.value)}
              />
              {formErrors.quantity && <span className="text-[10px] text-tertiary">{t(formErrors.quantity)}</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary">{t('inventory.transaction.note')}</label>
              <input
                className="border-b-2 border-secondary focus:outline-none focus:border-b-primary px-2 py-1 text-sm"
                value={transactionNote}
                onChange={(event) => setTransactionNote(event.target.value)}
              />
              {formErrors.note && <span className="text-[10px] text-tertiary">{t(formErrors.note)}</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary">{t('inventory.transaction.reference')}</label>
              <input
                className="border-b-2 border-secondary focus:outline-none focus:border-b-primary px-2 py-1 text-sm"
                value={transactionReference}
                onChange={(event) => setTransactionReference(event.target.value)}
              />
              {formErrors.reference && <span className="text-[10px] text-tertiary">{t(formErrors.reference)}</span>}
            </div>
            <div className="flex flex-row gap-2 justify-end">
              <Button variant="ghostLight" size="sm" isRound onClick={() => setTransactionModalOpen(false)}>
                {t('inventory.transaction.cancel')}
              </Button>
              <Button
                variant="default"
                size="sm"
                isRound
                onClick={handleCreateTransaction}
                isLoading={transactionLoading}
              >
                {t('inventory.transaction.submit')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Dashboard>
  );
};

export default InventoryPage;
