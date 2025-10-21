export const toCSV = (rows: Record<string, unknown>[]): string => {
  if (!rows.length) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const escape = (value: unknown): string => {
    const stringValue = value === null || value === undefined ? '' : String(value);
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const lines = [headers.join(',')];

  for (const row of rows) {
    const values = headers.map((header) => escape(row[header]));
    lines.push(values.join(','));
  }

  return lines.join('\n');
};
