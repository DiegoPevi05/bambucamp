import type {
  ImageAsset,
  AdminTent,
  TentFormData as SharedTentFormData,
  AdminProduct,
  ProductFormData as SharedProductFormData,
  AdminExperience,
  ExperienceFormData as SharedExperienceFormData,
  OptionsReserve,
  AdminReserveTentDto,
  AdminReserveProductDto,
  AdminReserveExperienceDto,
  AdminReserveExtraItemDto,
  AdminCreateReserveProductDto,
  AdminCreateReserveExperienceDto,
  AdminCreateReserveExtraItemDto,
  AdminReserve,
  AdminReserveFormData,
  ReserveFilters as SharedReserveFilters,
} from '@bambucamp/shared-types';

export type ImageInterface = ImageAsset<File>;

export type {
  SignIn,
  User,
  UserFilters,
  UserFormData,
  CustomPrice,
  ProductCategory,
  ProductFilters,
  ExperienceCategory,
  ExperienceFilters,
  DiscountCode,
  DiscountCodeFilters,
  DiscountCodeFormData,
  ExtraItem,
  NotificationDto,
  notifcationFilters,
  Review,
  ReviewFormData,
  Faq,
  FaqFormData,
} from '@bambucamp/shared-types';

export type Tent = AdminTent;
export type TentFormData = SharedTentFormData<File>;
export type { TentFilters } from '@bambucamp/shared-types';

export type Product = AdminProduct;
export type ProductFormData = SharedProductFormData<File>;
export type { PublicProduct } from '@bambucamp/shared-types';

export type Experience = AdminExperience;
export type ExperienceFormData = SharedExperienceFormData<File>;
export type { PublicExperience } from '@bambucamp/shared-types';

export type optionsReserve = OptionsReserve;

export type ReserveTentDto = AdminReserveTentDto;
export type ReserveProductDto = AdminReserveProductDto;
export type ReserveExperienceDto = AdminReserveExperienceDto;
export type ReserveExtraItemDto = AdminReserveExtraItemDto;

export type createReserveProductDto = AdminCreateReserveProductDto;
export type createReserveExperienceDto = AdminCreateReserveExperienceDto;
export type createReserveExtraItemDto = AdminCreateReserveExtraItemDto;

export type Reserve = AdminReserve;
export type ReserveFormData = AdminReserveFormData;
export type ReserveFilters = SharedReserveFilters<string, string>;
