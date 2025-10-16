import CreditCard from "../assets/images/svg/credit-card.svg?react";
import FlameKindling from "../assets/images/svg/flame-kindling.svg?react";
import Tent from "../assets/images/svg/tent.svg?react";

import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";

interface propSectionHeader {
  identifier:string;
}

const SectionHeader = (props:propSectionHeader) => {
  const { identifier } = props;
  const {t} = useTranslation();
  const navigate = useNavigate();

  const goToRoute = (route:string) => {
    navigate(route, { state: { from: location.pathname } });
  };

  return(
    <div
      className="absolute inset-x-0 top-24 sm:top-10 mx-auto w-[80%] sm:w-[400px] h-auto z-[200] flex flex-row justify-around items-center z-[40]">
      <div className="absolute w-full h-1 top-[25px] -translate-y-1/2 bg-slate-200 rounded-full z-10 duration-300 transition-all">
        <div className={`${identifier == "glampings" ? "w-1/3": ( identifier == "extras" ? "w-2/3" : "w-full" ) } h-full bg-secondary duration-300 transition-all`}></div>
      </div>

      <div className="w-1/3 h-auto flex flex-col items-center justify-start z-50 cursor-pointer group">
        <div onClick={()=>goToRoute("/booking")}  className={`w-[40px] sm:w-[50px] h-[40px] sm:h-[50px] bg-white border-4 border-secondary rounded-full flex items-center justify-center text-primary p-1 sm:p-2 group-hover:border-secondary group-hover:bg-white group-hover:text-primary duration-300 
          `}><Tent className="h-full w-full"/></div>
        <label className={`text-[10px] sm:text-xs ${identifier == "glampings" ? "text-white": "text-primary" }`}>Glampings</label>
      </div>
      <div className="w-1/3 h-auto flex flex-col items-center justify-start z-50 cursor-pointer group">
        <div onClick={()=>goToRoute("/extras")} className={`${identifier == "extras" || identifier == "payment" ? "border-secondary bg-white text-primary" : "border-slate-300 text-slate-300 bg-white" } w-[40px] sm:w-[50px] h-[40px] sm:h-[50px]  border-4 rounded-full flex items-center justify-center p-1 sm:p-2 cursor-pointer group-hover:border-secondary group-hover:bg-white group-hover:text-primary duration-300`}
        ><FlameKindling className="w-full h-full"/></div>
        <label className={`text-[10px] sm:text-xs ${identifier == "glampings" ? "text-white": "text-primary" } `}>Extras</label>
      </div>
      <div className="w-1/3 h-auto flex flex-col items-center justify-start z-50 cursor-pointer group">
        <div  onClick={()=>goToRoute("/reserve")} className={`${identifier == "payment" ? "border-secondary bg-white text-primary" : "border-slate-300 text-slate-300 bg-white" } w-[40px] sm:w-[50px] h-[40px] sm:h-[50px]  border-4 rounded-full flex items-center justify-center p-1 sm:p-2 group-hover:border-secondary group-hover:bg-white group-hover:text-primary duration-300`}
        ><CreditCard className="w-full h-full"/></div>
        <label className={`text-[10px] sm:text-xs ${identifier == "glampings" ? "text-white": "text-primary" }`}>{t("reserve.reserve")}</label>
      </div>
    </div>
  )

}

export default SectionHeader;
