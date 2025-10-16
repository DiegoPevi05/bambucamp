import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "./ui/Button";
import { fadeIn } from "../lib/motions";
import { useTranslation } from "react-i18next";

export interface BundlesCarouselProps<T extends { id?: number | string }> {
  bundles: (T & {
    header?: string | null;
    name: string;
    description?: string | null;
    price: number;
    custom_price?: number | null;
    duration?: number | null;
    qtypeople?: number | null;
    images?: string[];           // expects array; if string JSON, pre-parse before passing
    suggestions?: string[];      // expects array; same note as above
  })[];
  /** ms between slides (default 10000) */
  intervalMs?: number;
  /** CTA: called when user clicks the button (default opens WhatsApp) */
  onRequestBundle?: (bundle: BundlesCarouselProps<any>["bundles"][number]) => void;
  /** Optional custom CTA label (default t("experience.request_bundle")) */
  ctaLabel?: string;
  /** Section id for anchors */
  id?: string;
  /** Title shown above (default t("services.bundles")) */
  title?: string;
}

const BundlesCarousel = <T extends { id?: number | string }>({
  bundles,
  intervalMs = 10000,
  onRequestBundle,
  ctaLabel,
  id = "bundles-section",
  title,
}: BundlesCarouselProps<T>) => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const count = bundles?.length ?? 0;
  const hovering = useRef(false);

  const active = useMemo(() => (count ? bundles[index % count] : null), [bundles, count, index]);

  useEffect(() => {
    if (!count) return;
    const id = setInterval(() => {
      if (!hovering.current) setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs]);

  if (!count || !active) return null;

  const reverse = index % 2 === 1;
  const cover = Array.isArray(active.images) && active.images[0]
    ? active.images[0].replace(/^public\//, "").replace(/\\/g, "/")
    : "";
  const suggestions = Array.isArray(active.suggestions) ? active.suggestions : [];
  const price = (active.custom_price ?? active.price).toFixed(2);

  const handleCTA = () => {
    if (onRequestBundle) return onRequestBundle(active);
    window.open("https://wa.link/ioswo5", "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id={id}
      className="relative w-full py-16 px-6 sm:px-12 lg:px-24 bg-white"
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
    >
      <motion.h2
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={fadeIn("down", "", 0, 1)}
        className="text-3xl sm:text-5xl font-primary text-center mb-10 text-secondary"
      >
        {title ?? t("services.bundles")}
      </motion.h2>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`bundle_slide_${active.id ?? index}`}
            initial={{ opacity: 0, x: reverse ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reverse ? -60 : 60 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid items-stretch gap-6 lg:gap-10 grid-cols-1 lg:grid-cols-2"
          >
            {/* Image */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeIn(reverse ? "left" : "right", "", 0, 1)}
              className={`flex items-center justify-center ${reverse ? "lg:order-2" : "lg:order-1"} order-2 sm:order-1`}
            >
              <div className="h-[500px] sm:h-[800px] w-auto overflow-hidden rounded-2xl">
                {cover ? (
                  <img
                    src={cover}
                    alt={active.name}
                    className="h-full w-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-2xl" />
                )}
              </div>
            </motion.div>

            {/* Content */}
            <motion.article
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeIn(reverse ? "right" : "left", "", 0.1, 1.1)}
              className={`flex flex-col items-center justify-center ${reverse ? "lg:order-1" : "lg:order-2"} order-1 sm:order-2 p-2 sm:p-8`}
            >
              <header className="mb-3">
                <h3 className="text-2xl sm:text-5xl font-primary text-tertiary text-center">
                  {active.header ?? "BAMBUCAMP"}
                </h3>
                <p className="text-sm sm:text-xl text-gray-300 mt-1 text-secondary text-center">
                  {active.name}
                </p>
              </header>

              {active.description && (
                <p className="text-sm sm:text-lg text-primary text-center">{active.description}</p>
              )}

              <div className="mt-4 text-sm sm:text-lg text-primary flex flex-wrap gap-x-6 gap-y-2 justify-center">
                {typeof active.duration === "number" && (
                  <span>{t("experience.duration")}: {active.duration} {t("experience.minutes")}</span>
                )}
                <span>{t("common.price")}: S/. {price}</span>
                {typeof active.qtypeople === "number" && (
                  <span>{t("experience.people")}: {active.qtypeople}</span>
                )}
              </div>

              {suggestions.length > 0 && (
                <div className="mt-4 max-w-2xl">
                  <h4 className="font-semibold text-primary mb-2 text-sm sm:text-xl text-center">
                    {t("experience.suggestions")}
                  </h4>
                  <ul className="list-disc pl-5 text-primary space-y-1 text-xs sm:text-lg">
                    {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              <div className="pt-5">
                <Button variant="ghostLight" onClick={handleCTA}>
                  {ctaLabel ?? t("experience.request_bundle")}
                </Button>
              </div>

              <p className="text-xs sm:text-sm text-tertiary mt-2 text-center">
                {t("experience.disclaimer_bundles")}
              </p>
            </motion.article>
          </motion.div>
        </AnimatePresence>

        {/* Bullets */}
        <div className="flex items-center justify-center gap-2 my-4">
          {bundles.map((_, i) => {
            const activeDot = i === index;
            return (
              <button
                key={`bundle_dot_${i}`}
                aria-label={`Ir al bundle ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-3 w-3 rounded-full transition-all ${
                  activeDot ? "bg-primary scale-110" : "bg-secondary hover:bg-primary/70"
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BundlesCarousel;
