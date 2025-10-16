import { FormEvent, useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import Banner from "../assets/video/Banner.mp4";
import FooterBanner from "../assets/video/Footer.mp4";
import { LOGO_THIRD, TENT_SVG, SERVICE_1, SERVICE_2, SERVICE_3, SERVICE_4, SERVICE_5, SERVICE_6, SERVICE_7, SERVICE_8, ISOLOGO_TERTIARY, ISOLOGO_WHITE } from "../assets/images"
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion"
import { styles } from "../lib/styles"
import { fadeIn } from "../lib/motions"
import SearchDatesBar from "../components/SearchBar"
import BundlesCarousel from "../components/BundlesCarousel";
import Reviews from "../components/Reviews"
import Footer from "../components/Footer"
import { ZodError } from 'zod';
import Button from "../components/ui/Button"
import { formHomeSchema } from "../db/schemas.ts"
import Collapsible from "../components/Collapsible"
import { useTranslation } from "react-i18next"
import WavesIcon from "../assets/images/svg/waves.svg?react";
import PizzaIcon from "../assets/images/svg/pizza.svg?react";
import TentIcon from "../assets/images/svg/tent.svg?react";
import MartiniIcon from "../assets/images/svg/martini.svg?react";
import HandHeartIcon from "../assets/images/svg/hand-heart.svg?react";
import DicesIcon from "../assets/images/svg/dices.svg?react";
import BeefIcon from "../assets/images/svg/beef.svg?react";
import CartTaxiFrontIcon from "../assets/images/svg/car-taxi-front.svg?react";

import ChatComponent from "../components/ChatWhatsapp.tsx"
import { ContactForm, webContent } from "../lib/interfaces.ts";
import { ContactFormSubmit, getContentWeb } from "../db/actions/common.ts";
import FooterDevelopment from "../components/FooterDevelopment.tsx";
import HeroTentCarousel from "../components/HeroTentCarousel.tsx";

const ServiceCard = ({
  name, image, to, children
}: { name: string; image: string; to: string; children: React.ReactNode }) => {
  return (
    <Link to={to} className="relative row-span-1 col-span-1 hover:scale-105 hover:z-20 transition-all flex flex-col items-center justify-center cursor-pointer bg-primary max-lg:py-6">
      <div className="absolute w-full h-full left-0 top-0 bg-no-repeat bg-cover bg-center opacity-[20%]" style={{ backgroundImage: `url(${image})` }} />
      <h2 className="text-white text-lg lg:text-4xl z-[50]">{name}</h2>
      {children}
    </Link>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [dataWebHome, setDataWebHome] = useState<webContent>({ tents: [], bundles:[], reviews: [], faqs: [] })

  useEffect(() => {
    getContentWebHandler();
  }, [])

  const getContentWebHandler = async () => {
    const webContent = await getContentWeb(i18n.language);
    if (webContent) {
      setDataWebHome(webContent);
    }
  }

  const [loadingForm, setLoadingForm] = useState<boolean>(false);

  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});

  const validateFields = (): ContactForm | null => {
    const form = document.getElementById("form_contact_home") as HTMLFormElement;
    const name = (form.querySelector('input[name="name"]') as HTMLInputElement).value;
    const email = (form.querySelector('input[name="email"]') as HTMLInputElement).value;
    const message = (form.querySelector('textarea[name="message"]') as HTMLInputElement).value;

    setErrorMessages({});

    try {

      formHomeSchema.parse({ email, name, message });

      return {
        name,
        email,
        message,
      };

    } catch (error) {
      if (error instanceof ZodError) {
        const newErrorMessages: Record<string, string> = {};
        error.errors.forEach(err => {
          const fieldName = err.path[0] as string;
          newErrorMessages[fieldName] = err.message;
        });
        setErrorMessages(newErrorMessages);
      }
      return null;
    }
  };

  const onSubmitCreation = async (e: FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    const fieldsValidated = validateFields();
    if (fieldsValidated != null) {
      await ContactFormSubmit(fieldsValidated, i18n.language);
    }
    setLoadingForm(false);
  };

  return (
    <div className="overflow-hidden">
      <ChatComponent />
      <Navbar />
      <div id="hero" className="relative w-full h-[100vh] flex flex-col justify-center items-center z-[20]">
        <video src={Banner} autoPlay loop muted className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none" />
        <motion.div
          initial="hidden"
          whileInView='show'
          viewport={{ once: true }}
          variants={fadeIn("down", "", 0, 2)}
          className="h-auto  sm:h-[20%] lg:h-[25%] w-[90%] sm:w-auto bg-transparent z-[10]">
          <img src={LOGO_THIRD} alt="logo_lg" className="w-full h-full object-cover" />
        </motion.div>
        <SearchDatesBar />
      </div>



      <div id="reviews" className="relative w-[100vw] h-auto overflow-hidden">
        <Reviews reviews={dataWebHome.reviews} />
      </div>

      <div
        id="us-section"
        className="relative w-full h-auto flex flex-col justify-center items-center"
      >
        <div className="relative z-20 flex flex-col justify-center items-center gap-y-6 w-full max-w-7xl py-12 px-6 sm:px-12 lg:px-48">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn("down", "", 0.3, 1)}
            className="font-primary text-secondary text-center text-4xl sm:text-5xl p-4"
          >
            {t("home_page.greeting")}
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn("down", "", 0.5, 1)}
            className="font-primary text-center"
          >
            <p className="text-tertiary font-secondary text-md">
              {t("home_page.greeting_description")}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn("down", "", 0.8, 1)}
            className="flex flex-row max-sm:flex-wrap justify-center items-center max-sm:gap-4 sm:gap-x-4"
          >
            <Button variant="dark" onClick={() => navigate("/booking")}>
              {t("common.book_now")}
            </Button>
            <Button variant="ghostLight" onClick={() => navigate("/about")}>
              {t("home_page.see_tents")}
            </Button>
            <Button variant="ghostLight" onClick={() => navigate("/services/experiencia")}>
              {t("home_page.see_services")}
            </Button>
            <Button variant="dark" onClick={() => navigate("/services/aventura")}>
              {t("home_page.learn_more")}
            </Button>
          </motion.div>
        </div>
      </div>

      {dataWebHome.tents.length > 0 && (
        <div id="services-section" className="relative w-full h-[100vh] flex flex-col justify-center items-start">
          <HeroTentCarousel
            tents={dataWebHome.tents}
            textSide="left"
            heightClass="h-[100vh]"
            onSelectPrimary={(_) => navigate("/booking")}
            primaryCtaLabel={t("common.book_now")}
          />
        </div>

      )}

      {dataWebHome.bundles?.length > 0 && (
        <BundlesCarousel
          bundles={dataWebHome.bundles}
          intervalMs={10000}
          onRequestBundle={() =>
            window.open("https://wa.link/ioswo5", "_blank", "noopener,noreferrer")
          }
        />
      )}


      <div id="services-2-section" className="h-auto sm:h-[100vh] w-full grid grid-rows-8 sm:grid-rows-2 grid-cols-1 sm:grid-cols-4 relative overflow-hidden">
        <h1 className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-[40px] sm:text-[80px] text-white font-primary z-[100]">{t("common.services")}</h1>

        {/* Mapeo hacia páginas reales */}
        <ServiceCard name="BambuAdventure" image={SERVICE_1} to="/services/adventure">
          <WavesIcon className="h-6 sm:h-12 w-6 sm:w-12 z-[50] text-white mt-4" />
        </ServiceCard>

        {/* Food/Relax/Drinks/Games no están como categorías en tu dataset, los llevamos a 'experiencia' */}
        <ServiceCard name="BambuFood" image={SERVICE_2} to="/services/experience">
          <PizzaIcon className="h-6 sm:h-12 w-6 sm:w-12 z-[50] text-white mt-4" />
        </ServiceCard>

        <ServiceCard name="BambuRelax" image={SERVICE_3} to="/services/bundles">
          <TentIcon className="h-6 sm:h-12 w-6 sm:w-12 z-[50] text-white mt-4" />
        </ServiceCard>

        <ServiceCard name="BambuDrinks" image={SERVICE_4} to="/services/experience">
          <MartiniIcon className="h-6 sm:h-12 w-6 sm:w-12 z-[50] text-white mt-4" />
        </ServiceCard>

        <ServiceCard name="BambuLove" image={SERVICE_5} to="/services/love">
          <HandHeartIcon className="h-6 sm:h-12 w-6 sm:w-12 z-[50] text-white mt-4" />
        </ServiceCard>

        <ServiceCard name="BambuGames" image={SERVICE_6} to="/services/experiencia">
          <DicesIcon className="h-6 sm:h-12 w-6 sm:w-12 z-[50] text-white mt-4" />
        </ServiceCard>

        <ServiceCard name="BambuExtras" image={SERVICE_7} to="/services/experience">
          <BeefIcon className="h-6 sm:h-12 w-6 sm:w-12 z-[50] text-white mt-4" />
        </ServiceCard>

        <ServiceCard name="BambuTaxis" image={SERVICE_8} to="/services/transfer">
          <CartTaxiFrontIcon className="h-6 sm:h-12 w-6 sm:w-12 z-[50] text-white mt-4" />
        </ServiceCard>
      </div>

      <div id="FAQ" className="relative w-full h-auto lg:h-[100vh] grid grid-cols-1 lg:grid-cols-2 overflow-hidden px-12 sm:px-24 2xl:px-36 py-24 bg-secondary text-white max-lg:gap-y-4">
        <div className="lg:flex w-full h-full col-span-1 flex-col justify-center items-start gap-y-6">
          <motion.h2
            initial="hidden"
            whileInView='show'
            viewport={{ once: true }}
            variants={fadeIn("up", "", 0, 1.5)}
            className={`${styles.sectionHeadText} flex items-center gap-x-2 pb-2`}><img alt="isologo" src={ISOLOGO_WHITE} className="h-16 w-16 " /> FAQ</motion.h2>
          <motion.h3
            initial="hidden"
            whileInView='show'
            viewport={{ once: true }}
            variants={fadeIn("up", "", 0.5, 1.5)}
            className={`${styles.sectionSubText} text-white`}>{t("home_page.faqs_header")}</motion.h3>
          <motion.img
            initial="hidden"
            whileInView='show'
            viewport={{ once: true }}
            variants={fadeIn("up", "", 0.5, 1.5)}
            src={TENT_SVG} alt="tent" className="w-full lg:w-[80%] h-auto object-cover" />
        </div>
        <motion.div
          initial="hidden"
          whileInView='show'
          viewport={{ once: true }}
          variants={fadeIn("left", "tween", 0.8, 1.5)}
          className="block w-full h-full col-span-1 flex-col justify-start items-center">
          {dataWebHome.faqs.map((faq) => {
            return (
              <Collapsible key={`faqs_question_${faq.id}`} title={faq.question} content={faq.answer} />
            )
          })}
        </motion.div>
      </div>

      <div id="contact-section" className="relative w-full h-[100vh] flex flex-col justify-center items-center z-[20]">
        <video src={FooterBanner} autoPlay loop muted className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none" />
        <motion.form
          initial="hidden"
          whileInView='show'
          viewport={{ once: true }}
          variants={fadeIn("up", "tween", 0.8, 1.5)}
          id="form_contact_home" className="w-[90%] sm:w-[400px] h-auto flex flex-col justify-center items-center rounded-3xl shadow-3xl p-4 sm:p-6 z-[50]" style={{ background: "rgba(255,255,255,0.20)" }} onSubmit={(e) => onSubmitCreation(e)}>
          <img alt="isologo" src={ISOLOGO_TERTIARY} className="h-16 w-16 " />
          <h2 className="text-tertiary text-2xl my-2">{t("home_page.contact_us")}</h2>


          <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1 gap-y-2 sm:gap-y-1">
            <label htmlFor="name" className="font-primary text-tertiary text-sm h-auto">{t("common.name")}</label>
            <input name="name" className="w-full h-8 sm:h-10 text-xs sm:text-md bg-transparent text-white focus:text-white placeholder:text-white px-2 border-b-2 border-secondary focus:outline-none" placeholder={t("common.name")} />
            <div className="w-full h-6">
              {errorMessages.name &&
                <motion.p
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={fadeIn("up", "", 0, 1)}
                  className="h-6 text-[10px] sm:text-xs text-white font-tertiary">{t(errorMessages.name)}
                </motion.p>
              }
            </div>
          </div>

          <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1 gap-y-2 sm:gap-y-1">
            <label htmlFor="email" className="font-primary text-tertiary text-sm h-auto">{t("common.email")}</label>
            <input name="email" className="w-full h-8 sm:h-10 text-xs sm:text-md bg-transparent text-white focus:text-white placeholder:text-white px-2 border-b-2 border-secondary focus:outline-none" placeholder={t("common.email")} />
            <div className="w-full h-6">
              {errorMessages.email &&
                <motion.p
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={fadeIn("up", "", 0, 1)}
                  className="h-6 text-[10px] sm:text-xs text-white font-tertiary">{t(errorMessages.email)}
                </motion.p>
              }
            </div>
          </div>


          <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden my-1 gap-y-2 sm:gap-y-1">
            <label htmlFor="message" className="font-primary text-tertiary text-sm h-auto">{t("home_page.contact_form_message")}</label>
            <textarea name="message" className="w-full h-12 text-xs sm:text-md bg-transparent text-white focus:text-white placeholder:text-white px-2 border-b-2 border-secondary focus:outline-none" placeholder={t("home_page.contact_form_message")}>
            </textarea>
            <div className="w-full h-6">
              {errorMessages.message &&
                <motion.p
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={fadeIn("up", "", 0, 1)}
                  className="h-6 text-[10px] sm:text-xs text-white font-tertiary">{t(errorMessages.message)}
                </motion.p>
              }
            </div>
          </div>

          <Button variant="dark" type="submit" isLoading={loadingForm}>{t("common.send")}</Button>
        </motion.form>
      </div>
      <Footer />
      <FooterDevelopment />
    </div>
  )
}

export default Home
