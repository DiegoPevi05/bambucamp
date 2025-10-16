import  { useState } from "react";
import ShoppingCart from "../assets/images/svg/shopping-cart.svg?react";
import { styles } from "../lib/styles";
import { ISOLOGO_WHITE} from "../assets/images";
import { AnimatePresence} from "framer-motion";
import LanguageDropDownList from "./ui/LanguageSelector";
import {useCart} from "../contexts/CartContext";
import ShopCart from "./ShopCart";

interface ShopNavbarProps {
  variant?:string;
}

const ShopNavbar = (props:ShopNavbarProps) => {
  const { variant } = props;
  const  {  totalItems } = useCart();
  const [openSideBar, setOpenSideBar] = useState<boolean>(false);

  const toogleSidebar = () => {
    setOpenSideBar(!openSideBar);
  };

  return (
    <nav className={`${styles.paddingX} px-6 sm:px-10 z-50 absolute w-full flex flex-row ${variant == "dark" ?  "justify-end" : "justify-start" } items-start absolute top-0 left-0 z-[100] h-[80px]`}>
      <div className="hidden w-auto lg:flex justify-start lg:justify-center items-center">
        <a href="/" className="relative hover:cursor-pointer hover:scale-[1.05] transition-all duration-300 rounded-full top-8 w-[80px] sm:w-[100px] h-[80px] sm:h-[100px] flex items-center justify-center p-4 ">
          <img src={ISOLOGO_WHITE} alt="logo" className="w-full h-full"/>
        </a>
      </div>
      <div className={`${variant == "dark" ? "text-secondary":"text-white"} w-auto h-[40px] flex flex-row justify-center items-start mt-12`}>
        <LanguageDropDownList variant={variant}/>
        <button onClick={toogleSidebar} className="duration-300 group active:scale-95 hover:scale-105 flex justify-center items-center relative"> 
          <ShoppingCart className={`${variant =="dark" ? "group-hover:text-tertiary" : "group-hover:text-secondary" } h-6 sm:h-8 w-8 sm:w-8  duration-300`}/> 
          {totalItems > 0 && (
            <span className="absolute -top-3 -right-4 h-6 w-6 flex items-center justify-center text-xs bg-secondary text-white rounded-full">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {openSideBar && ( 
          <ShopCart onClose={toogleSidebar} />
        )}
      </AnimatePresence>
    </nav>
  );
};

export default ShopNavbar;
