import { useEffect, useState } from "react";
import Blocks from "../assets/images/svg/blocks.svg?react";
import CalendarPlus from "../assets/images/svg/calendar-plus.svg?react";
import CircleAlert from "../assets/images/svg/circle-alert.svg?react";
import Clock from "../assets/images/svg/clock.svg?react";
import FlameKindling from "../assets/images/svg/flame-kindling.svg?react";
import User from "../assets/images/svg/user.svg?react";

import { Experience } from "../lib/interfaces";
import { motion } from "framer-motion";
import { fadeIn } from "../lib/motions";
import { formatPrice, parseSuggestions } from "../lib/utils";
import { useTranslation } from "react-i18next";

interface propsItemExperience {
  variant?: string;
  index: number;
  experience: Experience;
  handleAddExperience: (idExperience: number, quantity: number, day: Date) => void;
  rangeDates: { date: Date, label: string }[];
}

const ExperienceCard: React.FC<propsItemExperience> = (props: propsItemExperience) => {
  const { t } = useTranslation();
  const { variant, experience, handleAddExperience, rangeDates } = props;

  const [quantity, setQuantity] = useState<number>(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  const handleIncrementQuantity = () => setQuantity((q) => q + 1);
  const handleReduceQuantity = () => setQuantity((q) => (q <= 1 ? q : q - 1));

  const handleSelectExperience = (idExperience: number) => {
    const indexDay = Number((document.querySelector(`#experience_day_selector_${idExperience}`) as HTMLInputElement).value);
    const dayObjectSelected = rangeDates.find((_, i) => i === indexDay);
    if (dayObjectSelected) {
      handleAddExperience(experience.id, quantity, dayObjectSelected.date);
      setQuantity(0);
    }
  };

  // Close modal with ESC
  useEffect(() => {
    if (!isDetailsOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsDetailsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDetailsOpen]);

  return (
    <>
      <motion.div
        key={`experience-catalog-${experience.id}`}
        initial="hidden"
        animate="show"
        exit="hidden"
        variants={fadeIn(` ${variant == "line" ? "up" : "left"}`, "", 0.5, 0.5)}
        className={`shrink-0 bg-white ${variant == "line" ? "w-full" : "w-[250px]"} h-auto flex flex-col items-start justify-start border border-slate-200 rounded-lg shadow-md`}
      >
        <div className={`${variant == "line" ? "h-[0px]" : "h-[150px]"} w-full rounded-t-lg`}>
          {experience.images.length > 0 ? (
            <img
              className="w-full h-full bg-center bg-cover rounded-t-lg"
              src={experience.images[0]}
              alt={experience.name}
            />
          ) : (
            <div className="w-full h-full bg-secondary rounded-t-lg flex items-center justify-center p-4">
              <FlameKindling className="text-white w-full h-full" />
            </div>
          )}
        </div>

        <div className="w-full h-auto flex flex-col justify-start items-start py-2 px-4">
          <div className={`w-full h-auto p-none m-none flex ${variant == "line" ? "flex-row" : "flex-col"}`}>
            <div className={`h-auto p-none m-none flex flex-col ${variant == "line" ? "w-[50%]" : "w-full"}`}>
              <h1 className={`${variant == "line" ? "text-sm" : "text-lg"} text-tertiary`}>{experience.name}</h1>

              {/* Short description + View details button */}
              <div className={`${variant == "line" ? "hidden" : "block"} text-xs text-secondary`}>
                <p className="inline">
                  {experience.description.length > 50
                    ? experience.description.slice(0, 50) + "… "
                    : experience.description}
                </p>
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(true)}
                  className="ml-1 underline underline-offset-2 text-secondary hover:text-tertiary"
                >
                  {t("experience.view_details", "View details")}
                </button>
              </div>

              {/* Always show the View details button in line variant */}
              {variant == "line" && (
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(true)}
                  className="mt-1 self-start text-xs underline underline-offset-2 text-secondary hover:text-tertiary"
                >
                  {t("experience.view_details", "View details")}
                </button>
              )}

              <p className="text-md">
                {formatPrice(experience.price === experience.custom_price ? experience.price : experience.custom_price)}
              </p>
            </div>

            <div className={`${variant == "line" ? "w-[50%]" : "hidden"}  h-[50px] flex flex-row justify-end ps-4 py-2`}>
              <button
                onClick={() => handleSelectExperience(experience.id)}
                className="p-2 bg-secondary text-white rounded-full group hover:bg-white hover:border-2 hover:border-secondary hover:text-secondary h-full w-auto flex items-center justify-center active:scale-95 duration-300 text-xs"
              >
                <CalendarPlus className="h-full w-full" />
              </button>
            </div>
          </div>

          <div className={`w-full h-auto flex ${variant == "line" ? "flex-row" : "flex-col"} `}>
            <div className="w-full h-[50%] flex flex-row">
              <div className="w-[50%] h-[40px] flex flex-row gap-x-2 justify-center items-center text-tertiary">
                <User />
                {experience.limit_age}
                <CircleAlert
                  className=" cursor-pointer h-4 w-4 flex items-center justify-center bg-slate-300 rounded-full hover:bg-secondary text-white hover:text-primary text-xs"
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content={t("experience.limit_age")}
                />
              </div>
              <div className="w-[50%] h-[40px] flex flex-row gap-x-2 justify-center items-center p-2 text-tertiary">
                <Blocks />
                {experience.qtypeople}
                <CircleAlert
                  className=" cursor-pointer h-4 w-4 flex items-center justify-center bg-slate-300 rounded-full hover:bg-secondary text-white hover:text-primary text-xs"
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content={t("experience.qty_people")}
                />
              </div>
            </div>
            <div className="w-full h-[50%] flex flex-row">
              <div className="w-[50%] h-[40px] flex flex-row gap-x-2 justify-center items-center text-tertiary">
                <Clock />
                {experience.duration}
                <CircleAlert
                  className=" cursor-pointer h-4 w-4 flex items-center justify-center bg-slate-300 rounded-full hover:bg-secondary text-white hover:text-primary text-xs"
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content={t("experience.duration_minutes")}
                />
              </div>
              <div className="w-[50%] h-[40px] flex flex-row gap-x-2 justify-center items-center p-2 text-tertiary">
                <p className="text-xs text-secondary">Sugg.</p>
                <CircleAlert
                  className=" cursor-pointer h-4 w-4 flex items-center justify-center bg-slate-300 rounded-full hover:bg-secondary text-white hover:text-primary text-xs"
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content={t(parseSuggestions(experience.suggestions))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={`w-full h-auto flex p-none m-none ${variant == "line" ? "flex-row" : "flex-col"}`}>
          <div className={`${variant == "line" ? "w-[50%]" : "w-full"} h-auto mt-auto flex flex-col relative rounded-b-lg px-4 gap-y-2 my-2`}>
            <label className="text-xs text-secondary">{t("experience.day")}</label>
            <select
              id={`experience_day_selector_${experience.id}`}
              className="w-[80%] mx-auto h-auto text-secondary border-2  rounded-md border-secondary text-sm"
            >
              {rangeDates.map((itemDate, index) => (
                <option key={"option_day_selector" + index} value={index}>
                  {itemDate.label}
                </option>
              ))}
            </select>
          </div>
          <div className={`${variant == "line" ? "w-[50%]" : "w-full"} h-[50px] mt-auto flex flex-row relative rounded-b-lg`}>
            <span className="w-[30%] h-auto flex items-center justify-center">{quantity}</span>
            <div className="w-[70%] h-auto flex flex-row px-4 py-2 items-center gap-x-2">
              <button
                onClick={handleReduceQuantity}
                className="w-full h-8 bg-secondary text-white border-2 border-secondary rounded-md active:scale-95 hover:bg-white hover:text-secondary hover:border-secondary duration-300"
              >
                -
              </button>
              <button
                onClick={handleIncrementQuantity}
                className="w-full h-8 bg-secondary text-white border-2 border-secondary rounded-md active:scale-95 hover:bg-white hover:text-secondary hover:border-secondary duration-300"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className={`${variant == "line" ? "hidden" : "w-full"}  h-[50px] flex flex-row justify-end px-4 py-2`}>
          <button
            onClick={() => handleSelectExperience(experience.id)}
            className="px-2 bg-secondary text-white rounded-full group hover:bg-white hover:border-2 hover:border-secondary hover:text-secondary h-full w-auto flex items-center justify-center active:scale-95 duration-300 text-xs"
          >
            {t("reserve.add_to_reserve")}
          </button>
        </div>
      </motion.div>

      {/* ===== Modal: Experience Details ===== */}
      {isDetailsOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`exp-modal-title-${experience.id}`}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDetailsOpen(false)} />

          {/* Panel */}
          <div className="relative w-[92%] max-w-md bg-white rounded-2xl shadow-2xl p-5">
            <button
              onClick={() => setIsDetailsOpen(false)}
              aria-label={t("close", "Close")}
              className="absolute right-3 top-3 h-7 w-7 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95"
            >
              ×
            </button>

            {/* Header */}
            <div className="mb-3">
              <h2 id={`exp-modal-title-${experience.id}`} className="text-xl font-semibold text-tertiary">
                {experience.name}
              </h2>
              {experience.category?.name && (
                <p className="text-xs text-secondary mt-0.5">{experience.category.name}</p>
              )}
            </div>

            {/* Body */}
            <div className="space-y-4">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-tertiary">{t("experience.description", "Description")}</h3>
                <p className="text-sm text-secondary mt-1 whitespace-pre-wrap">{experience.description}</p>
              </div>

              {/* Key facts */}
              <div className="flex flex-col gap-3 text-sm text-tertiary">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> <span>{t("experience.duration_minutes", "Duration (min)")}: {experience.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" /> <span>{t("experience.limit_age", "Age limit")}: {experience.limit_age}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Blocks className="h-4 w-4" /> <span>{t("experience.qty_people", "People")}: {experience.qtypeople}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarPlus className="h-4 w-4" />{" "}
                  <span>{t("experience.price", "Price")}: {formatPrice(experience.custom_price ?? experience.price)}</span>
                </div>
              </div>

              {/* Suggestions */}
              {Array.isArray(experience.suggestions) && experience.suggestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-tertiary">{t("experience.suggestions", "Suggestions")}</h3>
                  <ul className="mt-1 list-disc pl-5 text-sm text-secondary space-y-1">
                    {experience.suggestions.map((s, i) => (
                      <li key={i}>{t(s)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer (optional) */}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-3 py-2 text-sm rounded-md border border-slate-200 text-tertiary hover:bg-slate-50 active:scale-95"
              >
                {t("common.close", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExperienceCard;
