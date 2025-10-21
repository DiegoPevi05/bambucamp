import { Request, Response } from 'express';
import * as productService from '../services/productService';
import * as notificationService from '../services/notificationServices';
import { body, param, validationResult } from 'express-validator';
import { CustomError } from '../middleware/errors';
import { ProductFilters } from '../dto/product';

export const getAllPublicProducts = async (req: Request, res: Response) => {
  try {
    const { categories } = req.query;
    const products = await productService.getAllPublicProducts(categories as string[]);
    res.json(products);
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchProducts") });
    }
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { name, status, stockStatus, minStock, maxStock, page = '1', pageSize = '10' } = req.query;

    const minStockValue = minStock !== undefined ? Number(minStock) : undefined;
    const maxStockValue = maxStock !== undefined ? Number(maxStock) : undefined;

    const stockStatusFilter: ProductFilters['stockStatus'] =
      stockStatus === 'in' || stockStatus === 'out' ? stockStatus : undefined;

    const filters: ProductFilters = {
      name: typeof name === 'string' ? name : undefined,
      status: typeof status === 'string' ? status : undefined,
      stockStatus: stockStatusFilter,
      minStock: Number.isFinite(minStockValue) ? minStockValue : undefined,
      maxStock: Number.isFinite(maxStockValue) ? maxStockValue : undefined,
    };

    const pagination = {
      page: Math.max(1, parseInt(page as string, 10) || 1),
      pageSize: Math.max(1, parseInt(pageSize as string, 10) || 10),
    };

    const PaginatedProducts = await productService.getAllProducts(filters, pagination);

    res.json(PaginatedProducts);

  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchProducts") });
    }
  }
};

export const createProduct = [
  body('categoryId').notEmpty().withMessage("validation.categoryIdRequired"),
  body('name').notEmpty().withMessage("validation.nameRequired"),
  body('description').notEmpty().withMessage("validation.descriptionRequired"),
  body('price').notEmpty().withMessage("validation.priceRequired"),
  body('stock').notEmpty().withMessage("validation.stockRequired"),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {
      const product = await productService.createProduct(req.body, req.files);

      await notificationService.notifyProductCreation(req, product)

      res.status(201).json({ message: req.t("message.productCreated") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToCreateProduct") });
      }
    }
  }
];

export const updateProduct = [
  param('id').notEmpty().withMessage("validation.idRequired"),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {
      const product = await productService.updateProduct(Number(req.params.id), req.body  , req.files );

      await notificationService.notifyProductUpdate(req, product)

      res.json({ message: req.t("message.productUpdated") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToUpdateProduct") });
      }
    }
  }
];

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await productService.deleteProduct(Number(req.params.id));

    await notificationService.notifyProductDeletion(req, parseInt(req.params.id));

    res.json({ message: req.t("message.productDeleted") });
  } catch (error) {

    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToDeleteProduct") });
    }
  }
};


