import {fadeIn} from '../lib/motions'
import User from "../assets/images/svg/user.svg?react";
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Dashboard from '../components/ui/Dashboard'

const DashboardSettings = () => {
  const {t} = useTranslation();

  return(
    <Dashboard>
      <motion.div 
        initial="hidden"
        animate="show"
        exit="hidden"
        variants={fadeIn("up","",0.5,0.5)}
        className="bg-white row-span-7 grid grid-cols-2 grid-rows-3 gap-4">

          <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200 col-span-2 row-span-7 w-full h-full">
            <h1 className="text-lg flex flex-row gap-x-2 text-secondary"><User/>{t("Settings")}</h1>
            <p className="font-secondary text-md text-tertiary">{t("View your personal information and complete missing fields")}</p>
          </div>
      </motion.div>
    </Dashboard>
  )
}

export default DashboardSettings;
