import  { useState, useRef } from "react";
import MapPin from "../assets/images/svg/map-pin.svg?react";
import Search from "../assets/images/svg/search.svg?react";
import { motion } from "framer-motion";
import { fadeIn } from "../lib/motions";
import {useTranslation} from "react-i18next";
import {useCart} from "../contexts/CartContext";
import {useNavigate} from "react-router-dom";
import DatePicker from "./DatePicker";

interface propssSearchBar {
  section?:string;
}

const SearchDatesBar = ({section}:propssSearchBar) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const { dates, updateDateFrom, updateDateTo } = useCart();
  const [openBar, setOpenBar] = useState<{startDate:boolean, endDate: boolean, guests: boolean }>({ startDate: false, endDate: false, guests: false });

  const toggleBar = (type: "startDate" | "endDate" | "guests" | null) => {
    if(type === null){
      setOpenBar({ startDate: false, endDate: false, guests: false });
    }else{
      setOpenBar((prevOpenBar) => ({ startDate: false, endDate: false, guests: false, [type]: !prevOpenBar[type] }));
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);


  const handleSearchReservation = () => {
    toggleBar(null);
    goToRoute("/booking")
  };


  const goToRoute = (route:string) => {
    navigate(route);
  };



  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={fadeIn("up","",0.5,1)}
      ref={containerRef} 
      className={`relative  mt-24 w-[100%] sm:w-[80%]  ${section =="booking" ? "h-[100px] sm:h-[120px]" :"h-[120px] sm:h-[180px]" } lg:h-[60px] bg-white z-[50] grid grid-cols-2 ${section == "booking" ?  "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
      <div className={`${section == "booking" ? "hidden" : ""} max-lg:hidden relative flex flex-col w-full justify-center items-center after:absolute after:content-[''] after:top-0 after:left-0 after:w-full after:h-2 after:bg-secondary`}>
        <span className="text-slate-700 flex flex-row gap-x-4 items-center"><MapPin className="h-6 w-6" /> Bambucamp</span>
      </div>
      <DatePicker openBar={ openBar['startDate']} type="startDate" section={section}  toggleBar={toggleBar} date={dates.dateFrom} setDate={updateDateFrom} />
      <DatePicker openBar={ openBar['endDate']} type="endDate" section={section} toggleBar={toggleBar} date={dates.dateTo} setDate={updateDateTo} />
      <button className="bg-tertiary text-white w-full col-span-2 lg:col-span-1 hover:bg-primary hover:text-white flex flex-row justify-center items-center gap-x-2 duration-300" onClick={handleSearchReservation}><Search className="w-6 h-6"/>{t("common.book_now")}</button>
    </motion.div>

  );
};

export default SearchDatesBar;
