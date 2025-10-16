import type {
  ImageAsset,
  AdminTent,
  TentFormData as SharedTentFormData,
  AdminProduct,
  ProductFormData as SharedProductFormData,
  AdminExperience,
  ExperienceFormData as SharedExperienceFormData,
  PromotionFormData as SharedPromotionFormData,
  OptionsPromotion,
  OptionsReserve,
  AdminReserveTentDto,
  AdminReserveProductDto,
  AdminReserveExperienceDto,
  AdminReservePromotionDto,
  AdminCreateReserveProductDto,
  AdminCreateReserveExperienceDto,
  AdminCreateReservePromotionDto,
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
  Promotion,
  PromotionFilters,
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

export type PromotionFormData = SharedPromotionFormData<File>;
export type optionsPromotion = OptionsPromotion;
export type optionsReserve = OptionsReserve;

export type ReserveTentDto = AdminReserveTentDto;
export type ReserveProductDto = AdminReserveProductDto;
export type ReserveExperienceDto = AdminReserveExperienceDto;
export type ReservePromotionDto = AdminReservePromotionDto;

export type createReserveProductDto = AdminCreateReserveProductDto;
export type createReserveExperienceDto = AdminCreateReserveExperienceDto;
export type createReservePromotionDto = AdminCreateReservePromotionDto;

export type Reserve = AdminReserve;
export type ReserveFormData = AdminReserveFormData;
export type ReserveFilters = SharedReserveFilters<string, string>;

export type optTentPromotionDto = import('@bambucamp/shared-types').OptTentPromotionDto;
export type optTentPromotionPublicDto = import('@bambucamp/shared-types').OptTentPromotionPublicDto;
export type optProductPromotionDto = import('@bambucamp/shared-types').OptProductPromotionDto;
export type optProductPromotionPublicDto = import('@bambucamp/shared-types').OptProductPromotionPublicDto;
export type optExperiencePromotionDto = import('@bambucamp/shared-types').OptExperiencePromotionDto;
export type optExperiencePromotionPublicDto = import('@bambucamp/shared-types').OptExperiencePromotionPublicDto;
