import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FooterDevelopment from "../components/FooterDevelopment";
import Button from "../components/ui/Button";
import { motion } from "framer-motion";
import { fadeIn } from "../lib/motions";
import { useTranslation } from "react-i18next";
import ChatComponent from "../components/ChatWhatsapp.tsx"

import type { Experience, ExperienceCategory, webContent } from "../lib/interfaces";
import {
  getPublicCategoryExperiences,
  getPublicExperiences,
} from "../db/actions/reservation";

import Reviews from "../components/Reviews";             // NEW
import Collapsible from "../components/Collapsible";     // NEW
import { getContentWeb } from "../db/actions/common";    // NEW
import { LUNAHUANA, BAMBUCAMP, ISOLOGO_WHITE, TENT_SVG } from "../assets/images"; // NEW

const SLUG_TO_CATEGORY: Record<string, string> = {
  adventure: "BAMBU AVENTURA",
  love: "BAMBU AMOR",
  experience: "BAMBU EXPERIENCIA",
  transfer: "BAMBU TRASLADO",
  bundles: "BAMBU PAQUETES",
};

export default function ServicesCategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const categoryName = SLUG_TO_CATEGORY[String(slug || "").toLowerCase()];

  const [loading, setLoading] = useState(true);
  const [_, setCategories] = useState<ExperienceCategory[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [error, setError] = useState<string | null>(null);

  // NEW: contenido general (reviews + faqs)
  const [siteData, setSiteData] = useState<webContent>({ tents: [], bundles:[], reviews: [], faqs: [] });

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        // Contenido global (reviews + faqs)
        const content = await getContentWeb(i18n.language);
        if (mounted && content) setSiteData(content);

        // categorías (por si las usas más adelante)
        const cats = await getPublicCategoryExperiences(i18n.language);
        if (mounted && cats) setCategories(cats);

        // experiencias por categoría
        if (categoryName) {
          const exps = await getPublicExperiences(i18n.language, [categoryName]);
          if (mounted && exps) setExperiences(exps);
        } else {
          setExperiences([]);
        }
      } catch (e) {
        console.error(e);
        if (mounted) setError(t("services.error_loading") ?? "No se pudieron cargar las experiencias.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, [i18n.language, categoryName, t]);

  // Hero title/ subtitle (i18n)
  const headerTitle = useMemo(() => {
    if (!categoryName) return t("services.category_not_found") ?? "Categoría no encontrada";
    return categoryName.replace("BAMBU ", "BAMBUCAMP ");
  }, [categoryName, t]);

  if (!categoryName) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <ChatComponent />
        <Navbar />
        <main className="flex-1 px-6 sm:px-12 lg:px-24 py-16">
          <h1 className="text-3xl font-primary mb-3">{t("services.category_not_found")}</h1>
          <p className="text-gray-300">{t("services.choose_category")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/services/bundles"><Button variant="default">{t("services.bundles")}</Button></Link>
            <Link to="/services/adventure"><Button variant="default">{t("services.adventure")}</Button></Link>
            <Link to="/services/love"><Button variant="default">{t("services.love")}</Button></Link>
            <Link to="/services/experience"><Button variant="default">{t("services.experience")}</Button></Link>
            <Link to="/services/transfer"><Button variant="default">{t("services.transfer")}</Button></Link>
          </div>
        </main>
        <Footer />
        <FooterDevelopment />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-hidden">
      <ChatComponent />
      <Navbar />
      {/* HERO (igual estilo que About) */}
      <section className="relative w-full h-[45vh] sm:h-[55vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url(${BAMBUCAMP})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/90" />
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeIn("down", "", 0, 1.2)}
          className="relative z-10 px-6 text-center"
        >
          <h1 className="font-primary text-4xl sm:text-6xl">{headerTitle}</h1>
          <p className="mt-3 text-sm sm:text-base text-gray-200 max-w-3xl mx-auto">
            {t("services.hero_subtitle") || t("services.explore_by_category")}
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Link to="/extras"><Button variant="dark">{t("services.reserve_label")}</Button></Link>
          </div>
        </motion.div>
      </section>

      {/* GRID EXPERIENCIAS */}
      <main className="flex-1 px-6 sm:px-12 lg:px-24 pb-16">
        {loading ? (
          <p className="text-gray-400">{t("services.loading")}</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : experiences.length === 0 ? (
          <p className="text-gray-400">{t("services.coming_soon")}</p>
        ) : categoryName === "BAMBU PAQUETES" ? (
          /* ====== LAYOUT ESPECIAL PARA BUNDLES ====== */
          <div className="flex flex-col gap-10">
            {experiences.map((exp, idx) => {
              let suggestions: string[] = [];
              try {
                // @ts-ignore (backend puede enviar string)
                suggestions = exp.suggestions ? exp.suggestions : [];
              } catch {
                suggestions = [];
              }

              const cover =
                Array.isArray(exp.images) && exp.images[0]
                  ? exp.images[0].replace(/^public\//, "").replace(/\\/g, "/")
                  : "";

              // alternar: pares -> imagen izquierda, impares -> imagen derecha
              const reverse = idx % 2 === 1;

              return (
                <div
                  key={`${exp.id}_${idx}`}
                  className={`grid items-stretch gap-6 lg:gap-10
                              ${reverse ? "lg:grid-cols-[1fr_1.1fr]" : "lg:grid-cols-[1fr_1.1fr]"}
                              grid-cols-1 lg:grid-cols-2`}
                >
                  {/* Columna Imagen (izq si !reverse / der si reverse) */}
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
                          alt={exp.name}
                          className="h-full w-full object-cover rounded-2xl"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-secondary/30 to-secondary/10" />
                      )}
                    </div>
                  </motion.div>

                  {/* Columna Contenido */}
                  <motion.article
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeIn(reverse ? "right" : "left", "", 0.1, 1.1)}
                    className={`flex flex-col items-center justify-center ${reverse ? "lg:order-1" : "lg:order-2"} order-1 sm:order-2
                              p-2 sm:p-8`}
                  >
                    <header className="mb-3">
                      <h3 className="text-2xl sm:text-5xl font-primary text-tertiary text-center">{exp.header ?? categoryName}</h3>
                      <p className="text-sm sm:text-xl text-gray-300 mt-1 text-secondary">{exp.name}</p>
                    </header>

                    <p className="text-sm sm:text-lg text-gray-200">{exp.description}</p>

                    <div className="text-sm mt-4 text-sm sm:text-lg text-gray-300 flex flex-wrap gap-x-6 gap-y-2">
                      <span>{t("experience.duration")}: {exp.duration} {t("experience.minutes")}</span>
                      <span>{t("common.price")}: S/. {(exp.custom_price ?? exp.price).toFixed(2)}</span>
                      {typeof exp.qtypeople === "number" && (
                        <span>{t("experience.people")}: {exp.qtypeople}</span>
                      )}
                    </div>



                    {suggestions.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-white mb-2 text-sm sm:text-xl">{t("experience.suggestions")}</h4>
                        <ul className="list-disc pl-5 text-gray-300 space-y-1 text-xs sm:text-lg">
                          {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}

                    <div className="pt-5">
                      <Button
                        variant="ghostLight"
                        onClick={() => window.open("https://wa.link/ioswo5", "_blank", "noopener,noreferrer")}
                      >
                        {t("experience.request_bundle")}
                      </Button>
                    </div>

                    <p className="text-xs sm:text-sm text-tertiary mt-2">{t("experience.disclaimer_bundles")}</p>

                  </motion.article>
                </div>
              );
            })}
          </div>
        ) : (
          /* ====== LAYOUT NORMAL PARA OTRAS CATEGORÍAS ====== */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((exp, idx) => {
              let suggestions: string[] = [];
              try {
                // @ts-ignore
                suggestions = exp.suggestions ? JSON.parse(exp.suggestions as any) : [];
              } catch {
                suggestions = [];
              }

              const cover =
                Array.isArray(exp.images) && exp.images[0]
                  ? exp.images[0].replace(/^public\//, "").replace(/\\/g, "/")
                  : "";

              return (
                <article
                  key={`${exp.id}_${idx}`}
                  className="group border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur
                             transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-xl/20"
                >
                  <div className="relative h-48 overflow-hidden">
                    {cover ? (
                      <img
                        src={cover}
                        alt={exp.name}
                        className="absolute inset-0 h-full w-full object-cover transform transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-secondary/10" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                      <h3 className="text-2xl font-primary drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">{exp.name}</h3>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <p className="text-gray-200 text-sm line-clamp-3">{exp.description}</p>
                    <div className="text-sm text-gray-300">
                      <span className="mr-3">{t("experience.duration")}: {exp.duration} min</span>
                      <span>{t("common.price")}: S/. {(exp.custom_price ?? exp.price).toFixed(2)}</span>
                    </div>

                    {suggestions.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-gray-200">{t("experience.suggestions")}</summary>
                        <ul className="list-disc pl-5 text-gray-300 mt-1 space-y-1">
                          {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </details>
                    )}

                    <div className="pt-3 flex gap-2">
                      <Button variant="dark" onClick={() => navigate("/extras")}>
                        {t("services.reserve_label")}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* FAQ + Por qué nosotros (simple) */}
      <section className="bg-secondary text-white px-6 sm:px-12 lg:px-24 py-12">
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeIn("up", "", 0, 1)}
          className="text-3xl font-primary pb-2 flex items-center gap-x-2"
        >
          <img alt="isologo" src={ISOLOGO_WHITE} className="h-10 w-10" /> FAQ
        </motion.h2>

        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <div>
            {siteData.faqs.map((faq) => (
              <Collapsible key={`services_faq_${faq.id}`} title={faq.question} content={faq.answer} />
            ))}
          </div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn("left", "", 0.2, 1)}
            className="rounded-2xl p-6"
          >
            <h3 className="font-primary text-2xl mb-2">{t("about.why_us") ?? "¿Por qué Bambucamp?"}</h3>
            <ul className="list-disc pl-5 text-gray-100 space-y-2">
              <li>Glamping con estándar hotelero</li>
              <li>Experiencias personalizadas (Aventura, Amor, Experiencia, Traslado)</li>
              <li>Equipo atento y cercano</li>
            </ul>
            <motion.img
              initial="hidden"
              whileInView='show'
              viewport={{ once: true }}
              variants={fadeIn("up", "", 0.5, 1.5)}
              src={TENT_SVG} alt="tent" className="w-full lg:w-[80%] h-auto object-cover" />
          </motion.div>
        </div>
      </section>

      {/* RESEÑAS */}
      <section className="relative w-full h-auto bg-black">
        <div className="background-image absolute inset-0 w-full h-full opacity-[70%] bg-cover bg-no-repeat bg-bottom" style={{ backgroundImage: `url(${LUNAHUANA})` }}></div>
        <Reviews reviews={siteData.reviews} />
      </section>

      <Footer />
      <FooterDevelopment />
    </div>
  );
}
