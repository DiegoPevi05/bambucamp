import { useState, useEffect, FormEvent } from "react";
import Button from "../components/ui/Button";
import { LUNAHUANA, ISOLOGO } from "../assets/images";
import { motion } from "framer-motion";
import { fadeIn } from "../lib/motions";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Eye from "../assets/images/svg/eye.svg?react";
import EyeOff from "../assets/images/svg/eye-off.svg?react";
import {UpdatePassword} from "../db/actions/auth.ts";
import { resetPasswordSchema } from "../db/schemas.ts";
import {ForgotPassword} from "../lib/interfaces.ts";
import { ZodError } from "zod";

const ChangePassword = () => {

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const end_timer_str = localStorage.getItem("timer_reset_password");
  let end_timer: Date | null = null;

  if (end_timer_str) {
    end_timer = new Date(end_timer_str);
  }

  const getRemainingTime = () => {
    if (end_timer) {
      const now = new Date();
      const diffInSeconds = Math.floor((end_timer.getTime() - now.getTime()) / 1000);
      if (diffInSeconds > 0) {
        return diffInSeconds;
      }
    }
    return 300;
  }

  const [timer, setTimer] = useState(getRemainingTime()); // 300 seconds = 5 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer > 0) {
          return prevTimer - 1;
        } else {
          clearInterval(interval); // Stop the interval when timer reaches 0
          return 0;
        }
      });
    }, 1000); // Update timer every second

    return () => clearInterval(interval); // Cleanup the interval on unmount
  }, []);

  // Format timer to display as mm:ss
  const formattedTimer = new Date(timer * 1000).toISOString().substr(14, 5);

  const [loadingForm, setLoadingForm] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});

  const validateFields = (): ForgotPassword |null => {
      const form  = document.getElementById("form_user_update_password") as HTMLFormElement;
      const password  = (form.querySelector('input[name="password"]') as HTMLInputElement).value;
      const confirmPassword  = (form.querySelector('input[name="confirmPassword"]') as HTMLInputElement).value;

      let email = localStorage.getItem("email_reset_password") || "";
      let code  = localStorage.getItem("code_reset_password") || "";


      setErrorMessages({});

      try {

        resetPasswordSchema.parse({ password, confirmPassword });

        return {
            email,
            password,
            code
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

  const onSubmitUpdatePassword = async (e:FormEvent ) => {
      e.preventDefault();
      setLoadingForm(true);
      const fieldsValidated = validateFields();
      if(fieldsValidated != null){
        const isSuccess = await UpdatePassword(fieldsValidated,i18n.language);
        if(!isSuccess){
            setLoadingForm(false);
            return;
        }
        localStorage.removeItem("timer_reset_password");
        localStorage.removeItem("email_reset_password");
        localStorage.removeItem("code_reset_password");
        goToRoute("/signin");
      }
      setLoadingForm(false);
  };

  const goToRoute = (route:string) => {
    navigate(route);
  };

  return (
    <div className="w-full h-screen bg-cover bg-center" style={{backgroundImage: `url(${LUNAHUANA})`}}>
      <div className="w-full h-full flex justify-center items-center">
        <form id="form_user_update_password" className="w-[300px] sm:w-[400px] h-auto flex flex-col justify-center items-center rounded-3xl shadow-3xl p-6" style={{background: "rgba(255,255,255,0.80)"}} onSubmit={(e)=>onSubmitUpdatePassword(e)}>
          <img onClick={()=>goToRoute("/")} src={ISOLOGO} alt="logo" className="w-auto h-20 cursor-pointer hover:scale-105"/>
          <p className="text-secondary text-xs my-4">{t("auth.write_new_password")}</p>
          <div className="flex flex-row justify-end w-full h-auto">
            <span>{formattedTimer}</span>
          </div>
          <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden gap-y-4 sm:gap-y-1">
            <label htmlFor="password" className="font-primary text-secondary text-sm sm:text-lg h-3 sm:h-6">{t("auth.password")}</label>
            <div className="h-auto w-full relative">
              <input name="password" type={showPassword ? "text" : "password"} className="relative w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("auth.password")}/>
              <div onClick={()=>setShowPassword(!showPassword)} className="absolute top-0 right-2 h-full w-8 flex justify-center items-center cursor-pointer z-50">{ showPassword ? <EyeOff/> : <Eye />} </div>
            </div>
            <div className="w-full h-10">
              {errorMessages.password && 
                <motion.p 
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={fadeIn("up","", 0, 1)}
                  className="h-10 text-xs text-primary font-tertiary">{t(errorMessages.password)}
                </motion.p>
              }
            </div>
          </div>

          <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden gap-y-4 sm:gap-y-1">
            <label htmlFor="confirmPassword" className="font-primary text-secondary text-sm sm:text-lg h-3 sm:h-6">{t("auth.confirm_password")}</label>
            <div className="h-auto w-full relative">
              <input name="confirmPassword" type={showPassword ? "text" : "password"} className="relative w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("auth.confirm_password")}/>
              <div onClick={()=>setShowPassword(!showPassword)} className="absolute top-0 right-2 h-full w-8 flex justify-center items-center cursor-pointer z-50">{ showPassword ? <EyeOff/> : <Eye />} </div>
            </div>
            <div className="w-full h-10">
              {errorMessages.confirmPassword && 
                <motion.p 
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={fadeIn("up","", 0, 1)}
                  className="h-10 text-xs text-primary font-tertiary">{t(errorMessages.confirmPassword)}
                </motion.p>
              }
            </div>
          </div>

          <Button className="mb-4" isRound={true} isLoading={loadingForm}>{t("auth.restore_password")}</Button>
          <p onClick={()=>goToRoute("/signin")} className="text-secondary text-xs mb-2 flex flex-row items-center gap-x-2 hover:text-tertiary cursor-pointer group">{t("auth.account_question")}<span  className="text-primary group-hover:text-tertiary">{t("auth.sign_in")}</span></p>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
