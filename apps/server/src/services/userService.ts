import bcrypt from 'bcryptjs';
import { Prisma, Role } from '@prisma/client';
import * as userRepository from '../repositories/userRepository';
import { UserFilters, PaginatedUsers } from '../dto/user';
import { BadRequestError, NotFoundError } from '../middleware/errors';

interface Pagination {
  page: number;
  pageSize: number;
}

const normalizeEmail = (email: string): string => email.toLowerCase().trim();

const sanitizeRequired = (value: string | null | undefined, fallback = ''): string => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
};

const toRole = (role: string): Role => {
  if (!role) {
    throw new BadRequestError('validation.invalidRole');
  }

  const normalized = role.toUpperCase();

  if (normalized === 'COMMON') {
    return Role.CLIENT;
  }

  if (normalized === 'CLIENT') {
    return Role.CLIENT;
  }

  if (normalized === 'SUPERVISOR') {
    return Role.SUPERVISOR;
  }

  if (normalized === 'ADMIN') {
    return Role.ADMIN;
  }

  throw new BadRequestError('validation.invalidRole');
};

export const getAllUsers = async (filters: UserFilters, pagination: Pagination): Promise<PaginatedUsers> => {
  return await userRepository.getAllUsers(filters, pagination);
};

export const getUserById = async (id: number) => {
  return await userRepository.getUserById(id);
};

interface CreateUserInput {
  firstName: string;
  lastName?: string | null;
  email: string;
  password: string;
  role: string;
  phoneNumber?: string | null;
  document_type?: string | null;
  document_id?: string | null;
  nationality?: string | null;
}

export const createUser = async (input: CreateUserInput) => {
  const email = normalizeEmail(input.email);
  const existing = await userRepository.getUserByEmail(email);

  if (existing) {
    throw new BadRequestError('validation.emailAlreadyExists');
  }

  if (!input.password || input.password.trim().length === 0) {
    throw new BadRequestError('validation.passwordRequired');
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const data: Prisma.UserCreateInput = {
    email,
    password: hashedPassword,
    role: toRole(input.role),
    firstName: sanitizeRequired(input.firstName),
    lastName: sanitizeRequired(input.lastName, ''),
    phoneNumber: sanitizeRequired(input.phoneNumber, ''),
    document_type: sanitizeRequired(input.document_type, 'DNI'),
    document_id: sanitizeRequired(input.document_id, 'null'),
  };

  return userRepository.createUser(data);
};

interface UpdateUserInput {
  firstName?: string;
  lastName?: string | null;
  email?: string;
  password?: string;
  role?: string;
  phoneNumber?: string | null;
  document_type?: string | null;
  document_id?: string | null;
  nationality?: string | null;
}

export const updateUser = async (userId: number, input: UpdateUserInput) => {
  const user = await userRepository.getUserById(userId);

  if (!user) {
    throw new NotFoundError('error.noUserFoundInDB');
  }

  const email = input.email ? normalizeEmail(input.email) : user.email;

  if (email !== user.email) {
    const emailOwner = await userRepository.getUserByEmail(email);
    if (emailOwner && emailOwner.id !== userId) {
      throw new BadRequestError('validation.emailAlreadyExists');
    }
  }

  const updateData: Prisma.UserUpdateInput = {
    email,
  };

  if (typeof input.firstName === 'string') {
    updateData.firstName = sanitizeRequired(input.firstName, user.firstName);
  }

  if (typeof input.lastName === 'string' || input.lastName === null) {
    updateData.lastName = sanitizeRequired(input.lastName, user.lastName ?? '');
  }

  if (typeof input.phoneNumber === 'string' || input.phoneNumber === null) {
    updateData.phoneNumber = sanitizeRequired(input.phoneNumber, user.phoneNumber ?? '');
  }

  if (typeof input.document_type === 'string' || input.document_type === null) {
    updateData.document_type = sanitizeRequired(input.document_type, user.document_type ?? 'DNI');
  }

  if (typeof input.document_id === 'string' || input.document_id === null) {
    updateData.document_id = sanitizeRequired(input.document_id, user.document_id ?? 'null');
  }

  if (input.role) {
    updateData.role = toRole(input.role);
  }

  if (input.password && input.password.trim().length > 0) {
    updateData.password = await bcrypt.hash(input.password, 10);
    updateData.lastPasswordChanged = new Date();
  }

  return userRepository.updateUser(userId, updateData);
};

export const disableUser = async (id: number) => {
  return await userRepository.disableUser(id);
};

export const enableUser = async (id: number) => {
  return await userRepository.enableUser(id);
};

export const deleteUser = async (id: number) => {
  return await userRepository.deleteUser(id);
};

