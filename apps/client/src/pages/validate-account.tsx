import { useState, useEffect } from "react";
import Button from "../components/ui/Button";
import { LUNAHUANA, LOGO_PRIMARY } from "../assets/images";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {VerifyAccount} from "../db/actions/auth";
import {toast} from "sonner";
import LoadingComponent from "../components/ui/Loader";

const ValidateAccount = () => {

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [loadingPage,setLoadingPage] = useState(true);

  const goToRoute = (route:string) => {
    navigate(route);
  };

  // Extract query params using URLSearchParams
  useEffect(() => {
    const verifyUserAccount = async () => {
      const queryParams = new URLSearchParams(location.search);
      const emailParam = queryParams.get("email");
      const codeParam = queryParams.get("code");

      if (!emailParam || !codeParam) {
        toast.error(t("No params found, copy correct the link from the email."));
        return;
      }

      try {
        const isSuccess = await VerifyAccount({ email: emailParam, code: codeParam }, i18n.language);
        if (!isSuccess) {
          toast.error(t("Verification failed."));
          return;
        }

        setLoadingPage(false);
      } catch (error) {
        toast.error(t("An error occurred during verification."));
      }
    };

    verifyUserAccount();
  }, [location.search, i18n.language]);



  return (
    <>

    {!loadingPage ?
      <div className="w-full h-screen bg-cover bg-center" style={{backgroundImage: `url(${LUNAHUANA})`}}>
        <div className="w-full h-full flex justify-center items-center">
          <div className="w-[300px] sm:w-[400px] h-auto flex flex-col justify-center items-center rounded-3xl shadow-3xl p-6" style={{background: "rgba(255,255,255,0.80)"}}>
            <img onClick={()=>goToRoute("/")} src={LOGO_PRIMARY} alt="logo" className="w-auto h-20 cursor-pointer hover:scale-105"/>
            <p className="text-secondary text-md my-6 text-center">{t("Your email has been validated")}</p>

            <Button className="mb-4" isRound={true} onClick={()=>goToRoute("/signin")}>{t("Sign In")}</Button>
          </div>
        </div>
      </div>
      :
      <LoadingComponent/>
    }
    </>
  );
};

export default ValidateAccount;
