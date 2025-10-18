/* Shared domain and DTO types used across bambucamp applications */

// ------------------------------
// Contact & Support
// ------------------------------
export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export interface ComplaintForm {
  name: string;
  email: string;
  phone: string;
  documentId: string;
  claimType: 'queja' | 'reclamo';
  description: string;
  reservationCode?: string;
}

// ------------------------------
// Authentication & Account
// ------------------------------
export interface SignIn {
  email: string;
  password: string;
}

export interface SignUp {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface VerifyAccount {
  email: string;
  code: string;
}

// Legacy alias kept for backwards compatibility
export type VerifyAcccount = VerifyAccount;

export interface ForgotPassword {
  email: string;
  code?: string;
  password?: string;
}

export interface User {
  token: string;
  id: number;
  firstName?: string;
  lastName?: string;
  password?: string;
  email?: string;
  role?: string;
  phoneNumber?: string;
  document_id?: string;
  document_type?: string;
  nationality?: string;
  isDisabled?: boolean;
  lastLogin?: Date | null;
  lastPasswordChanged?: Date | null;
  emailVerified?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface UserFilters {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

export interface UserFormData {
  firstName: string;
  password?: string;
  email: string;
  role: string;
  lastName?: string;
  phoneNumber?: string;
  document_id?: string;
  document_type?: string;
  nationality?: string;
}

// ------------------------------
// Media helpers
// ------------------------------
export interface ImageAsset<TFile = unknown> {
  url: string;
  file: TFile;
}

// ------------------------------
// Pricing helpers
// ------------------------------
export interface CustomPriceRange {
  dateFrom: Date;
  dateTo: Date;
  price: number;
}

// Historical name maintained for compatibility
export type CustomPrice = CustomPriceRange;

// ------------------------------
// Tent domain
// ------------------------------
export interface TentServices {
  wifi: boolean;
  parking: boolean;
  pool: boolean;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  spa: boolean;
  bar: boolean;
  hotwater: boolean;
  airconditioning: boolean;
  grill: boolean;
}

export interface PublicTent {
  id: number;
  header: string;
  title: string;
  description: string;
  images: string[];
  qtypeople: number;
  qtykids: number;
  price: number;
  services: TentServices;
  custom_price: number;
  additional_people_price: number;
  max_additional_people: number;
  max_kids: number;
  kids_bundle_price: number;
  status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface AdminTent {
  id: number;
  header: string;
  title: string;
  description: string;
  images: string[];
  qtypeople: number;
  qtykids: number;
  price: number;
  services: TentServices;
  custom_price: CustomPriceRange[];
  additional_people_price: number;
  max_additional_people: number;
  max_kids: number;
  kids_bundle_price: number;
  status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface TentDto {
  header: string;
  title: string;
  description: string;
  services: string;
  qtypeople: number;
  qtykids: number;
  images: string;
  price: number;
  status: string;
  additional_people_price: number;
  max_additional_people: number;
  max_kids: number;
  kids_bundle_price: number;
  custom_price?: string;
  existing_images?: string;
}

export interface PublicTentDto extends Omit<TentDto, 'custom_price'> {
  id: number;
  custom_price?: number | string;
}

export interface TentFilters {
  title?: string;
  status?: string;
}

export interface TentFormData<TImage = unknown> {
  title: string;
  description: string;
  header: string;
  images: TImage[];
  services: string;
  qtypeople: number;
  qtykids: number;
  price: number;
  additional_people_price: number;
  max_additional_people: number;
  max_kids: number;
  kids_bundle_price: number;
  custom_price: string;
  status: string;
  existing_images?: string;
}

export interface PaginatedTents {
  tents: TentDto[];
  totalPages: number;
  currentPage: number;
}

// ------------------------------
// Product domain
// ------------------------------
export interface ProductCategory {
  id: number;
  name: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ProductBase<TCustomPrice = number> {
  id: number;
  categoryId: number;
  category: ProductCategory;
  name: string;
  description: string;
  price: number;
  images: string[];
  custom_price: TCustomPrice;
  status?: string;
  stock?: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export type PublicProduct = ProductBase<number>;

export type AdminProduct = ProductBase<CustomPriceRange[]> & {
  status: string;
  stock: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export interface ProductDto {
  categoryId: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string;
  status?: string;
  custom_price?: string;
  existing_images?: string;
}

export interface ProductPublicDto extends ProductDto {
  id: number;
  category: ProductCategory;
}

export interface ProductFormData<TImage = unknown> {
  categoryId: number;
  name: string;
  description: string;
  images: TImage[];
  price: number;
  stock: number;
  custom_price: string;
  status: string;
  existing_images?: string;
}

export interface PaginatedProducts {
  products: ProductPublicDto[];
  totalPages: number;
  currentPage: number;
}

export interface ProductFilters {
  name?: string;
  status?: string;
}

// ------------------------------
// Experience domain
// ------------------------------
export interface ExperienceCategory {
  id: number;
  name: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ExperienceBase<TCustomPrice = number> {
  id: number;
  categoryId: number;
  category: ExperienceCategory;
  header: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  images: string[];
  status?: string;
  limit_age: number;
  qtypeople: number;
  suggestions: string[];
  custom_price: TCustomPrice;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export type PublicExperience = ExperienceBase<number>;

export type AdminExperience = ExperienceBase<CustomPriceRange[]> & {
  status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export interface ExperienceDto {
  categoryId: number;
  header: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  images: string;
  limit_age: number;
  qtypeople: number;
  suggestions: string;
  status?: string;
  custom_price?: string;
  existing_images?: string;
}

export interface ExperiencePublicDto extends ExperienceDto {
  id: number;
  category: ExperienceCategory;
}

export interface ExperienceFormData<TImage = unknown> {
  categoryId: number;
  header: string;
  name: string;
  description: string;
  images: TImage[];
  price: number;
  duration: number;
  limit_age: number;
  qtypeople: number;
  suggestions: string;
  custom_price: string;
  status: string;
  existing_images?: string;
}

export interface PaginatedExperiences {
  experiences: ExperiencePublicDto[];
  totalPages: number;
  currentPage: number;
}

export interface ExperienceFilters {
  name?: string;
  status?: string;
}

// ------------------------------
// Discount codes
// ------------------------------
export interface DiscountCode {
  id: number;
  code: string;
  discount: number;
  expiredDate?: Date;
  stock?: number;
  status?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface DiscountCodeDto {
  code: string;
  discount: number;
  expiredDate?: Date;
  stock?: number;
  status?: string;
}

export interface DiscountCodeFilters {
  code?: string;
  status?: string;
}

export interface DiscountCodeFormData {
  code: string;
  discount: number;
  expiredDate: Date;
  stock: number;
  status: string;
}

export interface PaginatedDiscountCodes {
  discountCodes: DiscountCodeDto[];
  totalPages: number;
  currentPage: number;
}

export interface ExtraItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface OptionsReserve {
  tents: AdminTent[];
  products: AdminProduct[];
  experiences: AdminExperience[];
  extraItems: ExtraItem[];
  discounts: DiscountCode[];
}

// ------------------------------
// Reserve domain (shared helpers)
// ------------------------------
export type PaymentStatusValue = string;
export type ReserveStatusValue = string;

export interface ClientReserveTentDto {
  id?: number;
  idTent: number;
  name: string;
  price: number;
  nights: number;
  dateFrom: Date;
  dateTo: Date;
  confirmed: boolean;
  additional_people: number;
  additional_people_price: number;
  max_additional_people: number;
  kids?: number;
  qtykids: number;
  qtypeople: number;
  max_kids?: number;
  kidsBundlePrice?: number;
  tentDB?: PublicTent;
}

export interface AdminReserveTentDto {
  id?: number;
  idTent: number;
  name: string;
  price: number;
  nights: number;
  dateFrom: Date;
  dateTo: Date;
  confirmed: boolean;
  additional_people: number;
  additional_people_price: number;
  kids: number;
  kids_price: number;
  tentDB?: AdminTent;
}

export interface ServerReserveTentDto<TTent = unknown> {
  id?: number;
  idTent: number;
  name: string;
  price: number;
  nights: number;
  dateFrom: Date;
  dateTo: Date;
  confirmed: boolean;
  additional_people: number;
  additional_people_price: number;
  kids: number;
  kids_price: number;
  tentDB?: TTent;
}

export interface ClientReserveProductDto {
  id?: number;
  idProduct: number;
  name: string;
  price: number;
  quantity: number;
  confirmed: boolean;
  productDB?: PublicProduct;
}

export interface AdminReserveProductDto {
  id?: number;
  idProduct: number;
  name: string;
  price: number;
  quantity: number;
  confirmed: boolean;
  productDB?: AdminProduct;
}

export interface ServerReserveProductDto<TProduct = unknown> {
  id?: number;
  idProduct: number;
  name: string;
  price: number;
  quantity: number;
  confirmed: boolean;
  productDB?: TProduct;
}

export interface ClientReserveExperienceDto {
  id?: number;
  idExperience: number;
  name: string;
  price: number;
  quantity: number;
  day: Date;
  confirmed: boolean;
  experienceDB?: PublicExperience;
}

export interface AdminReserveExperienceDto {
  id?: number;
  idExperience: number;
  name: string;
  price: number;
  quantity: number;
  day: Date;
  confirmed: boolean;
  experienceDB?: AdminExperience;
}

export interface ServerReserveExperienceDto<TExperience = unknown> {
  id?: number;
  idExperience: number;
  name: string;
  price: number;
  quantity: number;
  day: Date;
  confirmed: boolean;
  experienceDB?: TExperience;
}

export interface ClientReserveExtraItemDto {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  confirmed: boolean;
}

export interface AdminReserveExtraItemDto extends ClientReserveExtraItemDto { }

export interface ServerReserveExtraItemDto<TExtraItem = unknown> {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  confirmed: boolean;
}


export type BaseCreateReserveProductDto<TReserveProduct> = TReserveProduct & { reserveId: number; };

export type ClientCreateReserveProductDto = BaseCreateReserveProductDto<ClientReserveProductDto>;
export type AdminCreateReserveProductDto = BaseCreateReserveProductDto<AdminReserveProductDto>;
export type ServerCreateReserveProductDto = BaseCreateReserveProductDto<ServerReserveProductDto>;

export type ClientCreateReserveExperienceDto = BaseCreateReserveProductDto<ClientReserveExperienceDto>;
export type AdminCreateReserveExperienceDto = BaseCreateReserveProductDto<AdminReserveExperienceDto>;
export type ServerCreateReserveExperienceDto = BaseCreateReserveProductDto<ServerReserveExperienceDto>;

export type ClientCreateReserveExtraItemDto = BaseCreateReserveProductDto<ClientReserveExtraItemDto>;
export type AdminCreateReserveExtraItemDto = BaseCreateReserveProductDto<AdminReserveExtraItemDto>;
export type ServerCreateReserveExtraItemDto = BaseCreateReserveProductDto<ServerReserveExtraItemDto>;

export interface BaseReserve<
  TTent,
  TProduct,
  TExperience,
  TExtraItem = undefined,
  TPaymentStatus = PaymentStatusValue,
  TReserveStatus = ReserveStatusValue
> {
  id?: number;
  external_id: string;
  userId: number;
  user_name?: string;
  user_email?: string;
  tents: TTent[];
  products: TProduct[];
  experiences: TExperience[];
  extraItems?: TExtraItem extends undefined ? [] : Exclude<TExtraItem, undefined>[];
  dateSale: Date;
  eta?: Date | null;
  price_is_calculated: boolean;
  discount_code_id: number;
  discount_code_name: string;
  net_import: number;
  discount: number;
  gross_import: number;
  canceled_reason: string;
  canceled_status: boolean;
  payment_status: TPaymentStatus;
  reserve_status: TReserveStatus;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export type ClientReserve = BaseReserve<
  ClientReserveTentDto,
  ClientReserveProductDto,
  ClientReserveExperienceDto,
  ClientReserveExtraItemDto
>;

export type AdminReserve = BaseReserve<
  AdminReserveTentDto,
  AdminReserveProductDto,
  AdminReserveExperienceDto,
  AdminReserveExtraItemDto
>;

export type ServerReserve = BaseReserve<
  ServerReserveTentDto,
  ServerReserveProductDto,
  ServerReserveExperienceDto,
  ServerReserveExtraItemDto
>;

export interface BaseReserveForm<
  TTent,
  TProduct,
  TExperience,
  TExtraItem = undefined,
  TPaymentStatus = PaymentStatusValue,
  TReserveStatus = ReserveStatusValue
> {
  userId?: number;
  user_email?: string;
  user_firstname?: string;
  user_lastname?: string;
  user_phone_number?: string;
  user_document_type?: string;
  user_document_id?: string;
  user_nationality?: string;
  eta?: Date;
  tents: TTent[];
  products: TProduct[];
  experiences: TExperience[];
  extraItems?: TExtraItem extends undefined ? [] : Exclude<TExtraItem, undefined>[];
  price_is_calculated?: boolean;
  discount_code_id: number;
  discount_code_name?: string;
  net_import?: number;
  discount?: number;
  gross_import?: number;
  canceled_reason?: string;
  canceled_status?: boolean;
  payment_status?: TPaymentStatus;
  reserve_status?: TReserveStatus;
}

export type ClientReserveFormData = BaseReserveForm<
  ClientReserveTentDto,
  ClientReserveProductDto,
  ClientReserveExperienceDto,
  ClientReserveExtraItemDto
>;

export type AdminReserveFormData = BaseReserveForm<
  AdminReserveTentDto,
  AdminReserveProductDto,
  AdminReserveExperienceDto,
  AdminReserveExtraItemDto
>;

export interface ServerReserveFormDto extends BaseReserveForm<
  ServerReserveTentDto,
  ServerReserveProductDto,
  ServerReserveExperienceDto,
  ServerReserveExtraItemDto
> {
  userId: number;
  external_id: string;
}

export interface ReserveFilters<TDate = string | Date, TPaymentStatus = string> {
  dateFrom?: TDate;
  dateTo?: TDate;
  payment_status?: TPaymentStatus;
}

export interface ReserveOptions {
  tents?: PublicTentDto[];
  products?: ProductPublicDto[];
  experiences?: ExperiencePublicDto[];
  discounts?: DiscountCodeDto[];
}

export interface PaginatedReserve<TReserve> {
  reserves: TReserve[];
  totalPages: number;
  currentPage: number;
}

export type PaginatedReserveResponse<TReserve> = PaginatedReserve<TReserve>;

export enum ReserveEntityType {
  RESERVE = 'RESERVE',
  TENT = 'TENT',
  PRODUCT = 'PRODUCT',
  EXPERIENCE = 'EXPERIENCE'
}

export interface ReservePriceResult {
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
}

// ------------------------------
// Notifications & Content
// ------------------------------
export interface NotificationDto {
  id: number;
  title: string;
  preview: string;
  description: string;
  type: string;
  date: Date;
  isRead: boolean;
}

export interface NotificationFilters {
  date?: string;
  target?: string[];
  type?: string[];
}

// Backwards compatible alias
export type notifcationFilters = NotificationFilters;

export interface Review {
  id: number;
  name: string;
  title: string;
  review: string;
  stars: number;
  day: Date;
  href: string;
  profile_image_url: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ReviewFormData {
  name: string;
  title: string;
  review: string;
  stars: number;
  day: Date;
  href: string;
  profile_image_url: string;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface FaqFormData {
  question: string;
  answer: string;
}

export interface WebContent {
  tents: PublicTent[];
  bundles: PublicExperience[];
  reviews: Review[];
  faqs: Faq[];
}

export type webContent = WebContent;

