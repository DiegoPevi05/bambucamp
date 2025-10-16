import Smartphone from "../assets/images/svg/smartphone.svg?react";
import Mail from "../assets/images/svg/mail.svg?react";
import MapPin from "../assets/images/svg/map-pin.svg?react";
import Facebook from "../assets/images/svg/facebook.svg?react";
import Instagram from "../assets/images/svg/instagram.svg?react";
import TikTok from "../assets/images/svg/tiktok.svg?react";

import { LOGO_PRIMARY } from "../assets/images";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const FooterLink = ({ children, to }: { children: React.ReactNode; to: string }) => {
  const handleClick = () => {
    // smooth scroll to top on navigation
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <Link to={to} onClick={handleClick} className="text-white text-sm hover:underline duration-300 flex flex-row">
      {children}
    </Link>
  );
};

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="relative w-full h-auto bg-primary grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 px-12 sm:px-24 lg:px-48 py-12 lg:pt-12 gap-y-6 lg:gap-x-12">
      <div className="col-span-1 flex flex-col gap-y-2">
        <Link to="/" className="hover:scale-[1.05] transition-all duration-300 rounded-full bg-white top-8 w-[120px] h-[120px] flex items-center justify-center">
          <img src={LOGO_PRIMARY} alt="logo" className="w-[80px] h-[80px]" />
        </Link>
        <p className="text-white text-md">Bambucamp Glamping</p>
        <p className="text-white text-xs">{t("common.all_rights_reserved")} {new Date().getFullYear()}</p>
      </div>

      <div className="hidden sm:block max-sm:col-span-1 lg:hidden flex-col gap-y-2" />

      {/* Navegación */}
      <div className="col-span-1 flex flex-col gap-y-2">
        <FooterLink to="/">{t("common.home")}</FooterLink>
        <FooterLink to="/about">{t("common.about_us")}</FooterLink>
        <FooterLink to="/booking">{t("reserve.reservations")}</FooterLink>
      </div>

      {/* Servicios */}
      <div className="col-span-1 flex flex-col gap-y-2">
        <FooterLink to="/services/bundles">{t("services.bundles")}</FooterLink>
        <FooterLink to="/services/love">{t("services.love")}</FooterLink>
        <FooterLink to="/services/adventure">{t("services.adventure")}</FooterLink>
        <FooterLink to="/services/experience">{t("services.experience")}</FooterLink>
        <FooterLink to="/services/transfer">{t("services.transfer")}</FooterLink>
      </div>

      {/* Políticas */}
      <div className="col-span-1 flex flex-col gap-y-2">
        <FooterLink to="/policies/services">{t("common.service_politics")}</FooterLink>
        <FooterLink to="/policies/privacy">{t("common.privacy_politics")}</FooterLink>
        <FooterLink to="/complaints-book">{t("common.complaints_book")}</FooterLink>
        <FooterLink to="/contact">{t("home_page.contact_us")}</FooterLink>
      </div>

      {/* Contacto / Redes */}
      <div className="col-span-1 flex flex-col gap-y-3">
        <h2 className="font-primary text-white text-md">{t("home_page.contact_us")}</h2>
        <div className="flex flex-row gap-x-4">
          <div className="flex flex-row gap-x-2 text-white">
            <Smartphone className="h-4 w-4" />
            <p className="font-primary text-sm"> +51 912-135-696</p>
          </div>
        </div>

        <a href="mailto:reservas@bambucamp.com" target="_blank" className="flex flex-row gap-x-2 text-white hover:text-primary duration-300">
          <Mail className="h-4 w-4" />
          <p className="font-primary text-sm">reservas@bambucamp.com</p>
        </a>

        <div className="flex flex-row gap-x-2 text-white">
          <MapPin className="h-4 w-4" />
          <p className="font-primary text-sm">Jita pasaje cuatro esquina, Lunahuaná 15727</p>
        </div>

        <div className="flex flex-row gap-x-6 text-white">
          <a href="https://www.facebook.com/bambucamp" target="_blank" className="font-primary text-sm hover:scale-[1.05] hover:text-primary duration-300">
            <Facebook className="h-6 w-6" />
          </a>
          <a href="https://www.instagram.com/bambucamp_glamping" target="_blank" className="font-primary text-sm hover:scale-[1.05] hover:text-primary duration-300">
            <Instagram className="h-6 w-6" />
          </a>
          <a href="https://www.tiktok.com/@bambucampglamping" target="_blank" className="font-primary text-sm hover:scale-[1.05] hover:text-primary duration-300">
            <TikTok className="h-6 w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
