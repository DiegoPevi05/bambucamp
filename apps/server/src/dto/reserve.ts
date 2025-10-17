import type { Experience, PaymentStatus, Product, ReserveStatus, Tent } from '@prisma/client';
import type {
  BaseCreateReserveProductDto,
  BaseReserve,
  BaseReserveForm,
  PaginatedReserveResponse,
  ReserveOptions as SharedReserveOptions,
  ReserveFilters as SharedReserveFilters,
  ServerReserveExperienceDto,
  ServerReserveProductDto,
  ServerReserveTentDto,
} from '@bambucamp/shared-types';

export { ReserveEntityType } from '@bambucamp/shared-types';

export type ReserveTentDto = ServerReserveTentDto<Tent>;
export type ReserveProductDto = ServerReserveProductDto<Product>;
export type ReserveExperienceDto = ServerReserveExperienceDto<Experience>;

export type createReserveProductDto = BaseCreateReserveProductDto<ReserveProductDto>;
export type createReserveExperienceDto = BaseCreateReserveProductDto<ReserveExperienceDto>;

export type ReserveOptions = SharedReserveOptions;
export type ReserveFilters = SharedReserveFilters<Date, PaymentStatus>;

export type ReserveDto = BaseReserve<
  ReserveTentDto,
  ReserveProductDto,
  ReserveExperienceDto,
  undefined,
  PaymentStatus,
  ReserveStatus
>;

export type ReserveFormDto = BaseReserveForm<
  ReserveTentDto,
  ReserveProductDto,
  ReserveExperienceDto,
  undefined,
  PaymentStatus,
  ReserveStatus
> & {
  userId: number;
  external_id: string;
};

export type PaginatedReserve = PaginatedReserveResponse<ReserveDto>;
