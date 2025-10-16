import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // ⬅️ NEW
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FooterDevelopment from "../components/FooterDevelopment";
import Reviews from "../components/Reviews";
import Collapsible from "../components/Collapsible";
import Button from "../components/ui/Button";
import ChatComponent from "../components/ChatWhatsapp.tsx"
import { fadeIn } from "../lib/motions";
import { motion } from "framer-motion";
import { styles } from "../lib/styles";
import { LUNAHUANA, BAMBUCAMP, ISOLOGO_WHITE, TENT_SVG, TENT_FRONT } from "../assets/images";
import { getContentWeb } from "../db/actions/common";
import type { webContent } from "../lib/interfaces";

const normalizeUrl = (url: string) => url.replace(/^public\//, "").replace(/\\/g, "/");

export default function About() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate(); // ⬅️ NEW
  const [data, setData] = useState<webContent>({ tents: [], bundles:[], reviews: [], faqs: [] });

  useEffect(() => {
    (async () => {
      const content = await getContentWeb(i18n.language);
      if (content) setData(content);
    })();
  }, [i18n.language]);

  return (
    <div className="overflow-hidden bg-black text-white">
      <ChatComponent />
      <Navbar />

      {/* HERO */}
      <section className="relative w-full h-[60vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url(${BAMBUCAMP})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/90" />
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeIn("down", "", 0, 1.2)}
          className="relative z-10 px-6 text-center"
        >
          <h1 className="font-primary text-4xl sm:text-6xl">{t("about.title") || "Sobre nosotros"}</h1>
          <p className="mt-3 text-sm sm:text-base text-gray-200 max-w-3xl mx-auto">
            {t("about.subtitle") || "Creamos experiencias de glamping en Lunahuaná combinando naturaleza, confort y gastronomía."}
          </p>
          <div className="mt-6 flex items-center justify-center">
            {/* ⬇️ Click -> /booking */}
            <Button variant="dark" onClick={() => navigate("/booking")}>
              {t("common.book_now")}
            </Button>
          </div>
        </motion.div>
      </section>

      {/* QUIÉNES SOMOS */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12 lg:px-24 py-12">
        {/* 2 cols on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT: story + green card */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn("up", "", 0, 1)}
            className="space-y-6"
          >
            <div>
              <h2 className="font-primary text-3xl sm:text-4xl mb-4">
                {t("about.our_story") || "Nuestra historia"}
              </h2>
              <p className="text-gray-200 leading-relaxed">
                {t("about.our_story_text") ||
                  "Nacimos con el propósito de acercarte a la naturaleza sin renunciar a la comodidad. Nuestro equipo cuida cada detalle: desde el diseño de las tiendas hasta las experiencias de aventura, relax y gastronomía."}
              </p>
            </div>

            {/* Green stats card */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeIn("up", "", 0.15, 1)}
              className="rounded-2xl p-6 bg-secondary/20 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-3">
                <img src={ISOLOGO_WHITE} alt="iso" className="h-10 w-10" />
                <h3 className="font-primary text-xl">Bambucamp en números</h3>
              </div>
              <ul className="space-y-2 text-gray-200">
                <li>• 10 años de prestigio</li>
                <li>• {data.tents.length} tiendas activas</li>
                <li>• 131+ reseñas públicas</li>
                <li>• 4 líneas de experiencias</li>
              </ul>
            </motion.div>
          </motion.div>

          {/* RIGHT: big image */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn("left", "", 0.1, 1)}
            className="relative"
          >
            <div className="w-full rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
              <div className="relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[5/6]">
                <img src={TENT_FRONT} alt="Bambucamp tent front" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* NUESTRAS TIENDAS */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 py-12">
        <h2 className="font-primary text-3xl sm:text-4xl mb-6">{t("about.our_tents") || "Nuestras tiendas"}</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.tents.map((tent) => {
            const img = tent.images?.[0] ? normalizeUrl(tent.images[0]) : "";
            return (
              <article
                key={`tent_${tent.id}`}
                className="group relative rounded-3xl overflow-hidden border border-white/10
                           transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-xl/20"
              >
                {/* ⬇️ Use an <img> so it can scale on hover */}
                <div className="relative h-56 w-full overflow-hidden">
                  {img ? (
                    <img
                      src={img}
                      alt={`${tent.header} ${tent.title}`}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#111]" />
                  )}
                </div>

                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-4 relative">
                  <h3 className="text-xl font-primary">{tent.header} · {tent.title}</h3>
                  <p className="text-sm text-gray-300 line-clamp-3 mt-1">{tent.description}</p>
                  <div className="mt-3 text-sm text-gray-400">
                    {t("common.capacity") || "Capacidad"}: {tent.qtypeople} {t("common.adults") || "adultos"} · {tent.qtykids} {t("common.kids") || "niños"}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-secondary text-white px-6 sm:px-12 lg:px-24 py-12">
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeIn("up", "", 0, 1)}
          className={`${styles.sectionHeadText} flex items-center gap-x-2 pb-2`}
        >
          <img alt="isologo" src={ISOLOGO_WHITE} className="h-12 w-12" /> FAQ
        </motion.h2>

        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <div className="order-2 lg:order-1">
            {data.faqs.map((faq) => (
              <Collapsible key={`about_faq_${faq.id}`} title={faq.question} content={faq.answer} />
            ))}
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn("left", "", 0.2, 1)}
            className="order-1 lg:order-2 rounded-2xl p-6"
          >
            <h3 className="font-primary text-2xl mb-2">
              {t("about.why_us") || "¿Por qué Bambucamp?"}
            </h3>
            <ul className="list-disc pl-5 text-gray-100 space-y-2">
              <li>Glamping con estándar hotelero</li>
              <li>Experiencias personalizadas (Aventura, Amor, Experiencia, Traslado)</li>
              <li>Equipo atento y cercano</li>
            </ul>
            <motion.img
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeIn("up", "", 0.5, 1.5)}
              src={TENT_SVG}
              alt="tent"
              className="w-full lg:w-[80%] h-auto object-cover"
            />
            <div className="mt-6">
              {/* ⬇️ Label changed to book_now + click -> /booking */}
              <Button variant="light" onClick={() => navigate("/booking")}>
                {t("common.book_now")}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* RESEÑAS */}
      <section className="relative w-full h-auto bg-black">
        <div
          className="background-image absolute inset-0 w-full h-full opacity-[70%] bg-cover bg-no-repeat bg-bottom"
          style={{ backgroundImage: `url(${LUNAHUANA})` }}
        />
        <Reviews reviews={data.reviews} />
      </section>

      <Footer />
      <FooterDevelopment />
    </div>
  );
}
