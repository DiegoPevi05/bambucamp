import { useState } from "react"
import { styles } from "../lib/styles"
import { tentsData } from "../lib/constant"
import { TentIT } from "../lib/interfaces"
import { motion } from "framer-motion"
import { fadeIn } from "../lib/motions"
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
      initial="hidden"
      animate="show"
      variants={fadeIn("left","spring", data.id*0.1,1)}
      onClick={selectCard}
      className="bg-black
      h-[300px] 2xl:h-[350px] w-[160px] 2xl:min-w-[200px] 
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
        {tents.map(tent=>(
          <CarouselCard key={tent.id} data={tent} isSelected={tent.id === selectedTentId} handleSelect={handleSelect}/>
        ))}
      </div>
    </div>
  )
}

const ServiceItem = () = {
  return(

  )
}

const VerticalCarousel = () => {

  const [tents, setTents] = useState<TentIT[]>(tentsData)
  const [selectedTent, setSelectedTent] = useState<TentIT>(tentsData[0])
  const [selectedImage, setSelectedImage] = useState<number>(1);

  const handleSelectTent = (id:number) => {
    setSelectedTent(tentsData.find(tent=>tent.id===id)!)
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
        <div className="relative col-span-2 row-span-2 w-full h-full ">
          <motion.img 
            initial="hidden"
            animate="show"
            variants={fadeIn("up","",0.5,1.5)}
            src={selectedTent.images[selectedImage]} 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-[5%] left-0 w-full h-auto flex justify-center items-center gap-x-12">
            <button onClick={handlePrevImage} className="w-16 h-16 bg-white rounded-full flex justify-center items-center hover:cursor-pointer hover:-translate-x-2 duration-300">
              <ChevronLeftIcon className="w-8 h-8 text-primary"/>
            </button>
            <button onClick={handleNextImage} className="w-16 h-16 bg-white rounded-full flex justify-center items-center hover:cursor-pointer hover:translate-x-2 duration-300">
              <ChevronRightIcon className="w-8 h-8 text-primary"/>
            </button>
          </div>
        </div>
        <div className="w-full h-full col-span-3 row-span-1 flex flex-col justify-end items-start gap-x-6 bg-secondary px-24">
            <motion.h2 
              initial="hidden"
              animate="show"
              variants={fadeIn("up","",0.5,1.5)}
              className={`${styles.sectionSubText} text-white`}>{selectedTent.header}
            </motion.h2>

            <motion.h1 
              initial="hidden"
              animate="show"
              variants={fadeIn("up","",0.8,1.5)}
              className={`${styles.sectionHeadText} text-tertiary`}>{selectedTent.title}
            </motion.h1>
            <motion.p 
              initial="hidden"
              animate="show"
              variants={fadeIn("up","",1,1.5)}
              className={`${styles.sectionBodyText} text-white`}>{selectedTent.description}
            </motion.p>
            <ul className="w-full h-auto grid grid-cols-4 gap-4 pb-12">
              <li className="text-white font-secondary flex flex-row gap-x-2">
                <Wifi className="w-6 h-6 text-white"/>
                Wi-fi
              </li>
              <li className="text-white font-secondary flex flex-row gap-x-2">
                <Car className="w-6 h-6 text-white"/>
                Parking
              </li>

              <li className="text-white font-secondary flex flex-row gap-x-2">
                <Waves className="w-6 h-6 text-white"/>
                Pool
              </li>

              <li className="text-white font-secondary flex flex-row gap-x-2">
                <Croissant className="w-6 h-6 text-white"/>
                Breakfast
              </li>

              <li className="text-white font-secondary flex flex-row gap-x-2">
                <Sandwich className="w-6 h-6 text-white"/>
                Lunch
              </li>

              <li className="text-white font-secondary flex flex-row gap-x-2">
                <Utensils className="w-6 h-6 text-white"/>
                Dinner
              </li>

              <li className="text-white font-secondary flex flex-row gap-x-2">
                <Sparkles className="w-6 h-6 text-white"/>
                Spa
              </li>

              <li className="text-white font-secondary flex flex-row gap-x-2">
                <Martini className="w-6 h-6 text-white"/>
                Bar
              </li>

              <li className="text-white font-secondary flex flex-row gap-x-2">
                <Bath className="w-6 h-6 text-white"/>
                Hotwater
              </li>

              <li className="text-white font-secondary flex flex-row gap-x-2">
                <AirVent className="w-6 h-6 text-white"/>
                Air coniditoning
              </li>

              <li className="text-white font-secondary flex flex-row gap-x-2">
                <Beef className="w-6 h-6 text-white"/>
                Grill
              </li>
            </ul>
        </div>

        <div className="col-span-3 row-span-1 w-full h-auto flex justify-start bg-transparent">
          <CarouselImages tents={tents} selectedTentId={selectedTent.id} handleSelect={handleSelectTent}/>
        </div>
    </div>
  );
}

export default VerticalCarousel;
