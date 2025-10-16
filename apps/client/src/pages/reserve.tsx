import { ChangeEvent, useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip'
import ChevronLeftIcon from "../assets/images/svg/chevron-left.svg?react";
import ChevronRightIcon from "../assets/images/svg/chevron-right.svg?react";
import Coins from "../assets/images/svg/coins.svg?react";
import FlameKindlingIcon from "../assets/images/svg/flame-kindling.svg?react";
import List from "../assets/images/svg/list.svg?react";
import Pizza from "../assets/images/svg/pizza.svg?react";
import Tent from "../assets/images/svg/tent.svg?react";
import User from "../assets/images/svg/user.svg?react";

import ShopNavbar from "../components/ShopNavbar";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import SectionHeader from "../components/SectionHeader";
import { useAuth } from '../contexts/AuthContext';
import { formatPrice, formatDateToYYYYMMDD, formatDate, computeTentNightly } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { createReserve, validateDiscountCode } from '../db/actions/reservation';
import { DiscountCode, ReserveFormData } from '../lib/interfaces';
import { motion } from 'framer-motion';
import { fadeIn } from '../lib/motions';
import { userInfoReserveSchema } from '../db/schemas';
import { ZodError } from 'zod';

const Reservation: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { cart, getTotalNights, getTotalCost, addDiscountCode, cleanCart, checkDates } = useCart();
  const navigate = useNavigate();
  const [discountCode, setDiscountCode] = useState<DiscountCode>({ id: 0, code: "", discount: 0 });
  const [loadingDiscountCode, setLoadingDiscountcode] = useState<boolean>(false);
  const [loadingReserve, setLoadingReserve] = useState<boolean>(false);

  useEffect(() => {
    if (cart.discount && cart.discount.id != 0) {
      setDiscountCode(cart.discount);
    }
  }, [])


  const handleDiscountCode = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDiscountCode((prevDiscountCode) => ({
      ...prevDiscountCode,
      code: value.trim(),
    }));
  };

  const ValidateDiscountCodeHandler = async () => {
    setLoadingDiscountcode(true)
    if (discountCode.code.length <= 0) {
      toast.error(t("reserve.provide_valid_code"));
    }

    const discountValidated = await validateDiscountCode(discountCode.code, i18n.language);
    if (discountValidated !== null) {
      addDiscountCode(discountValidated);
      setDiscountCode(discountValidated);
    }
    setLoadingDiscountcode(false);
  }

  const goToRoute = (route: string, state?: any) => {
    navigate(route, { state: { from: location.pathname, ...state } });
  };

  const onSubmitCreateReserve = async () => {
    setLoadingReserve(true);

    const data: ReserveFormData = {
      tents: cart.tents,
      products: cart.products,
      experiences: cart.experiences,
      discount_code_id: discountCode.id,
    }

    if (user == null) {
      const fieldsValidated = validateFields();

      if (fieldsValidated != null) {
        data.user_email = fieldsValidated.email;
        data.user_firstname = fieldsValidated.firstName;
        data.user_lastname = fieldsValidated.lastName;
        data.user_phone_number = fieldsValidated.phoneNumber;
        data.user_document_type = fieldsValidated.document_type;
        data.user_document_id = fieldsValidated.document_id;
        data.eta = fieldsValidated.eta;
      } else {
        setLoadingReserve(false);
        return;
      }

    } else {

      const form = document.getElementById("user_information") as HTMLFormElement;
      const eta = new Date((form.querySelector('input[name="eta"]') as HTMLInputElement).value);
      data.user_email = user.email;
      data.user_firstname = user.firstName;
      data.user_lastname = user.lastName;
      data.user_phone_number = user.phoneNumber;
      data.eta = eta;
    }

    const responseReserve = await createReserve(data, i18n.language);


    if (responseReserve !== null) {
      setLoadingReserve(false);
      cleanCart();
      sessionStorage.setItem("reserve_summary", JSON.stringify(responseReserve));

      goToRoute("/reserve-processing", responseReserve);
    }

    setLoadingReserve(false);
  }

  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});

  const validateFields = (): { firstName: string, lastName: string, email: string, phoneNumber: string, document_type: string, document_id: string, eta: Date } | null => {
    const form = document.getElementById("user_information") as HTMLFormElement;
    const firstName = (form.querySelector('input[name="firstName"]') as HTMLInputElement).value;
    const lastName = (form.querySelector('input[name="lastName"]') as HTMLInputElement).value;
    const email = (form.querySelector('input[name="email"]') as HTMLInputElement).value;
    const phoneNumber = (form.querySelector('input[name="phoneNumber"]') as HTMLInputElement).value;
    const document_type = (form.querySelector('select[name="document_type"]') as HTMLInputElement).value;
    const document_id = (form.querySelector('input[name="document_id"]') as HTMLInputElement).value;
    const eta = (form.querySelector('input[name="eta"]') as HTMLInputElement).value;
    const eta_date = new Date();
    // Split the eta value into hours and minutes
    const [hours, minutes] = eta.split(':').map(Number);

    // Set the hours and minutes on the today date object
    eta_date.setHours(hours, minutes, 0, 0);

    setErrorMessages({});

    try {

      userInfoReserveSchema.parse({ email, firstName, lastName, phoneNumber, document_type, document_id });

      return {
        firstName,
        lastName,
        email,
        phoneNumber,
        document_type,
        document_id,
        eta: eta_date
      };

    } catch (error) {
      console.log(error);
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

  return (
    <>
      <div className="w-full min-h-screen relative flex flex-row overflow-x-hidden">
        <SectionHeader identifier="payment" />
        <ShopNavbar variant="dark" />
        <div className={`relative w-full h-full flex flex-col  sm:px-16 px-4 sm:py-16 py-10`}>
          <div className="flex flex-row w-full h-auto gap-x-4 mt-36 sm:mt-24 2xl:mt-auto">
            <button onClick={() => goToRoute("/extras")} className="rounded-full h-8 sm:h-12 w-8 sm:w-12 bg-white border-2 border-secondary text-secondary duration-300 transition-all hover:bg-secondary group active:scale-95 ">
              <ChevronLeftIcon className="h-full w-full group-hover:text-white" />
            </button>
            <h1 className="font-primary text-secondary  text-2xl sm:text-6xl">{t("reserve.reserve")}</h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-auto">
            <div className="flex flex-col justify-start items-start col-span-1 pt-10 sm:pt-16  sm:px-8 gap-y-4 text-tertiary">
              {user == null ?
                (

                  <form id="user_information" className="w-full h-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <h1 className="sm:col-span-2 text-xl inline-flex gap-x-2"><User />{t("reserve.user_info_header")}</h1>
                    <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden gap-y-2  sm:gap-y-1">
                      <label htmlFor="FirstName" className="font-primary text-secondary text-xs sm:text-lg h-auto sm:h-6">{t("reserve.firstname")}</label>
                      <input name="firstName" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.firstname")} />
                      <div className="w-full h-6">
                        {errorMessages.firstName &&
                          <motion.p
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={fadeIn("up", "", 0, 1)}
                            className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">{t(errorMessages.firstName)}
                          </motion.p>
                        }
                      </div>
                    </div>

                    <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden gap-y-2 sm:gap-y-1">
                      <label htmlFor="lastName" className="font-primary text-secondary text-xs sm:text-lg h-auto sm:h-6">{t("reserve.lastname")}</label>
                      <input name="lastName" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.lastname")} />
                      <div className="w-full h-6">
                        {errorMessages.lastName &&
                          <motion.p
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={fadeIn("up", "", 0, 1)}
                            className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">{t(errorMessages.lastName)}
                          </motion.p>
                        }
                      </div>
                    </div>

                    <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden gap-y-2 sm:gap-y-1">
                      <label htmlFor="email" className="font-primary text-secondary text-xs sm:text-lg h-3 sm:h-6">{t("common.email")}</label>
                      <input name="email" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("common.email")} />
                      <div className="w-full h-6">
                        {errorMessages.email &&
                          <motion.p
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={fadeIn("up", "", 0, 1)}
                            className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">{t(errorMessages.email)}
                          </motion.p>
                        }
                      </div>
                    </div>

                    <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden gap-y-2 sm:gap-y-1">
                      <label htmlFor="phoneNumber" className="font-primary text-secondary text-xs sm:text-lg h-auto sm:h-6">{t("reserve.phone")}</label>
                      <input name="phoneNumber" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.phone")} />
                      <div className="w-full h-6">
                        {errorMessages.phoneNumber &&
                          <motion.p
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={fadeIn("up", "", 0, 1)}
                            className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">{t(errorMessages.phoneNumber)}
                          </motion.p>
                        }
                      </div>
                    </div>

                    <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden gap-y-2 sm:gap-y-1">
                      <label htmlFor="document_type" className="font-primary text-secondary text-xs sm:text-lg h-auto sm:h-6">{t("reserve.document_type")}</label>
                      <select name="document_type" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary">
                        <option value="DNI">{t("reserve.DNI")}</option>
                        <option value="Passport">{t("reserve.Passport")}</option>
                      </select>
                      <div className="w-full h-6">
                        {errorMessages.document_type &&
                          <motion.p
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={fadeIn("up", "", 0, 1)}
                            className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">{t(errorMessages.document_type)}
                          </motion.p>
                        }
                      </div>
                    </div>

                    <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden gap-y-2 sm:gap-y-1">
                      <label htmlFor="document_id" className="font-primary text-secondary text-xs sm:text-lg h-auto sm:h-6">{t("reserve.document_id")}</label>
                      <input name="document_id" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.document_id")} />
                      <div className="w-full h-6">
                        {errorMessages.document_id &&
                          <motion.p
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={fadeIn("up", "", 0, 1)}
                            className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">{t(errorMessages.document_id)}
                          </motion.p>
                        }
                      </div>
                    </div>

                    <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden gap-y-2 sm:gap-y-1 col-span-1 sm:col-span-2">
                      <label htmlFor="eta" className="font-primary text-secondary text-xs sm:text-lg h-auto sm:h-6">{t("reserve.eta")}</label>
                      <input name="eta" type="time" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.eta")} />
                      <div className="w-full h-6">
                        {errorMessages.eta &&
                          <motion.p
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={fadeIn("up", "", 0, 1)}
                            className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">{t(errorMessages.eta)}
                          </motion.p>
                        }
                      </div>
                    </div>
                  </form>
                )
                :
                <form id="user_information" className="w-full h-auto flex flex-col gap-4">
                  <h1 className="sm:col-span-2 text-xl inline-flex gap-x-2"><User />{t("reserve.user_info_header")}</h1>
                  <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden gap-y-2 sm:gap-y-1">
                    <label htmlFor="eta" className="font-primary text-secondary text-xs sm:text-lg h-auto sm:h-6">{t("reserve.eta")}</label>
                    <input name="eta" type="time" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.eta")} />
                    <div className="w-full h-6">
                      {errorMessages.eta &&
                        <motion.p
                          initial="hidden"
                          animate="show"
                          exit="hidden"
                          variants={fadeIn("up", "", 0, 1)}
                          className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">{t(errorMessages.eta)}
                        </motion.p>
                      }
                    </div>
                  </div>
                </form>
              }
              <span className="flex flex-row items-end gap-x-2">
                <List className="h-8 w-8" />
                <h2 className="text-2xl">{t("reserve.summary")}</h2>
              </span>
              <div className="w-full h-auto flex flex-col gap-y-3">
                <div className='w-auto h-auto gap-x-2 flex flex-row items-end'>
                  <span className="text-lg font-primary text-secondary">{t("reserve.number_nights")}:</span>
                  <span className="text-md font-secondary">{getTotalNights()}</span>
                </div>
                <div className='w-auto h-auto gap-x-2 flex flex-row items-end'>
                  <span className="text-lg font-primary text-secondary">Desde:</span>
                  <span className="text-md font-secondary">
                    {formatDate(checkDates.checkin)}
                  </span>
                </div>
                <div className='w-auto h-auto gap-x-2 flex flex-row items-end'>
                  <span className="text-lg font-primary text-secondary">Hasta:</span>
                  <span className="text-md font-secondary">
                    {formatDate(checkDates.checkout)}
                  </span>
                </div>
              </div>

              {cart.tents.length > 0 && (
                <>
                  <span className="flex flex-row items-end gap-x-2">
                    <Tent className="h-5 w-5" />
                    <h2 className="text-lg">Glampings</h2>
                  </span>

                  <div className="w-full h-auto flex flex-col gap-y-3">
                    {cart.tents.map((tentCart, index) => {
                      const { nightly, kidsBundleApplies, effectiveExtraAdults } = computeTentNightly(tentCart);
                      const nights = tentCart.nights || 0;
                      const lineTotal = nightly * nights;

                      return (
                        <div
                          key={`reserve_tent_cart_${index}`}
                          className="flex w-full gap-4 border-2 border-slate-200 rounded-lg shadow-sm p-4"
                        >
                          {/* Left: info */}
                          <div className="flex-1 flex flex-col">
                            <span className="text-sm text-secondary">{t("reserve.glamping")}</span>
                            <span className="text-sm font-medium">{tentCart.name}</span>

                            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                              <div className="flex gap-2">
                                <span className="text-secondary">{t("reserve.nights")}:</span>
                                <span className="mt-auto">{nights}</span>
                              </div>

                              <div className="flex gap-2">
                                <span className="text-secondary">{t("reserve.unit_price")}:</span>
                                <span className="mt-auto">{formatPrice(tentCart.price)}</span>
                              </div>

                              {/* Adults extra (effective) */}
                              {effectiveExtraAdults > 0 && (
                                <div className="flex gap-2 col-span-2">
                                  <span className="text-secondary">{t("glampings.aditional_people")}:</span>
                                  <span className="mt-auto">
                                    {effectiveExtraAdults} × {formatPrice(tentCart.additional_people_price || 0)} / {t("reserve.night")}
                                  </span>
                                </div>
                              )}

                              {/* Kids bundle (only if it applies) */}
                              {kidsBundleApplies && (
                                <div className="flex gap-2 col-span-2">
                                  <span className="text-secondary">{t("booking.kids_bundle")}:</span>
                                  <span className="mt-auto">
                                    {formatPrice(tentCart.kidsBundlePrice || 0)} / {t("reserve.night")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: total */}
                          <div className="flex flex-col items-end min-w-[110px]">
                            <span className="text-xs text-secondary">{t("reserve.nightly_total")}</span>
                            <span className="text-sm font-medium">{formatPrice(nightly)}</span>

                            <span className="mt-2 text-xs text-secondary">{t("reserve.subtotal")}</span>
                            <span className="text-base font-semibold">{formatPrice(lineTotal)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              {cart.experiences.length > 0 && (
                <>
                  <span className="flex flex-row items-end gap-x-2">
                    <FlameKindlingIcon className="h-5 w-5" />
                    <h2 className="text-lg">{t("reserve.experiences")}</h2>
                  </span>
                  <div className="w-full h-auto flex flex-col gap-y-3">
                    {cart.experiences.map((experienceCart, index) => {
                      return (
                        <div key={`reserve_experience_cart_${index}`} className="flex flex-row w-full h-auto border-2 border-slate-200 rounded-lg shadow-sm p-4">
                          <div className="flex flex-col h-full w-auto">
                            <span className="text-sm text-secondary"></span><span className="text-sm mt-auto">{experienceCart.name}</span>
                            <div className="flex flex-row gap-x-2"><span className="text-xs text-secondary">{t("reserve.quantity")} :</span><span className="text-xs mt-auto">{experienceCart.quantity}</span></div>
                            <div className="flex flex-row gap-x-2"><span className="text-xs text-secondary">{t("reserve.unit_price")}:</span><span className="text-xs mt-auto">{formatPrice(experienceCart.price)}</span></div>
                            <div className="flex flex-row gap-x-2"><span className="text-xs text-secondary">{t("reserve.day")} :</span><span className="text-xs mt-auto">{formatDateToYYYYMMDD(experienceCart.day)}</span></div>
                          </div>
                          <div className="flex flex-col items-end h-full w-[20%] ml-auto">
                            <span>{formatPrice(experienceCart.quantity * experienceCart.price)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
              {cart.products.length > 0 && (
                <>
                  <span className="flex flex-row items-end gap-x-2">
                    <Pizza className="h-5 w-5" />
                    <h2 className="text-lg">{t("reserve.products")}</h2>
                  </span>
                  <div className="w-full h-auto flex flex-col gap-y-3">
                    {cart.products.map((productCart, index) => {
                      return (
                        <div key={`reserve_product_cart_${index}`} className="flex flex-row w-full h-auto border-2 border-slate-200 rounded-lg shadow-sm p-4">
                          <div className="flex flex-col h-full w-auto">
                            <span className="text-sm text-secondary"></span><span className="text-sm mt-auto">{productCart.name}</span>
                            <div className="flex flex-row gap-x-2"><span className="text-xs text-secondary">{t("reserve.quantity")} :</span><span className="text-xs mt-auto">{productCart.quantity}</span></div>
                            <div className="flex flex-row gap-x-2"><span className="text-xs text-secondary">{t("reserve.unit_price")}:</span><span className="text-xs mt-auto">{formatPrice(productCart.price)}</span></div>
                          </div>
                          <div className="flex flex-col items-end h-full w-[20%] ml-auto">
                            <span>{formatPrice(productCart.quantity * productCart.price)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col justify-start items-start col-span-1 pt-12 sm:pt-16 sm:px-8 gap-y-4 text-secondary">
              <div className="w-full 2xl:w-[50%] h-auto flex flex-col justify-start items-start gap-y-2 rounded-xl border-2 border-slate-200 p-4 shadow-sm">
                <span className="flex flex-row items-end gap-x-2 mb-2">
                  <Coins className="h-6 w-6" />
                </span>
                <div className="w-full h-auto flex flex-row justify-between">
                  <h3 className="text-tertiary">{t("reserve.total_amount")}</h3>
                  <span>{formatPrice(getTotalCost())}</span>
                </div>
                <div className="w-full h-auto flex flex-col justify-between gap-y-2">
                  <label className="text-xs">{t("reserve.apply_discount_code")}</label>
                  <div className="w-full h-auto flex flex-row justify-between gap-x-4">
                    <input name="reserve_discount_code" value={discountCode.code} onChange={(e) => handleDiscountCode(e)} className="w-auto border-2 border-secondary rounded-lg px-2 text-sm" placeholder={t("reserve.CODE")} />
                    <button onClick={() => ValidateDiscountCodeHandler()} className="w-[30%] rounded-full h-8 bg-tertiary text-white hover:text-secondary hover:bg-white hover:border-2 hover:border-primary duration-300 transition-all active:scale-95 text-sm" disabled={loadingDiscountCode}>{t("reserve.apply")}</button>
                  </div>
                </div>
                <div className="w-full h-auto flex flex-row justify-between">
                  <h3>{t("reserve.discount")}</h3>
                  <span>{`${discountCode.discount}%`}</span>
                </div>
                <div className="w-full h-auto flex flex-row justify-between mt-2">
                  <h3>{t("reserve.total_to_pay")}</h3>
                  <span className="text-lg text-primary">{formatPrice(getTotalCost() * (1 - (discountCode.discount / 100)))}</span>
                </div>
              </div>

              <div className="w-full 2xl:w-[50%] flex flex-col gap-y-2">
                <Button
                  onClick={() => onSubmitCreateReserve()}
                  variant="dark" effect="default" size="lg"
                  className="group text-xs sm:text-lg h-8 sm:h-10"
                  rightIcon={<ChevronRightIcon className="w-4 sm:w-6 h-4 sm:h-6 ml-2 duration-300" />}
                  isLoading={loadingReserve}
                >
                  {t("reserve.reserve_now")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Tooltip id="my-tooltip" style={{ backgroundColor: "#00AAA9", borderRadius: "10px", padding: "6px", fontSize: "10px" }} />
    </>
  );
}

export default Reservation;
