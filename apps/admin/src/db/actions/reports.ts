import axios from 'axios';
import { toast } from 'sonner';
import { InventoryReportFilters, SalesReportFilters } from '@bambucamp/shared-types';

const DEFAULT_LOCALE = 'es';

const successMessage = (language: string | undefined) => {
  switch (language) {
    case 'en':
      return 'Report downloaded successfully.';
    case 'es':
    default:
      return 'Reporte descargado correctamente.';
  }
};

const errorMessage = (language: string | undefined) => {
  switch (language) {
    case 'en':
      return 'Unable to download the report.';
    case 'es':
    default:
      return 'No se pudo descargar el reporte.';
  }
};

const parseFilename = (disposition: string | undefined, fallback: string) => {
  if (!disposition) {
    return fallback;
  }

  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch && utfMatch[1]) {
    try {
      return decodeURIComponent(utfMatch[1]);
    } catch {
      return utfMatch[1];
    }
  }

  const asciiMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (asciiMatch && asciiMatch[1]) {
    return asciiMatch[1];
  }

  return fallback;
};

const triggerBrowserDownload = (data: BlobPart, filename: string, mimeType: string | undefined) => {
  const blob = new Blob([data], { type: mimeType ?? 'application/octet-stream' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
};

const withQueryParams = (baseUrl: string, params: URLSearchParams) => {
  const query = params.toString();
  return query ? `${baseUrl}?${query}` : baseUrl;
};

export const downloadInventoryReport = async (
  token: string,
  filters: InventoryReportFilters,
  language?: string,
): Promise<boolean> => {
  const params = new URLSearchParams();
  params.append('dateFrom', filters.dateFrom);
  params.append('dateTo', filters.dateTo);
  params.append('format', filters.format);
  params.append('sortBy', filters.sortBy);

  filters.productIds?.forEach((id) => {
    params.append('productIds', id.toString());
  });

  try {
    const response = await axios.get(
      withQueryParams(`${import.meta.env.VITE_BACKEND_URL}/reports/inventory`, params),
      {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept-Language': language ?? DEFAULT_LOCALE,
        },
      },
    );

    const filename = parseFilename(
      response.headers['content-disposition'],
      `inventory-report.${filters.format}`,
    );

    triggerBrowserDownload(response.data, filename, response.headers['content-type']);
    toast.success(successMessage(language));
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error ?? errorMessage(language);
      toast.error(message);
    } else {
      toast.error(errorMessage(language));
    }
    console.error('downloadInventoryReport', error);
    return false;
  }
};

export const downloadSalesReport = async (
  token: string,
  filters: SalesReportFilters,
  language?: string,
): Promise<boolean> => {
  const params = new URLSearchParams();
  params.append('dateFrom', filters.dateFrom);
  params.append('dateTo', filters.dateTo);
  params.append('format', filters.format);

  try {
    const response = await axios.get(
      withQueryParams(`${import.meta.env.VITE_BACKEND_URL}/reports/sales`, params),
      {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept-Language': language ?? DEFAULT_LOCALE,
        },
      },
    );

    const filename = parseFilename(
      response.headers['content-disposition'],
      `sales-report.${filters.format}`,
    );

    triggerBrowserDownload(response.data, filename, response.headers['content-type']);
    toast.success(successMessage(language));
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error ?? errorMessage(language);
      toast.error(message);
    } else {
      toast.error(errorMessage(language));
    }
    console.error('downloadSalesReport', error);
    return false;
  }
};
