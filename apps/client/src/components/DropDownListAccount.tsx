import { User as UserIT } from "../lib/interfaces";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {  fadeOnly } from "../lib/motions";
import CalendarCheck from "../assets/images/svg/calendar-check.svg?react";
import User from "../assets/images/svg/user.svg?react";
import DoorClosed from "../assets/images/svg/door-closed.svg?react";
import ChevronDown from "../assets/images/svg/chevron-down.svg?react";
import PanelTop from "../assets/images/svg/panel-top.svg?react";

interface DropDownProps {
  user: UserIT | null;
  variant?: string;
  isDashboard?: boolean;
}

const DropDownListAccount = (props:DropDownProps) => {
  const { user, variant , isDashboard } = props;
  const { logout } = useAuth();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(false);

  const goToRoute = (route:string) => {
    navigate(route);
  }

  const toogleDropDown = () => {
    setOpen(!open);
  };

  return(
    <div className="relative w-auto h-full ml-auto sm:mx-6 z-[20] flex items-center justify-center">
      <div 
        onClick={toogleDropDown} 
        className={`${variant =="dark" ? "text-secondary" : "text-white"} text-sm sm:text-xl  px-2 flex flex-row gap-x-1 z-50 items-center justify-center cursor-pointer hover:text-tertiary duration-300`}>
        <User className="h-5 w-5"/>{user?.firstName ? user.firstName : "user" }
        <ChevronDown/>
      </div>
      <AnimatePresence>
        {open && 
          <motion.div 
            initial="hidden"
            animate='show'
            exit="hidden"
            viewport={{ once: true }}
            variants={fadeOnly("",0,0.3)}
            className={`${variant =="dark" ? "right-[0px] top-[50px] bg-secondary border-secondary" : "right-[0px] top-[110%] bg-primary border-primary"} absolute  w-[140px] h-auto flex flex-col justify-start items-start  divide-y divide-white rounded-md border-4`}>

            {!isDashboard ?
              <>
                <span  onClick={() => goToRoute("/dashboard/reserves")} className="rounded-t-md w-full h-auto flex flex-row justify-center items-center gap-x-2 hover:bg-white cursor-pointer group py-2">
                  <CalendarCheck className="text-white group-hover:scale-[1.05]  group-hover:text-tertiary ease-in-out duration-300 transition-all cursor-pointer "/>
                  <p className="text-white text-sm group-hover:scale-[1.05]  group-hover:text-tertiary ease-in-out duration-300 transition-all cursor-pointer">{t("reserve.reserves")}</p>
                </span>


                <span  onClick={() => goToRoute("/dashboard/account")} className="w-full h-auto flex flex-row justify-center items-center gap-x-2 hover:bg-white cursor-pointer group py-2">
                  <User className="text-white group-hover:scale-[1.05]  group-hover:text-tertiary ease-in-out duration-300 transition-all cursor-pointer"/>
                  <p className="text-white text-sm group-hover:scale-[1.05]  group-hover:text-tertiary ease-in-out duration-300 transition-all cursor-pointer">{t("reserve.account")}</p>
                </span>

              </>
              :

                <span  onClick={() => goToRoute("/")} className="w-full h-auto flex flex-row justify-center items-center gap-x-2 hover:bg-white cursor-pointer group py-2">
                  <PanelTop className="text-white group-hover:scale-[1.05]  group-hover:text-tertiary ease-in-out duration-300 transition-all cursor-pointer"/>
                  <p className="text-white text-sm group-hover:scale-[1.05]  group-hover:text-tertiary ease-in-out duration-300 transition-all cursor-pointer">{t("reserve.go_to_web")}</p>
                </span>

            }



            <span  onClick={() => logout()} className="rounded-b-md w-full h-auto flex flex-row justify-center items-center gap-x-2 hover:bg-white cursor-pointer group py-2">
              <DoorClosed className="text-white group-hover:scale-[1.05]  group-hover:text-tertiary ease-in-out duration-300 transition-all cursor-pointer"/>
              <p className="text-white text-sm group-hover:scale-[1.05]  group-hover:text-tertiary ease-in-out duration-300 transition-all cursor-pointer">{t("auth.log_out")}</p>
            </span>
          </motion.div>
        }
      </AnimatePresence>
    </div>
  )
}
export default DropDownListAccount;
