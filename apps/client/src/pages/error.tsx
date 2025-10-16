import { TENT_SVG } from "../assets/images"
import { motion } from "framer-motion";
import { fadeIn } from "../lib/motions";
import {useTranslation} from "react-i18next";

const ErrorPage = () => {
  const {t} = useTranslation();
  return(
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-secondary">
        <motion.img 
          initial="hidden"
          whileInView='show'
          viewport={{ once: true }}
          variants={fadeIn("up","",0.5,1.5)}
          src={TENT_SVG} alt="tent" className="w-[300px] h-auto object-cover"/>
          <motion.h3 
            initial="hidden"
            whileInView='show'
            viewport={{ once: true }}
            variants={fadeIn("up","",0.5,1.5)}
            className={`text-white`}>
                {`Error 404 ${t("common.error_not_found")}`}
          </motion.h3>
    </div>
  );
}

export default ErrorPage;
