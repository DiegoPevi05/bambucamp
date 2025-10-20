import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ReserveTentDto, ReserveProductDto, ReserveExperienceDto, DiscountCode } from '../lib/interfaces';
import { getCookie, setCookie } from '../lib/cookies';
import { computeTentNightly } from '../lib/utils.ts';

interface CartItem {
  tents: ReserveTentDto[];
  products: ReserveProductDto[];
  experiences: ReserveExperienceDto[];
  discount: DiscountCode;
}

interface CartContextType {
  dates: { dateFrom: Date, dateTo: Date };
  cart: CartItem;
  totalItems: number;
  getTotalCost: () => number;
  addDiscountCode: (discountCode: DiscountCode) => void;
  addTent: (tent: ReserveTentDto) => void;
  removeTent: (idTent: number) => void;
  updateTentNights: (idTent: number, nights: number) => void;
  addProduct: (product: ReserveProductDto) => void;
  removeProduct: (idProduct: number) => void;
  updateProductQuantity: (idProduct: number, quantity: number) => void;
  addExperience: (experience: ReserveExperienceDto) => void;
  removeExperience: (idExperience: number) => void;
  updateExperienceQuantity: (idExperience: number, quantity: number) => void;
  isTentInCart: (idTent: number) => boolean;
  getTotalNights: () => number;
  updateDateFrom: (newDateFrom: Date) => void;
  updateDateTo: (newDateTo: Date) => void;
  getRangeDates: () => { date: Date, label: string }[];
  checkDates: { checkin: Date, checkout: Date };
  getReservationsDates: () => { checkin: Date, checkout: Date };
  cleanCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}
const CART_COOKIE_NAME = 'cart';
const CART_COOKIE_MAX_AGE_MS = 60 * 60 * 1000;

export function CartProvider({ children }: CartProviderProps) {

  const getInitialCart = (): CartItem => {
    const savedCart = getCookie(CART_COOKIE_NAME);
    if (!savedCart) {
      return { tents: [], products: [], experiences: [], discount: { id: 0, code: "", discount: 0 } };
    }

    try {
      const parsed = JSON.parse(savedCart);
      return {
        tents: (parsed.tents ?? []).map((tent: ReserveTentDto) => ({ ...tent, advanced: tent.advanced ?? 0 })),
        products: (parsed.products ?? []).map((product: ReserveProductDto) => ({ ...product, advanced: product.advanced ?? 0 })),
        experiences: (parsed.experiences ?? []).map((experience: ReserveExperienceDto) => ({ ...experience, advanced: experience.advanced ?? 0 })),
        discount: parsed.discount ?? { id: 0, code: "", discount: 0 },
      };
    } catch {
      return { tents: [], products: [], experiences: [], discount: { id: 0, code: "", discount: 0 } };
    }
  };

  const [cart, setCart] = useState<CartItem>(getInitialCart);

  const [dates, setDates] = useState<{ dateFrom: Date, dateTo: Date }>({
    dateFrom: new Date(), // Initialize with current date
    dateTo: new Date(new Date().setDate(new Date().getDate() + 1)),
  });

  const [checkDates, setCheckDates] = useState<{ checkin: Date, checkout: Date }>({
    checkin: new Date(),
    checkout: new Date(new Date().setDate(new Date().getDate() + 1))
  })

  useEffect(() => {
    const { checkin, checkout } = getReservationsDates();
    setCheckDates({ checkin, checkout })
  }, [cart.tents])


  useEffect(() => {
    setCookie(CART_COOKIE_NAME, JSON.stringify(cart), CART_COOKIE_MAX_AGE_MS);
  }, [cart]);

  const updateDateFrom = (newDateFrom: Date) => {
    setDates(prevDates => ({
      ...prevDates,
      dateFrom: newDateFrom,
    }));
  };

  const updateDateTo = (newDateTo: Date) => {
    setDates(prevDates => ({
      ...prevDates,
      dateTo: newDateTo,
    }));
  };

  const updateCart = (updateFn: (prevCart: CartItem) => CartItem) => {
    setCart(prevCart => updateFn(prevCart));
  };

  const addTent = (tent: ReserveTentDto) => {
    updateCart(prevCart => ({
      ...prevCart,
      tents: [...prevCart.tents, tent],
    }));
  };

  const removeTent = (index: number) => {
    updateCart(prevCart => ({
      ...prevCart,
      tents: prevCart.tents.filter((_, i) => i !== index),
    }));
  };

  const addDiscountCode = (discountCode: DiscountCode) => {
    updateCart(prevCart => ({
      ...prevCart,
      discount: discountCode,
    }));
  }



  const updateTentNights = (idTent: number, night: number) => {
    updateCart(prevCart => ({
      ...prevCart,
      tents: prevCart.tents.map(tent =>
        tent.idTent === idTent ? { ...tent, night } : tent
      ),
    }));
  };

  const addProduct = (product: ReserveProductDto) => {
    updateCart(prevCart => ({
      ...prevCart,
      products: [...prevCart.products, product],
    }));
  };

  const removeProduct = (index: number) => {
    updateCart(prevCart => ({
      ...prevCart,
      products: prevCart.products.filter((_, i) => i !== index),
    }));
  };

  const updateProductQuantity = (index: number, quantity: number) => {
    updateCart(prevCart => ({
      ...prevCart,
      products: prevCart.products.map((product, i) =>
        i === index ? { ...product, quantity } : product
      ),
    }));
  };

  const addExperience = (experience: ReserveExperienceDto) => {
    updateCart(prevCart => ({
      ...prevCart,
      experiences: [...prevCart.experiences, experience],
    }));
  };

  const removeExperience = (index: number) => {
    updateCart(prevCart => ({
      ...prevCart,
      experiences: prevCart.experiences.filter((_, i) => i !== index),
    }));
  };

  const updateExperienceQuantity = (index: number, quantity: number) => {
    updateCart(prevCart => ({
      ...prevCart,
      experiences: prevCart.experiences.map((experience, i) =>
        i === index ? { ...experience, quantity } : experience
      ),
    }));
  };

  const isTentInCart = (idTent: number): boolean => {
    // Filter tents by idTent
    const filteredTents = cart.tents.filter(tent => tent.idTent === idTent);

    // Iterate over the filtered tents and compare dateFrom and dateTo
    return filteredTents.some(tent => {

      // Extract day, month, and year
      const greaterThanDateFrom = convertDateToMidDay(tent.dateFrom) < convertDateToMidDay(dates.dateTo);

      const lowerThanDateTo = convertDateToMidDay(tent.dateTo) > convertDateToMidDay(dates.dateFrom);

      // Return true if either dateFrom or dateTo matches
      return (greaterThanDateFrom && lowerThanDateTo);
    });
  };

  const convertDateToMidDay = (date: Date): Date => {
    const newDate = new Date(date); // Create a copy of the date
    newDate.setUTCHours(17, 0, 0, 0); // Set the hours to 17:00:00.000 UTC
    return newDate; // Return the updated Date object
  }

  const getTotalNights = useCallback((): number => {
    const start = new Date(dates.dateFrom);
    const end = new Date(dates.dateTo);

    // Set both dates to 12:00 PM
    start.setHours(12, 0, 0, 0);
    end.setHours(12, 0, 0, 0);

    // Calculate difference in time
    const timeDifference = end.getTime() - start.getTime();

    // Convert the difference to days (1 day = 86400000 ms)
    const totalNights = timeDifference / (1000 * 3600 * 24);

    return totalNights > 0 ? totalNights : 0; // Ensure no negative nights
  }, [dates]);



  const getTotalCost = (): number => {
    const tentTotal = cart.tents.reduce((sum, tent) => {
      const { nightly } = computeTentNightly(tent);
      const nights = tent.nights || 0;
      return sum + nightly * nights;
    }, 0);

    const productTotal = cart.products.reduce(
      (sum, product) => sum + (product.price * product.quantity),
      0
    );

    const experienceTotal = cart.experiences.reduce(
      (sum, experience) => sum + (experience.price * experience.quantity),
      0
    );

    return tentTotal + productTotal + experienceTotal;
  };

  const getRangeDates = useCallback(() => {
    // Initialize an array to store the ranges of dates
    let dateRanges: { date: Date; label: string }[] = [];

    // Loop through each tent in the cart
    cart.tents.forEach((tent) => {
      // Initialize the current date to tent's dateFrom
      let currentDate = new Date(tent.dateFrom);

      // Loop through the dates from dateFrom to dateTo for each tent
      while (currentDate <= new Date(tent.dateTo)) {
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
  }, [cart.tents]);

  const getReservationsDates = (): { checkin: Date, checkout: Date } => {
    const rangeDates = getRangeDates();
    // Return today's date and tomorrow's date if rangeDates is empty
    if (rangeDates.length === 0) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return {
        checkin: today,
        checkout: tomorrow,
      };
    }

    const lastItem = rangeDates.length - 1;

    return {
      checkin: rangeDates[0].date,
      checkout: rangeDates[lastItem].date
    }
  }

  const totalItems = cart.tents.length + cart.products.length + cart.experiences.length;

  // Recalculate tent nights when dates change
  useEffect(() => {
    const totalNights = getTotalNights();

    // Update the nights for all tents in the cart
    setCart(prevCart => ({
      ...prevCart,
      tents: prevCart.tents.map(tent => ({
        ...tent,
        nights: totalNights, // Update nights
      })),
    }));
  }, [dates, getTotalNights]);

  const cleanCart = () => {
    setCart({ tents: [], products: [], experiences: [], discount: { id: 0, code: "", discount: 0 } });
    // Clear the cart cookie by setting an expired date
    setCookie(CART_COOKIE_NAME, '', 0); // Set the cookie with an empty string and max age 0 to remove it
  }

  return (
    <CartContext.Provider value={{ cart, updateDateTo, updateDateFrom, dates, checkDates, totalItems, addDiscountCode, addTent, removeTent, updateTentNights, addProduct, removeProduct, updateProductQuantity, addExperience, removeExperience, updateExperienceQuantity, isTentInCart, getTotalCost, getTotalNights, getRangeDates, cleanCart, getReservationsDates }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
