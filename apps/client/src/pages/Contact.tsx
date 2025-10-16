// src/pages/ContactUs.tsx
import { FormEvent, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FooterDevelopment from "../components/FooterDevelopment";
import Button from "../components/ui/Button";
import { motion } from "framer-motion";
import { fadeIn } from "../lib/motions";
import { useTranslation } from "react-i18next";
import { ISOLOGO_TERTIARY, LUNAHUANA, BAMBUCAMP, TENT_SVG } from "../assets/images";
import Collapsible from "../components/Collapsible";
import Reviews from "../components/Reviews";
import { getContentWeb, ContactFormSubmit } from "../db/actions/common";
import type { webContent, ContactForm } from "../lib/interfaces";
import { z, ZodError } from "zod";
import ChatComponent from "../components/ChatWhatsapp.tsx"

const contactSchema = z.object({
  name: z.string().min(1, { message: "validations.name_required" }),
  email: z.string().email({ message: "validations.email_invalid" }),
  message: z.string().min(1, { message: "validations.message_required" }),
});

export default function ContactUs() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<webContent>({ tents: [], bundles:[], reviews: [], faqs: [] });
  const [loadingForm, setLoadingForm] = useState(false);
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const content = await getContentWeb(i18n.language);
      if (content) setData(content);
    })();
  }, [i18n.language]);

  const onSubmitCreation = async (e: FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);

    const form = document.getElementById("form_contact_page") as HTMLFormElement;
    const name = (form.querySelector('input[name="name"]') as HTMLInputElement).value;
    const email = (form.querySelector('input[name="email"]') as HTMLInputElement).value;
    const message = (form.querySelector('textarea[name="message"]') as HTMLTextAreaElement).value;

    setErrorMessages({});
    try {
      contactSchema.parse({ name, email, message });

      const payload: ContactForm = { name, email, message };
      await ContactFormSubmit(payload, i18n.language);
      form.reset();
    } catch (err) {
      if (err instanceof ZodError) {
        const map: Record<string, string> = {};
        err.errors.forEach((e) => {
          const field = String(e.path[0] ?? "");
          map[field] = String(e.message);
        });
        setErrorMessages(map);
      }
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="overflow-hidden bg-black text-white">
      <ChatComponent />
      <Navbar />

      {/* HERO + FORM */}
      <section className="relative w-full min-h-[70vh] grid grid-cols-1 lg:grid-cols-2 pt-24 sm:pt-28">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BAMBUCAMP})`, opacity: 0.4 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/90" />

        {/* Form left */}
        <div className="relative z-10 flex items-center justify-center px-6 py-10 order-2 lg:order-1">
          <motion.form
            id="form_contact_page"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn("up", "tween", 0.2, 1)}
            onSubmit={onSubmitCreation}
            className="w-[95%] sm:w-[500px] rounded-3xl shadow-3xl p-6 sm:p-8"
            style={{ background: "rgba(0,0,0,0.6)" }}
          >
            <img alt="isologo" src={ISOLOGO_TERTIARY} className="h-12 w-12 mb-2" />
            <h2 className="text-tertiary text-2xl mb-4">{t("home_page.contact_us")}</h2>

            <div className="flex flex-col gap-y-2">
              <label className="font-primary text-tertiary text-sm">{t("common.name")}</label>
              <input name="name" className="w-full h-10 bg-transparent text-white px-2 border-b-2 border-secondary focus:outline-none" placeholder={t("common.name")!} />
              {errorMessages.name && <p className="text-xs text-white">{t(errorMessages.name)}</p>}
            </div>

            <div className="flex flex-col gap-y-2 mt-2">
              <label className="font-primary text-tertiary text-sm">{t("common.email")}</label>
              <input name="email" className="w-full h-10 bg-transparent text-white px-2 border-b-2 border-secondary focus:outline-none" placeholder={t("common.email")!} />
              {errorMessages.email && <p className="text-xs text-white">{t(errorMessages.email)}</p>}
            </div>

            <div className="flex flex-col gap-y-2 mt-2">
              <label className="font-primary text-tertiary text-sm">{t("home_page.contact_form_message")}</label>
              <textarea name="message" className="w-full h-24 bg-transparent text-white px-2 border-b-2 border-secondary focus:outline-none" placeholder={t("home_page.contact_form_message")!} />
              {errorMessages.message && <p className="text-xs text-white">{t(errorMessages.message)}</p>}
            </div>

            <div className="mt-5">
              <Button type="submit" variant="dark" isLoading={loadingForm}>
                {t("common.send")}
              </Button>
            </div>
          </motion.form>
        </div>

        {/* Right header/subtitle */}
        <div className="relative z-10 flex items-center justify-center px-6 py-10 order-1 lg:order-2">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn("down", "", 0.15, 1)}
            className="max-w-lg text-center lg:text-left"
          >
            <h1 className="font-primary text-4xl sm:text-5xl">{t("contact.header_title") || "Hablemos"}</h1>
            <p className="mt-3 text-gray-200">{t("contact.header_subtitle") || "Cuéntanos tu idea, pregunta o comentario. Te responderemos pronto."}</p>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-secondary text-white px-6 sm:px-12 lg:px-24 py-12">
        <h2 className="text-3xl font-primary mb-4">FAQ</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            {data.faqs.map((faq) => (
              <Collapsible key={`contact_faq_${faq.id}`} title={faq.question} content={faq.answer} />
            ))}
          </div>
          <div className=" rounded-2xl p-6">
            <h3 className="font-primary text-2xl mb-2">{t("about.why_us") ?? "¿Por qué Bambucamp?"}</h3>
            <ul className="list-disc pl-5 text-gray-100 space-y-2">
              <li>Atención personalizada</li>
              <li>Respuestas claras y rápidas</li>
              <li>Compromiso con tu experiencia</li>
            </ul>
            <motion.img
              initial="hidden"
              whileInView='show'
              viewport={{ once: true }}
              variants={fadeIn("up", "", 0.5, 1.5)}
              src={TENT_SVG} alt="tent" className="w-full lg:w-[80%] h-auto object-cover" />
          </div>
        </div>
      </section>

      {/* Reseñas */}
      <section className="relative w-full h-auto bg-black">
        <div className="background-image absolute inset-0 w-full h-full opacity-[70%] bg-cover bg-no-repeat bg-bottom" style={{ backgroundImage: `url(${LUNAHUANA})` }}></div>
        <Reviews reviews={data.reviews} />
      </section>

      <Footer />
      <FooterDevelopment />
    </div>
  );
}
