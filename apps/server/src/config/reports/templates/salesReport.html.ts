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

export interface SalesReportTemplateRow {
  externalId: string;
  gross: string;
  net: string;
  dateRange: string;
  reserveStatus: string;
  paymentStatus: string;
}

export interface SalesReportTemplateData {
  documentTitle: string;
  title: string;
  subtitle: string;
  generatedAtLabel: string;
  generatedByLabel: string;
  dateRangeLabel: string;
  generatedAt: string;
  generatedBy: string;
  dateRange: string;
  tableHeaders: {
    externalId: string;
    gross: string;
    net: string;
    range: string;
    reserveStatus: string;
    paymentStatus: string;
    empty: string;
  };
  rows: SalesReportTemplateRow[];
  footerNote: string;
}

export const renderSalesReportHtml = (data: SalesReportTemplateData): string => {
  const bodyRows = data.rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.externalId)}</td>
        <td class="text-right">${escapeHtml(row.gross)}</td>
        <td class="text-right">${escapeHtml(row.net)}</td>
        <td>${escapeHtml(row.dateRange)}</td>
        <td>${escapeHtml(row.reserveStatus)}</td>
        <td>${escapeHtml(row.paymentStatus)}</td>
      </tr>
  `).join('');

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
          <table class="report-table">
            <thead>
              <tr>
                <th>${escapeHtml(data.tableHeaders.externalId)}</th>
                <th class="text-right">${escapeHtml(data.tableHeaders.gross)}</th>
                <th class="text-right">${escapeHtml(data.tableHeaders.net)}</th>
                <th>${escapeHtml(data.tableHeaders.range)}</th>
                <th>${escapeHtml(data.tableHeaders.reserveStatus)}</th>
                <th>${escapeHtml(data.tableHeaders.paymentStatus)}</th>
              </tr>
            </thead>
            <tbody>
              ${bodyRows || `<tr><td colspan="6" class="text-muted">${escapeHtml(data.tableHeaders.empty)}</td></tr>`}
            </tbody>
          </table>
          <div class="footer-note">${escapeHtml(data.footerNote)}</div>
        </div>
      </body>
    </html>
  `;
};
