import * as reserveRepository from '../repositories/ReserveRepository';

interface SalesFilters {
  step: "W" | "M" | "Y";
  type: "A" | "P";
  anchor: Date;
  offset: number;
  tz: string;
}

export const getNetSalesStatistics = async (filters: SalesFilters, language: string) =>
  reserveRepository.getNetSalesStatistics(filters, language);

export const getReserveQuantityStatistics = async (filters: SalesFilters, language: string) =>
  reserveRepository.getReserveQuantityStatistics(filters, language);
