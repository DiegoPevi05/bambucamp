import * as productRepository from '../repositories/ProductRepository';
import * as utils from '../lib/utils';
import { ProductDto, ProductFilters, PaginatedProducts, PublicProduct } from "../dto/product";
import * as inventoryRepository from '../repositories/InventoryRepository';
import * as inventoryService from './inventoryService';
import { deleteSubFolder, serializeImagesTodb, moveImagesToSubFolder, deleteImages } from '../lib/utils';
import { NotFoundError } from '../middleware/errors';


export const getAllPublicProducts = async (categories?: string[]) => {
  const products = await productRepository.getAllPublicProducts(categories);
  const stockMap = await inventoryRepository.getStockForProductIds(products.map((product) => product.id));

  const ProductsPublic: PublicProduct[] = [];

  products.forEach((product) => {
    const productPublic: PublicProduct = {
      id: product.id,
      categoryId: product.categoryId,
      category: product.category,
      name: product.name,
      description: product.description,
      price: product.price,
      images: JSON.parse(product.images ? product.images : '[]'),
      custom_price: product.custom_price != undefined ? utils.calculatePrice(product.price, product.custom_price) : product.price,
      stock: stockMap.get(product.id) ?? 0,
    };
    ProductsPublic.push(productPublic);
  });

  return ProductsPublic;

};

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllProducts = async (filters: ProductFilters, pagination: Pagination): Promise<PaginatedProducts> => {
  const products = await productRepository.getAllProducts(filters);
  const stockMap = await inventoryRepository.getStockForProductIds(products.map((product) => product.id));

  const enriched = products.map((product) => {
    const parsedImages = JSON.parse(product.images ? product.images : '[]');
    const stock = stockMap.get(product.id) ?? 0;

    return {
      ...product,
      images: parsedImages,
      stock,
    };
  });

  const filtered = enriched.filter((product) => {
    if (filters.stockStatus === 'in' && product.stock <= 0) {
      return false;
    }

    if (filters.stockStatus === 'out' && product.stock > 0) {
      return false;
    }

    if (typeof filters.minStock === 'number' && product.stock < filters.minStock) {
      return false;
    }

    if (typeof filters.maxStock === 'number' && product.stock > filters.maxStock) {
      return false;
    }

    return true;
  });

  const totalPages = filtered.length === 0 ? 0 : Math.ceil(filtered.length / pagination.pageSize);
  const desiredPage = totalPages === 0 ? pagination.page : Math.min(pagination.page, totalPages);
  const currentPage = desiredPage <= 0 ? 1 : desiredPage;
  const start = (currentPage - 1) * pagination.pageSize;
  const paginatedProducts = totalPages === 0 ? filtered.slice(0, pagination.pageSize) : filtered.slice(start, start + pagination.pageSize);

  return {
    products: paginatedProducts,
    totalPages,
    currentPage,
  };
};

export const getProductById = async (id: number) => {
  return await productRepository.getProductById(id);
};


// Define a custom type for the Multer file
type MulterFile = Express.Multer.File;

export const createProduct = async (data: ProductDto, files: MulterFile[] | { [fieldname: string]: MulterFile[]; } | undefined) => {

  const images = serializeImagesTodb(files as { [fieldname: string]: MulterFile[] });

  if (images) {
    data.images = images;
  }
  data.categoryId = Number(data.categoryId);
  data.price = Number(data.price);
  const stock = Number(data.stock ?? 0);
  delete data.stock;

  const product = await productRepository.createProduct(data);

  if (images) {
    // Move images to the new folder
    const movedImages = await moveImagesToSubFolder(product.id, "products", JSON.parse(images || '[]'));

    await updateProductImages(product.id, JSON.stringify(movedImages));
  }

  if (stock > 0) {
    await inventoryService.createTransaction({
      productId: product.id,
      type: 'IN',
      quantity: stock,
      note: 'Initial stock on creation',
      reference: 'PRODUCT-CREATE',
    });
  }

  return product;


};

export const updateProduct = async (id: number, data: ProductDto, files: MulterFile[] | { [fieldname: string]: MulterFile[]; } | undefined) => {


  const product = await productRepository.getProductById(id);

  if (!product) {
    throw new NotFoundError("error.noProductFoundInDB");
  }

  const categoryId = data.categoryId != null ? Number(data.categoryId) : undefined;
  const price = data.price != null ? Number(data.price) : undefined;

  if (categoryId != null && categoryId !== product.categoryId) {
    product.categoryId = categoryId;
  }

  if (data.name && data.name != product.name) {
    product.name = data.name;
  }

  if (data.description && data.description != product.description) {
    product.description = data.description;
  }

  if (files || data.existing_images) {


    let imagesToConserve: string[] = product.images ? JSON.parse(product.images) : [];
    // Normalize paths to use forward slashes
    imagesToConserve = imagesToConserve.map(image => image.replace(/\\/g, '/'));

    if (data.existing_images) {

      const imageToReplace: string[] = data.existing_images ? JSON.parse(data.existing_images) : [];

      if (imageToReplace.length >= 0 && imagesToConserve.length != imageToReplace.length) {
        // Find the images that need to be removed
        const imagesToRemove = imagesToConserve.filter(dbImage => !imageToReplace.includes(dbImage));
        // Perform the removal of images
        if (imagesToRemove.length > 0) {
          deleteImages(imagesToRemove);
        }

        imagesToConserve = imagesToConserve.filter(dbImage => imageToReplace.includes(dbImage));
      }

    }

    let NewMovedImages: any[] = [];

    if (files) {

      const imagesFiles = serializeImagesTodb(files as { [fieldname: string]: MulterFile[] });

      NewMovedImages = await moveImagesToSubFolder(product.id, "products", JSON.parse(imagesFiles || '[]'));

    }

    const allImages = [...imagesToConserve, ...NewMovedImages];

    const formattedImages = allImages.map(image => image.replace(/\//g, '\\'));
    // Store the images in the desired format
    product.images = JSON.stringify(formattedImages);
  }

  if (price != null && price !== product.price) {
    product.price = price;
  }

  if (data.status && data.status != product.status) {
    product.status = data.status;
  }

  if (data.custom_price && data.custom_price != product.custom_price) {
    product.custom_price = data.custom_price;
  }

  product.updatedAt = new Date();

  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, stock: _stock, ...productData } = product;

  return await productRepository.updateProduct(id, productData);
};

export const deleteProduct = async (id: number) => {
  const product = await productRepository.getProductById(id);
  if (product?.images) {
    deleteSubFolder(product.id, "products");
  }
  return await productRepository.deleteProduct(id);
};


export const updateProductImages = async (productId: number, images: string) => {
  await productRepository.updateProductImages(productId, images);
};

export const checkProductStock = async (idProduct: number, quantity: number, options?: { reference?: string; note?: string; createdById?: number }): Promise<boolean> => {

  const product = await productRepository.getProductById(idProduct);

  if (!product) {
    throw new NotFoundError("error.noProductFoundInDB");
  }

  await inventoryService.createTransaction({
    productId: product.id,
    type: 'OUT',
    quantity,
    reference: options?.reference,
    note: options?.note ?? 'Reserve allocation',
    createdById: options?.createdById,
  });

  return true;

}
