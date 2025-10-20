import Dashboard from "../components/ui/Dashboard";
import { useState, useEffect, FormEvent, useMemo, useRef, useCallback } from "react";
import { Eye, Pen, X, ChevronLeft, ChevronRight, Calendar, CircleX, FlameKindling, Tent, Pizza, Search, Plus, Disc, Receipt, User as UserIcon, UserPlus } from "lucide-react";
import Button from "../components/ui/Button";
import { formatDate, getCurrentCustomPrice, calculatePrice, formatPrice, getReserveDates, formatDateToYYYYMMDD, getNumberOfNights, computeTentNightlyTotals } from "../lib/utils";
import { getAllReserveOptions, getAllReserves, createReserve, updateReserve, deleteReserve, downloadBillForReserve, SearchAvailableTents } from "../db/actions/reserves";
import { getAllUsers } from "../db/actions/users";
import { useAuth } from "../contexts/AuthContext";
import { UserFilters, Reserve, ReserveFilters, ReserveFormData, optionsReserve, ReserveTentDto, ReserveProductDto, ReserveExperienceDto, User, ReserveExtraItemDto } from "../lib/interfaces";
import { AnimatePresence, motion } from "framer-motion";
import { fadeIn } from "../lib/motions";
import { ZodError } from 'zod';
import { ReserveExperienceItemFormDataSchema, ReserveFormDataSchema, ReserveProductItemFormDataSchema, ReserveExtraItemFormDataSchema, ReserveTentItemFormDataSchema } from "../db/schemas";
import Modal from "../components/Modal";
import { InputRadio } from "../components/ui/Input";
import { useTranslation } from "react-i18next";
import DatePicker from "../components/DatePicker";
import { toast } from "sonner";


const DashboardAdminReserves = () => {

  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [datasetReserves, setDataSetReserves] = useState<{ reserves: Reserve[], totalPages: Number, currentPage: Number }>({ reserves: [], totalPages: 1, currentPage: 1 });
  const [datasetReservesOptions, setDatasetReservesOptions] = useState<optionsReserve>({ tents: [], products: [], experiences: [], extraItems: [], discounts: [] });
  const [tents, setTents] = useState<ReserveTentDto[]>([]);
  const [products, setProducts] = useState<ReserveProductDto[]>([]);
  const [experiences, setExperiences] = useState<ReserveExperienceDto[]>([]);
  const [extraItems, setExtraItems] = useState<ReserveExtraItemDto[]>([]);

  const [openReserveOption, setOpenReserveOption] = useState<"tent" | "product" | "experience" | "extraItem" | null>(null);

  const [currentView, setCurrentView] = useState<string>("LOADING");

  useEffect(() => {
    getReservesHandler(1);
    getReservesOptions();
  }, [])

  const getReservesOptions = async () => {
    if (user != null) {
      const ReserveOptions = await getAllReserveOptions(user.token, i18n.language);
      if (ReserveOptions) {
        setDatasetReservesOptions(ReserveOptions);
      }
    }
  }

  const getReservesHandler = async (page: Number, filters?: ReserveFilters) => {
    setCurrentView("LOADING");
    if (user != null) {
      const reserves = await getAllReserves(user.token, page, i18n.language, filters);
      if (reserves) {
        setDataSetReserves(reserves);
        setCurrentView("L");
      }
    }
  }

  const [loadingForm, setLoadingForm] = useState<boolean>(false);
  const [tentItemTotalPrice, setTentItemTotalPrice] = useState<number>(0);

  const [searchGlampingDates, setSearchGlampingDates] = useState<{
    date_from: Date;
    date_to: Date;
  }>({
    date_from: new Date(),
    date_to: new Date(new Date().setDate(new Date().getDate() + 1)),
  });

  const [openCalendar, setOpenCalendar] = useState<{ date_from: boolean, date_to: boolean }>({ date_from: false, date_to: false });

  const toggleBar = (type: "date_from" | "date_to" | null) => {
    if (type === null) {
      setOpenCalendar({ date_from: false, date_to: false });
    } else {
      setOpenCalendar((prevOpenCalendar) => ({ date_from: false, date_to: false, guests: false, [type]: !prevOpenCalendar[type] }));
    }
  };

  const updateDateFromHandler = (newDateFrom: Date) => {
    setSearchGlampingDates(prevDates => ({
      ...prevDates,
      date_from: newDateFrom,
    }));
  };

  const updateDateToHandler = (newDateTo: Date) => {
    setSearchGlampingDates(prevDates => ({
      ...prevDates,
      date_to: newDateTo,
    }));
  };

  const [loadingGlampings, setLoadingGlampings] = useState(false);

  const tentSearchCache = useRef<Map<string, optionsReserve["tents"]>>(new Map());

  const lastSelectedTentIdRef = useRef<number | null>(null);

  const tentSearchKey = useMemo(() => {
    const fromKey = formatDateToYYYYMMDD(searchGlampingDates.date_from);
    const toKey = formatDateToYYYYMMDD(searchGlampingDates.date_to);
    return `${fromKey}_${toKey}_${i18n.language}`;
  }, [searchGlampingDates.date_from, searchGlampingDates.date_to, i18n.language]);

  useEffect(() => {
    tentSearchCache.current.clear();
  }, [user?.id]);

  useEffect(() => {

    let isCancelled = false;

    if (searchGlampingDates.date_from > searchGlampingDates.date_to) {
      toast.error(t("reserve.validations.start_date_before_end_date"))
      setLoadingGlampings(false);
      return;
    }

    const cachedTents = tentSearchCache.current.get(tentSearchKey);
    if (cachedTents) {
      setDatasetReservesOptions((prevOptions => ({ ...prevOptions, tents: cachedTents })));
      setLoadingGlampings(false);
      return;
    }

    const searchAvailableTentsHandler = async () => {
      if (user != null) {
        setLoadingGlampings(true);
        try {
          const tentsDB = await SearchAvailableTents(user.token, { dateFrom: searchGlampingDates.date_from, dateTo: searchGlampingDates.date_to }, i18n.language);
          if (!isCancelled && tentsDB != null) {
            tentSearchCache.current.set(tentSearchKey, tentsDB);
            setDatasetReservesOptions((prevOptions => ({ ...prevOptions, tents: tentsDB })));

          }
        } finally {
          if (!isCancelled) {
            setLoadingGlampings(false);
          }
        }
      }
    }

    searchAvailableTentsHandler();

    return () => {
      isCancelled = true;
    }

  }, [tentSearchKey, user, searchGlampingDates.date_from, searchGlampingDates.date_to, i18n.language])

  const getTentItemFormData = useCallback((): {
    idTent: number;
    additional_people: number;
    additional_people_price: number;
    kids: number;
    base_kids: number;
    max_kids: number;
    kids_bundle_price: number;
    dateFrom: Date;
    dateTo: Date;
    no_custom_price: boolean;
  } | null => {
    const container = document.getElementById("modal_reserve_items") as HTMLFormElement;
    if (!container) return null;

    const idTentInput = container.querySelector(`select[name="reserve_tent_option_id"]`) as HTMLSelectElement;
    const additionalPeopleInput = container.querySelector(`input[name="reserve_tent_option_additional_people"]`) as HTMLInputElement;
    const kidsInput = container.querySelector(`input[name="reserve_tent_option_kids"]`) as HTMLInputElement;
    const noCustomPriceInput = container.querySelector(`input[name="reserve_tent_option_no_special_price"]`) as HTMLInputElement;

    if (!idTentInput || !additionalPeopleInput || !kidsInput || !noCustomPriceInput) {
      return null;
    }

    const idTent = Number(idTentInput.value);
    const dateFrom = searchGlampingDates.date_from;
    const dateTo = searchGlampingDates.date_to;
    const no_custom_price = noCustomPriceInput.checked;

    const tent_db = datasetReservesOptions.tents.find((i) => i.id === idTent);
    if (!tent_db) {
      return null;
    }

    const baseKids = tent_db.qtykids ?? 0;
    const maxKidsLimit = Math.max(tent_db.max_kids ?? 0, baseKids);

    if (lastSelectedTentIdRef.current !== idTent) {
      kidsInput.value = baseKids.toString();
      lastSelectedTentIdRef.current = idTent;
    }

    const additional_people = Number(additionalPeopleInput.value);
    let kids = Number(kidsInput.value);

    if (!Number.isFinite(kids)) {
      kids = baseKids;
      kidsInput.value = kids.toString();
    }

    setErrorMessages({});

    try {
      ReserveTentItemFormDataSchema.parse({
        reserve_tent_option_id: idTent,
        reserve_tent_option_date_from: dateFrom,
        reserve_tent_option_date_to: dateTo,
        reserve_tent_option_additional_people: additional_people,
        reserve_tent_option_additional_people_max: tent_db.max_additional_people,
        reserve_tent_option_kids: kids,
        reserve_tent_option_kids_max: maxKidsLimit,
      });

      return {
        idTent,
        additional_people,
        additional_people_price: tent_db.additional_people_price ?? 0,
        kids,
        base_kids: baseKids,
        max_kids: maxKidsLimit,
        kids_bundle_price: tent_db.kids_bundle_price ?? 0,
        dateFrom,
        dateTo,
        no_custom_price,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrorMessages: Record<string, string> = {};
        error.errors.forEach(err => {
          const fieldName = err.path[0] as string;
          newErrorMessages[fieldName] = err.message;
        });
        setErrorMessages(newErrorMessages);
      }
      return null;
    }

  }, [datasetReservesOptions.tents, searchGlampingDates.date_from, searchGlampingDates.date_to]);

  const calculateTentItemPrice = useCallback(() => {

    const currentItem = getTentItemFormData();

    if (currentItem == null) {
      setTentItemTotalPrice(0);
      return;
    }

    const tentData = datasetReservesOptions.tents.find((i) => i.id === currentItem.idTent);

    if (!tentData) {
      setTentItemTotalPrice(0);
      return;
    }

    const nights = getNumberOfNights(currentItem.dateFrom, currentItem.dateTo);

    const pricing = computeTentNightlyTotals(
      {
        price: tentData.price,
        custom_price: tentData.custom_price,
        qtykids: tentData.qtykids,
        max_kids: tentData.max_kids,
        kids_bundle_price: tentData.kids_bundle_price,
        additional_people_price: tentData.additional_people_price,
        max_additional_people: tentData.max_additional_people,
        qtypeople: tentData.qtypeople,
      },
      {
        kids: currentItem.kids,
        additional_people: currentItem.additional_people,
        no_custom_price: currentItem.no_custom_price,
      }
    );

    setTentItemTotalPrice(pricing.nightly * nights);
  }, [getTentItemFormData, datasetReservesOptions.tents]);

  useEffect(() => {
    calculateTentItemPrice();
  }, [calculateTentItemPrice]);

  const [productItemTotalPrice, setProductItemTotalPrice] = useState<number>(0);

  const getProductItemFormData = (): { idProduct: number, quantity: number, no_custom_price: boolean } | null => {
    const container = document.getElementById("modal_reserve_items") as HTMLFormElement;

    const idProductInput = container.querySelector(`select[name="reserve_product_option_id"]`) as HTMLSelectElement;
    const quantityInput = container.querySelector(`input[name="reserve_product_option_quantity"]`) as HTMLInputElement;
    const noCustomPriceInput = container.querySelector(`input[name="reserve_product_option_no_special_price"]`) as HTMLInputElement;

    if (idProductInput == undefined || quantityInput == undefined || noCustomPriceInput == undefined) {
      return null;
    }

    const idProduct = Number(idProductInput.value);
    const quantity = Number(quantityInput.value);
    const no_custom_price = noCustomPriceInput.checked;

    setErrorMessages({});

    try {

      ReserveProductItemFormDataSchema.parse({
        reserve_product_option_id: idProduct,
        reserve_product_option_quantity: quantity,
      });

      return {
        idProduct,
        quantity,
        no_custom_price: no_custom_price
      }

    } catch (error) {
      if (error instanceof ZodError) {
        const newErrorMessages: Record<string, string> = {};
        error.errors.forEach(err => {
          const fieldName = err.path[0] as string;
          newErrorMessages[fieldName] = err.message;
        });
        setErrorMessages(newErrorMessages);
      }
      return null;
    }

  }

  const [experienceItemTotalPrice, setExperienceItemTotalPrice] = useState<number>(0);

  const getExperienceItemFormData = (): { idExperience: number, quantity: number, day: Date, no_custom_price: boolean } | null => {
    const container = document.getElementById("modal_reserve_items") as HTMLFormElement;

    const idExperienceInput = container.querySelector(`select[name="reserve_experience_option_id"]`) as HTMLSelectElement;
    const quantityInput = container.querySelector(`input[name="reserve_experience_option_quantity"]`) as HTMLInputElement;
    const dateInput = container.querySelector(`input[name="reserve_experience_option_date"]`) as HTMLInputElement;
    const noCustomPriceInput = container.querySelector(`input[name="reserve_experience_option_no_special_price"]`) as HTMLInputElement;

    if (idExperienceInput == undefined || quantityInput == undefined || dateInput == undefined || noCustomPriceInput == undefined) {
      return null;
    }

    const idExperience = Number(idExperienceInput.value);
    const day = new Date(dateInput.value);
    const quantity = Number(quantityInput.value);
    const no_custom_price = noCustomPriceInput.checked;

    setErrorMessages({});

    try {

      ReserveExperienceItemFormDataSchema.parse({
        reserve_experience_option_id: idExperience,
        reserve_experience_option_day: day,
        reserve_experience_option_quantity: quantity,
      });

      return {
        idExperience,
        day,
        quantity,
        no_custom_price: no_custom_price
      }

    } catch (error) {
      if (error instanceof ZodError) {
        const newErrorMessages: Record<string, string> = {};
        error.errors.forEach(err => {
          const fieldName = err.path[0] as string;
          newErrorMessages[fieldName] = err.message;
        });
        setErrorMessages(newErrorMessages);
      }
      return null;
    }

  }

  const [extraItemTotalPrice, setExtraItemTotalPrice] = useState<number>(0);

  const getExtraItemFormData = (): { extraItemId: null, name: string, price: number, quantity: number } | null => {
    const container = document.getElementById("modal_reserve_items") as HTMLFormElement;

    const nameInput = container.querySelector(`input[name="reserve_extra_item_option_name"]`) as HTMLInputElement;
    const priceInput = container.querySelector(`input[name="reserve_extra_item_option_price"]`) as HTMLInputElement;
    const quantityInput = container.querySelector(`input[name="reserve_extra_item_option_quantity"]`) as HTMLInputElement;

    if (!nameInput || !priceInput || !quantityInput) return null;

    const name = nameInput.value;
    const price = Number(priceInput.value);
    const quantity = Number(quantityInput.value);

    setErrorMessages({});

    try {
      // keep schema call; pass id as null (if your schema expects it)
      ReserveExtraItemFormDataSchema.parse({
        reserve_extra_item_option_id: null,
        reserve_extra_item_option_name: name,
        reserve_extra_item_option_price: price,
        reserve_extra_item_option_quantity: quantity,
      });

      return { extraItemId: null, name, price, quantity };
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrorMessages: Record<string, string> = {};
        error.errors.forEach(err => {
          const fieldName = err.path[0] as string;
          newErrorMessages[fieldName] = err.message;
        });
        setErrorMessages(newErrorMessages);
      }
      return null;
    }
  };

  const calculateProductItemPrice = () => {

    const currentItem = getProductItemFormData();

    if (currentItem == null) {
      setProductItemTotalPrice(0);
      return;
    }

    const data = datasetReservesOptions.products.find((i) => i.id == currentItem.idProduct);

    if (data) {
      const base_price = calculatePrice(data.price, data.custom_price, currentItem.no_custom_price)
      setProductItemTotalPrice(base_price * currentItem.quantity);
    }
  }

  const calculateExperienceItemPrice = () => {

    const currentItem = getExperienceItemFormData();

    if (currentItem == null) {
      setExperienceItemTotalPrice(0);
      return;
    }

    const data = datasetReservesOptions.experiences.find((i) => i.id == currentItem.idExperience);

    if (data) {
      const base_price = calculatePrice(data.price, data.custom_price, currentItem.no_custom_price)
      setExperienceItemTotalPrice(base_price * currentItem.quantity);
    }
  }

  const calculateExtraItemPrice = () => {
    const currentItem = getExtraItemFormData();
    if (currentItem == null) {
      setExtraItemTotalPrice(0);
      return;
    }
    setExtraItemTotalPrice(currentItem.price * currentItem.quantity);
  };


  const handleAddReserveOption = (type: string) => {
    let data: any = null;

    if (type == "tent") {

      const currentItem = getTentItemFormData();

      if (currentItem == null) {
        return;
      }

      data = datasetReservesOptions.tents.find((i) => i.id == currentItem.idTent);

      if (data) {
        console.log(currentItem.dateFrom, currentItem.dateTo);
        const nights = getNumberOfNights(currentItem.dateFrom, currentItem.dateTo);

        const pricing = computeTentNightlyTotals(
          {
            price: data.price,
            custom_price: data.custom_price,
            qtykids: data.qtykids,
            max_kids: data.max_kids,
            kids_bundle_price: data.kids_bundle_price,
            additional_people_price: data.additional_people_price,
            max_additional_people: data.max_additional_people,
            qtypeople: data.qtypeople,
          },
          {
            kids: currentItem.kids,
            additional_people: currentItem.additional_people,
            no_custom_price: currentItem.no_custom_price,
          }
        );

        const newTentOption: ReserveTentDto = {
          idTent: currentItem.idTent,
          name: data.title,
          nights,
          price: pricing.nightlyBase,
          advanced: 0,
          confirmed: true,
          dateFrom: currentItem.dateFrom,
          dateTo: currentItem.dateTo,
          additional_people: pricing.effectiveAdditionalPeople,
          additional_people_price: pricing.additional_people_price,
          kids: pricing.selectedKids,
          kids_price: pricing.kids_price,
        };

        setTents([...tents, newTentOption]);
      }

    } else if (type == "product") {

      const currentItem = getProductItemFormData();

      if (currentItem == null) {
        return;
      }

      data = datasetReservesOptions.products.find((i) => i.id == currentItem.idProduct);

      if (data) {
        const newProductOption: ReserveProductDto = {
          idProduct: currentItem.idProduct,
          name: data.name,
          quantity: currentItem.quantity,
          price: calculatePrice(data.price, data.custom_price, currentItem.no_custom_price),
          advanced: 0,
          confirmed: true,
        };
        setProducts([...products, newProductOption]);
      }
    } else if (type == "experience") {

      const currentItem = getExperienceItemFormData();

      if (currentItem == null) {
        return;
      }

      data = datasetReservesOptions.experiences.find((i) => i.id == currentItem.idExperience);

      if (data) {
        const newExperienceOption: ReserveExperienceDto = {
          idExperience: currentItem.idExperience,
          name: data.name,
          day: currentItem.day,
          quantity: currentItem.quantity,
          price: calculatePrice(data.price, data.custom_price, currentItem.no_custom_price),
          advanced: 0,
          confirmed: true,
        };
        setExperiences([...experiences, newExperienceOption]);
      }

    } else if (type == "extraItem") {

      const currentItem = getExtraItemFormData();
      if (currentItem == null) return;

      const newExtraItemOption: ReserveExtraItemDto = {
        reserveId: 0,
        name: currentItem.name,
        price: currentItem.price,
        quantity: currentItem.quantity,
        advanced: 0,
        confirmed: true,
      };
      setExtraItems([...extraItems, newExtraItemOption]);

    }
    setOpenReserveOption(null);

  };


  const handleRemoveReserveOption = (index: number, type: string) => {
    if (type === "tent") {
      setTents(tents.filter((_, i) => i !== index));
    } else if (type === "product") {
      setProducts(products.filter((_, i) => i !== index));
    } else if (type === "experience") {
      setExperiences(experiences.filter((_, i) => i !== index));
    } else if (type === "extraItem") {
      setExtraItems(extraItems.filter((_, i) => i !== index));
    }
  };


  const handleAdvancedChange = (type: "tent" | "product" | "experience" | "extraItem", index: number, value: number) => {
    const parsedValue = Number.isFinite(value) && value >= 0 ? value : 0;

    if (type === "tent") {
      setTents(prev => prev.map((item, i) => (i === index ? { ...item, advanced: parsedValue } : item)));
    } else if (type === "product") {
      setProducts(prev => prev.map((item, i) => (i === index ? { ...item, advanced: parsedValue } : item)));
    } else if (type === "experience") {
      setExperiences(prev => prev.map((item, i) => (i === index ? { ...item, advanced: parsedValue } : item)));
    } else if (type === "extraItem") {
      setExtraItems(prev => prev.map((item, i) => (i === index ? { ...item, advanced: parsedValue } : item)));
    }
  };


  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});

  const [totals, setTotals] = useState<{
    discount_code_id: number,
    discount_code_name: string,
    gross_import: number,
    discount: number,
    net_import: number,
    advanced_total: number,
  }>({ discount_code_id: 0, discount_code_name: "", gross_import: 0, discount: 0, net_import: 0, advanced_total: 0 });

  const [discountCode, setDiscountCode] = useState<{ discount_code_id: number, discount_code_name: string, discount: number }>({ discount_code_id: 0, discount_code_name: "", discount: 0 })

  const onChangeDiscountCode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const list_values = value.split("_");
    if (list_values.length > 2) {
      setDiscountCode({ discount_code_id: Number(list_values[0]), discount_code_name: list_values[1], discount: Number(list_values[2]) })
    }
  }

  useEffect(() => {

    const gross_import = [
      extraItems.reduce((sum, item) => sum + (item.quantity * item.price), 0),
      tents.reduce((sum, item) => {
        const nightly = item.price + (item.additional_people_price ?? 0) * item.additional_people + (item.kids_price ?? 0);
        return sum + (nightly * item.nights);
      }, 0),
      products.reduce((sum, item) => sum + (item.quantity * item.price), 0),
      experiences.reduce((sum, item) => sum + (item.quantity * item.price), 0),
    ].reduce((acc, value) => acc + value, 0);

    const advanced_total = [
      extraItems.reduce((sum, item) => sum + (item.advanced ?? 0), 0),
      tents.reduce((sum, item) => sum + (item.advanced ?? 0), 0),
      products.reduce((sum, item) => sum + (item.advanced ?? 0), 0),
      experiences.reduce((sum, item) => sum + (item.advanced ?? 0), 0),
    ].reduce((acc, value) => acc + value, 0);

    setTotals((prevTotals) => {
      let net_import = gross_import;
      let discountValue = 0;
      let discountCodeId = 0;
      let discountCodeName = "";

      if (discountCode.discount_code_id > 0 && discountCode.discount > 0 && discountCode.discount <= 100) {
        discountValue = discountCode.discount;
        discountCodeId = discountCode.discount_code_id;
        discountCodeName = discountCode.discount_code_name;
        net_import = gross_import - ((discountCode.discount / 100) * gross_import);
      }

      return {
        ...prevTotals,
        gross_import,
        net_import,
        discount: discountValue,
        discount_code_id: discountCodeId,
        discount_code_name: discountCodeName,
        advanced_total,
      };
    });

  }, [extraItems, tents, experiences, products, discountCode]);


  const validateFields = (formname: string): ReserveFormData | null => {

    const form = document.getElementById(formname) as HTMLFormElement;

    let user_document_type = "";
    let user_document_id = "";
    let user_nationality = "";
    let user_firstname = ""
    let user_lastname = ""
    let user_phone_number = ""
    let user_email = ""
    const userId = selectedReserve?.userId;

    if (userType == "old") {
      user_email = (form.querySelector('input[name="user_email"]') as HTMLInputElement).value
    } else {
      user_document_type = (form.querySelector('select[name="document_type"]') as HTMLInputElement).value;
      user_document_id = (form.querySelector('input[name="document_id"]') as HTMLInputElement).value
      user_nationality = (form.querySelector('input[name="nationality"]') as HTMLInputElement).value
      user_firstname = (form.querySelector('input[name="firstName"]') as HTMLInputElement).value
      user_lastname = (form.querySelector('input[name="lastName"]') as HTMLInputElement).value
      user_phone_number = (form.querySelector('input[name="phoneNumber"]') as HTMLInputElement).value
      user_email = (form.querySelector('input[name="user_email"]') as HTMLInputElement).value
    };

    const payment_status = (form.querySelector('select[name="payment_status"]') as HTMLInputElement).value;
    const reserve_status = (form.querySelector('select[name="reserve_status"]') as HTMLInputElement).value;
    const canceled_status = (form.querySelector('input[name="canceled_status"]') as HTMLInputElement).checked;
    const canceled_reason = (form.querySelector('textarea[name="canceled_reason"]') as HTMLInputElement).value;

    setErrorMessages({});

    try {

      ReserveFormDataSchema.parse({
        userType,
        userId,
        name: user_firstname,
        lastname: user_lastname,
        cellphone: user_phone_number,
        user_email,
        tents,
        products,
        experiences,
        extraItems,
        discount_code_id: totals.discount_code_id,
        discount_code_name: totals.discount_code_name,
        gross_import: totals.gross_import,
        discount: totals.discount,
        net_import: totals.net_import,
        canceled_reason,
        canceled_status,
        payment_status,
        reserve_status
      });

      return {
        user_document_type,
        user_document_id,
        user_nationality,
        user_firstname,
        user_lastname,
        user_phone_number,
        user_email,
        userId,
        tents,
        products,
        experiences,
        extraItems,
        price_is_calculated: true,
        discount_code_id: totals.discount_code_id,
        discount_code_name: totals.discount_code_name,
        gross_import: totals.gross_import,
        discount: totals.discount,
        net_import: totals.net_import,
        canceled_reason,
        canceled_status,
        payment_status,
        reserve_status

      };
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrorMessages: Record<string, string> = {};
        error.errors.forEach(err => {
          const fieldName = err.path[0] as string;
          newErrorMessages[fieldName] = err.message;
        });
        setErrorMessages(newErrorMessages);
      }
      return null;
    }
  };

  const onSubmitCreation = async (e: FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    const fieldsValidated = validateFields('form_create_reserve');
    if (fieldsValidated != null) {
      if (user !== null) {
        const isSuccess = await createReserve(fieldsValidated, user.token, i18n.language);
        if (!isSuccess) {
          setLoadingForm(false);
          return;
        }
      }
      getReservesHandler(1);
      setCurrentView("L")
    }
    setLoadingForm(false);
  };


  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

  const [selectedReserve, setSelectedReserve] = useState<Reserve | null>(null);

  const searchReserveHandler = async () => {

    // Get the input value
    const searchValueFrom = (document.querySelector('input[name="criteria_search_value_date_from"]') as HTMLInputElement).value;
    const searchValueTo = (document.querySelector('input[name="criteria_search_value_date_to"]') as HTMLInputElement).value;

    const selectedPaymentStatus = (document.querySelector('select[name="criteria_search_status"]') as HTMLSelectElement).value;

    // Construct filters based on input values and selected criteria
    const filters: ReserveFilters = {};

    if (searchValueFrom) {
      filters["dateFrom"] = searchValueFrom;
    }

    if (searchValueFrom) {
      filters["dateTo"] = searchValueTo;
    }

    if (selectedPaymentStatus) {
      filters.payment_status = selectedPaymentStatus;
    }

    getReservesHandler(1, filters);
  }

  const deleteReserveHandler = async () => {
    if (user != null && selectedReserve != null && selectedReserve.id) {
      const isSuccess = await deleteReserve(selectedReserve.id, user.token, i18n.language)
      if (!isSuccess) {
        return;
      }
    }
    getReservesHandler(1);
    setOpenDeleteModal(false);
  }

  const onChangeSelectedReserve = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type, value, checked } = e.target as any;

    let fieldValue: any = type === 'checkbox' ? checked : value;

    if (type === 'date') {
      const date = new Date(value);
      const localOffset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() + localOffset);
      fieldValue = localDate;
    }

    setSelectedReserve(prevSelectedReserve => {
      if (!prevSelectedReserve) return null;
      return {
        ...prevSelectedReserve,
        [name]: fieldValue,
      };
    });
  };

  const onSubmitUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    const fieldsValidated = validateFields('form_update_reserve');
    if (fieldsValidated != null) {
      if (user !== null && selectedReserve != null && selectedReserve.id) {
        const isSuccess = await updateReserve(selectedReserve.id, fieldsValidated, user.token, i18n.language);
        if (!isSuccess) {
          setLoadingForm(false);
          return;
        }
      }
      getReservesHandler(1);
      setCurrentView("L")
    }
    setLoadingForm(false);
  };


  const [users, setUsers] = useState<User[]>([])

  const searchUsersByEmail = async (formname: string) => {
    const form = document.getElementById(formname) as HTMLFormElement;
    const email = (form.querySelector('input[name="search_user_email"]') as HTMLInputElement).value;

    const filters: UserFilters = {}

    if (email) {
      filters['email'] = email;
    }

    filters.role = "CLIENT";

    if (user != null) {
      const usersDB = await getAllUsers(user.token, 1, i18n.language, filters);
      if (usersDB) {
        setUsers(usersDB.users);
      }
    }
  }
  const selectUserId = async (formname: string, user: User) => {
    const form = document.getElementById(formname) as HTMLFormElement;
    const user_email = form.querySelector('input[name="user_email"]') as HTMLInputElement;

    user_email.value = user.email ?? "";
    setUsers([]);
  }

  /*
  const [experiencesDayOptions,setDataExperienceDayOptions] = useState<{date:Date, label:string}[]>([])

  const getDateRangeFromForm = (formname:string) => {
      // Get the form element by ID
      const form = document.getElementById(formname) as HTMLInputElement;
      
      if (!form) {
          throw new Error('Form not found');
      }
      
      // Select the dateFrom and dateTo inputs from the form
      const dateFromInput = form.querySelector('input[name="dateFrom"]') as HTMLInputElement;
      const dateToInput = form.querySelector('input[name="dateTo"]') as HTMLInputElement;
      
      if (!dateFromInput || !dateToInput) {
          throw new Error('dateFrom or dateTo input not found');
      }
      
      // Get the values of the dateFrom and dateTo inputs
      const dateFrom = new Date(dateFromInput.value);
      const dateTo = new Date(dateToInput.value);
      
      if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
          throw new Error('Invalid dates');
      }

      if (dateTo <= dateFrom) {
          toast.error("La fecha Inicio tiene que ser previa a la fecha de Fin");
      }
      
      // Initialize an array to store the date range
      const dateRange = [];

      // Loop through the dates from dateFrom to dateTo
      let currentDate = new Date(dateFrom);
      while (currentDate <= dateTo) {
          const formattedDate = currentDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
          dateRange.push({
              date: new Date(currentDate),
              label: formattedDate
          });
          
          // Move to the next day
          currentDate.setDate(currentDate.getDate() + 1);
      }

      setDataExperienceDayOptions(dateRange);
      }*/

  const downloadReceipt = async () => {
    if (user !== null && selectedReserve && selectedReserve.id) {
      await downloadBillForReserve(selectedReserve.id, user.token, i18n.language);
    }
  }

  const [userType, setUserType] = useState<'new' | 'old'>('old');

  return (
    <Dashboard>
      <AnimatePresence>
        {currentView == "LOADING" && (
          <motion.div
            key={"Loading-View"}
            initial="hidden"
            animate="show"
            exit="hidden"
            viewport={{ once: true }}
            variants={fadeIn("up", "", 0.5, 0.3)}
            className="w-full min-h-[300px] flex flex-col justify-center items-center gap-y-4 bg-white pointer-events-none">
            <div className="loader"></div>
            <h1 className="font-primary text-secondary mt-4">{t("common.loading")}</h1>
          </motion.div>
        )}

        {currentView == "L" && (
          <>
            <motion.div
              key={"List-View"}
              initial="hidden"
              animate="show"
              exit="hidden"
              viewport={{ once: true }}
              variants={fadeIn("up", "", 0.5, 0.3)}
              className="w-full h-auto flex flex-col justify-start items-start gap-y-4">
              <h2 className="text-secondary text-2xl flex flex-row gap-x-4"><Calendar />{t("reserve.reserves")}</h2>
              <div className="w-full h-auto flex flex-col xl:flex-row justify-start xl:justify-between items-center gap-x-4">
                <div className="w-full xl:w-auto h-auto flex flex-col lg:flex-row  justify-start lg:justify-between xl:justify-start items-start gap-y-4 gap-x-4">
                  <div className="w-full lg:w-[50%] xl:w-auto flex flex-col md:flex-row items-start md:items-center gap-x-2">
                    <input
                      type="date"
                      name="criteria_search_value_date_from"
                      placeholder={t("reserve.from")}
                      className="w-[50%] xl:w-48 h-8 text-xs font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-primary"
                    />
                    <input
                      type="date"
                      name="criteria_search_value_date_to"
                      placeholder={t("reserve.to")}
                      className="w-[50%] xl:w-48 h-8 text-xs font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-primary"
                    />
                  </div>
                  <div className="w-full lg:w-[50%] xl:w-auto flex flex-col md:flex-row items-start md:items-center gap-x-2">
                    <label className="max-xl:w-full md:ml-4 flex items-center text-xs">
                      {t("reserve.payment_status")}
                      <select name="criteria_search_status" className="max-xl:w-full ml-2 h-8 text-xs font-tertiary border-b-2 border-secondary focus:outline-none focus:border-b-primary">
                        <option value="">{t("reserve.select_payment_status")}</option>
                        <option value="PAID">{t("reserve.PAID")}</option>
                        <option value="UNPAID">{t("reserve.UNPAID")}</option>
                      </select>
                    </label>
                    <Button variant="ghostLight" isRound={true} effect="default" className="md:ml-4 mt-4 md:mt-0" onClick={() => searchReserveHandler()}>
                      {t("common.search")}
                    </Button>
                  </div>
                </div>
                <div className="w-full xl:w-auto h-auto flex flex-row justify-end items-start gap-y-4 gap-x-4 max-xl:mt-4">
                  <Button onClick={() => { setCurrentView("A"); setTents([]); setProducts([]); setExperiences([]); setExtraItems([]); setErrorMessages({}) }} size="sm" variant="dark" effect="default" className="min-w-[300px]" isRound={true}>Agregar Reserva <Calendar /></Button>
                </div>
              </div>
              <table className="h-full w-full shadow-xl rounded-xl text-center p-4">
                <thead className="font-primary text-sm xl:text-md bg-primary text-white">
                  <tr className="">
                    <th className="rounded-tl-xl p-2">#</th>
                    <th className="p-2">{t("reserve.external_id")}</th>
                    <th className="p-2">{t("reserve.from")}</th>
                    <th className="p-2">{t("reserve.to")}</th>
                    <th className="p-2 max-xl:hidden">{t("reserve.services_and_products")}</th>
                    <th className="p-2">{t("reserve.total_amount")}</th>
                    <th className="p-2">{t("reserve.cancel")}</th>
                    <th className="p-2">{t("reserve.reserve_status")}</th>
                    <th className="p-2">{t("reserve.payment_status")}</th>
                    <th className="p-2 max-xl:hidden">{t("reserve.created")}</th>
                    <th className="p-2 max-xl:hidden">{t("reserve.updated")}</th>
                    <th className="rounded-tr-xl p-2">{t("reserve.actions")}</th>
                  </tr>
                </thead>
                <tbody className="font-secondary text-xs xl:text-sm">
                  {datasetReserves.reserves.map((reserveItem, index) => {
                    return (
                      <tr key={"user_key" + index} className="text-slate-400 hover:bg-secondary hover:text-white duration-300 cursor-pointer">
                        <td className="">{reserveItem.id}</td>
                        <td className="">{reserveItem.external_id}</td>

                        <td className="">{formatDateToYYYYMMDD(getReserveDates(reserveItem.tents).dateFrom)}</td>
                        <td className="">{formatDateToYYYYMMDD(getReserveDates(reserveItem.tents).dateTo)}</td>

                        <td className="max-xl:hidden flex flex-row gap-x-4 justify-around">
                          <div className="flex flex-row gap-x-2"><Tent />{reserveItem.tents.length}</div>
                          <div className="flex flex-row gap-x-2"><FlameKindling />{reserveItem.experiences.length}</div>
                          <div className="flex flex-row gap-x-2"><Pizza />{reserveItem.products.length}</div>
                        </td>
                        <td className="">{`${formatPrice(reserveItem.gross_import)}`}</td>
                        <td className="h-full">{reserveItem.canceled_status ? t("common.yes") : t("common.no")}</td>
                        <td className="h-full">{reserveItem.reserve_status != "CONFIRMED" ? (reserveItem.reserve_status != "NOT_CONFIRMED" ? t("reserve.COMPLETE") : t("reserve.NOT_CONFIRMED")) : t("reserve.CONFIRMED")}</td>
                        <td className="h-full">{reserveItem.payment_status != "PAID" ? t("reserve.UNPAID") : t("reserve.PAID")}</td>
                        <td className="h-full max-xl:hidden">{reserveItem.updatedAt != undefined && reserveItem.updatedAt != null ? formatDate(reserveItem.updatedAt) : t("reserve.none")}</td>
                        <td className="h-full max-xl:hidden">{reserveItem.createdAt != undefined && reserveItem.createdAt != null ? formatDate(reserveItem.createdAt) : t("reserve.none")}</td>
                        <td className="h-full flex flex-col items-center justify-center">
                          <div className="w-full h-auto flex flex-row flex-wrap gap-x-2">
                            <button onClick={() => { setSelectedReserve(reserveItem); setTents(reserveItem.tents.map((item) => ({ ...item, advanced: item.advanced ?? 0 }))); setProducts(reserveItem.products.map((item) => ({ ...item, advanced: item.advanced ?? 0 }))); setExperiences(reserveItem.experiences.map((item) => ({ ...item, advanced: item.advanced ?? 0 }))); setExtraItems((reserveItem.extraItems ?? []).map((item) => ({ ...item, advanced: item.advanced ?? 0 }))); setUserType('old'); setCurrentView("V") }} className="border rounded-md hover:bg-primary hover:text-white duration-300 active:scale-75 p-1"><Eye className="h-5 w-5" /></button>
                            <button onClick={() => { setSelectedReserve(reserveItem); setTents(reserveItem.tents.map((item) => ({ ...item, advanced: item.advanced ?? 0 }))); setProducts(reserveItem.products.map((item) => ({ ...item, advanced: item.advanced ?? 0 }))); setExperiences(reserveItem.experiences.map((item) => ({ ...item, advanced: item.advanced ?? 0 }))); setExtraItems((reserveItem.extraItems ?? []).map((item) => ({ ...item, advanced: item.advanced ?? 0 }))); setUserType('old'); setCurrentView("E"); setErrorMessages({}) }} className="border rounded-md hover:bg-primary hover:text-white duration-300 active:scale-75 p-1"><Pen className="h-5 w-5" /></button>
                            <button onClick={() => { setOpenDeleteModal(true), setSelectedReserve(reserveItem) }} className="border rounded-md hover:bg-red-400 hover:text-white duration-300 active:scale-75 p-1"><X className="h-5 w-5" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="flex flex-row justify-between w-full">
                <Button onClick={() => getReservesHandler(Number(datasetReserves.currentPage) - 1)} size="sm" variant="dark" effect="default" isRound={true} disabled={datasetReserves.currentPage == 1}> <ChevronLeft />  </Button>
                <Button onClick={() => getReservesHandler(Number(datasetReserves.currentPage) + 1)} size="sm" variant="dark" effect="default" isRound={true} disabled={datasetReserves.currentPage >= datasetReserves.totalPages}> <ChevronRight /> </Button>
              </div>
            </motion.div>

            <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
              <div className="w-[400px] h-auto flex flex-col items-center justify-center text-secondary pb-6 px-6 pt-12 text-center">
                <CircleX className="h-[60px] w-[60px] text-red-400 " />
                <p className="text-primary">{t("reserve.secure_delete_reserve_header")}</p>
                <div className="flex flex-row justify-around w-full mt-6">
                  <Button size="sm" variant="dark" effect="default" isRound={true} onClick={() => setOpenDeleteModal(false)}>{t("common.cancel")} </Button>
                  <Button size="sm" variant="danger" effect="default" isRound={true} onClick={() => { deleteReserveHandler() }}>{t("common.accept")} </Button>
                </div>
              </div>
            </Modal>
          </>

        )}

        {currentView !== "L" && (

          <AnimatePresence>
            {openReserveOption != null && (
              <Modal isOpen={openReserveOption != null} onClose={() => setOpenReserveOption(null)}>
                <div id="modal_reserve_items" className="w-[100%] xl:w-[800px] max-xl:min-h-[600px] xl:h-[600px] flex flex-col items-start justify-start text-secondary py-16 px-4 sm:p-6 overflow-hidden max-xl:overflow-y-scroll">
                  <div className="w-[100%] h-auto flex overflow-x-croll">
                    <div className="w-full h-auto flex flex-row gap-x-4 sm:gap-x-6 pb-4 border-b-2 border-secondary">
                      <InputRadio
                        className="w-auto"
                        onClick={() => { setOpenReserveOption("tent") }}
                        name="category"
                        placeholder={t("reserve.glampings")}
                        rightIcon={<Tent />}
                        checked={openReserveOption === "tent"}
                        readOnly
                      />
                      <InputRadio
                        className="w-auto"
                        onClick={() => { setOpenReserveOption("product") }}
                        name="category"
                        placeholder={t("reserve.products")}
                        rightIcon={<Pizza />}
                        checked={openReserveOption === "product"}
                        readOnly
                      />
                      <InputRadio
                        className="w-auto"
                        onClick={() => { setOpenReserveOption("experience") }}
                        name="category"
                        placeholder={t("reserve.experiences")}
                        rightIcon={<FlameKindling />}
                        checked={openReserveOption === "experience"}
                        readOnly
                      />
                      <InputRadio
                        className="w-auto"
                        onClick={() => { setOpenReserveOption("extraItem") }}
                        name="category"
                        placeholder={t("reserve.extraItems")}
                        rightIcon={<Disc />}
                        checked={openReserveOption === "extraItem"}
                        readOnly
                      />
                    </div>
                  </div>
                  {openReserveOption == "tent" && (

                    <div className="flex flex-col justify-start items-start w-full h-auto mt-6 gap-y-2 sm:gap-y-2 xl:overflow-y-scroll xl:pr-4">
                      <div className="flex flex-row justify-start items-start w-full h-auto my-1  gap-x-6">

                        <div className="flex flex-col justify-start itemst-start gap-x-6 w-full h-auto gap-y-2 sm:gap-y-1">

                          <label className="text-secondary">{t("reserve.from")}:</label>
                          <div className="w-full  sm:p-2 border-b-2  border-b-secondary">
                            <DatePicker openBar={openCalendar['date_from']} type="date_from" section="add_tent" toggleBar={toggleBar} date={searchGlampingDates.date_from} setDate={updateDateFromHandler} />
                          </div>
                        </div>

                        <div className="flex flex-col justify-start itemst-start gap-x-6 w-full h-auto gap-y-2 sm:gap-y-1">
                          <label className="text-secondary">{t("reserve.to")}:</label>
                          <div className="w-full  sm:p-2 border-b-2  border-b-secondary">
                            <DatePicker openBar={openCalendar['date_to']} type="date_to" section="add_tent" toggleBar={toggleBar} date={searchGlampingDates.date_to} setDate={updateDateToHandler} />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-start items-start gap-x-6 w-[100%] h-auto gap-y-2 sm:gap-y-1">
                        <label htmlFor="reserve_tent_option_id" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{"Glampings"}</label>

                        {datasetReservesOptions.tents.length == 0 || loadingGlampings ?
                          <div className="h-auto w-full flex flex-col items-center justify-center">
                            <div className="loader"></div>
                            <h1 className="font-primary text-white mt-4">{t("common.loading")}</h1>
                          </div>
                          :
                          <select onChange={() => calculateTentItemPrice()} name="reserve_tent_option_id" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary">
                            {
                              datasetReservesOptions.tents.map((tent, index) => {
                                return (
                                  <option key={index} value={tent.id}>{`${tent.title} | ${t("reserve.price")}: ${formatPrice(tent.price)} ${getCurrentCustomPrice(tent.custom_price) > 0 ? `| ${t("reserve.price_of_day")} ${formatPrice(getCurrentCustomPrice(tent.custom_price))}` : " "} | ${t("reserve.price_aditional_people")} ${formatPrice(tent.additional_people_price)} `}</option>
                                )
                              })
                            }
                          </select>
                        }
                        <div className="w-full h-6">
                          {errorMessages.reserve_tent_option_id && (
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.reserve_tent_option_id)}
                            </motion.p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col justify-start itemst-start gap-x-6 w-[100%] h-auto gap-y-2 sm:gap-y-1">
                        <label htmlFor="reserve_tent_option_additional_people" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("reserve.aditional_people")}</label>
                        <input onChange={() => calculateTentItemPrice()} name="reserve_tent_option_additional_people" type="number" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.aditional_people")} />
                        <div className="w-full h-6">
                          {errorMessages.reserve_tent_option_additional_people && (
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.reserve_tent_option_additional_people)}
                            </motion.p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col justify-start itemst-start gap-x-6 w-[100%] h-auto gap-y-2 sm:gap-y-1">
                        <label htmlFor="reserve_tent_option_kids" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("reserve.kids")}</label>
                        <input onChange={() => calculateTentItemPrice()} name="reserve_tent_option_kids" type="number" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.kids")} />
                        <div className="w-full h-6">
                          {errorMessages.reserve_tent_option_kids && (
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.reserve_tent_option_kids)}
                            </motion.p>
                          )}
                        </div>
                      </div>
                      <div className="checkbox-wrapper-13 px-2 w-full">
                        <input onChange={() => calculateTentItemPrice()} name="reserve_tent_option_no_special_price" type="checkbox" aria-hidden="true" />
                        <label className="text-[12px]" htmlFor="canceled_status">{t("reserve.custom_price_not_apply")}</label>
                      </div>
                      <div className="w-full h-auto flex flex-row justify-end">
                        <span className="text-2xl">{formatPrice(tentItemTotalPrice)}</span>
                      </div>


                      <Button onClick={() => handleAddReserveOption("tent")} size="sm" type="button" variant="dark" effect="default" isRound={true} className="w-auto ml-auto mt-auto">{t("reserve.add_glamping_reserve")}</Button>
                    </div>

                  )}

                  {openReserveOption == "product" && (

                    <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden mt-6 gap-y-2 sm:gap-y-2">
                      <div className="flex flex-col justify-start items-start gap-x-6 w-[100%] h-auto gap-y-2 sm:gap-y-1">
                        <label htmlFor="reserve_product_option_id" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("reserve.product")}</label>
                        <select onChange={() => calculateProductItemPrice()} name="reserve_product_option_id" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary">
                          {datasetReservesOptions.products.map((product, index) => {
                            return (
                              <option key={index} value={product.id}>{`${product.name} | ${t("reserve.price")}: ${formatPrice(product.price)} ${getCurrentCustomPrice(product.custom_price) > 0 ? `| ${t("reserve.price_of_day")} ${formatPrice(getCurrentCustomPrice(product.custom_price))}` : " "}`}</option>
                            )
                          })}
                        </select>
                        <div className="w-full h-6">
                          {errorMessages.reserve_product_option_id && (
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.reserve_product_option_id)}
                            </motion.p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col justify-start itemst-start gap-x-6 w-[100%] h-auto gap-y-2 sm:gap-y-1">
                        <label htmlFor="reserve_product_option_quantity" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("reserve.quantity")}</label>
                        <input onChange={() => calculateProductItemPrice()} name="reserve_product_option_quantity" type="number" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.quantity")} />
                        <div className="w-full h-6">
                          {errorMessages.reserve_product_option_quantity && (
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.reserve_product_option_quantity)}
                            </motion.p>
                          )}
                        </div>
                      </div>
                      <div className="checkbox-wrapper-13 px-2 w-full">
                        <input onChange={() => calculateProductItemPrice()} name="reserve_product_option_no_special_price" type="checkbox" aria-hidden="true" />
                        <label className="text-[12px]" htmlFor="reserve_product_option_no_special_price">{t("reserve.custom_price_not_apply")}</label>
                      </div>
                      <div className="w-full h-auto flex flex-row justify-end">
                        <span className="text-2xl">{formatPrice(productItemTotalPrice)}</span>
                      </div>


                      <Button onClick={() => handleAddReserveOption("product")} size="sm" type="button" variant="dark" effect="default" isRound={true} className="w-auto ml-auto mt-auto">{t("reserve.add_product_reserve")}</Button>
                    </div>

                  )}

                  {openReserveOption == "experience" && (

                    <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden mt-6 gap-y-2 sm:gap-y-2">

                      <div className="flex flex-col justify-start items-start gap-x-6 w-[100%] h-auto gap-y-2 sm:gap-y-1">
                        <label htmlFor="reserve_experience_option_id" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("reserve.experience")}</label>
                        <select onChange={() => calculateExperienceItemPrice()} name="reserve_experience_option_id" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary">
                          {datasetReservesOptions.experiences.map((experience, index) => {
                            return (
                              <option key={index} value={experience.id}>{`${experience.name} | ${t("reserve.price")}: ${formatPrice(experience.price)} ${getCurrentCustomPrice(experience.custom_price) > 0 ? `| ${t("reserve.price_of_day")} ${formatPrice(getCurrentCustomPrice(experience.custom_price))}` : " "} `}</option>
                            )
                          })}
                        </select>
                        <div className="w-full h-6">
                          {errorMessages.reserve_experience_option_id && (
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.reserve_experience_option_id)}
                            </motion.p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col justify-start itemst-start gap-x-6 w-[100%] h-auto gap-y-2 sm:gap-y-1">
                        <label htmlFor="reserve_experience_option_quantity" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("reserve.quantity")}</label>
                        <input onChange={() => calculateExperienceItemPrice()} name="reserve_experience_option_quantity" type="number" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.quantity")} />
                        <div className="w-full h-6">
                          {errorMessages.reserve_experience_option_quantity && (
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.reserve_experience_option_quantity)}
                            </motion.p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col justify-start itemst-start gap-x-6 w-full h-auto gap-y-2 sm:gap-y-1">
                        <label htmlFor="reserve_experience_option_date" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">{t("reserve.day_of_experience")}</label>
                        <input onChange={() => calculateExperienceItemPrice()} name="reserve_experience_option_date" type="date" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.day_of_experience")} />

                        <div className="w-full h-6">
                          {errorMessages.reserve_experience_option_date && (
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.reserve_experience_option_date)}
                            </motion.p>
                          )}
                        </div>
                      </div>
                      <div className="checkbox-wrapper-13 px-2 w-full">
                        <input onChange={() => calculateExperienceItemPrice()} name="reserve_experience_option_no_special_price" type="checkbox" aria-hidden="true" />
                        <label className="text-[12px]" htmlFor="canceled_status">{t("reserve.custom_price_not_apply")}</label>
                      </div>
                      <div className="w-full h-auto flex flex-row justify-end">
                        <span className="text-2xl">{formatPrice(experienceItemTotalPrice)}</span>
                      </div>


                      <Button onClick={() => handleAddReserveOption("experience")} size="sm" type="button" variant="dark" effect="default" isRound={true} className="w-auto ml-auto mt-auto">{t("reserve.add_experience_reserve")}</Button>
                    </div>

                  )}

                  {openReserveOption == "extraItem" && (
                    <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden mt-6 gap-y-2 sm:gap-y-2">
                      <div className="flex flex-col lg:flex-row justify-start items-start w-full h-auto overflow-hidden my-1 gap-x-6 gap-y-2">
                        <div className="flex flex-col justify-start items-start w-full h-auto gap-y-2 sm:gap-y-1">
                          <label htmlFor="reserve_extra_item_option_name" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">
                            {t("reserve.extra_item_name")}
                          </label>
                          <input
                            name="reserve_extra_item_option_name"
                            className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary"
                            placeholder={t("reserve.extra_item_name")}
                            onChange={calculateExtraItemPrice}
                          />
                          <div className="w-full h-6">
                            {errorMessages.reserve_extra_item_option_name && (
                              <motion.p initial="hidden" animate="show" exit="hidden" variants={fadeIn("up", "", 0, 1)} className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                                {t(errorMessages.reserve_extra_item_option_name)}
                              </motion.p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col justify-start items-start w-full h-auto gap-y-2 sm:gap-y-1">
                          <label htmlFor="reserve_extra_item_option_price" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">
                            {t("reserve.extra_item_price")}
                          </label>
                          <input
                            onChange={calculateExtraItemPrice}
                            name="reserve_extra_item_option_price"
                            type="number"
                            className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary"
                            placeholder={t("reserve.extra_item_price")}
                          />
                          <div className="w-full h-6">
                            {errorMessages.reserve_extra_item_option_price && (
                              <motion.p initial="hidden" animate="show" exit="hidden" variants={fadeIn("up", "", 0, 1)} className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                                {t(errorMessages.reserve_extra_item_option_price)}
                              </motion.p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col justify-start items-start w-full h-auto gap-y-2 sm:gap-y-1">
                          <label htmlFor="reserve_extra_item_option_quantity" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">
                            {t("reserve.extra_item_quantity")}
                          </label>
                          <input
                            onChange={calculateExtraItemPrice}
                            name="reserve_extra_item_option_quantity"
                            type="number"
                            className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary"
                            placeholder={t("reserve.extra_item_quantity")}
                          />
                          <div className="w-full h-6">
                            {errorMessages.reserve_extra_item_option_quantity && (
                              <motion.p initial="hidden" animate="show" exit="hidden" variants={fadeIn("up", "", 0, 1)} className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                                {t(errorMessages.reserve_extra_item_option_quantity)}
                              </motion.p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-auto flex flex-row justify-end">
                        <span className="text-2xl">{formatPrice(extraItemTotalPrice)}</span>
                      </div>

                      <Button
                        onClick={() => handleAddReserveOption("extraItem")}
                        size="sm"
                        type="button"
                        variant="dark"
                        effect="default"
                        isRound={true}
                        className="w-auto ml-auto mt-auto"
                      >
                        {t("reserve.add_extra_item_reserve")}
                      </Button>
                    </div>
                  )}
                </div>
              </Modal>
            )}
          </AnimatePresence>
        )}

        {currentView == "V" && selectedReserve && (
          <motion.div
            key={"View"}
            initial="hidden"
            animate="show"
            exit="hidden"
            viewport={{ once: true }}
            variants={fadeIn("up", "", 0.5, 0.3)}
            className="w-full h-auto flex flex-col justify-start items-start gap-y-4">
            <div className="flex flex-row justify-between w-full h-auto mt-2">
              <h2 className="text-secondary text-2xl flex flex-row gap-x-4"><Calendar />{t("reserve.reserve")}</h2>
              <Button onClick={() => downloadReceipt()} effect={"default"} variant="ghostLight" rightIcon={<Receipt />} isRound={true} disabled={selectedReserve.payment_status != "PAID" || selectedReserve.reserve_status != "COMPLETE"}>{t("reserve.download_receipt")}</Button>
            </div>

            <div className="w-full h-auto flex flex-col lg:flex-row gap-6 p-6">

              <div className="flex flex-col justify-start items-start w-full">

                <div className="flex flex-col justify-start items-start w-full h-auto my-1 gap-y-2 sm:gap-y-1">
                  <label htmlFor="user_email" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("user.user_email")}</label>
                  <input name="user_email" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("user.user_emai")} value={`${selectedReserve.user_email ?? ""}`} readOnly />

                </div>
                <div className="w-full h-auto flex flex-row justify-between my-4">
                  <div className="w-[60%] xl:w-[40%] h-auto flex flex-row">
                    <select name="discount_code_selector" className="w-full xl:w-[50%] h-auto text-xs">
                      {selectedReserve.discount_code_id == 0 ?
                        <option key={"no_discount_applied"} value={`${0}_${0}_${0}`}>{t("reserve.no_discount")}</option>
                        :
                        <option key={"selected_discount"} value={`${selectedReserve.discount_code_id}_${selectedReserve.discount_code_name}_${selectedReserve.discount}`}>{`${t("reserve.discount_code")}: ${selectedReserve.discount_code_name} | ${t("reserve.discount")}: ${formatPrice(selectedReserve.discount)}%`} </option>
                      }
                    </select>
                  </div>
                </div>
                <table className="h-auto w-full shadow-xl rounded-xl text-center border-collapse table-fixed">
                  <thead className="font-primary text-xs xl:text-sm bg-secondary text-white rounded-t-xl">
                    <tr className="">
                      <th className="w-[5%] rounded-tl-xl py-2">#</th>
                      <th className="w-[45%] py-2">{t("reserve.item")}</th>
                      <th className="w-[10%] py-2">{t("reserve.unit")}</th>
                      <th className="w-[10%] py-2">{t("reserve.unit_price")}</th>
                      <th className="w-[10%] py-2">{t("reserve.qty")}</th>
                      <th className="w-[10%] py-2">{t("reserve.price")}</th>
                      <th className="w-[10%] py-2">{t("reserve.advanced")}</th>
                    </tr>
                  </thead>
                  <tbody className="font-secondary text-xs xl:text-sm">

                    {selectedReserve.extraItems?.map((item, index) => (
                      <tr key={"reserve_key_extra_item_" + index} className="text-slate-400 ">
                        <td className="border border-slate-300 text-center">{index + 1}</td>
                        <td className="border border-slate-300 text-left">{item.name}</td>
                        <td className="border border-slate-300 text-center">{t("reserve.unit")}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price)}</td>
                        <td className="border border-slate-300 text-center">{item.quantity}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.advanced ?? 0)}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}

                    {selectedReserve.tents.map((item, index) => (
                      <tr key={"reserve_key_tent_" + index} className="text-slate-400 ">
                        <td className="border border-slate-300 text-center">{(selectedReserve.extraItems?.length ?? 0) + index + 1}</td>
                        <td className="border border-slate-300 text-left">{`${item.name} | ${t("reserve.from")}: ${formatDateToYYYYMMDD(item.dateFrom)} ${t("reserve.to")}: ${formatDateToYYYYMMDD(item.dateTo)}${item.additional_people > 0 ? ` | ADP:${item.additional_people} ADPP: ${formatPrice(item.additional_people_price ?? 0)}` : ""}${item.kids > 0 ? ` | KDS:${item.kids}${item.kids_price ? ` KDPP: ${formatPrice(item.kids_price ?? 0)}` : ""}` : ""}`}</td>
                        <td className="border border-slate-300 text-center">{t("reserve.nights")}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price + ((item.additional_people_price ?? 0) * item.additional_people) + (item.kids_price ?? 0))}</td>
                        <td className="border border-slate-300 text-center">{item.nights}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.advanced ?? 0)}</td>
                        <td className="border border-slate-300 text-center">{formatPrice((item.price + (item.kids_price ?? 0) + ((item.additional_people_price ?? 0) * item.additional_people)) * item.nights)}</td>
                      </tr>
                    ))}

                    {selectedReserve.experiences.map((item, index) => (
                      <tr key={"reserve_key_experience_" + index} className="text-slate-400 ">
                        <td className="border border-slate-300 text-center">{(selectedReserve.extraItems?.length ?? 0) + (selectedReserve.tents?.length ?? 0) + index + 1}</td>
                        <td className="border border-slate-300 text-left">{`${item.name} | ${t("reserve.day_of_experience")} ${formatDateToYYYYMMDD(item.day)}`}</td>
                        <td className="border border-slate-300 text-center">{t("reserve.unit")}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price)}</td>
                        <td className="border border-slate-300 text-center">{item.quantity}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.advanced ?? 0)}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}

                    {selectedReserve.products.map((item, index) => (
                      <tr key={"reserve_key_product_" + index} className="text-slate-400 ">
                        <td className="border border-slate-300 text-center">{(selectedReserve.extraItems?.length ?? 0) + (selectedReserve.tents?.length ?? 0) + (selectedReserve.experiences?.length ?? 0) + index + 1}</td>
                        <td className="border border-slate-300 text-left">{`${item.name}`}</td>
                        <td className="border border-slate-300 text-center">{t("reserve.unit")}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price)}</td>
                        <td className="border border-slate-300 text-center">{item.quantity}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.advanced ?? 0)}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                    <tr key={"reserve_key_net_import"} className="text-slate-400">
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={6}>{t("reserve.gross_import")}</td>
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={1}>{formatPrice(totals.gross_import)}</td>
                    </tr>
                    <tr key={"reserve_key_advanced_total"} className="text-slate-400">
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={6}>{t("reserve.advanced_total")}</td>
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={1}>{formatPrice(totals.advanced_total)}</td>
                    </tr>
                    <tr key={"reserve_key_total"} className="text-slate-400">
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={6}>{t("reserve.discount")}</td>
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={1}>{formatPrice(((totals.discount / 100) * totals.gross_import))}</td>
                    </tr>
                    <tr key={"reserve_key_gross_import"} className="text-slate-400">
                      <td className="" colSpan={6}>{t("reserve.net_import")}</td>
                      <td className="" colSpan={1}>{formatPrice(totals.net_import)}</td>
                    </tr>
                  </tbody>
                </table>
                <label className="text-secondary text-xs mt-2">{t("reserve.table_glosary")}</label>
                <div className="flex flex-row justify-start items-start w-full h-auto overflow-hidden my-1  gap-x-6 mt-12">
                  <div className="flex flex-col justify-start itemst-start gap-x-6 w-full h-auto gap-y-2 sm:gap-y-1">
                    <label htmlFor="payment_status" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("reserve.payment_status")}</label>
                    <select name="payment_status" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary">

                      <option value={selectedReserve.payment_status}>{selectedReserve.payment_status == "PAID" ? t("reserve.PAID") : t("reserve.UNPAID")}</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-start itemst-start gap-x-6 w-full h-auto gap-y-2 sm:gap-y-1">
                    <label htmlFor="reserve_status" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("reserve.reserve_status")}</label>
                    <select name="reserve_status" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" >

                      <option value={selectedReserve.reserve_status}>{selectedReserve.reserve_status != "CONFIRMED" ? (selectedReserve.reserve_status != "NOT_CONFIRMED" ? t("reserve.COMPLETE") : t("reserve.NOT_CONFIRMED")) : t("reserve.CONFIRMED")}</option>
                    </select>
                  </div>

                </div>

                <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1  gap-y-2">

                  <label htmlFor="canceled_reason" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6 mb-2">{t("reserve.canceled")}</label>

                  <div className="checkbox-wrapper-13 px-2">
                    <input name="canceled_status" type="checkbox" aria-hidden="true" checked={selectedReserve.canceled_status} readOnly />
                    <label htmlFor="canceled_status">{t("reserve.canceled_reserve")}</label>
                  </div>
                  <textarea name="canceled_reason" className="w-full h-8 sm:h-20 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.canceled_reason")} value={selectedReserve.canceled_reason} readOnly />
                </div>

                <div className="flex flex-row justify-end gap-x-6 w-full mt-4">
                  <Button type="button" onClick={() => setCurrentView("L")} size="sm" variant="dark" effect="default" isRound={true}>{t("reserve.go_back_reserves_list")}</Button>
                </div>

              </div>
            </div>
          </motion.div>
        )}



        {currentView == "A" && (
          <motion.div
            key={"New-View"}
            initial="hidden"
            animate="show"
            exit="hidden"
            viewport={{ once: true }}
            variants={fadeIn("up", "", 0.5, 0.3)}
            className="w-full h-auto flex flex-col justify-start items-start gap-y-4">
            <h2 className="text-secondary text-2xl flex flex-row gap-x-4"><Calendar />{t("reserve.add_reserve")}</h2>

            <form id="form_create_reserve" className="w-full h-auto flex flex-col lg:flex-row gap-6 p-6" onSubmit={(e) => onSubmitCreation(e)}>

              <div className="flex flex-col justify-start items-start w-full">

                <div className="flex flex-col justify-start items-start w-full h-auto my-1 gap-y-2 sm:gap-y-1">
                  <label htmlFor="search_user_email" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("reserve.search_user")}</label>
                  <div className="w-full flex flex-row justify-start items-center gap-x-4">
                    <InputRadio
                      className="w-auto"
                      onClick={() => { setUserType("old") }}
                      name="category"
                      placeholder={t("reserve.user_old")}
                      rightIcon={<UserIcon />}
                      checked={userType === "old"}
                      readOnly
                    />
                    <InputRadio
                      className="w-auto"
                      onClick={() => { setUserType("new") }}
                      name="category"
                      placeholder={t("reserve.user_new")}
                      rightIcon={<UserPlus />}
                      checked={userType === "new"}
                      readOnly
                    />
                  </div>
                  {userType == "old" ?
                    <>
                      <div className="w-full h-auto flex flex-row justify-between gap-x-4 relative">
                        <input name="search_user_email" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.search_user")} />
                        <AnimatePresence>
                          {users && users.length > 0 && (
                            <motion.div
                              initial="hidden"
                              animate="show"
                              variants={fadeIn("up", "", 0, 0.3)}
                              className="absolute left-0 top-8 sm:top-10 w-full max-h-[100px] min-h-[50px] overflow-y-scroll flex flex-col justify-start items-start bg-white py-2">
                              {users.map((userItem, index) => {
                                return (
                                  <span onClick={() => selectUserId('form_create_reserve', userItem)} className="w-full h-auto text-sm font-primary text-secondary hover:bg-secondary hover:text-white duration-300 hover:cursor-pointer p-2" key={"user" + index}>{`${t("reserve.user")}: ${userItem.firstName},${userItem.lastName} ${t("reserve.email")}: ${userItem.email}`}</span>
                                )
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button type="button" onClick={() => searchUsersByEmail('form_create_reserve')} className="w-auto h-auto border border-2 border-slate-200 p-2 rounded-xl active:scale-95 duration-300"><Search /></button>
                      </div>
                      <label htmlFor="user_email" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("reserve.user")}</label>
                      <input name="user_email" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("user.user_email")} />
                      <div className="w-full h-6">
                        {errorMessages.user_email && (
                          <motion.p
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={fadeIn("up", "", 0, 1)}
                            className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                            {errorMessages.user_email}
                          </motion.p>
                        )}
                      </div>
                    </>
                    :
                    <div className="w-full h-auto grid grid-cols-2 gap-4">
                      <div className="col-span-1 flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1 gap-y-2 sm:gap-y-1">
                        <label htmlFor="user_email" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">{t("user.user_email")}</label>
                        <input name="user_email" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("user.user_email")} />
                        <div className="w-full h-6">
                          {errorMessages.user_email &&
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">{t(errorMessages.user_email)}
                            </motion.p>
                          }
                        </div>
                      </div>
                      <div className="col-span-1 flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1 gap-y-2 sm:gap-y-1">
                        <label htmlFor="firstName" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">{t("user.user_firstname")}</label>
                        <input name="firstName" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("user.user_firstname")} />
                        <div className="w-full h-6">
                          {errorMessages.name &&
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.name)}
                            </motion.p>
                          }
                        </div>
                      </div>
                      <div className="col-span-1 flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1 gap-y-2 sm:gap-y-1">
                        <label htmlFor="lastName" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">{t("user.user_lastname")}</label>
                        <input name="lastName" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("user.user_lastname")} />
                        <div className="w-full h-6">
                          {errorMessages.lastname &&
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.lastname)}
                            </motion.p>
                          }
                        </div>
                      </div>
                      <div className="col-span-1 flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1 gap-y-2 sm:gap-y-1">
                        <label htmlFor="phoneNumber" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">{t("user.user_cellphone")}</label>
                        <input name="phoneNumber" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("user.user_cellphone")} />
                        <div className="w-full h-6">
                          {errorMessages.cellphone &&
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.cellphone)}
                            </motion.p>
                          }
                        </div>
                      </div>
                      <div className="col-span-1 flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1 gap-y-2 sm:gap-y-1">
                        <label htmlFor="document_type" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">{t("user.user_document_type")}</label>
                        <select name="document_type" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary">
                          <option value="DNI">{t("user.DNI")}</option>
                          <option value="PASSPORT">{t("user.PASSPORT")}</option>
                        </select>
                        <div className="w-full h-6">
                          {errorMessages.document_type &&
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.document_type)}
                            </motion.p>
                          }
                        </div>
                      </div>
                      <div className="col-span-1 flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1 gap-y-2 sm:gap-y-1">
                        <label htmlFor="document_id" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">{t("user.user_document_id")}</label>
                        <input name="document_id" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("user.user_document_id")} />
                        <div className="w-full h-6">
                          {errorMessages.document_id &&
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.document_id)}
                            </motion.p>
                          }
                        </div>
                      </div>
                      <div className="col-span-1 flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1 gap-y-2 sm:gap-y-1">
                        <label htmlFor="nationality" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">{t("user.user_nationality")}</label>
                        <input name="nationality" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("user.user_nationality")} />
                        <div className="w-full h-6">
                          {errorMessages.nationality &&
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.nationality)}
                            </motion.p>
                          }
                        </div>
                      </div>
                    </div>
                  }

                </div>
                <div className="w-full h-auto flex flex-row justify-between mb-4">
                  <div className="w-[60%] xl:w-[40%] h-auto flex flex-row">
                    <select name="discount_code_selector" onChange={(e) => onChangeDiscountCode(e)} className="w-full xl:w-[50%] h-auto text-xs">
                      <option key={"no_discount_applied"} value={`${0}_${0}_${0}`}>{t("reserve.no_discount")}</option>
                      {datasetReservesOptions.discounts.map((discount, index) => {
                        return (
                          <option className="text-xs" key={index} value={`${discount.id}_${discount.code}_${discount.discount}`}>{`${t("reserve.discount_code")}: ${discount.code} | ${t("reserve.discount")}: ${formatPrice(discount.discount)}%`}</option>
                        )
                      })}
                    </select>
                  </div>
                  <Button type="button" onClick={() => setOpenReserveOption("tent")} variant="ghostLight" rightIcon={<Plus />} isRound={true} effect="default">{t("reserve.add_item")}</Button>
                </div>
                <table className="h-auto w-full shadow-xl rounded-xl text-center border-collapse table-fixed">
                  <thead className="font-primary text-xs xl:text-sm bg-secondary text-white rounded-t-xl">
                    <tr className="">
                      <th className="w-[5%] rounded-tl-xl py-2">#</th>
                      <th className="w-[35%] py-2">{t("reserve.item")}</th>
                      <th className="w-[10%] py-2">{t("reserve.unit")}</th>
                      <th className="w-[10%] py-2">{t("reserve.unit_price")}</th>
                      <th className="w-[10%] py-2">{t("reserve.qty")}</th>
                      <th className="w-[10%] py-2">{t("reserve.price")}</th>
                      <th className="w-[10%] py-2">{t("reserve.advanced")}</th>
                      <th className="w-[10%] py-2 rounded-tr-xl">{t("reserve.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="font-secondary text-xs xl:text-sm">

                    {extraItems.map((item, index) => (
                      <tr key={"reserve_key_extra_item_" + index} className="text-slate-400 ">
                        <td className="border border-slate-300 text-center">{index + 1}</td>
                        <td className="border border-slate-300 text-left">{item.name}</td>
                        <td className="border border-slate-300 text-center">{t("reserve.unit")}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price)}</td>
                        <td className="border border-slate-300 text-center">{item.quantity}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price * item.quantity)}</td>
                        <td className="border border-slate-300 text-center">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.advanced ?? 0}
                            onChange={(e) => handleAdvancedChange("extraItem", index, Number(e.target.value))}
                            className="w-full h-8 text-xs sm:text-sm font-tertiary px-2 border border-secondary rounded focus:outline-none focus:border-primary"
                          />
                        </td>
                        <td className="border border-slate-300 text-center">{<button onClick={() => handleRemoveReserveOption(index, "extraItem")} className="h-auto w-auto hover:text-tertiary"><CircleX /></button>}</td>
                      </tr>
                    ))}

                    {tents.map((item, index) => (
                      <tr key={"reserve_key_tent_" + index} className="text-slate-400 ">
                        <td className="border border-slate-300 text-center">{extraItems.length + index + 1}</td>
                        <td className="border border-slate-300 text-left">{`${item.name} | ${t("reserve.from")}: ${formatDateToYYYYMMDD(item.dateFrom)} ${t("reserve.to")}: ${formatDateToYYYYMMDD(item.dateTo)}${item.additional_people > 0 ? ` | ADP:${item.additional_people} ADPP: ${formatPrice(item.additional_people_price ?? 0)}` : ""}${item.kids > 0 ? ` | KDS:${item.kids}${item.kids_price ? ` KDPP: ${formatPrice(item.kids_price ?? 0)}` : ""}` : ""}`}</td>
                        <td className="border border-slate-300 text-center">{t("reserve.nights")}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price + ((item.additional_people_price ?? 0) * item.additional_people) + (item.kids_price ?? 0))}</td>
                        <td className="border border-slate-300 text-center">{item.nights}</td>
                        <td className="border border-slate-300 text-center">{formatPrice((item.price + (item.kids_price ?? 0) + ((item.additional_people_price ?? 0) * item.additional_people)) * item.nights)}</td>
                        <td className="border border-slate-300 text-center">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.advanced ?? 0}
                            onChange={(e) => handleAdvancedChange("tent", index, Number(e.target.value))}
                            className="w-full h-8 text-xs sm:text-sm font-tertiary px-2 border border-secondary rounded focus:outline-none focus:border-primary"
                          />
                        </td>
                        <td className="border border-slate-300 text-center">{<button onClick={() => handleRemoveReserveOption(index, "tent")} className="h-auto w-auto hover:text-tertiary"><CircleX /></button>}</td>
                      </tr>
                    ))}

                    {experiences.map((item, index) => (
                      <tr key={"reserve_key_experience_" + index} className="text-slate-400 ">
                        <td className="border border-slate-300 text-center">{extraItems.length + tents.length + index + 1}</td>
                        <td className="border border-slate-300 text-left">{`${item.name} | ${t("reserve.day_of_experience")} ${formatDateToYYYYMMDD(item.day)}`}</td>
                        <td className="border border-slate-300 text-center">{t("reserve.unit")}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price)}</td>
                        <td className="border border-slate-300 text-center">{item.quantity}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price * item.quantity)}</td>
                        <td className="border border-slate-300 text-center">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.advanced ?? 0}
                            onChange={(e) => handleAdvancedChange("experience", index, Number(e.target.value))}
                            className="w-full h-8 text-xs sm:text-sm font-tertiary px-2 border border-secondary rounded focus:outline-none focus:border-primary"
                          />
                        </td>
                        <td className="border border-slate-300 text-center">{<button onClick={() => handleRemoveReserveOption(index, "experience")} className="h-auto w-auto hover:text-tertiary"><CircleX /></button>}</td>
                      </tr>
                    ))}

                    {products.map((item, index) => (
                      <tr key={"reserve_key_product_" + index} className="text-slate-400 ">
                        <td className="border border-slate-300 text-center">{extraItems.length + tents.length + experiences.length + index + 1}</td>
                        <td className="border border-slate-300 text-left">{`${item.name}`}</td>
                        <td className="border border-slate-300 text-center">{t("reserve.unit")}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price)}</td>
                        <td className="border border-slate-300 text-center">{item.quantity}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price * item.quantity)}</td>
                        <td className="border border-slate-300 text-center">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.advanced ?? 0}
                            onChange={(e) => handleAdvancedChange("product", index, Number(e.target.value))}
                            className="w-full h-8 text-xs sm:text-sm font-tertiary px-2 border border-secondary rounded focus:outline-none focus:border-primary"
                          />
                        </td>
                        <td className="border border-slate-300 text-center">{<button onClick={() => handleRemoveReserveOption(index, "product")} className="h-auto w-auto hover:text-tertiary"><CircleX /></button>}</td>
                      </tr>
                    ))}
                    <tr key={"reserve_key_net_import"} className="text-slate-400">
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={6}>{t("reserve.gross_import")}</td>
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={2}>{formatPrice(totals.gross_import)}</td>
                    </tr>
                    <tr key={"reserve_key_advanced_total"} className="text-slate-400">
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={6}>{t("reserve.advanced_total")}</td>
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={2}>{formatPrice(totals.advanced_total)}</td>
                    </tr>
                    <tr key={"reserve_key_total"} className="text-slate-400">
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={6}>{t("reserve.discount")}</td>
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={2}>{formatPrice(((totals.discount / 100) * totals.gross_import))}</td>
                    </tr>
                    <tr key={"reserve_key_gross_import"} className="text-slate-400">
                      <td className="" colSpan={6}>{t("reserve.net_import")}</td>
                      <td className="" colSpan={2}>{formatPrice(totals.net_import)}</td>
                    </tr>
                  </tbody>
                </table>
                <label className="text-secondary text-xs mt-2">{t("reserve.table_glosary")}</label>
                <div className="w-full h-auto flex flex-col items-start justify-start gap-y-2 pt-2">
                  {errorMessages.gross_import &&
                    <motion.p
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      variants={fadeIn("up", "", 0, 1)}
                      className="h-auto text-[10px] sm:text-xs text-primary font-tertiary">
                      {t(errorMessages.gross_import)}
                    </motion.p>
                  }
                  {errorMessages.net_import &&
                    <motion.p
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      variants={fadeIn("up", "", 0, 1)}
                      className="h-auto text-[10px] sm:text-xs text-primary font-tertiary">
                      {t(errorMessages.net_import)}
                    </motion.p>
                  }
                </div>

                <div className="flex flex-row justify-start items-start w-full h-auto overflow-hidden my-1  gap-x-6 mt-12">
                  <div className="flex flex-col justify-start itemst-start gap-x-6 w-full h-auto gap-y-2 sm:gap-y-1">
                    <label htmlFor="payment_status" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("reserve.payment_status")}</label>
                    <select name="payment_status" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary">
                      <option value="UNPAID">{t("reserve.UNPAID")}</option>
                      <option value="PAID">{t("reserve.PAID")}</option>
                    </select>

                    <div className="w-full h-6">
                      {errorMessages.payment_status && (
                        <motion.p
                          initial="hidden"
                          animate="show"
                          exit="hidden"
                          variants={fadeIn("up", "", 0, 1)}
                          className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                          {errorMessages.payment_status}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-start itemst-start gap-x-6 w-full h-auto gap-y-2 sm:gap-y-1">
                    <label htmlFor="reserve_status" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("reserve.reserve_status")}</label>
                    <select name="reserve_status" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary">
                      <option value="CONFIRMED">{t("reserve.CONFIRMED")}</option>
                      <option value="NOT_CONFIRMED">{t("reserve.NOT_CONFIRMED")}</option>
                      <option value="COMPLETE">{t("reserve.COMPLETE")}</option>
                    </select>

                    <div className="w-full h-6">
                      {errorMessages.reserve_status && (
                        <motion.p
                          initial="hidden"
                          animate="show"
                          exit="hidden"
                          variants={fadeIn("up", "", 0, 1)}
                          className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                          {errorMessages.reserve_status}
                        </motion.p>
                      )}
                    </div>
                  </div>

                </div>

                <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1  gap-y-2">

                  <label htmlFor="canceled_reason" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6 mb-2">{t("reserve.canceled")}</label>

                  <div className="checkbox-wrapper-13 px-2">
                    <input name="canceled_status" type="checkbox" aria-hidden="true" />
                    <label htmlFor="canceled_status">{t("reserve.canceled_reserve")}</label>
                  </div>

                  <div className="w-full h-6">
                    {errorMessages.canceled_status && (
                      <motion.p
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        variants={fadeIn("up", "", 0, 1)}
                        className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                        {errorMessages.canceled_status}
                      </motion.p>
                    )}
                  </div>

                  <textarea name="canceled_reason" className="w-full h-8 sm:h-20 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.canceled_reason")} />

                  <div className="w-full h-6">
                    {errorMessages.canceled_reason && (
                      <motion.p
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        variants={fadeIn("up", "", 0, 1)}
                        className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                        {errorMessages.canceled_reason}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="flex flex-row justify-end gap-x-6 w-full">
                  <Button type="button" onClick={() => setCurrentView("L")} size="sm" variant="dark" effect="default" isRound={true}>{t("common.cancel")}</Button>
                  <Button type="submit" size="sm" variant="dark" effect="default" isRound={true} isLoading={loadingForm}>{t("reserve.create_reserve")}</Button>
                </div>

              </div>
            </form>
          </motion.div>
        )}

        {currentView == "E" && selectedReserve && (
          <motion.div
            key={"Edit-View"}
            initial="hidden"
            animate="show"
            exit="hidden"
            viewport={{ once: true }}
            variants={fadeIn("up", "", 0.5, 0.3)}
            className="w-full h-auto flex flex-col justify-start items-start gap-y-4">
            <h2 className="text-secondary text-2xl flex flex-row gap-x-4"><Calendar />{t("reserve.add_reserve")}</h2>
            <form id="form_update_reserve" className="w-full h-auto flex flex-col lg:flex-row gap-6 p-6" onSubmit={(e) => onSubmitUpdate(e)}>

              <div className="flex flex-col justify-start items-start w-full">

                <div className="flex flex-col justify-start items-start w-full h-auto my-1 gap-y-2 sm:gap-y-1">
                  <label htmlFor="search_user_email" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("reserve.search_user")}</label>
                  <div className="w-full flex flex-row justify-start items-center gap-x-4">
                    <InputRadio
                      className="w-auto"
                      onClick={() => { setUserType("old") }}
                      name="category"
                      placeholder={t("reserve.user_old")}
                      rightIcon={<UserIcon />}
                      checked={userType === "old"}
                      readOnly
                    />
                    <InputRadio
                      className="w-auto"
                      onClick={() => { setUserType("new") }}
                      name="category"
                      placeholder={t("reserve.user_new")}
                      rightIcon={<UserPlus />}
                      checked={userType === "new"}
                      readOnly
                    />
                  </div>
                  {userType == "old" ?
                    <>
                      <div className="w-full h-auto flex flex-row justify-between gap-x-4 relative">
                        <input name="search_user_email" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.search_user")} />
                        <AnimatePresence>
                          {users && users.length > 0 && (
                            <motion.div
                              initial="hidden"
                              animate="show"
                              variants={fadeIn("up", "", 0, 0.3)}
                              className="absolute left-0 top-8 sm:top-10 w-full max-h-[100px] min-h-[50px] overflow-y-scroll flex flex-col justify-start items-start bg-white py-2">
                              {users.map((userItem, index) => {
                                return (
                                  <span onClick={() => selectUserId('form_create_reserve', userItem)} className="w-full h-auto text-sm font-primary text-secondary hover:bg-secondary hover:text-white duration-300 hover:cursor-pointer p-2" key={"user" + index}>{`${t("reserve.user")}: ${userItem.firstName},${userItem.lastName} ${t("reserve.email")}: ${userItem.email}`}</span>
                                )
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button type="button" onClick={() => searchUsersByEmail('form_create_reserve')} className="w-auto h-auto border border-2 border-slate-200 p-2 rounded-xl active:scale-95 duration-300"><Search /></button>
                      </div>
                      <label htmlFor="user_email" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("user.user_email")}</label>
                      <input name="user_email" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.user_selected")} value={`${selectedReserve.user_email ?? ""}`} readOnly />

                      <div className="w-full h-6">
                        {errorMessages.user_email && (
                          <motion.p
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={fadeIn("up", "", 0, 1)}
                            className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                            {errorMessages.user_email}
                          </motion.p>
                        )}
                      </div>
                    </>
                    :
                    <div className="w-full h-auto grid grid-cols-2 gap-4">
                      <div className="col-span-1 flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1 gap-y-2 sm:gap-y-1">
                        <label htmlFor="user_email" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">{t("user.user_email")}</label>
                        <input name="user_email" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("user.user_email")} value={selectedReserve?.user_email} onChange={(e) => onChangeSelectedReserve(e)} />
                        <div className="w-full h-6">
                          {errorMessages.user_email &&
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">{t(errorMessages.user_email)}
                            </motion.p>
                          }
                        </div>
                      </div>
                      <div className="col-span-1 flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1 gap-y-2 sm:gap-y-1">
                        <label htmlFor="firstName" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">{t("user.user_firstname")}</label>
                        <input name="firstName" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("user.user_firstname")} />
                        <div className="w-full h-6">
                          {errorMessages.name &&
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.name)}
                            </motion.p>
                          }
                        </div>
                      </div>
                      <div className="col-span-1 flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1 gap-y-2 sm:gap-y-1">
                        <label htmlFor="lastName" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">{t("user.user_lastname")}</label>
                        <input name="lastName" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("user.user_lastname")} />
                        <div className="w-full h-6">
                          {errorMessages.lastname &&
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.lastname)}
                            </motion.p>
                          }
                        </div>
                      </div>
                      <div className="col-span-1 flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1 gap-y-2 sm:gap-y-1">
                        <label htmlFor="phoneNumber" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">{t("user.user_cellphone")}</label>
                        <input name="phoneNumber" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("user.user_cellphone")} />
                        <div className="w-full h-6">
                          {errorMessages.cellphone &&
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.cellphone)}
                            </motion.p>
                          }
                        </div>
                      </div>
                      <div className="col-span-1 flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1 gap-y-2 sm:gap-y-1">
                        <label htmlFor="document_type" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">{t("user.user_document_type")}</label>
                        <select name="document_type" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary">
                          <option value="DNI">{t("user.DNI")}</option>
                          <option value="PASSPORT">{t("user.PASSPORT")}</option>
                        </select>
                        <div className="w-full h-6">
                          {errorMessages.document_type &&
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.document_type)}
                            </motion.p>
                          }
                        </div>
                      </div>
                      <div className="col-span-1 flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1 gap-y-2 sm:gap-y-1">
                        <label htmlFor="document_id" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">{t("user.user_document_id")}</label>
                        <input name="document_id" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("user.user_document_id")} />
                        <div className="w-full h-6">
                          {errorMessages.document_id &&
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.document_id)}
                            </motion.p>
                          }
                        </div>
                      </div>
                      <div className="col-span-1 flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1 gap-y-2 sm:gap-y-1">
                        <label htmlFor="nationality" className="font-primary text-secondary text-xs xl:text-lg h-3 sm:h-6">{t("user.user_nationality")}</label>
                        <input name="nationality" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("user.user_nationality")} />
                        <div className="w-full h-6">
                          {errorMessages.nationality &&
                            <motion.p
                              initial="hidden"
                              animate="show"
                              exit="hidden"
                              variants={fadeIn("up", "", 0, 1)}
                              className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                              {t(errorMessages.nationality)}
                            </motion.p>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
                <div className="w-full h-auto flex flex-row justify-between mb-4">
                  <div className="w-[60%] xl:w-[40%] h-auto flex flex-row">
                    <select name="discount_code_selector" value={`${selectedReserve.discount_code_id}_${selectedReserve.discount_code_name}_${selectedReserve.discount}`} onChange={(e) => onChangeDiscountCode(e)} className="w-full xl:w-[50%] h-auto text-xs">
                      <option key={"no_discount_applied"} value={`${0}_${0}_${0}`}>{t("reserve.no_discount")}</option>
                      {datasetReservesOptions.discounts.map((discount, index) => {
                        return (
                          <option className="text-xs" key={index} value={`${discount.id}_${discount.code}_${discount.discount}`}>{`${t("reserve.discount_code")}: ${discount.code} | ${t("reserve.discount")}: ${formatPrice(discount.discount)}%`}</option>
                        )
                      })}
                    </select>
                  </div>
                  <Button type="button" onClick={() => setOpenReserveOption("tent")} variant="ghostLight" rightIcon={<Plus />} isRound={true} effect="default">{t("reserve.add_item")}</Button>
                </div>
                <table className="h-auto w-full shadow-xl rounded-xl text-center border-collapse table-fixed">
                  <thead className="font-primary text-xs xl:text-sm bg-secondary text-white rounded-t-xl">
                    <tr className="">
                      <th className="w-[5%] rounded-tl-xl py-2">#</th>
                      <th className="w-[35%] py-2">{t("reserve.item")}</th>
                      <th className="w-[10%] py-2">{t("reserve.unit")}</th>
                      <th className="w-[10%] py-2">{t("reserve.unit_price")}</th>
                      <th className="w-[10%] py-2">{t("reserve.qty")}</th>
                      <th className="w-[10%] py-2">{t("reserve.price")}</th>
                      <th className="w-[10%] py-2">{t("reserve.advanced")}</th>
                      <th className="w-[10%] py-2 rounded-tr-xl">{t("reserve.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="font-secondary text-xs xl:text-sm">

                    {extraItems.map((item, index) => (
                      <tr key={"reserve_key_extra_item_" + index} className="text-slate-400 ">
                        <td className="border border-slate-300 text-center">{index + 1}</td>
                        <td className="border border-slate-300 text-left">{item.name}</td>
                        <td className="border border-slate-300 text-center">{t("reserve.unit")}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price)}</td>
                        <td className="border border-slate-300 text-center">{item.quantity}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price * item.quantity)}</td>
                        <td className="border border-slate-300 text-center">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.advanced ?? 0}
                            onChange={(e) => handleAdvancedChange("extraItem", index, Number(e.target.value))}
                            className="w-full h-8 text-xs sm:text-sm font-tertiary px-2 border border-secondary rounded focus:outline-none focus:border-primary"
                          />
                        </td>
                        <td className="border border-slate-300 text-center">{<button onClick={() => handleRemoveReserveOption(index, "extraItem")} className="h-auto w-auto hover:text-tertiary"><CircleX /></button>}</td>
                      </tr>
                    ))}

                    {tents.map((item, index) => (
                      <tr key={"reserve_key_tent_" + index} className="text-slate-400 ">
                        <td className="border border-slate-300 text-center">{extraItems.length + index + 1}</td>
                        <td className="border border-slate-300 text-left">{`${item.name} | ${t("reserve.from")}: ${formatDateToYYYYMMDD(item.dateFrom)} ${t("reserve.to")}: ${formatDateToYYYYMMDD(item.dateTo)}${item.additional_people > 0 ? ` | ADP:${item.additional_people} ADPP: ${formatPrice(item.additional_people_price ?? 0)}` : ""}${item.kids > 0 ? ` | KDS:${item.kids}${item.kids_price ? ` KDPP: ${formatPrice(item.kids_price ?? 0)}` : ""}` : ""}`}</td>
                        <td className="border border-slate-300 text-center">{t("reserve.nights")}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price + ((item.additional_people_price ?? 0) * item.additional_people) + (item.kids_price ?? 0))}</td>
                        <td className="border border-slate-300 text-center">{item.nights}</td>
                        <td className="border border-slate-300 text-center">{formatPrice((item.price + (item.kids_price ?? 0) + ((item.additional_people_price ?? 0) * item.additional_people)) * item.nights)}</td>
                        <td className="border border-slate-300 text-center">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.advanced ?? 0}
                            onChange={(e) => handleAdvancedChange("tent", index, Number(e.target.value))}
                            className="w-full h-8 text-xs sm:text-sm font-tertiary px-2 border border-secondary rounded focus:outline-none focus:border-primary"
                          />
                        </td>
                        <td className="border border-slate-300 text-center">{<button onClick={() => handleRemoveReserveOption(index, "tent")} className="h-auto w-auto hover:text-tertiary"><CircleX /></button>}</td>
                      </tr>
                    ))}

                    {experiences.map((item, index) => (
                      <tr key={"reserve_key_experience_" + index} className="text-slate-400 ">
                        <td className="border border-slate-300 text-center">{extraItems.length + tents.length + index + 1}</td>
                        <td className="border border-slate-300 text-left">{`${item.name} | ${t("reserve.day_of_experience")} ${formatDateToYYYYMMDD(item.day)}`}</td>
                        <td className="border border-slate-300 text-center">{t("reserve.unit")}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price)}</td>
                        <td className="border border-slate-300 text-center">{item.quantity}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price * item.quantity)}</td>
                        <td className="border border-slate-300 text-center">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.advanced ?? 0}
                            onChange={(e) => handleAdvancedChange("experience", index, Number(e.target.value))}
                            className="w-full h-8 text-xs sm:text-sm font-tertiary px-2 border border-secondary rounded focus:outline-none focus:border-primary"
                          />
                        </td>
                        <td className="border border-slate-300 text-center">{<button onClick={() => handleRemoveReserveOption(index, "experience")} className="h-auto w-auto hover:text-tertiary"><CircleX /></button>}</td>
                      </tr>
                    ))}

                    {products.map((item, index) => (
                      <tr key={"reserve_key_product_" + index} className="text-slate-400 ">
                        <td className="border border-slate-300 text-center">{extraItems.length + tents.length + experiences.length + index + 1}</td>
                        <td className="border border-slate-300 text-left">{`${item.name}`}</td>
                        <td className="border border-slate-300 text-center">{t("reserve.unit")}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price)}</td>
                        <td className="border border-slate-300 text-center">{item.quantity}</td>
                        <td className="border border-slate-300 text-center">{formatPrice(item.price * item.quantity)}</td>
                        <td className="border border-slate-300 text-center">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.advanced ?? 0}
                            onChange={(e) => handleAdvancedChange("product", index, Number(e.target.value))}
                            className="w-full h-8 text-xs sm:text-sm font-tertiary px-2 border border-secondary rounded focus:outline-none focus:border-primary"
                          />
                        </td>
                        <td className="border border-slate-300 text-center">{<button onClick={() => handleRemoveReserveOption(index, "product")} className="h-auto w-auto hover:text-tertiary"><CircleX /></button>}</td>
                      </tr>
                    ))}
                    <tr key={"reserve_key_net_import"} className="text-slate-400">
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={6}>{t("reserve.gross_import")}</td>
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={2}>{formatPrice(totals.gross_import)}</td>
                    </tr>
                    <tr key={"reserve_key_advanced_total"} className="text-slate-400">
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={6}>{t("reserve.advanced_total")}</td>
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={2}>{formatPrice(totals.advanced_total)}</td>
                    </tr>
                    <tr key={"reserve_key_total"} className="text-slate-400">
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={6}>{t("reserve.discount")}</td>
                      <td className="border-[1px] border-t-secondary border-b-secondary" colSpan={2}>{formatPrice(((totals.discount / 100) * totals.gross_import))}</td>
                    </tr>
                    <tr key={"reserve_key_gross_import"} className="text-slate-400">
                      <td className="" colSpan={6}>{t("reserve.net_import")}</td>
                      <td className="" colSpan={2}>{formatPrice(totals.net_import)}</td>
                    </tr>
                  </tbody>
                </table>
                <label className="text-secondary text-xs mt-2">{t("reserve.table_glosary")}</label>
                <div className="flex flex-row justify-start items-start w-full h-auto overflow-hidden my-1  gap-x-6 mt-12">
                  <div className="flex flex-col justify-start itemst-start gap-x-6 w-full h-auto gap-y-2 sm:gap-y-1">
                    <label htmlFor="payment_status" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("reserve.payment_status")}</label>
                    <select name="payment_status" value={selectedReserve.payment_status} onChange={(e) => onChangeSelectedReserve(e)} className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary">
                      <option value="UNPAID">{t("reserve.UNPAID")}</option>
                      <option value="PAID">{t("reserve.PAID")}</option>
                    </select>

                    <div className="w-full h-6">
                      {errorMessages.payment_status && (
                        <motion.p
                          initial="hidden"
                          animate="show"
                          exit="hidden"
                          variants={fadeIn("up", "", 0, 1)}
                          className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                          {errorMessages.payment_status}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-start itemst-start gap-x-6 w-full h-auto gap-y-2 sm:gap-y-1">
                    <label htmlFor="reserve_status" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("reserve.reserve_status")}</label>
                    <select name="reserve_status" value={selectedReserve.reserve_status} onChange={(e) => onChangeSelectedReserve(e)} className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary">
                      <option value="CONFIRMED">{t("reserve.CONFIRMED")}</option>
                      <option value="NOT_CONFIRMED">{t("reserve.NOT_CONFIRMED")}</option>
                      <option value="COMPLETE">{t("reserve.COMPLETE")}</option>
                    </select>

                    <div className="w-full h-6">
                      {errorMessages.reserve_status && (
                        <motion.p
                          initial="hidden"
                          animate="show"
                          exit="hidden"
                          variants={fadeIn("up", "", 0, 1)}
                          className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                          {errorMessages.reserve_status}
                        </motion.p>
                      )}
                    </div>
                  </div>

                </div>

                <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1  gap-y-2">

                  <label htmlFor="canceled_reason" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6 mb-2">{t("reserve.canceled")}</label>

                  <div className="checkbox-wrapper-13 px-2">
                    <input name="canceled_status" type="checkbox" aria-hidden="true" checked={selectedReserve.canceled_status} onChange={(e) => onChangeSelectedReserve(e)} />
                    <label htmlFor="canceled_status">{t("reserve.canceled_reserve")}</label>
                  </div>

                  <div className="w-full h-6">
                    {errorMessages.canceled_status && (
                      <motion.p
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        variants={fadeIn("up", "", 0, 1)}
                        className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                        {errorMessages.canceled_status}
                      </motion.p>
                    )}
                  </div>

                  <textarea name="canceled_reason" className="w-full h-8 sm:h-20 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.canceled_reason")} value={selectedReserve.canceled_reason} onChange={(e) => onChangeSelectedReserve(e)} />

                  <div className="w-full h-6">
                    {errorMessages.canceled_reason && (
                      <motion.p
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        variants={fadeIn("up", "", 0, 1)}
                        className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">
                        {errorMessages.canceled_reason}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="flex flex-row justify-end gap-x-6 w-full">
                  <Button type="button" onClick={() => setCurrentView("L")} size="sm" variant="dark" effect="default" isRound={true}>{t("common.cancel")}</Button>
                  <Button type="submit" size="sm" variant="dark" effect="default" isRound={true} isLoading={loadingForm}>{t("reserve.update_reserve")}</Button>
                </div>

              </div>
            </form>
          </motion.div>
        )}

      </AnimatePresence>
    </Dashboard>
  )
}

export default DashboardAdminReserves;
