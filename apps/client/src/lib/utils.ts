import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Reserve, ReserveExperienceDto, ReserveProductDto, ReserveTentDto, CustomPrice } from './interfaces'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getTentsNames = (reserve: Reserve) => {
  if (reserve.tents.length === 0) return "N/A";
  return reserve.tents.map((tent: ReserveTentDto) => tent.name).join(", ");
}

export const getProductsNames = (reserve: Reserve) => {
  if (reserve.products.length === 0) return "N/A";
  return reserve.products.map((product: ReserveProductDto) => product.name).join(", ");
}

export const getExperiencesNames = (reserve: Reserve) => {
  if (reserve.experiences.length === 0) return "N/A";
  return reserve.experiences.map((experience: ReserveExperienceDto) => experience.name).join(", ");
}

export const formatPrice = (price: number) => {
  return price.toLocaleString("es-PE", { style: "currency", currency: "PEN" });
};

export const formatDate = (date: Date) => {
  date.setHours(12);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  //format with time 
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export const getDiscount = (basePrice: number, discountedPrice: number) => {
  const priceDiscounted = 100 - 100 * (discountedPrice / basePrice);
  return priceDiscounted.toFixed(2);
}

export const getCurrentCustomPrice = (customPrices: CustomPrice[]): number => {


  const currentDate = new Date();

  const matchingPrices = customPrices.filter(customPrice => currentDate >= customPrice.dateFrom && currentDate <= customPrice.dateTo);

  if (matchingPrices.length === 0) {
    return 0;
  }
  matchingPrices.sort((a, b) => b.dateTo.getTime() - a.dateTo.getTime());

  return matchingPrices[0].price;
}

export const formatTime = (utcDateString: string): string => {
  const currentDate = new Date(utcDateString);

  // Format to HH:MM
  const hours = currentDate.getHours().toString().padStart(2, '0');
  const minutes = currentDate.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

export const convertStrToCurrentTimezoneDate = (utcDateString: string): Date => {
  const date = new Date(utcDateString);
  const localOffset = date.getTimezoneOffset(); // getTimezoneOffset() returns the difference in minutes
  return new Date(date.getTime() + localOffset);
};

export const formatDateToYYYYMMDD = (date: Date): string => {
  // Create a new Date object with the current time zone
  const localDate = new Date(date);

  // Get the year, month, and day from the localDate object
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(localDate.getDate()).padStart(2, '0');

  // Return the date in the desired format YYYYY-MM-DD
  return `${year}-${month}-${day}`;
}

export const parseSuggestions = (suggestions: string[]): string => {
  if (suggestions.length === 0) {
    return "No Suggestions";
  }
  return suggestions.join('; ');
};


export const getReserveDates = (tents: ReserveTentDto[]): { dateFrom: Date; dateTo: Date } => {
  // Initialize the earliest start date and latest end date
  let earliestDateFrom: Date | null = null;
  let latestDateTo: Date | null = null;

  // Iterate through each tent
  tents.forEach((tent) => {

    if (earliestDateFrom === null || tent.dateFrom < earliestDateFrom) {
      earliestDateFrom = tent.dateFrom;
    }
    if (latestDateTo === null || tent.dateTo > latestDateTo) {
      latestDateTo = tent.dateTo;
    }
  });

  // Handle case where no tents are provided
  if (earliestDateFrom === null || latestDateTo === null) {
    return { dateFrom: (new Date()), dateTo: (new Date()) }
  }

  return { dateFrom: earliestDateFrom, dateTo: latestDateTo };
};


export const getRangeDatesForReserve = (reserve: Reserve) => {
  // Initialize an array to store the ranges of dates
  let dateRanges: { date: Date; label: string }[] = [];

  // Loop through each tent in the cart
  reserve.tents.forEach((dateItem) => {
    // Initialize the current date to tent's dateFrom
    let currentDate = new Date(dateItem.dateFrom);

    // Loop through the dates from dateFrom to dateTo for each tent
    while (currentDate <= dateItem.dateTo) {
      const formattedDate = currentDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD

      // Check if the date is already in the dateRanges array to avoid overlap
      const dateExists = dateRanges.some((range) => range.label === formattedDate);

      if (!dateExists) {
        dateRanges.push({
          date: new Date(currentDate),
          label: formattedDate,
        });
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  // Sort the dateRanges array by date to ensure the dates are in chronological order
  dateRanges = dateRanges.sort((a, b) => a.date.getTime() - b.date.getTime());

  return dateRanges;
};

interface HasCategory {
  category: {
    id: number;
    name: string;
  };
}

export const getCategoriesFromItems = <T extends HasCategory>(items: T[]): { id: number, name: string }[] => {
  const categoriesMap = new Map<number, { id: number, name: string }>();

  items.forEach(item => {
    const category = item.category;
    if (!categoriesMap.has(category.id)) {
      categoriesMap.set(category.id, { id: category.id, name: category.name });
    }
  });

  return Array.from(categoriesMap.values());
};

export const capitalizeNames = (names: string) => {
  return names
    .split(' ')
    .map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())
    .join(' ');
}

export const getInitials = (names: string) => {
  const nameArray = names.split(' ');
  const firstInitial = nameArray[0].charAt(0).toUpperCase();
  const lastInitial = nameArray[nameArray.length - 1].charAt(0).toUpperCase();
  return firstInitial + lastInitial;
}

export const getTimeAgo = (date: Date, t: (key: string) => string, language: string) => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  const isSpanish = language === 'es';

  if (diffInDays < 7) {
    return isSpanish
      ? `${t('timeAgo.ago')} ${diffInDays} ${t(diffInDays === 1 ? 'timeAgo.day' : 'timeAgo.day_plural')}`
      : `${diffInDays} ${t(diffInDays === 1 ? 'timeAgo.day' : 'timeAgo.day_plural')} ${t('timeAgo.ago')}`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return isSpanish
      ? `${t('timeAgo.ago')} ${weeks} ${t(weeks === 1 ? 'timeAgo.week' : 'timeAgo.week_plural')}`
      : `${weeks} ${t(weeks === 1 ? 'timeAgo.week' : 'timeAgo.week_plural')} ${t('timeAgo.ago')}`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return isSpanish
      ? `${t('timeAgo.ago')} ${months} ${t(months === 1 ? 'timeAgo.month' : 'timeAgo.month_plural')}`
      : `${months} ${t(months === 1 ? 'timeAgo.month' : 'timeAgo.month_plural')} ${t('timeAgo.ago')}`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return isSpanish
      ? `${t('timeAgo.ago')} ${years} ${t(years === 1 ? 'timeAgo.year' : 'timeAgo.year_plural')}`
      : `${years} ${t(years === 1 ? 'timeAgo.year' : 'timeAgo.year_plural')} ${t('timeAgo.ago')}`;
  }
};

export const getRangeDatesFromDates = (dateFrom: Date, dateTo: Date): { date: Date; label: string }[] => {

  let dateRanges: { date: Date; label: string }[] = [];

  // Initialize the current date to tent's dateFrom
  let currentDate = new Date(dateFrom);
  // Loop through the dates from dateFrom to dateTo for each tent
  while (currentDate <= dateTo) {
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD

    // Check if the date is already in the dateRanges array to avoid overlap
    const dateExists = dateRanges.some((range) => range.label === formattedDate);

    if (!dateExists) {
      dateRanges.push({
        date: new Date(currentDate),
        label: formattedDate,
      });
    }
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dateRanges;
}


export const getTotalNightsFromDates = (dateFrom: Date, dateTo: Date): number => {
  const start = new Date(dateFrom);
  const end = new Date(dateTo);

  // Set both dates to 12:00 PM
  start.setHours(12, 0, 0, 0);
  end.setHours(12, 0, 0, 0);

  // Calculate difference in time
  const timeDifference = end.getTime() - start.getTime();

  // Convert the difference to days (1 day = 86400000 ms)
  const totalNights = timeDifference / (1000 * 3600 * 24);

  return totalNights > 0 ? totalNights : 0; // Ensure no negative nights
}
export const toTitleCase = (str: string) => {
  return str
    .toLowerCase() // Convert the entire string to lowercase
    .split(' ') // Split the string into words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string
};

// somewhere shared (e.g., contexts/CartContext.ts or lib/pricing.ts)
export function computeTentNightly(tent: {
  price: number;
  custom_price?: number;
  kids?: number;
  qtykids: number;
  qtypeople: number;
  max_kids?: number;
  kids_bundle_price?: number;
  additional_people?: number;
  additional_people_price?: number;
}) {
  const nightlyBase = tent.price ? (tent.custom_price ? tent.custom_price : tent.price) : 0;

  const selectedKidsRaw = tent.kids ?? 0;
  const maxKids = tent.max_kids ?? Number.POSITIVE_INFINITY;
  const bundlePrice = tent.kids_bundle_price ?? 0;

  const rawExtraAdults = tent.additional_people ?? 0;
  const extraAdultPrice = tent.additional_people_price ?? 0;

  // clamp
  const selectedKids = Math.max(0, Math.min(selectedKidsRaw, maxKids));

  // rules 3 & 4 (mutual exclusion)
  const hasKids = selectedKids > tent.qtykids;
  const effectiveExtraAdults = hasKids ? 0 : rawExtraAdults;

  const extraAdultsPerNight = effectiveExtraAdults * extraAdultPrice;

  // bundle at max kids only (and no extra adults)
  const kidsBundleApplies = (selectedKids === maxKids) && bundlePrice > 0 && effectiveExtraAdults === 0;
  const kidsPerNight = kidsBundleApplies ? bundlePrice : 0;

  const nightly = nightlyBase + extraAdultsPerNight + kidsPerNight;

  console.log(nightly, extraAdultsPerNight, kidsPerNight);

  return { nightly, kidsBundleApplies, effectiveExtraAdults };
}
