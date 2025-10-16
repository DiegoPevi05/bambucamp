import { useState, FormEvent } from "react";
import Button from "../components/ui/Button";
import { LUNAHUANA, LOGO_PRIMARY } from "../assets/images";
import { signUpSchema } from "../db/schemas.ts"
import { motion } from "framer-motion";
import { fadeIn } from "../lib/motions";
import { useNavigate } from "react-router-dom";
import Eye from "../assets/images/svg/eye.svg?react";
import EyeOff from "../assets/images/svg/eye-off.svg?react";
import { useTranslation } from "react-i18next";
import { SignUp as SignUpIT } from "../lib/interfaces.ts";
import { ZodError } from "zod";
import {SignUpAccount} from "../db/actions/auth.ts";

const SignUp = () => {

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [loadingForm, setLoadingForm] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);


  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});

  const validateFields = (): SignUpIT |null => {
      const form = document.getElementById("form_user_sign_up") as HTMLFormElement;
      const email = (form.querySelector('input[name="email"]') as HTMLInputElement).value;
      const password = (form.querySelector('input[name="password"]') as HTMLInputElement).value;
      const confirmPassword = (form.querySelector('input[name="confirmPassword"]') as HTMLInputElement).value;
      const firstName = (form.querySelector('input[name="firstName"]') as HTMLInputElement).value;
      const lastName = (form.querySelector('input[name="lastName"]') as HTMLInputElement).value;
      const phoneNumber = (form.querySelector('input[name="phoneNumber"]') as HTMLInputElement).value;

      setErrorMessages({});

      try {

        signUpSchema.parse({  email, password,phoneNumber, confirmPassword, firstName,lastName });

        return {
            email,
            password,
            firstName,
            phoneNumber,
            lastName
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

  const onSubmitSignUp = async (e:FormEvent ) => {
      e.preventDefault();
      setLoadingForm(true);
      const fieldsValidated = validateFields();
      if(fieldsValidated != null){
        const isSuccess = await SignUpAccount(fieldsValidated,i18n.language);
        if(!isSuccess){
            setLoadingForm(false);
            return;
        }
      }
      setLoadingForm(false);
  };

  const goToRoute = (route:string) => {
    navigate(route);
  };

  return (
    <div className="w-full h-screen bg-cover bg-center" style={{backgroundImage: `url(${LUNAHUANA})`}}>
      <div className="w-full h-full flex justify-center items-center">
        <form id="form_user_sign_up" className="w-[90%] sm:w-[400px] h-auto flex flex-col justify-center items-center rounded-3xl shadow-3xl p-6" style={{background: "rgba(255,255,255,0.80)"}} onSubmit={(e)=>onSubmitSignUp(e)}>
          <img onClick={()=>goToRoute("/")} src={LOGO_PRIMARY} alt="logo" className="w-auto h-20 cursor-pointer hover:scale-105"/>
          <p className="text-secondary text-sm my-2">{t("auth.sign_in_header")}</p>

          <div className="flex flex-row justify-start items-center w-full h-auto gap-x-2">
            <div className="flex flex-col justify-start items-start w-1/2 h-auto overflow-hidden gap-y-2  sm:gap-y-1">
              <label htmlFor="FirstName" className="font-primary text-secondary text-xs sm:text-lg h-auto sm:h-6">{t("reserve.firstname")}</label>
              <input name="firstName" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.firstname")}/>
              <div className="w-full h-6">
                {errorMessages.firstName && 
                  <motion.p 
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    variants={fadeIn("up","", 0, 1)}
                    className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">{t(errorMessages.firstName)}
                  </motion.p>
                }
              </div>
            </div>
            <div className="flex flex-col justify-start items-start w-1/2 h-auto overflow-hidden gap-y-2 sm:gap-y-1">
              <label htmlFor="lastName" className="font-primary text-secondary text-xs sm:text-lg h-auto sm:h-6">{t("reserve.lastname")}</label>
              <input name="lastName" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.lastname")}/>
              <div className="w-full h-6">
                {errorMessages.lastName && 
                  <motion.p 
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    variants={fadeIn("up","", 0, 1)}
                    className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">{t(errorMessages.lastName)}
                  </motion.p>
                }
              </div>
            </div>
          </div>




          <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden gap-y-2 sm:gap-y-1">
            <label htmlFor="email" className="font-primary text-secondary text-xs sm:text-lg h-auto sm:h-6">{t("common.email")}</label>
            <input name="email" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("common.email")}/>
            <div className="w-full h-6">
              {errorMessages.email && 
                <motion.p 
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={fadeIn("up","", 0, 1)}
                  className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">{t(errorMessages.email)}
                </motion.p>
              }
            </div>
          </div>

          <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden gap-y-2 sm:gap-y-1">
            <label htmlFor="phoneNumber" className="font-primary text-secondary text-xs sm:text-lg h-auto sm:h-6">{t("reserve.phone")}</label>
            <input name="phoneNumber" className="w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("reserve.phone")}/>
            <div className="w-full h-6">
              {errorMessages.phoneNumber && 
                <motion.p 
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={fadeIn("up","", 0, 1)}
                  className="h-6 text-[10px] sm:text-xs text-primary font-tertiary">{t(errorMessages.phoneNumber)}
                </motion.p>
              }
            </div>
          </div>

          <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden gap-y-1 sm:gap-y-1">
            <label htmlFor="password" className="font-primary text-secondary text-xs sm:text-lg h-auto sm:h-6">{t("auth.password")}</label>
            <div className="h-auto w-full relative">
              <input name="password" type={showPassword ? "text" : "password"} className="relative w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("auth.password")}/>
              <div onClick={()=>setShowPassword(!showPassword)} className="absolute top-0 right-2 h-full w-8 flex justify-center items-center cursor-pointer z-50">{ showPassword ? <EyeOff/> : <Eye />} </div>
            </div>
            <div className="w-full h-8">
              {errorMessages.password && 
                <motion.p 
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={fadeIn("up","", 0, 1)}
                  className="h-8 sm:h-10 text-[10px] sm:text-xs text-primary font-tertiary">{t(errorMessages.password)}
                </motion.p>
              }
            </div>
          </div>

          <div className="flex flex-col justify-start items-start w-full h-auto overflow-hidden gap-y-1 sm:gap-y-1">
            <label htmlFor="confirmPassword" className="font-primary text-secondary text-xs  sm:text-lg h-auto">{t("auth.confirm_password")}</label>
            <div className="h-auto w-full relative">
              <input name="confirmPassword" type={showPassword ? "text" : "password"} className="relative w-full h-8 sm:h-10 text-xs sm:text-md font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder={t("auth.confirm_password")}/>
              <div onClick={()=>setShowPassword(!showPassword)} className="absolute top-0 right-2 h-full w-8 flex justify-center items-center cursor-pointer z-50">{ showPassword ? <EyeOff/> : <Eye />} </div>
            </div>
            <div className="w-full h-8">
              {errorMessages.confirmPassword && 
                <motion.p 
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={fadeIn("up","", 0, 1)}
                  className="h-8 sm:h-10 text-[10px] sm:text-xs text-primary font-tertiary">{t(errorMessages.confirmPassword)}
                </motion.p>
              }
            </div>
          </div>


          <Button type="submit" className="mb-4" isRound={true} isLoading={loadingForm}>{t("auth.sign_up")}</Button>
          <p onClick={()=>goToRoute("/signin")} className="text-secondary text-xs mb-2 hover:text-tertiary group cursor-pointer">{t("auth.account_question")} <span  className="text-primary cursor-pointer group-hover:text-tertiary">{t("auth.sign_in")}</span></p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
