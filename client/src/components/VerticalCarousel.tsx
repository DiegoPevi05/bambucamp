import { useState } from "react"
import { styles } from "../lib/styles"
import { tentsData } from "../lib/constant"
import { TentIT } from "../lib/interfaces"
import { motion, AnimatePresence } from "framer-motion"
import { fadeIn, fadeOnly } from "../lib/motions"
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  Wifi,
  Car,
  Waves,
  Croissant,
  Utensils,
  Sandwich,
  CookingPot,
  Sparkles,
  Martini,
  Bath,
  AirVent,
  Beef,
  Tent,
} from "lucide-react"
import * as LucideIcons from 'lucide-react';
import Button from "./ui/Button"
import { useNavigate } from "react-router-dom"


interface CarouselCardProps {
  data:TentIT
  isSelected:boolean
  handleSelect:(id:number)=>void
}

const CarouselCard = (props:CarouselCardProps) => {

  const {isSelected,data,handleSelect} = props;

  const selectCard = () => {
    handleSelect(data.id);
  }

  return (
    <motion.div 
      data-id-card={data.id}
      key={data.id}
      initial="hidden"
      animate="show"
      exit="hidden"
      variants={fadeIn("left","", data.id*0.1,1)}
      onClick={selectCard}
      className="bg-black
      h-[300px] 2xl:h-[350px] w-[160px] 2xl:min-w-[200px]  2xl:w-[200px]
      w-full rounded-3xl shadow-3xl relative overflow-hidden hover:-translate-y-4 ease-in-out duration-1200 transition-all
      flex flex-col justify-end items-start pb-6 border border-4 border-secondary
      "
    >
      <motion.div 
      initial="hidden"
      animate="show"
      variants={fadeIn("up","spring", data.id*0.2,1)}
      className="bg-primary flex px-4"
      style={{opacity:"100%", zIndex:"1000"}}
      >
        <h6 
          className="text-white font-primary uppercase"
        >
          {data.title}
        </h6>
      </motion.div>
      <div className={`w-full h-full ${ isSelected ? "opacity-100" : "opacity-50" } absolute top-0 left-0 bg-cover bg-center bg-no-repeat 
        hover:opacity-100 cursor-pointer duration-1200 transition-all`}
        style={{backgroundImage: `url(${data.images[2]})`}}>
      </div>
    </motion.div>
  )
}

interface carouselImagesProps {
  tents:TentIT[]
  selectedTentId:number
  handleSelect:(id:number)=>void
}

const CarouselImages = (props:carouselImagesProps) => {
  const {tents,selectedTentId,handleSelect} = props;

  return (
    <div className="w-full h-full  flex flex-row justify-center items-center overflow-x-scroll no-scroll-bar">
      <div className="w-full h-full flex flex-row gap-x-6 px-12 2xl:px-24 py-12 ">
        <AnimatePresence>
          {tents.map((tent,index)=>(
            <CarouselCard key={tent.id+"-"+index} data={tent} isSelected={tent.id === selectedTentId} handleSelect={handleSelect}/>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
interface ServiceItemProps {
  iconName: keyof typeof LucideIcons;
  label: string;
}

const ServiceItem = ({iconName,label}:ServiceItemProps) => {
  const IconComponent = LucideIcons[iconName];

  return(
    <li className="text-white text-[10px] sm:text-[14px] lg:text-lg font-secondary flex flex-row gap-x-2">
      <IconComponent className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-white" />
      {label}
    </li>
  )
}

const VerticalCarousel = () => {

  const navigate = useNavigate();
  const [tents, setTents] = useState<TentIT[]>(tentsData)
  const [selectedTent, setSelectedTent] = useState<TentIT>(tentsData[0])
  const [selectedImage, setSelectedImage] = useState<number>(0);

  const handleSelectTent = (id:number) => {
    const selectedIndex = tents.findIndex(tent => tent.id === id);
    const previousIndex = tents.slice(0, selectedIndex).length;
    setSelectedTent(tents[selectedIndex]);
  }

  const handleNextImage = () => {
    if(selectedImage === selectedTent.images.length-1) return setSelectedImage(0)
    setSelectedImage(selectedImage+1)
  };

  const handlePrevImage = () => {
    if(selectedImage === 0) return setSelectedImage(selectedTent.images.length-1)
    setSelectedImage(selectedImage-1)
  };

  const goBooking = () => {
    navigate("/booking")
  }


  return (
    <div className="w-full h-[100vh] bg-white relative flex flex-col lg:grid lg:grid-cols-5 lg:grid-rows-2 ">
        <div className="relative lg:col-span-2 lg:row-span-2 w-full h-full">
          <AnimatePresence>
            <motion.img 
              key={`${selectedTent.id}-${selectedImage}`}
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={fadeOnly("", 0, 1)}
              src={selectedTent.images[selectedImage]} 
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute lg:bottom-[5%] max-lg:top-[5%] max-lg:right-[2%] lg:left-0 w-auto lg:w-full h-auto flex justify-center items-center gap-x-2 sm:gap-x-12">
            <button onClick={handlePrevImage} className="w-10 sm:w-16 h-10 sm:h-16 bg-white rounded-full flex justify-center items-center hover:cursor-pointer hover:-translate-x-2 duration-300 border-2 border-secondary">
              <ChevronLeftIcon className="w-6 sm:w-8 h-6 sm:h-8 text-primary"/>
            </button>
            <button onClick={handleNextImage} className="w-10 sm:w-16 h-10 sm:h-16 bg-white rounded-full flex justify-center items-center hover:cursor-pointer hover:translate-x-2 duration-300 border-2 border-secondary">
              <ChevronRightIcon className="w-6 sm:w-8 h-6 sm:h-8 text-primary"/>
            </button>
          </div>
        </div>
      <div className="max-lg:absolute top-[5%] sm:top-[40px] left-[10px] sm:left-[40px] w-[70%] sm:w-[400px] h-[300px] sm:h-[350px] lg:w-full lg:h-full lg:col-span-3 lg:row-span-1 bg-secondary overflow-hidden">
          <AnimatePresence>
            <motion.div
              key={`${selectedTent.id}`}
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={fadeIn("up","",0,1)}
              className="w-full h-full flex flex-col justify-end items-start max-lg:gap-y-2 px-4 lg:px-24 "
            >
                <h2 
                  className={`${styles.sectionSubText} text-white`}>{selectedTent.header}
                </h2>

                <h1 
                  className={`${styles.sectionHeadText} text-tertiary flex flex-row items-center`}><Tent className="h-8 w-8"/>{selectedTent.title}
                </h1>
                <p 
                  className={`${styles.sectionBodyText} text-white`}>{selectedTent.description}
                </p>
              <ul className="w-full h-auto flex flex-row flex-wrap lg:grid lg:grid-cols-4 gap-2 lg:gap-4 sm:pb-6 lg:pb-12">
                  { selectedTent.services.wifi && ( <ServiceItem iconName={"Wifi"} label={"Wi-fi"}/>)}
                  { selectedTent.services.parking && ( <ServiceItem iconName={"Car"} label={"Parking"}/>)}
                  { selectedTent.services.pool  && ( <ServiceItem iconName={"Waves"} label={"Pool"}/> )  }
                  { selectedTent.services.breakfast && ( <ServiceItem iconName={"Croissant"} label={"Breakfast"}/> ) }
                  { selectedTent.services.lunch && (<ServiceItem iconName={"Sandwich"} label={"Lunch"}/>) }
                  { selectedTent.services.dinner && (<ServiceItem iconName={"Utensils"} label={"Dinner"}/>) }
                  { selectedTent.services.spa && (<ServiceItem iconName={"Sparkles"} label={"Spa"}/>) }
                  { selectedTent.services.bar && (<ServiceItem iconName={"Martini"} label={"Bar"}/>) }
                  { selectedTent.services.hotwater && (<ServiceItem iconName={"Bath"} label={"Hotwater"}/>) }
                  { selectedTent.services.airconditioning && (<ServiceItem iconName={"AirVent"} label={"Air Conditioning"}/>) }
                  { selectedTent.services.grill && (<ServiceItem iconName={"Beef"} label={"Grill"}/>) }
                </ul>
              <div className="w-full h-auto flex flex-row justify-start items-center gap-x-4 mb-4 lg:mb-12">
                <Button 
                  variant="default" 
                  size="default" 
                  className="text-xs sm:text-lg h-8 sm:h-10"
                  rightIcon={<ChevronRightIcon className="w-4 sm:w-6 h-4 sm:h-6 text-white ml-2 duration-300"/>}
                  onClick={()=>goBooking()}
                >
                  Book Now
                </Button>

                <Button 
                  variant="dark" 
                  size="default" 
                  className="max-sm:hidden text-xs sm:text-lg h-8 sm:h-10"
                  rightIcon={<ChevronRightIcon className="w-6 h-6 text-white ml-2 duration-300"/>}
                  onClick={()=>goBooking()}
                >
                  Services
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hidden lg:flex col-span-3 row-span-1 w-full h-auto justify-start bg-transparent">
          <CarouselImages tents={tents} selectedTentId={selectedTent.id} handleSelect={handleSelectTent}/>
        </div>
        <div className="max-lg:absolute max-lg:bottom-[5%] w-full h-auto flex flex-row justify-center items-center lg:hidden z-[20] gap-x-4">
          {tents.map((tent,index)=>(
            <span onClick={()=>handleSelectTent(tent.id)} className={`${ selectedTent.id == tent.id ? "bg-secondary" : "bg-white" } duration-300 h-6 w-6 cursor-pointer rounded-full border-2 border-secondary`}></span>
          ))}
        </div>
    </div>
  );
}

export default VerticalCarousel;
