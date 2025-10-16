import { useState } from "react";

import User from "../assets/images/svg/user.svg?react";
import AlignJustify from "../assets/images/svg/align-justify.svg?react";
import Facebook from "../assets/images/svg/facebook.svg?react";
import Instagram from "../assets/images/svg/instagram.svg?react";
import TikTok from "../assets/images/svg/tiktok.svg?react";
import X from "../assets/images/svg/x.svg?react";
import CalendarCheck from "../assets/images/svg/calendar-check.svg?react";
import ShoppingCart from "../assets/images/svg/shopping-cart.svg?react";

import Button from "./ui/Button";
import { LOGO_PRIMARY } from "../assets/images";
import { fadeIn, slideIn } from "../lib/motions";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageDropDownList from "./ui/LanguageSelector";
import { useAuth } from "../contexts/AuthContext";
import DropDownListAccount from "./DropDownListAccount";
import { useCart } from "../contexts/CartContext";
import ShopCart from "./ShopCart";

const NavBarItem = ({
  children,
  index,
  route,
  scrollTarget,
  goToRoute,
}: {
  children: string;
  index: number;
  route?: string;
  scrollTarget?: string;
  goToRoute: (route: string) => void;
}) => {
  const handleClick = () => {
    if (scrollTarget) {
      const targetElement = document.getElementById(scrollTarget);
      if (targetElement) targetElement.scrollIntoView({ behavior: "smooth" });
    } else if (route) {
      goToRoute(route);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      viewport={{ once: true }}
      variants={fadeIn("down", "", 1 + 0.1 * index, 1)}
      onClick={handleClick}
      className="w-auto h-[80px] flex flex-column justify-center items-center"
    >
      <li className="text-secondary text-lg 2xl:text-xl hover:scale-[1.05] hover:text-white ease-in-out duration-300 transition-all cursor-pointer">
        {children}
      </li>
    </motion.div>
  );
};

const NavBarItemMobile = ({
  children,
  index,
  route,
  scrollTarget,
  goToRoute,
  closeNavBar,
}: {
  children: React.ReactNode;
  index: number;
  route?: string;
  scrollTarget?: string;
  goToRoute: (route: string) => void;
  closeNavBar: () => void;
}) => {
  const handleClick = () => {
    if (scrollTarget) {
      const targetElement = document.getElementById(scrollTarget);
      if (targetElement) targetElement.scrollIntoView({ behavior: "smooth" });
    } else if (route) {
      goToRoute(route);
    }
    closeNavBar();
  };
  return (
    <motion.div
      initial="hidden"
      animate="show"
      viewport={{ once: true }}
      variants={slideIn("right", "", 0.1 * index, 0.3)}
      className="w-full h-auto sm:h-auto"
      onClick={handleClick}
    >
      <li className="text-white text-md hover:scale-[1.05] hover:text-tertiary ease-in-out duration-300 transition-all cursor-pointer">
        {children}
      </li>
    </motion.div>
  );
};

const services = [
  { key: "services.bundles", to: "/services/bundles" },
  { key: "services.adventure", to: "/services/adventure" },
  { key: "services.love", to: "/services/love" },
  { key: "services.experience", to: "/services/experience" },
  { key: "services.transfer", to: "/services/transfer" },
];

// NEW: Contact dropdown links
const contactLinks = [
  { key: "home_page.contact_us", to: "/contact" },
  { key: "common.complaints_book", to: "/complaints-book" },
  { key: "policies.privacy", to: "/policies/privacy" },
  { key: "policies.services", to: "/policies/services" },
];

const Navbar = () => {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [openSideBar, setOpenSideBar] = useState<boolean>(false);
  const [openCart, setOpenCart] = useState<boolean>(false);
  const [openServices, setOpenServices] = useState<boolean>(false);
  const [openContact, setOpenContact] = useState<boolean>(false); // NEW

  const { t } = useTranslation();
  const navigate = useNavigate();

  const goToRoute = (route: string) => navigate(route);
  const toogleSidebar = () => setOpenSideBar(!openSideBar);
  const toogleCart = () => setOpenCart(!openCart);

  return (
    <nav className={`sm:px-16 px-2 sm:py-16 py-10 w-full flex flex-row justify-center items-center bg-black-to-transparent absolute top-0 z-[100] max-h-[80px]`}>
      <div className="w-[50%] lg:w-[20%] flex justify-start lg:justify-center items-center h-[80px] sm:h-[125px]">
      </div>

      {/* Desktop nav */}
      <ul className="hidden w-[60%] lg:flex flex-row items-center justify-center gap-x-8">
        <NavBarItem index={0} route="/" goToRoute={goToRoute}>
          {t("common.home")}
        </NavBarItem>
        <NavBarItem index={1} route="/about" goToRoute={goToRoute}>
          {t("common.us")}
        </NavBarItem>
        <NavBarItem index={2} route="/booking" goToRoute={goToRoute}>
          {t("reserve.reservations")}
        </NavBarItem>

        {/* Services dropdown */}
        <motion.div
          className="relative h-[80px] flex items-center"
          onMouseEnter={() => setOpenServices(true)}
          onMouseLeave={() => setOpenServices(false)}
          initial="hidden"
          animate="show"
          variants={fadeIn("down", "", 1.4, 1)}
        >
          <button
            type="button"
            className="text-secondary text-lg 2xl:text-xl hover:text-white transition-colors"
          >
            {t("common.services")}
          </button>

          <AnimatePresence>
            {openServices && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                className="absolute top-[70%] left-0 -translate-x-1/2 mt-2 w-56 rounded-2xl border border-white/10 bg-black/90 backdrop-blur shadow-2xl p-2"
              >
                {services.map((s) => (
                  <button
                    key={s.to}
                    onClick={() => goToRoute(s.to)}
                    className="w-full text-left px-3 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {t(s.key)}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* NEW: Contact dropdown */}
        <motion.div
          className="relative h-[80px] flex items-center"
          onMouseEnter={() => setOpenContact(true)}
          onMouseLeave={() => setOpenContact(false)}
          initial="hidden"
          animate="show"
          variants={fadeIn("down", "", 1.6, 1)}
        >
          <button
            type="button"
            className="text-secondary text-lg 2xl:text-xl hover:text-white transition-colors"
          >
            {t("home_page.information")}
          </button>

          <AnimatePresence>
            {openContact && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                className="absolute top-[70%] left-0 -translate-x-1/2 mt-2 w-64 rounded-2xl border border-white/10 bg-black/90 backdrop-blur shadow-2xl p-2"
              >
                {contactLinks.map((c) => (
                  <button
                    key={c.to}
                    onClick={() => goToRoute(c.to)}
                    className="w-full text-left px-3 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {t(c.key)}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </ul>

      <div className="w-[50%] lg:w-[20%] h-full flex justify-end items-center">
        <LanguageDropDownList />
        <button
          onClick={toogleCart}
          className="duration-300 group active:scale-95 hover:scale-105 flex justify-center items-center relative text-white mr-1 lg:ml-2 lg:mr-8"
        >
          <ShoppingCart className="hover:text-tertiary h-6 sm:h-8 w-8 sm:w-8 duration-300" />
          {totalItems > 0 && (
            <span className="absolute -top-3 -right-4 h-6 w-6 flex items-center justify-center text-xs bg-secondary text-white rounded-full">
              {totalItems}
            </span>
          )}
        </button>
        {user ? (
          <DropDownListAccount user={user} isDashboard={false} />
        ) : (
          <Button effect="default" className="hidden lg:flex" onClick={() => goToRoute("/signin")}>
            {t("auth.log_in")}
            <User className="w-6 h-6" />
          </Button>
        )}
        <Button
          onClick={toogleSidebar}
          variant={"ghostLight"}
          effect={"default"}
          className="flex justify-center items-center lg:hidden h-10 lg:h-14 w-10 lg:w-14 p-0 !bg-transparent !color-white !border-transparent"
        >
          <AlignJustify className="w-6 h-6" />
        </Button>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden ${!openSideBar ? "pointer-events-none" : ""} w-screen h-screen absolute top-0 left-0`}>
        <div className={`lg:hidden w-screen h-[100vh] fixed top-0 ${!openSideBar ? "left-[100%]" : "left-0"} bottom-0 z-[120] bg-secondary duration-300 transition-all`}>
          <div className="h-10 sm:h-16 w-10 sm:w-16 absolute top-12 right-12">
            <X onClick={toogleSidebar} className="h-full w-auto text-white cursor-pointer hover:text-primary" />
          </div>
          <div className="w-full h-full flex flex-col justify-start items-start p-12">
            <a
              href="/"
              className="relative hover:cursor-pointer hover:scale-[1.05] transition-all duration-300 rounded-full bg-white top-0 w-[80px] sm:w-[125px] h-[80px] sm:h-[125px] flex items-center justify-center"
            >
              <img src={LOGO_PRIMARY} alt="logo" className="w-[40px] sm:w-[90px] h-[40px] sm:h-[90px]" />
            </a>

            <ul className="flex flex-col justify-start items-start gap-y-4 mt-16">
              <NavBarItemMobile closeNavBar={() => setOpenSideBar(false)} route="/about" goToRoute={goToRoute} index={1}>
                {t("common.us")}
              </NavBarItemMobile>
              <NavBarItemMobile closeNavBar={() => setOpenSideBar(false)} route="/booking" goToRoute={goToRoute} index={2}>
                {t("reserve.reservations")}
              </NavBarItemMobile>

              <motion.div
                initial="hidden"
                animate="show"
                viewport={{ once: true }}
                variants={slideIn("right", "", 0.1 * 3, 0.3)}
                className="w-full h-auto sm:h-auto"
              >
                <li className="text-white text-md hover:scale-[1.05] hover:text-tertiary ease-in-out duration-300 transition-all cursor-pointer">
                  {t("common.services")}
                </li>
              </motion.div>
              <ul className="flex flex-col justify-start items-start gap-y-4 pl-4">
                {/* Services (mobile) */}
                <NavBarItemMobile closeNavBar={() => setOpenSideBar(false)} route="/services/aventura" goToRoute={goToRoute} index={4}>
                  {t("services.adventure")}
                </NavBarItemMobile>
                <NavBarItemMobile closeNavBar={() => setOpenSideBar(false)} route="/services/amor" goToRoute={goToRoute} index={5}>
                  {t("services.love")}
                </NavBarItemMobile>
                <NavBarItemMobile closeNavBar={() => setOpenSideBar(false)} route="/services/experiencia" goToRoute={goToRoute} index={6}>
                  {t("services.experience")}
                </NavBarItemMobile>
                <NavBarItemMobile closeNavBar={() => setOpenSideBar(false)} route="/services/traslado" goToRoute={goToRoute} index={7}>
                  {t("services.transfer")}
                </NavBarItemMobile>
              </ul>


              {/* NEW: Contact links (mobile) */}
              <NavBarItemMobile closeNavBar={() => setOpenSideBar(false)} route="/contact" goToRoute={goToRoute} index={8}>
                {t("home_page.contact_us")}
              </NavBarItemMobile>
              <NavBarItemMobile closeNavBar={() => setOpenSideBar(false)} route="/complaints-book" goToRoute={goToRoute} index={9}>
                {t("common.complaints_book")}
              </NavBarItemMobile>
              <NavBarItemMobile closeNavBar={() => setOpenSideBar(false)} route="/policies/privacy" goToRoute={goToRoute} index={10}>
                {t("policies.privacy")}
              </NavBarItemMobile>
              <NavBarItemMobile closeNavBar={() => setOpenSideBar(false)} route="/policies/services" goToRoute={goToRoute} index={11}>
                {t("policies.services")}
              </NavBarItemMobile>
            </ul>

            <div className="w-full h-20 flex justify-start items-center mt-4">
              {user ? (
                <Button onClick={() => goToRoute("/dashboard/reserves")} effect="default" className="py-2 sm:py-6 text-md sm:text-lg gap-x-4">
                  {t("reserve.my_reserves")} <CalendarCheck className="w-6 h-6" />
                </Button>
              ) : (
                <Button onClick={() => goToRoute("/signin")} effect="default" className="py-2 sm:py-6 text-md sm:text-lg gap-x-4">
                  {t("auth.log_in")} <User className="w-6 h-6" />
                </Button>
              )}
            </div>

            {/* Socials (fixed URLs) */}
            <div className="w-full mt-auto flex flex-row justify-start items-center gap-x-4 sm:gap-x-6">
              <a href="https://www.facebook.com/bambucamp" target="_blank" className="font-primary text-white hover:scale-[1.05] hover:text-primary duration-300">
                <Facebook className="h-6 sm:h-10 w-6 sm:w-10" />
              </a>
              <a href="https://www.instagram.com/bambucamp_glamping" target="_blank" className="font-primary text-white text-sm hover:scale-[1.05] hover:text-primary duration-300">
                <Instagram className="h-6 sm:h-10 w-6 sm:w-10" />
              </a>
              <a href="https://www.tiktok.com/@bambucampglamping" target="_blank" className="font-primary text-white text-sm hover:scale-[1.05] hover:text-primary duration-300">
                <TikTok className="h-6 sm:h-10 w-6 sm:w-10" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>{openCart && <ShopCart onClose={toogleCart} />}</AnimatePresence>
    </nav>
  );
};

export default Navbar;
