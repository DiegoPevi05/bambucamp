// src/pages/PoliciesServices.tsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FooterDevelopment from "../components/FooterDevelopment";
import Button from "../components/ui/Button";
import { motion } from "framer-motion";
import { fadeIn } from "../lib/motions";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { RECEPTION_1 } from "../assets/images";
import ChatComponent from "../components/ChatWhatsapp.tsx"

export default function PoliciesServices() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="bg-black text-white min-h-screen overflow-hidden">
      <ChatComponent />
      <Navbar />

      {/* HERO with image + bottom gradient into black */}
      <section className="relative pt-28 min-h-[50vh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${RECEPTION_1})` }}
        />
        {/* Gradient to fade to black at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black" />

        {/* Foreground content */}
        <div className="relative z-10 px-6 sm:px-12 lg:px-24 pb-6 text-center">
          <motion.h1
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn("down", "", 0, 1)}
            className="font-primary text-4xl sm:text-6xl"
          >
            {t("policies.services_title")}
          </motion.h1>
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn("up", "", 0.1, 1)}
            className="text-gray-200 mt-3 max-w-3xl mx-auto"
          >
            {t("policies.services_subtitle")}
          </motion.p>

          <div className="mt-6 flex justify-center">
            <Button variant="dark" onClick={() => navigate("/booking")}>
              {t("common.book_now")}
            </Button>
          </div>
        </div>
      </section>

      {/* CONTENT (solid black background continues) */}
      <main className="px-6 sm:px-12 lg:px-24 pb-16 max-w-5xl mx-auto space-y-8">
        <section>
          <h2 className="font-primary text-2xl sm:text-3xl mb-2">1. Alcance</h2>
          <p className="text-gray-200">
            Esta política regula la prestación de servicios de Bambucamp, incluyendo
            experiencias, productos complementarios y condiciones de reserva.
          </p>
        </section>

        <section>
          <h2 className="font-primary text-2xl sm:text-3xl mb-2">2. Reservas y pagos</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-200">
            <li>Las reservas se confirman al completar el proceso de pago indicado.</li>
            <li>Los precios incluyen impuestos cuando corresponda.</li>
            <li>Los servicios adicionales se abonan previo a su ejecución o según se indique.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-primary text-2xl sm:text-3xl mb-2">3. Cambios y cancelaciones</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-200">
            <li>Los cambios están sujetos a disponibilidad y posibles diferencias de tarifa.</li>
            <li>Las cancelaciones podrían aplicar penalidades según la antelación.</li>
            <li>Las condiciones especiales se informarán en cada servicio o promoción.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-primary text-2xl sm:text-3xl mb-2">4. Conducta y seguridad</h2>
          <p className="text-gray-200">
            El huésped se compromete a respetar normas internas, horarios y lineamientos de
            seguridad; el incumplimiento podría derivar en la interrupción del servicio.
          </p>
        </section>

        <section>
          <h2 className="font-primary text-2xl sm:text-3xl mb-2">5. Fuerza mayor</h2>
          <p className="text-gray-200">
            En caso de eventos de fuerza mayor, Bambucamp podrá reprogramar o emitir créditos,
            priorizando la seguridad y continuidad operativa.
          </p>
        </section>

        <section>
          <h2 className="font-primary text-2xl sm:text-3xl mb-2">6. Contacto</h2>
          <p className="text-gray-200">
            Para consultas o soporte, comunícate con nuestro equipo mediante los canales
            oficiales indicados en el sitio web.
          </p>
        </section>
      </main>

      <Footer />
      <FooterDevelopment />
    </div>
  );
}
