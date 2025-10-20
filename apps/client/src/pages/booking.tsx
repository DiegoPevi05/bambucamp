import React, { useEffect, useState } from 'react';
import { ISOLOGO_TERTIARY, BAMBUCAMP } from '../assets/images';
import { motion } from 'framer-motion';
import { fadeOnly } from '../lib/motions';
import ChevronRightIcon from "../assets/images/svg/chevron-right.svg?react";
import LoaderCircle from "../assets/images/svg/loader-circle.svg?react";
import TentIcon from "../assets/images/svg/tent.svg?react";
import ServiceItem from '../components/ServiceItem';
import { formatPrice } from '../lib/utils';
import ShopNavbar from '../components/ShopNavbar';
import { useCart } from '../contexts/CartContext';
import Button from '../components/ui/Button';
import SearchDatesBar from '../components/SearchBar';
import { Tent } from '../lib/interfaces';
import { useTranslation } from 'react-i18next';
import { SearchAvailableTents } from '../db/actions/reservation';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import HeroTentCarousel from "../components/HeroTentCarousel";

const Booking: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [tents, setTents] = useState<Tent[]>([]);
  const [selectedTent, setSelectedTent] = useState(0);
  const [loadingTent, setLoadingTents] = useState(true);

  // Sheet + contadores
  const [showDetails, setShowDetails] = useState(false);
  const [extraAdults, setExtraAdults] = useState(0);
  const [kids, setKids] = useState(0);

  const { dates, addTent, cart, removeTent, isTentInCart, totalItems, getTotalNights } = useCart();

  // Tent actual + pricing
  const currentTent = tents[selectedTent];

  const basePrice =
    currentTent ? (currentTent.custom_price !== currentTent.price ? currentTent.custom_price : currentTent.price) : 0;

  const baseIncludedAdults = currentTent?.qtypeople ?? 2;
  const maxExtraAdults = currentTent?.max_additional_people ?? 0;
  const extraAdultPrice = currentTent?.additional_people_price ?? 0;

  // Kids (lectura defensiva)
  const includedKids = Number((currentTent as any)?.qtykids ?? (currentTent as any)?.qtyKids ?? 0);
  const maxKids = Number((currentTent as any)?.max_kids ?? (currentTent as any)?.maxKids ?? includedKids);
  const kidsBundlePrice = Number((currentTent as any)?.kids_bundle_price ?? (currentTent as any)?.kidsBundlePrice ?? 0);

  // Inicializa contadores al cambiar de tent
  useEffect(() => {
    // empezamos desde los incluidos (negocio: 1 free por defecto si lo hay)

    const initialKids = (currentTent && cart.tents.length > 0) ? (cart.tents.find((tent) => tent.idTent === currentTent.id)?.kids ?? Math.min(maxKids, includedKids)) : Math.min(maxKids, includedKids);
    setKids(initialKids);
    const initialAdults = (currentTent && cart.tents.length > 0) ? (cart.tents.find((tent) => tent.idTent === currentTent.id)?.additional_people ?? 0) : 0;
    setExtraAdults(initialAdults);
  }, [selectedTent, maxKids, includedKids]);

  // Regla del bundle: SOLO si se llegó al máximo
  const kidsBundleApplies = kids === maxKids && kidsBundlePrice > 0;
  const kidsCharge = kidsBundleApplies ? kidsBundlePrice : 0;

  const extrasCharge = extraAdults * extraAdultPrice;
  const estimatedNightly = basePrice + extrasCharge + kidsCharge;

  // Cargar tents
  useEffect(() => {
    const run = async () => {
      if (dates.dateFrom > dates.dateTo) {
        toast.error(t("validations.start_date_before_end_date"));
        return;
      }
      setLoadingTents(true);
      const tentsDB = await SearchAvailableTents(dates, i18n.language);
      if (tentsDB != null) setTents(tentsDB);
      setLoadingTents(false);
    };
    run();
  }, [dates, i18n.language, t]);

  const goToRoute = (route: string) => navigate(route);

  // add/remove helper con validaciones
  const handleToggleTent = (
    idTent: number,
    index: number,
    opts?: { extraAdults?: number; kids?: number }
  ) => {
    const tent = tents.find(t => t.id === Number(idTent));
    if (!tent) return;

    let extraAdultsSelected = opts?.extraAdults ?? extraAdults;
    let kidsSelected = opts?.kids ?? kids;

    // hard limits
    const tentIncludedKids = Number((tent as any)?.qtykids ?? (tent as any)?.qtyKids ?? 0);
    const tentMaxKids = Number((tent as any)?.max_kids ?? (tent as any)?.maxKids ?? tentIncludedKids);
    const kidsBundlePrice = Number((tent as any)?.kids_bundle_price ?? (tent as any)?.kidsBundlePrice ?? 0);

    kidsSelected = Math.max(0, Math.min(kidsSelected, tentMaxKids));
    extraAdultsSelected = Math.max(0, Math.min(extraAdultsSelected, tent.max_additional_people ?? 0));

    if (kidsSelected > 1) {
      extraAdultsSelected = 0;
    } else if (extraAdultsSelected > 0) {
      kidsSelected = 1;
    }

    if (isTentInCart(idTent)) {
      removeTent(index);
      return;
    }

    const nightlyBase = tent.price ? (tent.custom_price ? tent.custom_price : tent.price) : 0;

    addTent({
      idTent,
      name: tent.title,
      price: nightlyBase,
      advanced: 0,
      nights: getTotalNights(),
      dateFrom: dates.dateFrom,
      dateTo: dates.dateTo,
      additional_people: extraAdultsSelected,
      additional_people_price: tent.additional_people_price,
      max_additional_people: tent.max_additional_people,
      kids: kidsSelected,
      qtykids: tentIncludedKids,
      max_kids: tentMaxKids,
      kids_bundle_price:kidsBundlePrice,
      confirmed: false,
    } as any);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {/* Image layer */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BAMBUCAMP})` }}
        />
        {/* Dark overlay + background blur for depth */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>
      <SectionHeader identifier="glampings" />
      <ShopNavbar />

      {loadingTent ? (
        <div className='absolute right-1/2 top-1/2 left-1/2 bottom-1/2 -translate-x-1/2 -translate-y-1/2'>
          <LoaderCircle className='h-16 w-16 text-secondary animate-spin' />
        </div>
      ) : (
        <>
          {tents.length === 0 ? (
            <motion.div
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={fadeOnly("down", 0.5, 0.5)}
              className="w-[300px] h-[200px] absolute right-1/2 top-1/2 left-1/2 bottom-1/2
                        -translate-x-1/2 -translate-y-1/2
                        rounded-2xl border border-white/20 shadow-xl
                        bg-white/10 backdrop-blur-md
                        flex items-center justify-center flex-col gap-y-2 text-white p-4"
            >
              <p className="font-secondary text-tertiary text-center mx-auto">
                {t("booking.glampings_no_availability")}
              </p>
              <TentIcon className="h-12 w-12 text-tertiary" />
            </motion.div>
          ) : (
            <>
              <HeroTentCarousel
                tents={tents}
                textSide="right"
                heightClass="h-screen"
                onTentChange={(_, idx) => setSelectedTent(idx)}
                onSelectPrimary={(tent) => {
                  const idx = tents.findIndex(t => t.id === tent.id);
                  handleToggleTent(tent.id, idx, { extraAdults, kids });
                }}
                primaryCtaLabel={
                  isTentInCart(tents[selectedTent]?.id)
                    ? t("reserve.reserved")
                    : t("reserve.add_to_reserve")
                }
                secondaryCtaLabel={t("booking.view_more")}
                onSelectSecondary={() => setShowDetails(true)}
              />

              {showDetails && currentTent && (
                <div className="fixed inset-0 z-[100]">
                  <div className="absolute inset-0 bg-black/60" onClick={() => setShowDetails(false)} />
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 40, opacity: 0 }}
                    className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto"
                  >
                    {/* header */}
                    <div className="flex items-start gap-3">
                      <img alt="isologo" src={ISOLOGO_TERTIARY} className="h-10 w-10" />
                      <div className="flex-1">
                        <h2 className="font-primary text-primary text-sm uppercase">{currentTent.header}</h2>
                        <h1 className="font-primary text-tertiary text-2xl sm:text-3xl">{currentTent.title}</h1>
                      </div>
                      <button onClick={() => setShowDetails(false)} className="text-primary/70 hover:text-primary">✕</button>
                    </div>

                    {/* description */}
                    {currentTent.description && (
                      <p className="mt-3 text-secondary text-sm sm:text-base">{currentTent.description}</p>
                    )}

                    {/* services */}
                    <div className="mt-4">
                      <label className="text-primary text-sm">{t("common.services")}</label>
                      <div className="mt-2 flex flex-wrap gap-3">
                        {Object.entries(currentTent.services).map(([service, value]) =>
                          (value as any) ? <ServiceItem key={service} icon={service} color="text-primary" /> : null
                        )}
                      </div>
                    </div>

                    {/* capacities */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Adults incluidos */}
                      <div className="rounded-xl border border-secondary/30 p-4">
                        <label className="text-primary text-sm">{t("glampings.adults_included") || "Adults included"}</label>
                        <div className="mt-2 text-2xl font-primary text-secondary">{baseIncludedAdults}</div>
                        <p className="text-xs text-secondary/70">{t("booking.included_in_price") || "Included in the base price"}</p>
                      </div>

                      {/* Adultos extra (bloqueado si hay niños > 0) */}
                      <div className="rounded-xl border border-secondary/30 p-4">
                        <label className="text-primary text-sm">{t("glampings.aditional_people")}</label>
                        <p className="text-xs text-secondary/70">
                          {t("glampings.aditional_people_cost")}: {formatPrice(extraAdultPrice)} • {t("common.max")}: {maxExtraAdults}
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <button
                            onClick={() => setExtraAdults((v) => Math.max(0, v - 1))}
                            className="h-9 w-9 rounded-lg border-2 border-secondary text-secondary active:scale-95"
                            disabled={extraAdults <= 0}
                          >−</button>
                          <input className="h-10 w-14 text-center border rounded-lg" readOnly value={extraAdults} />
                          <button
                            onClick={() => {
                              if (kids > 1) {
                                toast.error(t("booking.no_adult_with_kids") || "No puedes agregar adulto extra cuando hay niños.");
                                return;
                              }
                              setExtraAdults((v) => Math.min(maxExtraAdults, v + 1));
                            }}
                            className="h-9 w-9 rounded-lg bg-secondary text-white border-2 border-secondary active:scale-95 disabled:opacity-50"
                            disabled={extraAdults >= maxExtraAdults /* además bloqueamos por handler si kids>0 */}
                          >＋</button>
                        </div>
                        {kids > 0 && (
                          <p className="mt-2 text-xs text-primary">
                            {t("booking.rule_info") || "Para agregar un adulto extra, establece niños en 0 (pierdes el incluido)."}
                          </p>
                        )}
                      </div>

                      {/* Kids */}
                      <div className="rounded-xl border border-secondary/30 p-4 sm:col-span-2">
                        <label className="text-primary text-sm">{t("glampings.kids") || "Kids"}</label>
                        <p className="text-xs text-secondary/70">
                          {t("common.max")}: {maxKids}
                          {kidsBundlePrice ? ` • ${t("booking.bundle_price") || "Bundle"}: ${formatPrice(kidsBundlePrice)} (${t("booking.applies_at_max") || "se aplica al llegar al máximo"})` : ""}
                          {` • ${t("booking.included_kids") || "Included"}: ${includedKids}`}
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <button
                            onClick={() => setKids((v) => Math.max(0, v - 1))}
                            className="h-9 w-9 rounded-lg border-2 border-secondary text-secondary active:scale-95"
                            disabled={kids <= 0}
                          >−</button>

                          <input className="h-10 w-14 text-center border rounded-lg" readOnly value={kids} />

                          <button
                            onClick={() => {
                              // Regla 4: si agrego niños, saco al adulto extra
                              if (extraAdults > 0) setExtraAdults(0);
                              setKids((v) => Math.min(maxKids, v + 1));
                            }}
                            className="h-9 w-9 rounded-lg bg-secondary text-white border-2 border-secondary active:scale-95 disabled:opacity-50"
                            disabled={kids >= maxKids}
                          >＋</button>
                        </div>

                        <div className="mt-2 text-xs flex flex-col">
                          {kidsBundleApplies
                            ? <span className="text-primary">{t("booking.bundle_applies") || "Se aplica el bundle de niños."}</span>
                            : (kids > 0
                              ? <span className="text-secondary/70">{t("booking.partial_children_note") || "Niños por debajo del máximo: sin bundle."}</span>
                              : <span className="text-secondary/70">{t("booking.children_required") || "Sin niños."}</span>
                            )
                          }
                          <span className="text-secondary/70">{t("booking.children_required") || "Los niños se consideran hasta los 5 años."}</span>
                        </div>
                      </div>
                    </div>

                    {/* price preview */}
                    <div className="mt-6 rounded-xl border border-secondary/30 p-4 bg-secondary/5">
                      <div className="flex justify-between text-sm">
                        <span>{t("booking.base_price") || "Base price"}</span>
                        <span>{formatPrice(basePrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>{t("glampings.aditional_people")}</span>
                        <span>{extraAdults} × {formatPrice(extraAdultPrice)} = {formatPrice(extrasCharge)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>{t("glampings.kids")}</span>
                        <span>{kidsBundleApplies ? formatPrice(kidsCharge) : formatPrice(0)}</span>
                      </div>
                      <div className="mt-3 border-t pt-3 flex justify-between font-primary text-lg">
                        <span>{t("booking.estimated_nightly") || "Estimated nightly"}</span>
                        <span>{formatPrice(estimatedNightly)}</span>
                      </div>
                    </div>

                    {/* actions */}
                    <div className="mt-6 flex flex-wrap gap-3 justify-end">
                      <Button variant="dark" onClick={() => setShowDetails(false)}>
                        {t("common.close")}
                      </Button>
                      <Button
                        onClick={() => {
                          const idx = selectedTent;
                          handleToggleTent(currentTent.id, idx, { extraAdults, kids });
                          setShowDetails(false);
                        }}
                      >
                        {isTentInCart(currentTent.id) ? t("reserve.remove") : t("reserve.add_to_reserve")}
                      </Button>
                    </div>
                  </motion.div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* MOBILE search bar (fixed under navbar) */}
      <div className="sm:hidden fixed top-[calc(100vh-40%)] w-full rounded-2xl shadow-xl  p-2">
        <SearchDatesBar section="booking" />
      </div>

      {/* DESKTOP search bar (your original idea) */}
      I<div className="hidden sm:flex absolute sm:bottom-16 left-6 sm:left-12 w-[92%] sm:w-[70%] z-[30]">
        <SearchDatesBar section="booking" />
      </div>

      {/* MOBILE sticky CTA */}
      <div className="sm:hidden fixed bottom-2 left-0 right-0 z-[50] px-4">
        <div className="rounded-2xl shadow-xl bg-transparent p-2">
          <Button
            onClick={() => goToRoute("/extras")}
            variant="default"
            effect="default"
            className="w-full h-12 text-base"
            rightIcon={<ChevronRightIcon className="w-5 h-5 ml-2" />}
            disabled={totalItems === 0}
          >
            {t('common.continue')}
          </Button>
        </div>
      </div>

      {/* DESKTOP floating CTA (unchanged, but hide on mobile) */}
      <div className="hidden sm:block absolute right-6 sm:right-12 bottom-6 lg:bottom-4 2xl:bottom-12 z-[60]">
        <Button
          onClick={() => goToRoute("/extras")}
          variant="default" effect="default" size="lg"
          className="group text-xs sm:text-lg h-10"
          rightIcon={<ChevronRightIcon className="w-4 sm:w-6 h-4 sm:h-6 ml-2 duration-300" />}
          disabled={totalItems == 0}
        >
          {t('common.continue')}
        </Button>
      </div>
    </div>
  );
};

export default Booking;
