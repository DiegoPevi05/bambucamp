import { PrismaClient, Product   } from "@prisma/client";
import { ProductDto, ProductFilters, ProductPublicDto } from "../dto/product";
import {BadRequestError} from "../middleware/errors";

const prisma = new PrismaClient();

export const getAllPublicProducts = async (categories?: string[]): Promise<ProductPublicDto[]> => {
  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      ...(categories && {
        category: {
          name: {
            in: categories, // Filter experiences by the category names array
            mode: 'insensitive', // Optional: make it case-insensitive
          }
        }
      }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      category: true, // Include the category object
    },
  });

  return products.map((product) => ({
    ...product,
    stock: product.stock ?? undefined,
  }));
};

export const getAllProducts = async (filters: ProductFilters): Promise<ProductPublicDto[]> => {
  const { name, status } = filters;

  const products = await prisma.product.findMany({
    where: {
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(status && { status: { contains: status, mode: 'insensitive' } }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      category: true,
    },
  });

  return products.map((product) => ({
    ...product,
    stock: product.stock ?? undefined,
  }));
};

export const getProductById = async (id: number): Promise<Product | null> => {
  return await prisma.product.findUnique({
    where: { id }
  });
};

export const getProductsByIds = async (ids: number[]): Promise<Product[]> => {
  return await prisma.product.findMany({
    where: {
      id: {
        in: ids
      }
    }
  });
};

export const createProduct = async (data: ProductDto): Promise<Product> => {
  return await prisma.product.create({
    data
  });
};

export const updateProduct = async (id:number, data: ProductDto): Promise<Product> => {
  return await prisma.product.update({
    where: { id },
    data
  });
};

export const deleteProduct = async (id: number): Promise<Product> => {
  return await prisma.product.delete({
    where: { id }
  });
};

export const updateProductImages = async (productId: number, images: string) => {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { images: images }
    });
  } catch (error) {
    throw new BadRequestError("error.noUpdateImages");
  }
};




