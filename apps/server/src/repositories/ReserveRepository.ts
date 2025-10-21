import { PrismaClient, Reserve, ReserveTent, ReserveProduct, ReserveExperience, ReserveExtraItem, Tent, ReserveStatus, PaymentStatus } from "@prisma/client";
import { ReserveDto, ReserveFilters, PaginatedReserve, ReserveTentDto, ReserveExperienceDto, ReserveProductDto, ReserveExtraItemDto, ReserveOptions, createReserveProductDto, createReserveExperienceDto } from "../dto/reserve";
import * as utils from "../lib/utils";
import { NotFoundError } from "../middleware/errors";

interface Pagination {
  page: number;
  pageSize: number;
}

export interface ExtendedReserve extends Reserve {
  tents: ReserveTent[];
  products: ReserveProduct[];
  experiences: ReserveExperience[];
  extraItems: ReserveExtraItem[];
}

const prisma = new PrismaClient();


type ReserveWithRelations = Reserve & {
  tents: ReserveTent[];
  products: ReserveProduct[];
  experiences: ReserveExperience[];
  extraItems: ReserveExtraItem[];
};

// Devuelve un ReserveDto con tentDB / productDB / experienceDB pegados
export async function enrichReserve(reserve: ReserveWithRelations): Promise<ReserveDto> {
  const tentIds = reserve.tents.map(t => t.idTent);
  const productIds = reserve.products.map(p => p.idProduct);
  const experienceIds = reserve.experiences.map(e => e.idExperience);

  const [rawTentsDB, rawProductsDB, rawExperiencesDB] = await Promise.all([
    tentIds.length ? prisma.tent.findMany({ where: { id: { in: tentIds } } }) : Promise.resolve([]),
    productIds.length ? prisma.product.findMany({ where: { id: { in: productIds } } }) : Promise.resolve([]),
    experienceIds.length ? prisma.experience.findMany({ where: { id: { in: experienceIds } } }) : Promise.resolve([]),
  ]);

  // Parseo directo (siempre string JSON válido)
  const tentsDB = rawTentsDB.map(t => ({
    ...t,
    services: JSON.parse(t.services as unknown as string),
    images: JSON.parse(t.images as unknown as string),
    custom_price: JSON.parse(t.custom_price as unknown as string),
  }));

  const productsDB = rawProductsDB.map(p => ({
    ...p,
    custom_price: JSON.parse(p.custom_price as unknown as string),
  }));

  const experiencesDB = rawExperiencesDB.map(e => ({
    ...e,
    custom_price: JSON.parse(e.custom_price as unknown as string),
  }));

  // Mapas por id para acceso O(1)
  const tentMap = new Map(tentsDB.map(t => [t.id, t]));
  const productMap = new Map(productsDB.map(p => [p.id, p]));
  const experienceMap = new Map(experiencesDB.map(e => [e.id, e]));

  return {
    ...reserve,
    tents: reserve.tents.map(tent => ({
      ...tent,
      tentDB: tentMap.get(tent.idTent),
    })),
    products: reserve.products.map(product => ({
      ...product,
      productDB: productMap.get(product.idProduct),
    })),
    experiences: reserve.experiences.map(experience => ({
      ...experience,
      experienceDB: experienceMap.get(experience.idExperience),
    })),
    extraItems: reserve.extraItems.map(x => ({ ...x })),
  } as ReserveDto;
}

export const searchAvailableTents = async (dateFrom: Date, dateTo: Date): Promise<Tent[]> => {
  // Find all reserved tent IDs within the date range
  const reservedTentIds = await prisma.reserveTent.findMany({
    where: {
      AND: [
        {
          dateFrom: {
            lte: dateTo,
          },
        },
        {
          dateTo: {
            gte: dateFrom,
          },
        },
        {
          reserve: {
            reserve_status: {
              in: [ReserveStatus.CONFIRMED, ReserveStatus.NOT_CONFIRMED],
            },
          },
        },
      ],
    },
    select: {
      idTent: true,
    },
  });

  // Extract unique tent IDs
  const reservedTentIdSet = new Set(reservedTentIds.map(rt => rt.idTent));

  // Fetch all tents that are ACTIVE and not reserved
  const tents = await prisma.tent.findMany({
    where: {
      status: 'ACTIVE',
      id: {
        not: {
          in: Array.from(reservedTentIdSet),
        },
      },
    },
  });

  return tents;
};

export const getCalendarDates = async (page: number): Promise<{ date: Date, label: string, available: boolean }[]> => {
  const currentDate = new Date();
  const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + page);
  const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

  const datesInMonth: { date: Date, label: string, available: boolean }[] = [];

  // Fetch all active tents
  const activeTents = await prisma.tent.findMany({
    where: { status: "ACTIVE" },
    select: { id: true },
  });

  const activeTentIds = activeTents.map(tent => tent.id);

  // Loop through each day of the month
  for (let day = 1; day <= endOfMonth.getDate(); day++) {
    const date = new Date(targetDate.getFullYear(), targetDate.getMonth(), day);

    // Skip past dates
    if (date < currentDate) {
      datesInMonth.push({ date, label: date.toDateString(), available: false });
      continue;
    }

    // Fetch reservations for the specific date
    const reservedTents = await prisma.reserveTent.findMany({
      where: {
        dateFrom: { lte: date },
        dateTo: { gte: date },
      },
      select: { idTent: true },
    });

    const reservedTentIds = reservedTents.map(reserveTent => reserveTent.idTent);

    // Check if all active tents are reserved on this date
    const allReserved = activeTentIds.every(tentId => reservedTentIds.includes(tentId));
    const available = !allReserved;

    datesInMonth.push({
      date,
      label: date.toDateString(),
      available,
    });
  }

  return datesInMonth;
};

export const getMyReservesByMonth = async (page: number, userId?: number): Promise<{ reserves: { id: number, external_id: string, dateFrom: Date, dateTo: Date }[] }> => {
  const currentDate = new Date();

  // Calculate the target month and year based on the page
  const targetDate = new Date(currentDate.setMonth(currentDate.getMonth() + page));
  const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1, 0, 0, 0);
  const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);
  const reserveTents = await prisma.reserveTent.findMany({
    where: {
      reserve: {
        ...(userId && { userId: userId }), // Filter by userId if provided
      },
      AND: [
        {
          dateFrom: { lte: endOfMonth },  // Ensure the reserveTent's dateFrom is within the range
        },
        {
          dateTo: { gte: startOfMonth },  // Ensure the reserveTent's dateTo is within the range
        },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      reserve: {
        select: {
          external_id: true, // Ensure external_id is selected
        },
      },
      dateFrom: true,
      dateTo: true,
      reserveId: true
    },
  });

  const formattedReserves = reserveTents.map(reserveTent => ({
    id: reserveTent.reserveId,
    external_id: reserveTent.reserve.external_id,
    dateFrom: reserveTent.dateFrom,
    dateTo: reserveTent.dateTo,
  }));

  return {
    reserves: formattedReserves,
  };
};

export const getMyReserves = async (
  pagination: Pagination,
  userId?: number,
  q?: string
): Promise<PaginatedReserve> => {
  const { page, pageSize } = pagination;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const qNumber = q && /^\d+$/.test(q) ? Number(q) : undefined;

  const whereClause: any = {
    ...(userId && { userId }),
    ...(q && {
      OR: [
        { external_id: { contains: q, mode: 'insensitive' } },
        ...(qNumber ? [{ id: qNumber }] : [])
      ]
    })
  };

  const totalCount = await prisma.reserve.count({ where: whereClause });

  const reserves = await prisma.reserve.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    include: {
      tents: true,
      products: true,
      experiences: true,
      extraItems: true,
    },
  });

  const enrichedReserves = await Promise.all(
    reserves.map(reserve => enrichReserve(reserve as ReserveWithRelations))
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    reserves: enrichedReserves,
    totalPages,
    currentPage: page,
  };
};

export const getAllReserveOptions = async (): Promise<ReserveOptions> => {

  const tents = await prisma.tent.findMany({
    where: {
      status: 'ACTIVE'
    }
  });

  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE'
    },
    include: {
      category: true, // Include the category object
    },
  });

  const normalizedProducts = products.map((product) => ({
    ...product,
    stock: product.stock ?? undefined,
  }));

  const experiences = await prisma.experience.findMany({
    where: {
      status: 'ACTIVE'
    },
    include: {
      category: true, // Include the category object
    },
  });

  const discounts = await prisma.discountCode.findMany({
    where: {
      status: 'ACTIVE'
    },
  })

  return {
    tents,
    products: normalizedProducts,
    experiences,
    discounts
  }

}

export const getReserveDtoById = async (reserveId: number): Promise<ReserveDto | null> => {
  // Retrieve all Reserve records matching the IDs
  const reserve = await prisma.reserve.findUnique({
    where: {
      id: reserveId,
    },
    include: {
      tents: true,
      products: true,
      experiences: true,
      extraItems: true,
      user: true,
    }
  });

  if (!reserve) return null;

  const enrichedReserve = await enrichReserve(reserve as ReserveWithRelations);

  return enrichedReserve;

}


export const getAllReserves = async (filters: ReserveFilters, pagination: Pagination): Promise<PaginatedReserve> => {
  const { dateFrom, dateTo, payment_status } = filters;
  const { page, pageSize } = pagination;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Find ReserveTent records within the date range
  const reservedTents = await prisma.reserveTent.findMany({
    where: {
      ...(dateFrom && { dateFrom: { lte: dateTo } }), // Ensure dateFrom is within the range
      ...(dateTo && { dateTo: { gte: dateFrom } }),   // Ensure dateTo is within the range
      ...(payment_status && {
        reserve: {
          payment_status: payment_status,
        },
      }),
    },
    skip,
    take,
    include: {
      reserve: true,   // Include related Reserve data
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Extract reserve IDs to filter the Reserve records
  const reserveIds = [...new Set(reservedTents.map(tent => tent.reserveId))];

  const totalCount = reserveIds.length;

  // Retrieve all Reserve records matching the IDs
  const reserves = await prisma.reserve.findMany({
    where: {
      id: { in: reserveIds },
    },
    include: {
      tents: true,
      products: true,
      experiences: true,
      extraItems: true,
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const enrichedReserves = await Promise.all(
    reserves.map(reserve => enrichReserve(reserve as ReserveWithRelations))
  );

  const reservesWithUser = enrichedReserves.map((reserve, index) => ({
    ...reserve,
    user_name: reserves[index].user.firstName,
    user_email: reserves[index].user.email,
  }));

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    reserves: reservesWithUser,  // Return the enriched reserves
    totalPages,
    currentPage: page,
  };
};

export const getReserveById = async (id: number): Promise<Reserve | null> => {
  return await prisma.reserve.findUnique({
    where: { id }
  });
};


export const createReserve = async (data: ReserveDto): Promise<ReserveDto | null> => {
  if (!data.userId) {
    throw new NotFoundError('error.noUserFoundInDB');
  }

  const confirmed = data.reserve_status !== ReserveStatus.NOT_CONFIRMED;

  // Preparar payload para Prisma
  const reserveData = {
    userId: data.userId,
    external_id: 'IN_PROCESS',
    dateSale: data.dateSale,
    price_is_calculated: data.price_is_calculated,
    discount_code_id: data.discount_code_id,
    discount_code_name: data.discount_code_name,
    net_import: data.net_import,
    discount: data.discount,
    gross_import: data.gross_import,
    canceled_reason: data.canceled_reason,
    canceled_status: data.canceled_status,
    payment_status: data.payment_status ?? PaymentStatus.UNPAID,
    reserve_status: data.reserve_status,
    eta: data.eta,
    tents: {
      create: (data.tents ?? []).map(tent => ({
        idTent: tent.idTent,
        name: tent.name,
        price: tent.price,
        advanced: tent.advanced ?? 0,
        nights: tent.nights,
        dateFrom: tent.dateFrom,
        dateTo: tent.dateTo,
        additional_people: tent.additional_people,
        additional_people_price: tent.additional_people_price,
        kids: tent.kids,
        kids_price: tent.kids_price,
        confirmed,
      })),
    },
    products: {
      create: (data.products ?? []).map(product => ({
        idProduct: product.idProduct,
        name: product.name,
        price: product.price,
        advanced: product.advanced ?? 0,
        quantity: product.quantity,
        confirmed,
      })),
    },
    experiences: {
      create: (data.experiences ?? []).map(experience => ({
        idExperience: experience.idExperience,
        name: experience.name,
        price: experience.price,
        advanced: experience.advanced ?? 0,
        quantity: experience.quantity,
        day: experience.day,
        confirmed,
      })),
    },
    extraItems: {
      create: (data.extraItems ?? []).map((x: any) => ({
        name: x.name,
        price: x.price,
        advanced: x.advanced ?? 0,
        quantity: x.quantity,
        confirmed,
      })),
    },
  };

  // Transacción: crear -> actualizar external_id -> leer con relaciones
  const reserve = await prisma.$transaction(async (tx) => {
    const created = await tx.reserve.create({ data: reserveData });

    const externalId = utils.generateExternalId(created.id);
    await tx.reserve.update({
      where: { id: created.id },
      data: { external_id: externalId },
    });

    const fresh = await tx.reserve.findUnique({
      where: { id: created.id },
      include: {
        tents: true,
        products: true,
        experiences: true,
        extraItems: true,
      },
    });

    if (!fresh) return null;
    return fresh;
  });

  if (!reserve) return null;

  // Enriquecer con tentDB / productDB / experienceDB
  const enriched = await enrichReserve(reserve);
  return enriched;
};

export const AddProductReserve = async (data: createReserveProductDto[]): Promise<ReserveProduct[]> => {

  const createdProducts: ReserveProduct[] = [];

  for (const productData of data) {
    const createdProduct = await prisma.reserveProduct.create({
      data: {
        reserveId: productData.reserveId,
        idProduct: productData.idProduct,
        name: productData.name,
        price: productData.price,
        advanced: productData.advanced ?? 0,
        quantity: productData.quantity,
        confirmed: productData.confirmed,
      },
    });
    createdProducts.push(createdProduct);
  }

  return createdProducts;
};

export const updateProductReserve = async (id: number, confirmed: boolean): Promise<ReserveProduct> => {
  return await prisma.reserveProduct.update({
    where: { id },
    data: { confirmed }
  });
}

export const deleteProductReserve = async (id: number): Promise<ReserveProduct> => {
  return await prisma.reserveProduct.delete({
    where: { id }
  });
}

export const AddExperienceReserve = async (data: createReserveExperienceDto[]): Promise<ReserveExperience[]> => {
  const createdExperiences: ReserveExperience[] = [];

  for (const experienceData of data) {
    const createdExperience = await prisma.reserveExperience.create({
      data: {
        reserveId: experienceData.reserveId,
        idExperience: experienceData.idExperience,
        name: experienceData.name,
        day: experienceData.day,
        price: experienceData.price,
        advanced: experienceData.advanced ?? 0,
        quantity: experienceData.quantity,
        confirmed: experienceData.confirmed,
      },
    });
    createdExperiences.push(createdExperience);
  }

  return createdExperiences;
};

export const AddExtraItemReserve = async (data: ReserveExtraItemDto[]): Promise<ReserveExtraItem[]> => {
  const created: ReserveExtraItem[] = [];
  for (const x of data) {
    const row = await prisma.reserveExtraItem.create({
      data: {
        reserveId: x.reserveId,
        name: x.name,
        price: x.price,
        advanced: x.advanced ?? 0,
        quantity: x.quantity,
        confirmed: x.confirmed ?? false,
      }
    });
    created.push(row);
  }
  return created;
};

export const updateExperienceReserve = async (id: number, confirmed: boolean): Promise<ReserveExperience> => {
  return await prisma.reserveExperience.update({
    where: { id },
    data: { confirmed }
  });
}

export const deleteExperienceReserve = async (id: number): Promise<ReserveExperience> => {
  return await prisma.reserveExperience.delete({
    where: { id }
  });
}


// reserveRepository.ts
export const getAvailableReserves = async (
  tents: ReserveTentDto[]
): Promise<{ reserveId: number; idTent: number; dateFrom: Date; dateTo: Date }[]> => {
  // Only new, well-formed tents
  return prisma.reserveTent.findMany({
    where: {
      OR: tents.map(t => ({
        idTent: t.idTent!,
        AND: [
          // overlap: start < otherEnd && end > otherStart
          { dateFrom: { lt: t.dateTo! } },
          { dateTo: { gt: t.dateFrom! } },
          {
            reserve: {
              // Only count blocking statuses; adjust as needed
              reserve_status: { in: [ReserveStatus.CONFIRMED, ReserveStatus.NOT_CONFIRMED] },
            },
          },
        ],
      })),
    },
    select: { reserveId: true, idTent: true, dateFrom: true, dateTo: true },
  });
};

export const upsertReserveDetails = async (
  idReserve: number,
  tents: ReserveTentDto[],
  products: ReserveProductDto[],
  experiences: ReserveExperienceDto[],
  extraItems: ReserveExtraItemDto[],
) => {
  // Delete existing tents associated with the reserve
  await prisma.reserveTent.deleteMany({
    where: { reserveId: idReserve },
  });

  // Delete existing products associated with the reserve
  await prisma.reserveProduct.deleteMany({
    where: { reserveId: idReserve },
  });

  // Delete existing experiences associated with the reserve
  await prisma.reserveExperience.deleteMany({
    where: { reserveId: idReserve },
  });

  // Delete existing extra items associated with the reserve
  await prisma.reserveExtraItem.deleteMany({
    where: { reserveId: idReserve },
  });

  // Create new tents
  await prisma.reserveTent.createMany({
    data: tents.map((tent) => ({
      idTent: tent.idTent,
      dateFrom: tent.dateFrom,
      dateTo: tent.dateTo,
      name: tent.name,
      price: tent.price,
      advanced: tent.advanced ?? 0,
      nights: tent.nights,
      additional_people: tent.additional_people,
      additional_people_price: tent.additional_people_price,
      kids: tent.kids,
      kids_price: tent.kids_price,
      confirmed: tent.confirmed,
      reserveId: idReserve, // Establish the relationship
    })),
  });

  // Create new products
  await prisma.reserveProduct.createMany({
    data: products.map((product) => ({
      idProduct: product.idProduct,
      name: product.name,
      price: product.price,
      advanced: product.advanced ?? 0,
      quantity: product.quantity,
      confirmed: product.confirmed,
      reserveId: idReserve, // Establish the relationship
    })),
  });

  // Create new experiences
  await prisma.reserveExperience.createMany({
    data: experiences.map((experience) => ({
      idExperience: experience.idExperience,
      name: experience.name,
      price: experience.price,
      advanced: experience.advanced ?? 0,
      quantity: experience.quantity,
      day: experience.day,
      confirmed: experience.confirmed,
      reserveId: idReserve, // Establish the relationship
    })),
  });

  // Create new extra items
  await prisma.reserveExtraItem.createMany({
    data: extraItems.map(x => ({
      name: x.name,
      price: x.price,
      advanced: x.advanced ?? 0,
      quantity: x.quantity,
      confirmed: x.confirmed,
      reserveId: idReserve,
    })),
  });

  // Optionally, return the updated reserve with related entities
  return await prisma.reserve.findUnique({
    where: { id: idReserve },
    include: {
      tents: true,
      products: true,
      experiences: true,
      extraItems: true,
    },
  });
};

export const updateReserve = async (id: number, data: Reserve): Promise<Reserve> => {
  return await prisma.reserve.update({
    where: { id },
    data
  });
};

export const deleteReserve = async (id: number): Promise<Reserve> => {
  return await prisma.reserve.delete({
    where: { id }
  });
};


export const confirmReserve = async (reserveId: number): Promise<void> => {

  await prisma.reserve.update({
    where: { id: reserveId },
    data: {
      reserve_status: ReserveStatus.CONFIRMED,
      tents: {
        updateMany: { data: { confirmed: true }, where: { reserveId } }
      },
      products: {
        updateMany: { data: { confirmed: true }, where: { reserveId } }
      },
      experiences: {
        updateMany: { data: { confirmed: true }, where: { reserveId } }
      },
      extraItems: {
        updateMany: { data: { confirmed: true }, where: { reserveId } }
      },
    }
  });
};

export const confirmTent = async (reserveTentId: number): Promise<void> => {
  // Ensure the tent belongs to the provided reserveId before updating
  const tent = await prisma.reserveTent.findFirst({
    where: { id: reserveTentId }
  });

  if (!tent) {
    throw new NotFoundError('error.noTentFoundInDB');
  }

  // Update the tent to confirmed
  await prisma.reserveTent.update({
    where: { id: reserveTentId },
    data: { confirmed: true }
  });
};

export const confirmProduct = async (reserveProductId: number): Promise<void> => {
  // Ensure the product belongs to the provided reserveId before updating
  const product = await prisma.reserveProduct.findFirst({
    where: { id: reserveProductId }
  });

  if (!product) {
    throw new NotFoundError('error.noProductFoundInDB');
  }

  // Update the product to confirmed
  await prisma.reserveProduct.update({
    where: { id: reserveProductId },
    data: { confirmed: true }
  });
};

export const confirmExperience = async (reserveExperienceId: number): Promise<void> => {
  // Ensure the experience belongs to the provided reserveId before updating
  const experience = await prisma.reserveExperience.findFirst({
    where: { id: reserveExperienceId }
  });

  if (!experience) {
    throw new NotFoundError('error.noExperienceFoundInDB');
  }

  // Update the experience to confirmed
  await prisma.reserveExperience.update({
    where: { id: reserveExperienceId },
    data: { confirmed: true }
  });
};


interface SalesFilters {
  step: "W" | "M" | "Y";
  type: "A" | "P";
  anchor: Date;
  offset: number;
  tz: string;
}

type MoneyPoint = { date: string; amount: number };
type QtyPoint = { date: string; quantity: number };

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function startOfWeek(d: Date) { // Sunday start; change if needed
  const x = startOfDay(d);
  const day = x.getDay(); // 0=Sun
  x.setDate(x.getDate() - day);
  return x;
}
function endOfWeek(d: Date) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}
function startOfMonth(d: Date) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}
function endOfMonth(d: Date) {
  const x = startOfMonth(d);
  x.setMonth(x.getMonth() + 1);
  x.setDate(0);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** Compute visible window based on step+anchor+offset */
function computeWindow(step: SalesFilters['step'], anchor: Date, offset: number) {
  const a = new Date(anchor);
  if (step === "W") {
    // shift anchor by 7 * offset days
    a.setDate(a.getDate() + (offset * 7));
    const ws = startOfWeek(a);
    const we = endOfWeek(a);
    // we’ll show 7 daily buckets
    const days: Date[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(ws);
      d.setDate(ws.getDate() + i);
      return d;
    });
    return { windowStart: ws, windowEnd: we, bucketDates: days };
  }

  if (step === "M") {
    // Interpret as a 5-week strip ending at the end of the anchor's week
    a.setDate(a.getDate() + (offset * 7 * 5)); // jump 5 weeks each page
    const end = endOfWeek(a);
    const start = new Date(end);
    start.setDate(end.getDate() - (7 * 5) + 1); // inclusive 5*7 days

    // produce 5 weekly buckets [Mon-Sun] or [Sun-Sat] aligned
    const weeks: { start: Date; end: Date }[] = [];
    let curEnd = end;
    for (let i = 0; i < 5; i++) {
      const wkEnd = new Date(curEnd);
      const wkStart = startOfWeek(wkEnd);
      weeks.unshift({ start: wkStart, end: wkEnd });
      curEnd = new Date(wkStart);
      curEnd.setDate(wkStart.getDate() - 1);
    }
    return { windowStart: start, windowEnd: end, weekBuckets: weeks };
  }

  // "Y": 12 months view; offset jumps by 12 months
  const base = startOfMonth(a);
  base.setMonth(base.getMonth() + (offset * 12));
  const months: { start: Date; end: Date; label: string }[] = [];
  let cur = new Date(base);
  for (let i = 0; i < 12; i++) {
    const ms = startOfMonth(cur);
    const me = endOfMonth(cur);
    months.push({ start: ms, end: me, label: ms.toISOString().slice(0, 7) }); // YYYY-MM
    cur.setMonth(cur.getMonth() - 1); // go backwards
  }
  months.reverse(); // oldest → newest
  const windowStart = months[0].start;
  const windowEnd = months[months.length - 1].end;
  return { windowStart, windowEnd, monthBuckets: months };
}

/** Common overlap where-clause:
 * tent overlaps the window if (dateFrom <= windowEnd) && (dateTo >= windowStart)
 */
function tentOverlapWhere(windowStart: Date, windowEnd: Date) {
  return {
    AND: [
      { dateFrom: { lte: windowEnd } },
      { dateTo: { gte: windowStart } },
    ],
  };
}

/** Reduce to one record per reserve (pick the LATEST dateFrom per reserve) */
function collapseToLatestPerReserve<T extends { reserveId: number | string; dateFrom: Date }>(
  rows: T[]
) {
  const map: Record<string, T> = {};
  for (const r of rows) {
    const key = String(r.reserveId);
    if (!map[key] || map[key].dateFrom < r.dateFrom) { // pick LATEST
      map[key] = r;
    }
  }
  return Object.values(map);
}

export const getNetSalesStatistics = async (
  filters: SalesFilters,
  language: string
): Promise<MoneyPoint[]> => {
  const { step, type, anchor, offset } = filters;
  const w = computeWindow(step, anchor, offset);
  const windowStart = w.windowStart;
  const windowEnd = w.windowEnd;

  const tentRows = await prisma.reserveTent.findMany({
    where: {
      ...tentOverlapWhere(windowStart, windowEnd),
      reserve: { reserve_status: { in: ['COMPLETE'] } },
    },
    orderBy: { dateFrom: 'asc' },
    select: {
      reserveId: true,
      dateFrom: true,
      dateTo: true,
      reserve: { select: { net_import: true } },
    },
  });

  const latestPerReserve = collapseToLatestPerReserve(
    tentRows.map(r => ({
      reserveId: r.reserveId,
      dateFrom: r.dateFrom,
      net_import: r.reserve?.net_import ?? 0,
    }))
  );

  let series: MoneyPoint[] = [];

  if (step === 'W') {
    // 7 daily buckets inside the window
    const daily: Record<string, number> = {};
    for (const row of latestPerReserve) {
      const key = row.dateFrom.toISOString().slice(0, 10);
      if (row.dateFrom >= startOfDay(windowStart) && row.dateFrom <= endOfDay(windowEnd)) {
        daily[key] = (daily[key] || 0) + row.net_import;
      }
    }
    const buckets = (w as any).bucketDates as Date[];
    const base = buckets.map(d => ({ date: d.toISOString().slice(0, 10), amount: daily[d.toISOString().slice(0, 10)] || 0 }));
    if (type === 'P') {
      series = base;
    } else {
      let acc = 0;
      series = base.map(b => ({ date: b.date, amount: (acc += b.amount) }));
    }
  } else if (step === 'M') {
    const weeks = (w as any).weekBuckets as { start: Date; end: Date }[];
    let acc = 0;
    for (const wk of weeks) {
      const sum = latestPerReserve
        .filter(r => r.dateFrom >= wk.start && r.dateFrom <= wk.end)
        .reduce((s, r) => s + r.net_import, 0);
      const label = wk.start.toISOString().slice(0, 10); // start-of-week
      if (type === 'A') {
        acc += sum;
        series.push({ date: label, amount: acc });
      } else {
        series.push({ date: label, amount: sum });
      }
    }
  } else {
    const months = (w as any).monthBuckets as { start: Date; end: Date; label: string }[];
    let acc = 0;
    for (const m of months) {
      const sum = latestPerReserve
        .filter(r => r.dateFrom >= m.start && r.dateFrom <= m.end)
        .reduce((s, r) => s + r.net_import, 0);
      const label = m.start.toLocaleString(language || 'default', { month: 'long' });
      if (type === 'A') {
        acc += sum;
        series.push({ date: label, amount: acc });
      } else {
        series.push({ date: label, amount: sum });
      }
    }
  }

  return series;
};

export const getReserveQuantityStatistics = async (
  filters: SalesFilters,
  language: string
): Promise<QtyPoint[]> => {
  const { step, type, anchor, offset } = filters;
  const w = computeWindow(step, anchor, offset);
  const windowStart = w.windowStart;
  const windowEnd = w.windowEnd;

  const tentRows = await prisma.reserveTent.findMany({
    where: {
      ...tentOverlapWhere(windowStart, windowEnd),
      reserve: { reserve_status: { in: ['COMPLETE'] } },
    },
    orderBy: { dateFrom: 'asc' },
    select: { reserveId: true, dateFrom: true },
  });

  const latestPerReserve = collapseToLatestPerReserve(tentRows);

  let series: QtyPoint[] = [];

  if (step === 'W') {
    const dayKeys: Record<string, number> = {};
    for (const r of latestPerReserve) {
      const key = r.dateFrom.toISOString().slice(0, 10);
      if (r.dateFrom >= startOfDay(windowStart) && r.dateFrom <= endOfDay(windowEnd)) {
        dayKeys[key] = (dayKeys[key] || 0) + 1;
      }
    }
    const buckets = (w as any).bucketDates as Date[];
    const base = buckets.map(d => ({ date: d.toISOString().slice(0, 10), quantity: dayKeys[d.toISOString().slice(0, 10)] || 0 }));
    if (type === 'P') {
      series = base;
    } else {
      let acc = 0;
      series = base.map(b => ({ date: b.date, quantity: (acc += b.quantity) }));
    }
  } else if (step === 'M') {
    const weeks = (w as any).weekBuckets as { start: Date; end: Date }[];
    let acc = 0;
    for (const wk of weeks) {
      const q = latestPerReserve.filter(r => r.dateFrom >= wk.start && r.dateFrom <= wk.end).length;
      const label = wk.start.toISOString().slice(0, 10);
      if (type === 'A') {
        acc += q;
        series.push({ date: label, quantity: acc });
      } else {
        series.push({ date: label, quantity: q });
      }
    }
  } else {
    const months = (w as any).monthBuckets as { start: Date; end: Date; label: string }[];
    let acc = 0;
    for (const m of months) {
      const q = latestPerReserve.filter(r => r.dateFrom >= m.start && r.dateFrom <= m.end).length;
      const label = m.start.toLocaleString(language || 'default', { month: 'long' });
      if (type === 'A') {
        acc += q;
        series.push({ date: label, quantity: acc });
      } else {
        series.push({ date: label, quantity: q });
      }
    }
  }

  return series;
};

export interface SalesReportReserveRow {
  id: number;
  externalId: string;
  grossImport: number;
  netImport: number;
  dateFrom: Date | null;
  dateTo: Date | null;
  paymentStatus: PaymentStatus;
  reserveStatus: ReserveStatus;
  createdAt: Date;
}

export const getReservesForReport = async (
  params: { dateFrom: Date; dateTo: Date },
): Promise<SalesReportReserveRow[]> => {
  const reserves = await prisma.reserve.findMany({
    where: {
      canceled_status: false,
      tents: {
        some: {
          AND: [
            { dateFrom: { lte: params.dateTo } },
            { dateTo: { gte: params.dateFrom } },
          ],
        },
      },
    },
    include: {
      tents: {
        select: {
          dateFrom: true,
          dateTo: true,
        },
      },
    },
    orderBy: { dateSale: 'asc' },
  });

  return reserves.map((reserve) => {
    const rangeStart = reserve.tents.reduce<Date | null>((acc, tent) => {
      if (!tent.dateFrom) return acc;
      if (!acc || tent.dateFrom < acc) {
        return tent.dateFrom;
      }
      return acc;
    }, null);

    const rangeEnd = reserve.tents.reduce<Date | null>((acc, tent) => {
      if (!tent.dateTo) return acc;
      if (!acc || tent.dateTo > acc) {
        return tent.dateTo;
      }
      return acc;
    }, null);

    return {
      id: reserve.id,
      externalId: reserve.external_id,
      grossImport: reserve.gross_import,
      netImport: reserve.net_import,
      dateFrom: rangeStart ?? reserve.dateSale ?? null,
      dateTo: rangeEnd ?? reserve.dateSale ?? null,
      paymentStatus: reserve.payment_status,
      reserveStatus: reserve.reserve_status,
      createdAt: reserve.dateSale,
    };
  });
};

// reserveRepository.ts
export async function recomputeAndUpdateReserveTotals(reserveId: number) {
  const reserve = await prisma.reserve.findUnique({
    where: { id: reserveId },
    include: { tents: true, products: true, experiences: true, extraItems: true },
  });
  if (!reserve) throw new NotFoundError('error.noReservefoundInDB');

  // Calculate gross
  const tentTotal = reserve.tents.reduce((sum, t) => {
    const nightly = t.price + (t.kids_price ?? 0) + (t.additional_people_price ?? 0) * (t.additional_people ?? 0);
    return sum + nightly * (t.nights ?? 0);
  }, 0);

  const productTotal = reserve.products.reduce((s, p) => s + p.price * p.quantity, 0);
  const experienceTotal = reserve.experiences.reduce((s, e) => s + e.price * e.quantity, 0);
  const extraItemTotal = reserve.extraItems.reduce((s, x) => s + x.price * x.quantity, 0);

  const gross_import = tentTotal + productTotal + experienceTotal + extraItemTotal;

  // Apply discount using your same util
  const { netImport, discount, discount_name } = await utils.applyDiscount(
    gross_import,
    reserve.discount_code_id,
    reserve.discount // keep current if any (your util handles optional)
  );

  await prisma.reserve.update({
    where: { id: reserveId },
    data: {
      gross_import,
      net_import: netImport,
      discount,
      discount_code_name: discount_name ?? "",
    },
  });
}
