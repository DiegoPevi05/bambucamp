import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Tent } from "../lib/interfaces";
import { fadeIn } from "../lib/motions"; // you already have this
import ChevronLeftIcon from "../assets/images/svg/chevron-left.svg?react";
import ChevronRightIcon from "../assets/images/svg/chevron-right.svg?react";
import Button from "./ui/Button";
import ServiceItem from "./ServiceItem";
import { ISOLOGO_TERTIARY } from "../assets/images";

/**
 * Reusable, high‑style hero carousel for Tents
 * - Full-bleed background that cycles through IMAGES of the current tent
 * - Chevrons switch the TENT
 * - Bullets switch the IMAGE within the current tent
 * - Auto-plays images (per tent) and pauses on hover
 * - Optional: auto-rotate tents (disabled by default)
 * - Text panel can be positioned left or right
 */

export type HeroTentCarouselProps = {
  tents: Tent[];
  initialTentIndex?: number;
  autoPlay?: boolean; // auto-play selected tent's images
  autoPlayIntervalMs?: number; // per-image interval
  autoRotateTents?: boolean; // rotate tents automatically (default false)
  tentRotateIntervalMs?: number; // default 10000ms
  showBullets?: boolean; // bullets for IMAGES
  showArrows?: boolean; // arrows for TENTS
  className?: string;
  heightClass?: string; // e.g. "min-h-[70vh]" or "h-[100vh]"
  textSide?: "left" | "right"; // where to show title/header panel
  onTentChange?: (tent: Tent, index: number) => void;
  onSelectPrimary?: (tent: Tent) => void; // optional CTA handler
  primaryCtaLabel?: string; // defaults to t("common.book_now")
  secondaryCtaLabel?: string; // optional second CTA
  onSelectSecondary?: (tent: Tent) => void;
};

const clampIndex = (idx: number, len: number) => (len === 0 ? 0 : (idx + len) % len);

const imgVariants = {
  enterFromRight: { opacity: 0, x: 40 },
  enterFromLeft: { opacity: 0, x: -40 },
  center: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exitToLeft: { opacity: 0, x: -40, transition: { duration: 0.6 } },
  exitToRight: { opacity: 0, x: 40, transition: { duration: 0.6 } },
};

export default function HeroTentCarousel({
  tents,
  initialTentIndex = 0,
  autoPlay = true,
  autoPlayIntervalMs = 4000,
  autoRotateTents = false, // default off per request
  tentRotateIntervalMs = 10000,
  showBullets = true,
  showArrows = true,
  className = "",
  heightClass = "min-h-[70vh]",
  textSide = "left",
  onTentChange,
  onSelectPrimary,
  primaryCtaLabel,
  secondaryCtaLabel,
  onSelectSecondary,
}: HeroTentCarouselProps) {
  const [tentIdx, setTentIdx] = useState(clampIndex(initialTentIndex, tents.length));
  const selectedTent = tents[tentIdx];

  // Track which image within current tent is active
  const [imgIdx, setImgIdx] = useState(0);
  const [dir, setDir] = useState<"left" | "right">("right"); // background animation direction
  const [isHovering, setIsHovering] = useState(false);
  const imgTimerRef = useRef<number | null>(null);
  const tentTimerRef = useRef<number | null>(null);

  // When tent changes, reset image index and notify
  useEffect(() => {
    setImgIdx(0);
    onTentChange?.(selectedTent, tentIdx);
  }, [tentIdx]);

  // ---- IMAGE AUTOPLAY (per tent) ----
  useEffect(() => {
    if (!autoPlay || !selectedTent || isHovering) return;

    if (imgTimerRef.current) window.clearInterval(imgTimerRef.current);
    imgTimerRef.current = window.setInterval(() => {
      const images = selectedTent?.images ?? [];
      if (!images.length) return;
      setDir("right");
      setImgIdx((prev) => (prev + 1) % images.length);
    }, autoPlayIntervalMs) as unknown as number;

    return () => {
      if (imgTimerRef.current) window.clearInterval(imgTimerRef.current);
    };
  }, [autoPlay, autoPlayIntervalMs, selectedTent, isHovering]);

  // ---- OPTIONAL TENT AUTOROTATE ----
  useEffect(() => {
    if (!autoRotateTents || isHovering || !tents.length) return;

    if (tentTimerRef.current) window.clearInterval(tentTimerRef.current);
    tentTimerRef.current = window.setInterval(() => {
      setDir("right");
      setTentIdx((prev) => clampIndex(prev + 1, tents.length));
    }, tentRotateIntervalMs) as unknown as number;

    return () => {
      if (tentTimerRef.current) window.clearInterval(tentTimerRef.current);
    };
  }, [autoRotateTents, tentRotateIntervalMs, tents.length, isHovering]);

  // ---- NAV HANDLERS ----
  const goNextTent = useCallback(() => {
    setDir("right");
    setTentIdx((prev) => clampIndex(prev + 1, tents.length));
  }, [tents.length]);

  const goPrevTent = useCallback(() => {
    setDir("left");
    setTentIdx((prev) => clampIndex(prev - 1, tents.length));
  }, [tents.length]);


  const goToImage = (index: number) => {
    if (!selectedTent?.images?.length) return;
    if (index === imgIdx) return;
    setDir(index > imgIdx ? "right" : "left");
    setImgIdx(clampIndex(index, selectedTent.images.length));
  };

  const currentBg = useMemo(() => {
    const imgs = selectedTent?.images || [];
    return imgs[imgIdx] || imgs[0] || "";
  }, [selectedTent, imgIdx]);

  const onMouseEnter = () => setIsHovering(true);
  const onMouseLeave = () => setIsHovering(false);

  if (!tents?.length) return null;

  return (
    <section
      className={`relative w-full ${heightClass} grid grid-cols-1 lg:grid-cols-2 pt-24 sm:pt-28 overflow-hidden ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Background image with cinematic overlays */}
      <div className="absolute inset-0">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`${selectedTent?.id}-${imgIdx}`}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentBg})` }}
            variants={imgVariants}
            initial={dir === "right" ? "enterFromRight" : "enterFromLeft"}
            animate="center"
            exit={dir === "right" ? "exitToLeft" : "exitToRight"}
          />
        </AnimatePresence>
      </div>

      {/* Top & bottom gradient vignettes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/70" />
        {/* Subtle side fade to improve text legibility */}
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black/40 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black/40 to-transparent" />
      </div>

      {/* Left/Right content panels */}
      <div className={`absolute max-sm:top-[calc(100vh-75%)] max-sm:w-full sm:relative z-[20] sm:z-10 flex items-center justify-center pl-6 pr-12 pt-10 pb-24 order-2 ${textSide === "left" ? "lg:order-1" : "lg:order-2"}`}>
        {/* Re-animate on tent change by keying the panel */}
        <motion.div
          key={`info-panel-${selectedTent?.id}`}
          initial="hidden"
          animate="show"
          variants={fadeIn("down", "tween", 0.2, 1)}
          className="w-[100%] sm:w-[560px] rounded-3xl shadow-3xl p-6 sm:p-8 bg-black/40"
        >
          <div className="flex items-center gap-3 mb-2">
            <img alt="isologo" src={ISOLOGO_TERTIARY} className="h-10 w-10" />
            <div>
              <h2 className="text-tertiary text-sm sm:text-base tracking-wide uppercase">{selectedTent?.header}</h2>
              <h1 className="text-tertiary text-2xl sm:text-4xl font-primary leading-tight">{selectedTent?.title}</h1>
            </div>
          </div>

          {selectedTent?.description && (
            <p className="hidden sm:flex text-white/95 text-sm sm:text-base mt-2">
              {selectedTent.description}
            </p>
          )}

          {/* Services */}
          <ul className="hidden mt-4 sm:grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(selectedTent?.services || {}).map(([service, value]) =>
              value ? <ServiceItem key={service} icon={service} /> : null
            )}
          </ul>

          {/* CTAs (optional) */}
          {(onSelectPrimary || onSelectSecondary) && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {onSelectPrimary && (
                <Button effect="default" variant="default" size="lg" onClick={() => onSelectPrimary(selectedTent)}>
                  {primaryCtaLabel || "Book now"}
                </Button>
              )}
              {onSelectSecondary && (
                <Button effect="default" variant="dark" size="lg" onClick={() => onSelectSecondary(selectedTent)}>
                  {secondaryCtaLabel || "Details"}
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <div className={`relative z-10 flex items-center justify-center px-6 py-10 order-1 ${textSide === "left" ? "lg:order-2" : "lg:order-1"}`}>
        <motion.div
          key={`side-panel-${selectedTent?.id}`}
          initial="hidden"
          animate="show"
          variants={fadeIn("down", "", 0.15, 1)}
          className="max-w-xl text-center lg:text-left rounded-3xl p-0 sm:p-0 shadow-none bg-transparent"
        />
      </div>

      {/* Controls: Arrows for TENTS */}
      {showArrows && (
        <div className="pointer-events-none absolute max-sm:top-[calc(100vh-35%)] max-sm:w-full sm:inset-0 z-20 flex items-center justify-between px-3 sm:px-6">
          <button
            aria-label="Previous tent"
            onClick={goPrevTent}
            className="pointer-events-auto rounded-full bg-white/90 hover:bg-white active:scale-95 transition h-11 w-11 sm:h-14 sm:w-14 border-4 border-secondary flex items-center justify-center"
          >
            <ChevronLeftIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </button>
          <button
            aria-label="Next tent"
            onClick={goNextTent}
            className="pointer-events-auto rounded-full bg-white/90 hover:bg-white active:scale-95 transition h-11 w-11 sm:h-14 sm:w-14 border-4 border-secondary flex items-center justify-center"
          >
            <ChevronRightIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </button>
        </div>
      )}

      {/* Bullets for IMAGES of current tent */}
      {showBullets && selectedTent?.images?.length > 0 && (
        <div className="absolute z-20 bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {selectedTent.images.map((_, i) => (
            <span
              key={`img-bullet-${selectedTent.id}-${i}`}
              onClick={() => goToImage(i)}
              className={`h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white/70 cursor-pointer transition ${imgIdx === i ? "bg-white" : "bg-white/20 hover:bg-white/40"
                }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * USAGE EXAMPLE (Hero)
 * <HeroTentCarousel
 *    tents={dataWebHome.tents}
 *    textSide="left"
 *    heightClass="h-[100vh]"
 *    onSelectPrimary={(tent) => navigate("/booking")}
 *    primaryCtaLabel={t("common.book_now")}
 *    // autoplay is ON by default; tents autorotate is OFF by default
 * />
 */
