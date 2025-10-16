import { useTranslation } from 'react-i18next';
import Wifi from "../assets/images/svg/wifi.svg?react";
import Car from "../assets/images/svg/car.svg?react";
import Waves from "../assets/images/svg/waves.svg?react";
import Croissant from "../assets/images/svg/croissant.svg?react";
import Sandwich from "../assets/images/svg/sandwich.svg?react";
import Utensils from "../assets/images/svg/utensils.svg?react";
import Sparkles from "../assets/images/svg/sparkles.svg?react";
import Martini from "../assets/images/svg/martini.svg?react";
import Bath from "../assets/images/svg/bath.svg?react";
import AirVent from "../assets/images/svg/air-vent.svg?react";
import Beef from "../assets/images/svg/beef.svg?react";
import Bonfire from "../assets/images/svg/flame-kindling.svg?react";


type IconKeys = 'bonfire' | 'wifi' | 'parking' | 'pool' | 'breakfast' | 'lunch' | 'dinner' | 'spa' | 'bar' | 'hotwater' | 'airconditioning' | 'grill'; // Extend this type as needed

const serviceIconMap: Record<IconKeys, React.FC<React.SVGProps<SVGSVGElement>>> = {
  wifi: Wifi,
  parking: Car,
  pool: Waves,
  breakfast: Croissant,
  lunch: Sandwich,
  dinner: Utensils,
  spa: Sparkles,
  bar: Martini,
  hotwater: Bath,
  airconditioning: AirVent,
  grill: Beef,
  bonfire: Bonfire
};

const serviceLabelMap: Record<string, string> = {
  wifi: 'glampings.wi_fi',
  parking: 'glampings.parking',
  pool: 'glampings.pool',
  breakfast: 'glampings.breakfast',
  lunch: 'glampings.lunch',
  dinner: 'glampings.dinner',
  spa: 'glampings.spa',
  bar: 'glampings.bar',
  hotwater: 'glampings.hotwater',
  airconditioning: 'glampings.air_conditioner',
  grill: 'glampings.grill',
  bonfire: 'glampings.bonfire'
};

interface ServiceItemProps {
  icon: string;
  size?: string;
  color?: string;
}

const ServiceItem = ({ icon, size, color }: ServiceItemProps) => {
  const { t } = useTranslation();

  const label = t(serviceLabelMap[icon]);

  // Type assertion with runtime validation
  const isValidIconKey = (key: string): key is IconKeys => {
    return key in serviceIconMap;
  };

  if (!isValidIconKey(icon)) {
    console.warn(`Invalid icon key: ${icon}`); // Warn about invalid keys
    return null; // or return a fallback element if desired
  }

  const IconComponent = serviceIconMap[icon]; // Get the icon component

  return (
    <li className={`${size == "sm" ? 'text-[12px] gap-x-1' : 'text-[10px] sm:text-[14px] 2xl:text-lg gap-x-2'} ${color ?? "text-white"} font-secondary flex flex-row `}>
      {/* @ts-ignore: Ignore TypeScript checking for IconComponent */}
      <IconComponent className={`${size == "sm" ? 'h-5 h-5' : 'w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6'} ${color ?? "text-white"}`} />
      {label}
    </li>
  )
}

export default ServiceItem;
