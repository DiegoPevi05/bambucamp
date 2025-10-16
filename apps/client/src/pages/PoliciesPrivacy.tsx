// src/pages/PoliciesPrivacy.tsx
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

export default function PoliciesPrivacy() {
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
            {t("policies.privacy_title")}
          </motion.h1>
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn("up", "", 0.1, 1)}
            className="text-gray-200 mt-3 max-w-3xl mx-auto"
          >
            {t("policies.privacy_subtitle")}
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
          <h2 className="font-primary text-2xl sm:text-3xl mb-2">1. Datos que recopilamos</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-200">
            <li>Identificación y contacto (nombre, correo, teléfono).</li>
            <li>Datos de reserva (fechas, servicios solicitados, preferencias).</li>
            <li>Información técnica básica (IP, dispositivo, analítica de uso).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-primary text-2xl sm:text-3xl mb-2">2. Finalidades</h2>
          <p className="text-gray-200">
            Gestionar reservas, brindar soporte, mejorar nuestros servicios y, con tu
            consentimiento, enviarte comunicaciones comerciales relevantes.
          </p>
        </section>

        <section>
          <h2 className="font-primary text-2xl sm:text-3xl mb-2">3. Conservación</h2>
          <p className="text-gray-200">
            Conservamos los datos durante el tiempo necesario para cumplir las finalidades o
            exigencias legales aplicables.
          </p>
        </section>

        <section>
          <h2 className="font-primary text-2xl sm:text-3xl mb-2">4. Derechos</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-200">
            <li>Acceso, rectificación, actualización y supresión de datos.</li>
            <li>Oposición o limitación del tratamiento conforme a la normativa.</li>
            <li>Portabilidad cuando sea procedente.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-primary text-2xl sm:text-3xl mb-2">5. Seguridad</h2>
          <p className="text-gray-200">
            Aplicamos medidas técnicas y organizativas para proteger tus datos frente a accesos
            no autorizados, alteraciones o pérdidas.
          </p>
        </section>

        <section>
          <h2 className="font-primary text-2xl sm:text-3xl mb-2">6. Contacto de privacidad</h2>
          <p className="text-gray-200">
            Si deseas ejercer tus derechos o realizar consultas, contáctanos a través de los
            medios indicados en el sitio web.
          </p>
        </section>
      </main>

      <Footer />
      <FooterDevelopment />
    </div>
  );
}
