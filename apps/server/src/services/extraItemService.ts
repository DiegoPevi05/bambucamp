import { ExtraItem } from '@prisma/client';
import * as extraItemRepository from '../repositories/ExtraItemRepository';
import { NotFoundError } from '../middleware/errors';

export const getExtraItemsByIds = async (ids: number[]): Promise<ExtraItem[]> => {
  const items = await extraItemRepository.getExtraItemsByIds(ids);

  if (items.length !== ids.length) {
    throw new NotFoundError('error.noExtraItemFoundInDB');
  }

  return items;
};

export const getExtraItemById = async (id: number): Promise<ExtraItem> => {
  const item = await extraItemRepository.getExtraItemById(id);

  if (!item) {
    throw new NotFoundError('error.noExtraItemFoundInDB');
  }

  return item;
};
