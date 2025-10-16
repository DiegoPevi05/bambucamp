import { useState, useEffect, FormEvent } from "react";
import Button from "../components/ui/Button";
import { LUNAHUANA, ISOLOGO } from "../assets/images";
import { motion } from "framer-motion";
import { fadeIn } from "../lib/motions";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {VerifyPasswordResetCode} from "../db/actions/auth.ts";
import {ForgotPassword as ForgotPasswordIT} from "../lib/interfaces.ts";
import { validateCodeSchema } from "../db/schemas.ts";
import { ZodError } from "zod";

const validateCode = () => {

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

  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});

  const validateFields = (): ForgotPasswordIT |null => {
      const form  = document.getElementById("form_user_validate_code") as HTMLFormElement;
      const email = localStorage.getItem("email_reset_password") || "";
      const code = (form.querySelector('input[name="code"]') as HTMLInputElement).value;

      setErrorMessages({});

      try {

        validateCodeSchema.parse({ code });

        return {
            email,
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

  const onSubmitValidateCode = async (e:FormEvent ) => {

      e.preventDefault();
      setLoadingForm(true);
      const fieldsValidated = validateFields();
      if(fieldsValidated != null){
        localStorage.setItem("code_reset_password", fieldsValidated.code || "");
        const isSuccess = await VerifyPasswordResetCode(fieldsValidated,i18n.language);
        if(!isSuccess){
            setLoadingForm(false);
            return;
        }
        goToRoute("/change-password");
      }
      setLoadingForm(false);
  };

  const goToRoute = (route:string) => {
    navigate(route);
  };

  return (
    <div className="w-full h-screen bg-cover bg-center" style={{backgroundImage: `url(${LUNAHUANA})`}}>
      <div className="w-full h-full flex justify-center items-center">
        <form id="form_user_validate_code" className="w-[90%] sm:w-[400px] h-auto flex flex-col justify-center items-center rounded-3xl shadow-3xl p-6" style={{background: "rgba(255,255,255,0.80)"}} onSubmit={(e)=>onSubmitValidateCode(e)}>
          <img onClick={()=>goToRoute("/")} src={ISOLOGO} alt="logo" className="w-auto h-20 cursor-pointer hover:scale-105"/>
          <p className="text-primary text-[11px] sm:text-xs my-2">{t("auth.input_code")}</p>
          <div className="flex flex-row justify-end w-full h-auto">
            <span>{formattedTimer}</span>
          </div>
          <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden gap-y-4 sm:gap-y-1">
            <label htmlFor="code" className="font-primary text-secondary text-sm sm:text-lg h-3 sm:h-6">{t("auth.code")}</label>
            <input name="code" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("auth.code")}/>
            <div className="w-full h-6">
              {errorMessages.code && 
                <motion.p 
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={fadeIn("up","", 0, 1)}
                  className="h-6 text-xs text-primary font-tertiary">{t(errorMessages.code)}
                </motion.p>
              }
            </div>
          </div>

          <Button className="mb-4" isRound={true} isLoading={loadingForm}>{t("auth.validate_code")}</Button>
          <p onClick={()=>goToRoute("/signin")} className="text-secondary text-xs mb-2 flex flex-row items-center gap-x-2 hover:text-tertiary cursor-pointer group">{t("auth.account_question")}<span  className="text-primary group-hover:text-tertiary">{t("auth.sign_in")}</span></p>
        </form>
      </div>
    </div>
  );
};

export default validateCode;
