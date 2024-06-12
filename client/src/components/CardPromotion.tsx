import { fadeIn } from "../lib/motions";
import { motion } from "framer-motion";
import Button from "./ui/Button";

interface PromptionCardProps {
  promotion: PromotionIT,
  index: number,
}

const PromotionCard = (props:PromptionCardProps) => {
  const {promotion,index} = props;

  return (
    <motion.div 
      initial="hidden"
      whileInView='show'
      viewport={{ once: true }}
      exit="hidden"
      variants={fadeIn("right","",1+(0.5*index),0.5)}
      className="bg-white max-sm:min-w-[90%] h-[400px] max-sm:ml-6 mt-12 max-sm:mb-12 sm:mx-6 sm:mt-auto shadow-xl rounded-3xl grid grid-rows-2 hover:cursor-pointer duration-300 relative">
      <div className="absolute -top-[32.5px] right-0 sm:-right-[32.5px] w-[65px] h-[65px] bg-secondary rounded-full flex justify-center items-center">
        <h1 className="text-sm text-center text-white">Save {promotion.discount}%</h1>
      </div>
      <img src={promotion.image} alt="promotion" className="w-full h-full object-cover rounded-t-2xl"/>
      <div className="p-5 flex flex-col justify-end">
        <h1 className="text-xs text-tertiary">{`${promotion.remaining < 10 ? 
        "Remain "+promotion.remaining+" promotions!":
        "Lasts promotion!"}
        `}
        </h1>
        <h2 className="text-sm">{promotion.title}</h2>
        <p className="text-xs">{promotion.description}</p>
        <Button size="sm" className="mt-4 w-[80%] ml-auto">Book Now</Button>
      </div>
    </motion.div>
  );
}
export default PromotionCard;
