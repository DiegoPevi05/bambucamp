import { InventoryReportFilters, SalesReportFilters } from '@bambucamp/shared-types';
import { InventoryMovementType } from '@prisma/client';
import { renderReportPdf } from '../config/reports/pdf';
import { renderInventoryReportHtml } from '../config/reports/templates/inventoryReport.html';
import { renderSalesReportHtml } from '../config/reports/templates/salesReport.html';
import { InventoryReportProductRow, getInventoryReportProducts } from '../repositories/InventoryRepository';
import { SalesReportReserveRow, getReservesForReport } from '../repositories/ReserveRepository';
import { toCSV } from '../lib/csv';
import { BadRequestError } from '../middleware/errors';

interface ReportContext {
  locale: string;
  translator: (key: string, options?: Record<string, unknown>) => string;
  userName?: string | null;
}

interface ReportResult {
  filename: string;
  content: Buffer;
  contentType: string;
}

const MOVEMENT_SIGN: Record<InventoryMovementType, '+' | '-'> = {
  IN: '+',
  OUT: '-',
  ADJUSTMENT: '+',
};

const parseDateRange = (filters: { dateFrom: string; dateTo: string }) => {
  const start = new Date(`${filters.dateFrom}T00:00:00.000Z`);
  const end = new Date(`${filters.dateTo}T23:59:59.999Z`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new BadRequestError('validation.dateInvalid');
  }

  if (start > end) {
    throw new BadRequestError('validation.dateRangeInvalid');
  }

  return { start, end };
};

const formatDate = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);

const formatDateTime = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);

const formatNumber = (value: number, locale: string, minimumFractionDigits = 0, maximumFractionDigits = 0) =>
  new Intl.NumberFormat(locale, { minimumFractionDigits, maximumFractionDigits }).format(value);

const formatDecimal = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

const buildInventoryCsv = (
  products: InventoryReportProductRow[],
  ctx: ReportContext,
  movementLabels: Record<InventoryMovementType, string>,
) => {
  const rows: Record<string, string>[] = [];

  for (const product of products) {
    if (product.transactions.length === 0) {
      rows.push({
        [ctx.translator('reports.csv.product')]: product.name,
        [ctx.translator('reports.csv.category')]: product.categoryName ?? '',
        [ctx.translator('reports.csv.stock')]: String(product.stock),
        [ctx.translator('reports.csv.movement')]: String(product.totalMovement),
        [ctx.translator('reports.csv.date')]: '',
        [ctx.translator('reports.csv.type')]: '',
        [ctx.translator('reports.csv.quantity')]: '',
        [ctx.translator('reports.csv.note')]: '',
        [ctx.translator('reports.csv.reference')]: '',
        [ctx.translator('reports.csv.user')]: '',
      });
      continue;
    }

    for (const transaction of product.transactions) {
      const quantitySign = MOVEMENT_SIGN[transaction.type];
      rows.push({
        [ctx.translator('reports.csv.product')]: product.name,
        [ctx.translator('reports.csv.category')]: product.categoryName ?? '',
        [ctx.translator('reports.csv.stock')]: String(product.stock),
        [ctx.translator('reports.csv.movement')]: String(product.totalMovement),
        [ctx.translator('reports.csv.date')]: formatDate(transaction.createdAt, ctx.locale),
        [ctx.translator('reports.csv.type')]: movementLabels[transaction.type],
        [ctx.translator('reports.csv.quantity')]: `${quantitySign}${transaction.quantity}`,
        [ctx.translator('reports.csv.note')]: transaction.note ?? '',
        [ctx.translator('reports.csv.reference')]: transaction.reference ?? '',
        [ctx.translator('reports.csv.user')]: transaction.createdBy
          ? [transaction.createdBy.firstName, transaction.createdBy.lastName]
              .filter(Boolean)
              .join(' ') || transaction.createdBy.email || ''
          : '',
      });
    }
  }

  return Buffer.from(`\uFEFF${toCSV(rows)}`, 'utf8');
};

const sortInventoryProducts = (
  products: InventoryReportProductRow[],
  sortBy: InventoryReportFilters['sortBy'],
) => {
  const sorted = [...products];

  switch (sortBy) {
    case 'stock_asc':
      sorted.sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name));
      break;
    case 'stock_desc':
      sorted.sort((a, b) => b.stock - a.stock || a.name.localeCompare(b.name));
      break;
    case 'qty_asc':
      sorted.sort((a, b) => a.totalMovement - b.totalMovement || a.name.localeCompare(b.name));
      break;
    case 'qty_desc':
      sorted.sort((a, b) => b.totalMovement - a.totalMovement || a.name.localeCompare(b.name));
      break;
    default:
      break;
  }

  return sorted;
};

const buildInventoryTemplateData = (
  products: InventoryReportProductRow[],
  filters: InventoryReportFilters,
  ctx: ReportContext,
) => {
  const movementLabels: Record<InventoryMovementType, string> = {
    IN: ctx.translator('reports.movements.in'),
    OUT: ctx.translator('reports.movements.out'),
    ADJUSTMENT: ctx.translator('reports.movements.adjustment'),
  };

  const sortedProducts = sortInventoryProducts(products, filters.sortBy);

  const templateProducts = sortedProducts.map((product) => ({
    id: product.id,
    name: product.name,
    categoryLabel: product.categoryName
      ? ctx.translator('reports.category_with_value', { value: product.categoryName })
      : ctx.translator('reports.category_unknown'),
    stockLabel: ctx.translator('reports.stock_label'),
    stockValue: String(product.stock),
    movementLabel: ctx.translator('reports.movement_label'),
    movementValue: String(product.totalMovement),
    transactions: product.transactions.map((transaction) => ({
      date: formatDate(transaction.createdAt, ctx.locale),
      type: movementLabels[transaction.type],
      quantity: `${MOVEMENT_SIGN[transaction.type]}${transaction.quantity}`,
      note: transaction.note ?? '-',
      reference: transaction.reference ?? '-',
      user: transaction.createdBy
        ? [transaction.createdBy.firstName, transaction.createdBy.lastName]
            .filter(Boolean)
            .join(' ') || transaction.createdBy.email || '-'
        : '-',
    })),
  }));

  return {
    templateProducts,
    sortedProducts,
    movementLabels,
  };
};

export const generateInventoryReport = async (
  filters: InventoryReportFilters,
  ctx: ReportContext,
): Promise<ReportResult> => {
  const { start, end } = parseDateRange(filters);

  const products = await getInventoryReportProducts({
    productIds: filters.productIds,
    dateFrom: start,
    dateTo: end,
  });

  const formattedRange = `${formatDate(start, ctx.locale)} - ${formatDate(end, ctx.locale)}`;
  const generatedAt = formatDateTime(new Date(), ctx.locale);
  const generatedBy = ctx.userName ?? ctx.translator('reports.unknown_user');

  const { templateProducts, sortedProducts, movementLabels } = buildInventoryTemplateData(products, filters, ctx);

  if (filters.format === 'csv') {
    const csvBuffer = buildInventoryCsv(sortedProducts, ctx, movementLabels);
    return {
      filename: `inventory-report-${Date.now()}.csv`,
      contentType: 'text/csv; charset=utf-8',
      content: csvBuffer,
    };
  }

  const html = renderInventoryReportHtml({
    documentTitle: ctx.translator('reports.inventory.document_title'),
    title: ctx.translator('reports.inventory.title'),
    subtitle: ctx.translator('reports.inventory.subtitle', { range: formattedRange }),
    generatedAtLabel: ctx.translator('reports.generated_at'),
    generatedByLabel: ctx.translator('reports.generated_by'),
    dateRangeLabel: ctx.translator('reports.date_range'),
    generatedAt,
    generatedBy,
    dateRange: formattedRange,
    products: templateProducts,
    tableHeaders: {
      date: ctx.translator('reports.table.date'),
      type: ctx.translator('reports.table.type'),
      quantity: ctx.translator('reports.table.quantity'),
      note: ctx.translator('reports.table.note'),
      reference: ctx.translator('reports.table.reference'),
      user: ctx.translator('reports.table.user'),
      empty: ctx.translator('reports.table.empty'),
    },
    footerNote: ctx.translator('reports.footer_note'),
  });

  const pdfBuffer = await renderReportPdf(html);

  return {
    filename: `inventory-report-${Date.now()}.pdf`,
    contentType: 'application/pdf',
    content: pdfBuffer,
  };
};

const buildSalesCsv = (rows: SalesReportReserveRow[], ctx: ReportContext) => {
  const csvRows = rows.map((row) => ({
    [ctx.translator('reports.sales.csv.externalId')]: row.externalId,
    [ctx.translator('reports.sales.csv.gross')]: formatDecimal(row.grossImport, ctx.locale),
    [ctx.translator('reports.sales.csv.net')]: formatDecimal(row.netImport, ctx.locale),
    [ctx.translator('reports.sales.csv.range')]: `${row.dateFrom ? formatDate(row.dateFrom, ctx.locale) : ''} - ${row.dateTo ? formatDate(row.dateTo, ctx.locale) : ''}`.trim(),
    [ctx.translator('reports.sales.csv.reserveStatus')]: ctx.translator(`reports.sales.reserve_status.${row.reserveStatus}`),
    [ctx.translator('reports.sales.csv.paymentStatus')]: ctx.translator(`reports.sales.payment_status.${row.paymentStatus}`),
  }));

  return Buffer.from(`\uFEFF${toCSV(csvRows)}`, 'utf8');
};

export const generateSalesReport = async (
  filters: SalesReportFilters,
  ctx: ReportContext,
): Promise<ReportResult> => {
  const { start, end } = parseDateRange(filters);

  const reserves = await getReservesForReport({ dateFrom: start, dateTo: end });

  const formattedRange = `${formatDate(start, ctx.locale)} - ${formatDate(end, ctx.locale)}`;
  const generatedAt = formatDateTime(new Date(), ctx.locale);
  const generatedBy = ctx.userName ?? ctx.translator('reports.unknown_user');

  if (filters.format === 'csv') {
    const csvBuffer = buildSalesCsv(reserves, ctx);
    return {
      filename: `sales-report-${Date.now()}.csv`,
      contentType: 'text/csv; charset=utf-8',
      content: csvBuffer,
    };
  }

  const rows = reserves.map((reserve) => ({
    externalId: reserve.externalId,
    gross: formatDecimal(reserve.grossImport, ctx.locale),
    net: formatDecimal(reserve.netImport, ctx.locale),
    dateRange: `${reserve.dateFrom ? formatDate(reserve.dateFrom, ctx.locale) : ''} - ${reserve.dateTo ? formatDate(reserve.dateTo, ctx.locale) : ''}`.trim(),
    reserveStatus: ctx.translator(`reports.sales.reserve_status.${reserve.reserveStatus}`),
    paymentStatus: ctx.translator(`reports.sales.payment_status.${reserve.paymentStatus}`),
  }));

  const html = renderSalesReportHtml({
    documentTitle: ctx.translator('reports.sales.document_title'),
    title: ctx.translator('reports.sales.title'),
    subtitle: ctx.translator('reports.sales.subtitle', { range: formattedRange }),
    generatedAtLabel: ctx.translator('reports.generated_at'),
    generatedByLabel: ctx.translator('reports.generated_by'),
    dateRangeLabel: ctx.translator('reports.date_range'),
    generatedAt,
    generatedBy,
    dateRange: formattedRange,
    tableHeaders: {
      externalId: ctx.translator('reports.sales.table.externalId'),
      gross: ctx.translator('reports.sales.table.gross'),
      net: ctx.translator('reports.sales.table.net'),
      range: ctx.translator('reports.sales.table.range'),
      reserveStatus: ctx.translator('reports.sales.table.reserveStatus'),
      paymentStatus: ctx.translator('reports.sales.table.paymentStatus'),
      empty: ctx.translator('reports.sales.table.empty'),
    },
    rows,
    footerNote: ctx.translator('reports.footer_note'),
  });

  const pdfBuffer = await renderReportPdf(html);

  return {
    filename: `sales-report-${Date.now()}.pdf`,
    contentType: 'application/pdf',
    content: pdfBuffer,
  };
};
