import axios from "axios";
import { toast } from "sonner";
import { serializeStatisticsNetSales, serializeStatisticsReserves } from "../serializer";

type Step = "W" | "M" | "Y";
type SeriesType = "A" | "P";

type WindowedFilters = {
  step: Step;
  type: SeriesType;
  anchor: string;   // YYYY-MM-DD
  offset: number;   // e.g., 0 (current), -1 (prev page), +1 (next)
  tz?: string;      // optional, default 'America/Lima'
};

export const getReserveQuantityStatistics = async (
  token: string,
  filters: WindowedFilters,
  language: string
): Promise<{ date: string; quantity: number }[] | null> => {
  let data: { date: string; quantity: number }[] | null = null;

  try {
    const params = new URLSearchParams();
    params.append("step", filters.step);
    params.append("type", filters.type);
    params.append("anchor", filters.anchor);
    params.append("offset", String(filters.offset));
    params.append("tz", filters.tz || "America/Lima");

    const url = `${import.meta.env.VITE_BACKEND_URL}/statistics/reserves?${params.toString()}`;

    const resp = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept-Language": language,
      },
    });

    data = serializeStatisticsReserves(resp.data);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage = (errorData as any)?.error;

      if (Array.isArray(errorMessage)) {
        errorMessage.forEach((err) => toast.error(err.msg || "Validation error occurred"));
      } else {
        if (statusCode) {
          toast.error(`${errorMessage || "Error during Fetching the statistics."} (Code: ${statusCode})`);
        } else {
          toast.error(errorMessage || "An error occurred.");
        }
      }
    } else {
      toast.error("An unexpected error occurred.");
    }
    console.error(error);
  }
  return null;
};

export const getNetSalesStatistics = async (
  token: string,
  filters: WindowedFilters,
  language: string
): Promise<{ date: string; amount: number }[] | null> => {
  let data: { date: string; amount: number }[] | null = null;

  try {
    const params = new URLSearchParams();
    params.append("step", filters.step);
    params.append("type", filters.type);
    params.append("anchor", filters.anchor);
    params.append("offset", String(filters.offset));
    params.append("tz", filters.tz || "America/Lima");

    // keep your existing route naming
    const url = `${import.meta.env.VITE_BACKEND_URL}/statistics/net-import?${params.toString()}`;

    const resp = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept-Language": language,
      },
    });

    data = serializeStatisticsNetSales(resp.data);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage = (errorData as any)?.error;

      if (Array.isArray(errorMessage)) {
        errorMessage.forEach((err) => toast.error(err.msg || "Validation error occurred"));
      } else {
        if (statusCode) {
          toast.error(`${errorMessage || "Error during Fetching the statistics."} (Code: ${statusCode})`);
        } else {
          toast.error(errorMessage || "An error occurred.");
        }
      }
    } else {
      toast.error("An unexpected error occurred.");
    }
    console.error(error);
  }
  return null;
};
