// src/pages/BookComplaint.tsx
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
import { getContentWeb } from "../db/actions/common";
import type { webContent, ComplaintForm } from "../lib/interfaces";
import { ClaimFormSubmit } from "../db/actions/common";
import { z, ZodError } from "zod";
import ChatComponent from "../components/ChatWhatsapp.tsx"

const complaintSchema = z.object({
  name: z.string().min(1, { message: "validations.name_required" }),
  email: z.string().email({ message: "validations.email_invalid" }),
  phone: z.string().min(6, { message: "complaint.phone_required" }),
  documentId: z.string().min(3, { message: "complaint.doc_number_required" }),
  claimType: z.enum(["queja", "reclamo"]),
  description: z.string().min(5, { message: "complaint.details_required" }),
  reservationCode: z.string().optional(),
});

export default function BookComplaint() {
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
    setErrorMessages({});

    const form = document.getElementById("form_complaint") as HTMLFormElement;
    const get = (sel: string) =>
      form.querySelector(sel) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    const payload: ComplaintForm = {
      name: (get('input[name="name"]') as HTMLInputElement).value,
      email: (get('input[name="email"]') as HTMLInputElement).value,
      phone: (get('input[name="phone"]') as HTMLInputElement).value,
      documentId: (get('input[name="documentId"]') as HTMLInputElement).value,
      claimType: (get('input[name="claimType"]:checked') as HTMLInputElement)?.value as "queja" | "reclamo",
      description: (get('textarea[name="description"]') as HTMLTextAreaElement).value,
      reservationCode: (get('input[name="reservationCode"]') as HTMLInputElement)?.value || undefined,
    };

    try {
      complaintSchema.parse(payload);
      const ok = await ClaimFormSubmit(payload, i18n.language);
      if (ok) form.reset();
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

        {/* Form */}
        <div className="relative z-10 flex items-center justify-center px-6 py-10 order-2 lg:order-1">
          <motion.form
            id="form_complaint"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn("up", "tween", 0.2, 1)}
            onSubmit={onSubmitCreation}
            className="w-[95%] sm:w-[500px] rounded-3xl shadow-3xl p-6 sm:p-8"
            style={{ background: "rgba(0,0,0,0.6)" }}
          >
            <img alt="isologo" src={ISOLOGO_TERTIARY} className="h-12 w-12 mb-2" />
            <h2 className="text-tertiary text-2xl mb-4">{t("complaint.title")}</h2>

            {/* Nombre */}
            <div>
              <label className="font-primary text-tertiary text-sm">{t("common.name")}</label>
              <input name="name" className="w-full h-10 bg-transparent text-white px-2 border-b-2 border-secondary focus:outline-none" placeholder={t("common.name")!} />
              {errorMessages.name && <p className="text-xs text-white mt-1">{t(errorMessages.name)}</p>}
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="font-primary text-tertiary text-sm">{t("common.email")}</label>
                <input name="email" className="w-full h-10 bg-transparent text-white px-2 border-b-2 border-secondary focus:outline-none" placeholder={t("common.email")!} />
                {errorMessages.email && <p className="text-xs text-white mt-1">{t(errorMessages.email)}</p>}
              </div>
              <div>
                <label className="font-primary text-tertiary text-sm">{t("reserve.phone")}</label>
                <input name="phone" className="w-full h-10 bg-transparent text-white px-2 border-b-2 border-secondary focus:outline-none" placeholder={t("reserve.phone_number")!} />
                {errorMessages.phone && <p className="text-xs text-white mt-1">{t(errorMessages.phone)}</p>}
              </div>
            </div>

            {/* Documento (single input now) */}
            <div className="mt-3">
              <label className="font-primary text-tertiary text-sm">{t("reserve.document_id")}</label>
              <input
                name="documentId"
                className="w-full h-10 bg-transparent text-white px-2 border-b-2 border-secondary focus:outline-none"
                placeholder={t("reserve.document_id")!}
              />
              {errorMessages.documentId && <p className="text-xs text-white mt-1">{t(errorMessages.documentId)}</p>}
            </div>

            {/* Tipo: queja / reclamo */}
            <div className="flex gap-6 mt-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="claimType" value="queja" defaultChecked />
                <span>{t("complaint.queja")}</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="claimType" value="reclamo" />
                <span>{t("complaint.reclamo")}</span>
              </label>
              {errorMessages.claimType && <p className="text-xs text-white mt-1">{t(errorMessages.claimType)}</p>}
            </div>

            {/* Descripción */}
            <div className="mt-3">
              <label className="font-primary text-tertiary text-sm">{t("complaint.details")}</label>
              <textarea
                name="description"
                className="w-full h-24 bg-transparent text-white px-2 border-b-2 border-secondary focus:outline-none"
                placeholder={t("complaint.details")!}
              />
              {errorMessages.description && <p className="text-xs text-white mt-1">{t(errorMessages.description)}</p>}
            </div>

            {/* Código de reserva (opcional) */}
            <div className="mt-3">
              <label className="font-primary text-tertiary text-sm">
                {t("complaint.reservation_code") || "Reservation code (optional)"}
              </label>
              <input
                name="reservationCode"
                className="w-full h-10 bg-transparent text-white px-2 border-b-2 border-secondary focus:outline-none"
                placeholder={t("complaint.reservation_code") || "Reservation code (optional)"}
              />
              {errorMessages.reservationCode && <p className="text-xs text-white mt-1">{t(errorMessages.reservationCode)}</p>}
            </div>

            <div className="mt-5">
              <Button type="submit" variant="dark" isLoading={loadingForm}>
                {t("common.send")}
              </Button>
            </div>

          </motion.form>
        </div>

        {/* Right: título + subtítulo (igual que antes) */}
        <div className="relative z-10 flex items-center justify-center px-6 py-10 order-1 lg:order-2">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn("down", "", 0.15, 1)}
            className="max-w-lg text-center lg:text-left"
          >
            <h1 className="font-primary text-4xl sm:text-5xl">{t("complaint.header_title")}</h1>
            <p className="mt-3 text-gray-200">{t("complaint.header_subtitle")}</p>
          </motion.div>
        </div>
      </section>

      {/* FAQ / Reviews / Footer unchanged */}
      <section className="bg-secondary text-white px-6 sm:px-12 lg:px-24 py-12">
        <h2 className="text-3xl font-primary mb-4">FAQ</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            {data.faqs.map((faq) => (
              <Collapsible key={`complaint_faq_${faq.id}`} title={faq.question} content={faq.answer} />
            ))}
          </div>
          <div className="rounded-2xl p-6">
            <h3 className="font-primary text-2xl mb-2">{t("about.why_us") ?? "¿Por qué Bambucamp?"}</h3>
            <ul className="list-disc pl-5 text-gray-100 space-y-2">
              <li>Atención rápida a tus comunicaciones</li>
              <li>Seguimiento de cada caso</li>
              <li>Compromiso con la mejora continua</li>
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

      <section className="relative w-full h-auto bg-black">
        <div className="background-image absolute inset-0 w-full h-full opacity-[70%] bg-cover bg-no-repeat bg-bottom" style={{ backgroundImage: `url(${LUNAHUANA})` }}></div>
        <Reviews reviews={data.reviews} />
      </section>

      <Footer />
      <FooterDevelopment />
    </div>
  );
}
