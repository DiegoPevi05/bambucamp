import { User, Tent, Product, Experience, NotificationDto, Reserve, ReserveTentDto, ReserveProductDto, ReserveExperienceDto, Review, Faq } from "../lib/interfaces"
import { convertStrToCurrentTimezoneDate } from "../lib/utils";

export const serializeUser = (data: any): User | null => {
  let user: User | null = null;

  user = {
    id: data.user.id,
    email: data.user.email,
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    role: data.user.role,
    phoneNumber: data.user.phoneNumber,
    token: data.token
  };

  return user;

}

const formatImagePaths = (images: string[]): string[] => {
  return images.map(image => {
    image = image.replace(/\\/g, '/'); // Assign the result of replace to image
    image = image.replace("public", import.meta.env.VITE_BACKEND_PUBLIC_URL); // Same here
    return image;
  });
};

export const serializeTent = (data: any): Tent | null => {
  let tent: Tent | null = null;

  tent = {
    id: data.id,
    header: data.header,
    title: data.title,
    description: data.description,
    images: formatImagePaths(data.images || []),
    qtypeople: data.qtypeople || 0,
    qtykids: data.qtykids || 0,
    price: data.price || 0,
    services: typeof data.services === 'string' ? JSON.parse(data.services) : data.services,
    custom_price: data.custom_price || 0,
    status: data.status,
    additional_people: data.additional_people || 0,
    additional_people_price: data.additional_people_price || 0,
    kids: data.kids || 0,
    max_additional_people: data.max_additional_people || 0,
    max_kids: data.max_kids,
    kids_bundle_price: data.kids_bundle_price,
    createdAt: data.createdAt ? convertStrToCurrentTimezoneDate(data.createdAt) : data.createdAt,
    updatedAt: data.updatedAt ? convertStrToCurrentTimezoneDate(data.updatedAt) : data.updatedAt
  };



  return tent;
}

export const serializeProduct = (data: any): Product | null => {
  let product: Product | null = null;

  product = {
    categoryId: data.categoryId,
    category: data.category,
    id: data.id,
    name: data.name,
    description: data.description,
    images: formatImagePaths(data.images || []),
    price: data.price || 0,
    custom_price: data.custom_price
  };
  return product;
}

export const serializeExperience = (data: any): Experience | null => {
  let experience: Experience | null = null;

  experience = {
    id: data.id,
    categoryId: data.categoryId,
    category: data.category,
    header: data.header,
    name: data.name,
    description: data.description,
    images: formatImagePaths(data.images || []),
    price: data.price || 0,
    duration: data.duration || 0,
    qtypeople: data.qtypeople || 0,
    limit_age: data.limit_age || 0,
    suggestions: typeof data.suggestions === 'string' ? JSON.parse(data.suggestions) : data.suggestions || [],
    custom_price: data.custom_price
  };
  return experience;
}

const serializeReserveTent = (data: any): ReserveTentDto => {

  let reserveTent: ReserveTentDto | null = null;

  const tent_db_parsed = serializeTent(data.tentDB);

  reserveTent = {
    id: data.id,
    idTent: data.idTent,
    name: data.name,
    price: data.price || 0,
    nights: data.nights || 0,
    dateFrom: new Date(data.dateFrom),
    dateTo: new Date(data.dateTo),
    confirmed: data.confirmed,
    qtykids: data.qtykids || 0,
    qtypeople: data.qtypeople || 0,
    additional_people: data.additional_people || 0,
    additional_people_price: data.additional_people_price || 0,
    max_additional_people: data.max_additional_people || 0,
    tentDB: tent_db_parsed != null ? tent_db_parsed : undefined
  }
  return reserveTent;
}

const serializeReserveProduct = (data: any): ReserveProductDto => {

  let reserveProduct: ReserveProductDto | null = null;

  const product_db_parsed = serializeProduct(data.productDB);

  reserveProduct = {
    id: data.id,
    idProduct: data.idProduct,
    name: data.name,
    price: data.price || 0,
    quantity: data.quantity || 0,
    confirmed: data.confirmed,
    productDB: product_db_parsed != null ? product_db_parsed : undefined
  }
  return reserveProduct;
}

const serializeReserveExperience = (data: any): ReserveExperienceDto => {

  let reserveExperience: ReserveExperienceDto | null = null;

  const experience_db_parsed = serializeExperience(data.experienceDB);

  reserveExperience = {
    id: data.id,
    idExperience: data.idExperience,
    name: data.name,
    price: data.price || 0,
    day: new Date(data.day),
    quantity: data.quantity || 0,
    confirmed: data.confirmed,
    experienceDB: experience_db_parsed != null ? experience_db_parsed : undefined
  }

  return reserveExperience;
}

export const serializeReserve = (data: any): Reserve | null => {
  let reserve: Reserve | null = null;

  reserve = {
    id: data.id,
    external_id: data.external_id,
    userId: data.userId,
    dateSale: data.dateSale ? convertStrToCurrentTimezoneDate(data.dateSale) : data.dateSale,
    price_is_calculated: data.price_is_calculated,
    net_import: data.net_import || 0,
    discount: data.discount || 0,
    gross_import: data.gross_import || 0,
    tents: data.tents ? data.tents.map((tent: any) => serializeReserveTent(tent)) : [],
    products: data.products ? data.products.map((product: any) => serializeReserveProduct(product)) : [],
    experiences: data.experiences ? data.experiences.map((experience: any) => serializeReserveExperience(experience)) : [],
    discount_code_id: data.discount_code_id || 0,
    discount_code_name: data.discount_code_name,
    canceled_reason: data.canceled_reason,
    canceled_status: data.canceled_status,
    payment_status: data.payment_status,
    reserve_status: data.reserve_status,
    createdAt: data.createdAt ? convertStrToCurrentTimezoneDate(data.createdAt) : data.createdAt,
    updatedAt: data.updatedAt ? convertStrToCurrentTimezoneDate(data.updatedAt) : data.updatedAt
  };
  return reserve;
}

export const serializeMyReserves = (data: any): Reserve | null => {
  let reserve = serializeReserve(data);
  return reserve;
}

export const serializeMyReservesCalendar = (data: any): { id: number, external_id: string, dateFrom: Date, dateTo: Date } | null => {

  let reserve: { id: number, external_id: string, dateFrom: Date, dateTo: Date } | null = null;

  reserve = {
    id: data.id,
    external_id: data.external_id,
    dateFrom: data.dateFrom ? convertStrToCurrentTimezoneDate(data.dateFrom) : data.dateFrom,
    dateTo: data.dateTo ? convertStrToCurrentTimezoneDate(data.dateTo) : data.dateTo,
  };

  return reserve
}

export const serializeNotification = (data: any): NotificationDto | null => {

  let notification: NotificationDto | null = null;

  notification = {
    id: data.id,
    title: data.title,
    preview: data.preview,
    description: data.description,
    type: data.type,
    date: data.date ? convertStrToCurrentTimezoneDate(data.date) : data.date,
    isRead: data.isRead
  }

  return notification;
}

export const serializeReview = (data: any): Review | null => {

  let review: Review | null = null;

  review = {
    id: data.id,
    name: data.name,
    title: data.title,
    review: data.review,
    stars: data.stars || 0,
    day: data.day ? convertStrToCurrentTimezoneDate(data.day) : data.day,
    href: data.href,
    profile_image_url: data.profile_image_url,
    createdAt: data.createdAt ? convertStrToCurrentTimezoneDate(data.createdAt) : data.createdAt,
    updatedAt: data.updatedAt ? convertStrToCurrentTimezoneDate(data.updatedAt) : data.updatedAt
  }

  return review;
}

export const serializeFaq = (data: any): Faq | null => {

  let faq: Faq | null = null;

  faq = {
    id: data.id,
    question: data.question,
    answer: data.answer,
    createdAt: data.createdAt ? convertStrToCurrentTimezoneDate(data.createdAt) : data.createdAt,
    updatedAt: data.updatedAt ? convertStrToCurrentTimezoneDate(data.updatedAt) : data.updatedAt
  }

  return faq;
}

export const serializeCalendarDays = (data: any): { date: Date, label: string, available: boolean }[] => {
  let dates: { date: Date, label: string, available: boolean }[] = [];

  data.forEach((day: any) => {
    let day_item: { date: Date, label: string, available: boolean } = {
      date: new Date(day.date),
      label: day.label,
      available: day.available
    };
    dates.push(day_item);
  })

  return dates;
}




