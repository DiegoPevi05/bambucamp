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
} from "lucide-react"
import * as LucideIcons from 'lucide-react';

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
    <div className="w-full h-auto  flex flex-row justify-center items-center overflow-x-scroll no-scroll-bar">
      <div className="w-full h-auto flex flex-row gap-x-6 px-12 2xl:px-24 py-12 ">
        <AnimatePresence>
          {tents.map((tent,index)=>(
            <CarouselCard key={tent.id} data={tent} isSelected={tent.id === selectedTentId} handleSelect={handleSelect}/>
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
    <li className="text-white font-secondary flex flex-row gap-x-2">
      <IconComponent className="w-6 h-6 text-white" />
      {label}
    </li>
  )
}

const VerticalCarousel = () => {

  const [tents, setTents] = useState<TentIT[]>(tentsData)
  const [selectedTent, setSelectedTent] = useState<TentIT>(tentsData[0])
  const [selectedImage, setSelectedImage] = useState<number>(0);

  const handleSelectTent = (id:number) => {
    const selectedIndex = tents.findIndex(tent => tent.id === id);
    const previousIndex = tents.slice(0, selectedIndex).length;
    //add hidden class to all previousIndex cards
    const cards = document.querySelectorAll("[data-id-card]");
    cards.forEach((card, index) => {
      if(index < previousIndex) card.classList.add("hidden")
    })
    setSelectedTent(tents[selectedIndex]);
    //const newTents = [...tents.slice(selectedIndex), ...tents.slice(0, selectedIndex)];
    //setTents(newTents);
    //setSelectedTent(newTents[0]);
  }

  const handleNextImage = () => {
    if(selectedImage === selectedTent.images.length-1) return setSelectedImage(0)
    setSelectedImage(selectedImage+1)
  };

  const handlePrevImage = () => {
    if(selectedImage === 0) return setSelectedImage(selectedTent.images.length-1)
    setSelectedImage(selectedImage-1)
  };


  return (
    <div className="w-full h-full bg-white grid grid-cols-5 grid-rows-2 ">
        <div className="relative col-span-2 row-span-2 w-full h-full">
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
          <div className="absolute bottom-[5%] left-0 w-full h-auto flex justify-center items-center gap-x-12">
            <button onClick={handlePrevImage} className="w-16 h-16 bg-white rounded-full flex justify-center items-center hover:cursor-pointer hover:-translate-x-2 duration-300">
              <ChevronLeftIcon className="w-8 h-8 text-primary"/>
            </button>
            <button onClick={handleNextImage} className="w-16 h-16 bg-white rounded-full flex justify-center items-center hover:cursor-pointer hover:translate-x-2 duration-300">
              <ChevronRightIcon className="w-8 h-8 text-primary"/>
            </button>
          </div>
        </div>
        <div className="w-full h-full col-span-3 row-span-1 bg-secondary overflow-hidden">
          <AnimatePresence>

            <motion.div
              key={`${selectedTent.id}`}
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={fadeIn("down","",0,1)}
              className="w-full h-full flex flex-col justify-end items-start gap-x-6 px-24 "
            >
                <h2 
                  className={`${styles.sectionSubText} text-white`}>{selectedTent.header}
                </h2>

                <h1 
                  className={`${styles.sectionHeadText} text-tertiary`}>{selectedTent.title}
                </h1>
                <p 
                  className={`${styles.sectionBodyText} text-white`}>{selectedTent.description}
                </p>
                <ul className="w-full h-auto grid grid-cols-4 gap-4 pb-12">
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
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="col-span-3 row-span-1 w-full h-auto flex justify-start bg-transparent">
          <CarouselImages tents={tents} selectedTentId={selectedTent.id} handleSelect={handleSelectTent}/>
        </div>
    </div>
  );
}

export default VerticalCarousel;
