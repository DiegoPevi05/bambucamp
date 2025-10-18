import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Reserve, ImageInterface, ReserveTentDto, CustomPrice, Tent } from './interfaces'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatFullName = (firstName: string | undefined, lastName: string | undefined) => {
  let rtn_str = null;
  if (firstName != undefined && firstName.length > 0) rtn_str = firstName;
  if (lastName != undefined && lastName.length > 0) rtn_str += "," + lastName;
  return rtn_str;
}

export const getTentsNames = (reserve: Reserve) => {
  if (reserve.tents.length === 0) return "N/A";
  return reserve.tents.map((tent) => tent.name).join(", ");
}

export const getProductsNames = (reserve: Reserve) => {
  if (reserve.products.length === 0) return "N/A";
  return reserve.products.map((product) => product.name).join(", ");
}

export const getExperiencesNames = (reserve: Reserve) => {
  if (reserve.experiences.length === 0) return "N/A";
  return reserve.experiences.map((experience) => experience.name).join(", ");
}

export const formatPrice = (price: number) => {
  return price.toLocaleString("es-PE", { style: "currency", currency: "PEN" });
};

export const formatDate = (date: Date) => {
  //format with time 
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export const formatToISODate = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export const convertStrToCurrentTimezoneDate = (utcDateString: string): Date => {
  const date = new Date(utcDateString);
  const localOffset = date.getTimezoneOffset(); // getTimezoneOffset() returns the difference in minutes
  return new Date(date.getTime() + localOffset);
};

export const getLabelService = (key: string) => {
  if (key == "wifi") return "glamping.wi_fi"
  if (key == "parking") return "glamping.parking"
  if (key == "pool") return "glamping.pool"
  if (key == "breakfast") return "glamping.breakfast"
  if (key == "lunch") return "glamping.lunch"
  if (key == "dinner") return "glamping.dinner"
  if (key == "spa") return "glamping.spa"
  if (key == "bar") return "glamping.bar"
  if (key == "hotwater") return "glamping.hotwater"
  if (key == "airconditioning") return "glamping.air_conditioner"
  if (key == "grill") return "glamping.grill"
  return key;
}

export const createImagesArray = (files: File[]) => {
  const newImages: ImageInterface[] = files.map(file => ({
    url: URL.createObjectURL(file),
    file
  }));
  return newImages;
}

export const calculatePrice = (basePrice: number, customPrices: CustomPrice[], noCustomPrice?: boolean): number => {

  if (customPrices === null) return basePrice;

  if (noCustomPrice) return basePrice;

  const currentCustomPrice = getCurrentCustomPrice(customPrices);

  return currentCustomPrice > 0 ? currentCustomPrice : basePrice;
};

export const getCurrentCustomPrice = (customPrices: CustomPrice[]): number => {


  const currentDate = new Date();

  const matchingPrices = customPrices.filter(customPrice => currentDate >= customPrice.dateFrom && currentDate <= customPrice.dateTo);

  if (matchingPrices.length === 0) {
    return 0;
  }
  matchingPrices.sort((a, b) => b.dateTo.getTime() - a.dateTo.getTime());

  return matchingPrices[0].price;
}

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

// Checkout day is exclusive; normalize to local midnight for math.
export function getNumberOfNights(dateFrom: Date, dateTo: Date): number {
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

export const countUnconfirmedItems = (reserve: Reserve): number => {
  let unconfirmedCount = 0;

  // Count unconfirmed tents
  reserve.tents.forEach((tent) => {
    if (!tent.confirmed) {
      unconfirmedCount++;
    }
  });

  // Count unconfirmed products
  reserve.products.forEach((product) => {
    if (!product.confirmed) {
      unconfirmedCount++;
    }
  });

  // Count unconfirmed experiences
  reserve.experiences.forEach((experience) => {
    if (!experience.confirmed) {
      unconfirmedCount++;
    }
  });

  return unconfirmedCount;
}

type TentPricingInput = Pick<
  Tent,
  | 'price'
  | 'custom_price'
  | 'qtykids'
  | 'max_kids'
  | 'kids_bundle_price'
  | 'additional_people_price'
  | 'max_additional_people'
  | 'qtypeople'
>

type TentSelectionInput = {
  kids?: number
  additional_people?: number
  no_custom_price?: boolean
}

export const computeTentNightlyTotals = (
  tent: TentPricingInput,
  selection: TentSelectionInput
): {
  nightly: number
  nightlyBase: number
  kids_price: number
  additional_people_price: number
  selectedKids: number
  effectiveAdditionalPeople: number
} => {
  // Same idea as client, but honoring "no_custom_price"
  const nightlyBase = calculatePrice(
    tent.price,
    tent.custom_price ?? [],
    selection.no_custom_price
  );

  const baseKids = tent.qtykids ?? 0;

  // Match client: if max_kids is missing, treat as Infinity
  const maxKids = (tent.max_kids ?? Number.POSITIVE_INFINITY);

  // Default UI behavior: start from base kids; clamp to [0, maxKids]
  const rawKids = Number(selection.kids ?? baseKids);
  const selectedKids = Math.max(0, Math.min(rawKids, maxKids));

  // Extra adults (clamped to tent limit)
  const rawExtraAdults = Number(selection.additional_people ?? 0);
  const maxExtraAdults = Math.max(tent.max_additional_people ?? 0, 0);
  const sanitizedExtraAdults = Math.max(0, Math.min(rawExtraAdults, maxExtraAdults));

  // Client rule: if selected kids exceed included, extra adults are dropped
  const effectiveAdditionalPeople = selectedKids > baseKids ? 0 : sanitizedExtraAdults;

  // Per-unit price shown back to UI (only matters if there are extra adults)
  const additionalPeopleUnitPrice =
    effectiveAdditionalPeople > 0 ? (tent.additional_people_price ?? 0) : 0;

  // Client bundle rule: ONLY when kids hit the max, AND no extra adults
  const kidsBundleEligible =
    (tent.kids_bundle_price ?? 0) > 0 &&
    selectedKids === maxKids &&
    effectiveAdditionalPeople === 0;

  const kidsBundlePrice = kidsBundleEligible ? (tent.kids_bundle_price ?? 0) : 0;

  const nightly =
    nightlyBase +
    effectiveAdditionalPeople * (tent.additional_people_price ?? 0) +
    kidsBundlePrice;

  return {
    nightly,
    nightlyBase,
    kids_price: kidsBundlePrice,                // nightly kids charge (bundle)
    additional_people_price: additionalPeopleUnitPrice, // per-unit nightly extra adult price (for display/storage)
    selectedKids,
    effectiveAdditionalPeople,
  };
};



