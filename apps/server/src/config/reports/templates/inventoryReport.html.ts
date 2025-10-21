import fs from 'fs';
import path from 'path';

const baseStyles = fs.readFileSync(path.join(__dirname, '_baseReport.css'), 'utf8');

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export interface InventoryReportTemplateTransaction {
  date: string;
  type: string;
  quantity: string;
  note: string;
  reference: string;
  user: string;
}

export interface InventoryReportTemplateProduct {
  id: number;
  name: string;
  categoryLabel: string;
  stockLabel: string;
  stockValue: string;
  movementLabel: string;
  movementValue: string;
  transactions: InventoryReportTemplateTransaction[];
}

export interface InventoryReportTemplateData {
  documentTitle: string;
  title: string;
  subtitle: string;
  generatedAtLabel: string;
  generatedByLabel: string;
  dateRangeLabel: string;
  generatedAt: string;
  generatedBy: string;
  dateRange: string;
  products: InventoryReportTemplateProduct[];
  tableHeaders: {
    date: string;
    type: string;
    quantity: string;
    note: string;
    reference: string;
    user: string;
    empty: string;
  };
  footerNote: string;
}

export const renderInventoryReportHtml = (data: InventoryReportTemplateData): string => {
  const productBlocks = data.products.map((product) => {
    const rows = product.transactions.map((transaction) => `
        <tr>
          <td>${escapeHtml(transaction.date)}</td>
          <td>${escapeHtml(transaction.type)}</td>
          <td class="text-right">${escapeHtml(transaction.quantity)}</td>
          <td>${escapeHtml(transaction.note)}</td>
          <td>${escapeHtml(transaction.reference)}</td>
          <td>${escapeHtml(transaction.user)}</td>
        </tr>
    `).join('');

    return `
      <section class="product-block">
        <div class="product-block__header">
          <div>
            <div class="product-block__name">${escapeHtml(product.name)}</div>
            <div class="product-block__meta">${escapeHtml(product.categoryLabel)}</div>
          </div>
          <div class="product-block__meta">
            <div>${escapeHtml(product.stockLabel)}: <strong>${escapeHtml(product.stockValue)}</strong></div>
            <div>${escapeHtml(product.movementLabel)}: <strong>${escapeHtml(product.movementValue)}</strong></div>
          </div>
        </div>
        <table class="report-table">
          <thead class="report-table__headers">
            <tr>
              <th>${escapeHtml(data.tableHeaders.date)}</th>
              <th>${escapeHtml(data.tableHeaders.type)}</th>
              <th class="text-right">${escapeHtml(data.tableHeaders.quantity)}</th>
              <th>${escapeHtml(data.tableHeaders.note)}</th>
              <th>${escapeHtml(data.tableHeaders.reference)}</th>
              <th>${escapeHtml(data.tableHeaders.user)}</th>
            </tr>
          </thead>
          <tbody class="report-table__body">
            ${rows || `<tr><td colspan="6" class="text-muted">${escapeHtml(data.tableHeaders.empty)}</td></tr>`}
          </tbody>
        </table>
      </section>
    `;
  }).join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(data.documentTitle)}</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="report-container">
          <div class="report-header">
            <div>
              <strong>${escapeHtml(data.generatedAtLabel)}</strong><br />
              ${escapeHtml(data.generatedAt)}
            </div>
            <div class="report-header__meta">
              <div><strong>${escapeHtml(data.generatedByLabel)}</strong></div>
              <div>${escapeHtml(data.generatedBy)}</div>
              <div><strong>${escapeHtml(data.dateRangeLabel)}</strong></div>
              <div>${escapeHtml(data.dateRange)}</div>
            </div>
          </div>
          <h1 class="report-title">${escapeHtml(data.title)}</h1>
          <div class="report-subtitle">${escapeHtml(data.subtitle)}</div>
          ${productBlocks}
          <div class="footer-note">${escapeHtml(data.footerNote)}</div>
        </div>
      </body>
    </html>
  `;
};
