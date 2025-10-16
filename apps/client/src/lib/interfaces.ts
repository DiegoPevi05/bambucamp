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
  claimType: "queja" | "reclamo";
  description: string;
  reservationCode?: string;
}

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

export interface VerifyAcccount {
  email: string;
  code: string;
}

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
  role?: string; // Add role or other attributes as needed
  phoneNumber?: string;
}

export interface CustomPrice {
  dateFrom: Date;
  dateTo: Date;
  price: number;
}

export interface Tent {
  id: number;
  header: string;
  title: string;
  description: string;
  images: string[];
  qtypeople: number;
  qtykids: number;
  price: number;
  services: {
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
  custom_price: number;
  additional_people: number;
  additional_people_price: number;
  max_additional_people: number;
  kids: number;
  max_kids: number;
  kids_bundle_price: number;
  status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}


export interface ProductCategory {
  id: number;
  name: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Product {
  id: number;
  categoryId: number;
  category: ProductCategory;
  name: string;
  description: string;
  price: number;
  images: string[];
  custom_price: number;
}

export interface ExperienceCategory {
  id: number;
  name: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Experience {
  id: number;
  categoryId: number;
  category: ExperienceCategory;
  header: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  images: string[];
  limit_age: number;
  qtypeople: number;
  suggestions: string[];
  custom_price: number;
}


export interface ReserveTentDto {
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
  tentDB?: Tent;

}

export interface ReserveProductDto {
  id?: number;
  idProduct: number;
  name: string;
  price: number;
  quantity: number;
  confirmed: boolean;
  productDB?: Product;
}

export interface createReserveProductDto extends ReserveProductDto {
  reserveId: number;
}

export interface ReserveExperienceDto {
  id?: number;
  idExperience: number;
  name: string;
  price: number;
  quantity: number;
  day: Date;
  confirmed: boolean;
  experienceDB?: Experience;
}

export interface createReserveExperienceDto extends ReserveExperienceDto {
  reserveId: number;
}


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

export interface Faq {
  id: number;
  question: string;
  answer: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}



export interface NotificationDto {
  id: number;
  title: string;
  preview: string;
  description: string;
  type: string;
  date: Date;
  isRead: boolean;
}

export interface notifcationFilters {
  date?: string;
  target?: string[];
  type?: string[];
}

export interface Reserve {
  id: number;
  external_id: number;
  userId: number;
  tents: ReserveTentDto[];
  products: ReserveProductDto[];
  experiences: ReserveExperienceDto[];
  dateSale: Date;
  price_is_calculated: boolean;
  discount_code_id: number;
  discount_code_name: string;
  net_import: number;
  discount: number;
  gross_import: number;
  canceled_reason: string;
  canceled_status: boolean;
  payment_status: string;
  reserve_status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ReserveFormData {
  user_email?: string,
  user_firstname?: string;
  user_lastname?: string;
  user_phone_number?: string;
  user_document_type?: string;
  user_document_id?: string;
  eta?: Date;
  tents: ReserveTentDto[];
  products: ReserveProductDto[];
  experiences: ReserveExperienceDto[];
  discount_code_id: number;
}

export interface DiscountCode {
  id: number,
  code: string,
  discount: number,
}


export interface webContent {
  tents: Tent[];
  bundles:Experience[];
  reviews: Review[];
  faqs: Faq[];
}
