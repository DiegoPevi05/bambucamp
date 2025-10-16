import { useEffect, useState } from "react"
import { styles } from "../lib/styles"
import { Tent } from "../lib/interfaces"
import { motion, AnimatePresence } from "framer-motion"
import { fadeIn, fadeOnly } from "../lib/motions"
import ChevronLeftIcon from "../assets/images/svg/chevron-left.svg?react";
import ChevronRightIcon from "../assets/images/svg/chevron-right.svg?react";
import Button from "./ui/Button"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import ServiceItem from "./ServiceItem"
import {ISOLOGO_TERTIARY} from "../assets/images"


interface CarouselCardProps {
  data:Tent
  index:number;
  isSelected:boolean
  handleSelect:(id:number)=>void
}

const CarouselCard = (props:CarouselCardProps) => {

  const {isSelected,index,data,handleSelect} = props;

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
      variants={fadeOnly("left", 0.5*index,0.5)}
      onClick={selectCard}
      className="shrink-1 bg-black
      h-[300px] 2xl:h-[350px] min-w-[160px] 2xl:min-w-[200px]  2xl:w-[200px]
      w-full rounded-3xl shadow-3xl relative overflow-hidden hover:-translate-y-4 ease-in-out duration-1200 transition-all
      flex flex-col justify-end items-start pb-6 border border-4 border-secondary
      "
    >
      <motion.div 
      initial="hidden"
      animate="show"
      variants={fadeIn("up","spring", 0.8*index,1)}
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
        style={{backgroundImage: `url(${data.images[1]})`}}>
      </div>
    </motion.div>
  )
}

interface carouselImagesProps {
  tents:Tent[]
  selectedTentId:number
  handleSelect:(id:number)=>void
}

const CarouselImages = (props:carouselImagesProps) => {
  const {tents,selectedTentId,handleSelect} = props;

  return (
    <div className="w-full h-full  flex flex-row justify-center items-center overflow-x-scroll">
      <div className="w-full h-full flex flex-row-reverse justify-end gap-x-6 px-12 py-12">
        <AnimatePresence>
          {tents.map((tent,index)=>(
            <CarouselCard key={tent.id+"-"+index} index={index} data={tent} isSelected={tent.id === selectedTentId} handleSelect={handleSelect}/>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface VerticalCarousel{
  tents:Tent[];
}

const VerticalCarousel = (props:VerticalCarousel) => {
  const {tents} = props;

  const {t} = useTranslation();
  const navigate = useNavigate();
  const [selectedTent, setSelectedTent] = useState<Tent>(tents[0])
  const [selectedImage, setSelectedImage] = useState<number>(0);

  const handleSelectTent = (id:number) => {
    const selectedIndex = tents.findIndex(tent => tent.id === id);
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

  useEffect(()=>{
    setSelectedImage(0);
  },[selectedTent])

  const goBooking = () => {
    navigate("/booking")
  }


  return (
    <div className="w-full h-[100vh] bg-white relative flex flex-col lg:grid lg:grid-cols-5 lg:grid-rows-2 ">
        <div className="relative lg:col-span-2 lg:row-span-2 w-full h-full">
          <motion.img 
            key={`${selectedTent.id}-${selectedImage}`}
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={fadeOnly("", 0, 1)}
            src={selectedTent.images[selectedImage]} 
            className="w-full h-full object-cover"
          />
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
                  className={`${styles.sectionSubText} text-white hidden sm:block`}>{selectedTent.header}
                </h2>

                <h1 
                  className={`${styles.sectionHeadText} text-tertiary flex flex-row items-center`}><img alt="isologo" src={ISOLOGO_TERTIARY} className="h-10 w-10"/> {selectedTent.title}
                </h1>
                <p 
                  className={`${styles.sectionBodyText} text-white mb-2`}>{selectedTent.description}
                </p>
              <ul className="w-full h-auto flex flex-row flex-wrap lg:grid lg:grid-cols-4 gap-2 lg:gap-4 sm:pb-4">
                {Object.entries(selectedTent.services).map(([service, value]) => {
                    if (value) {

                      return <ServiceItem key={service} icon={service} />;
                    }
                    return null;
                  })}
                </ul>
              <div className="w-full h-auto flex flex-row justify-start items-center gap-x-4 mb-4 lg:mb-6">
                <Button 
                  effect="default"
                  variant="default" 
                  size="lg" 
                  className="group text-xs sm:text-lg h-8 sm:h-10"
                  rightIcon={<ChevronRightIcon className="w-4 sm:w-6 h-4 sm:h-6 ml-2 duration-300"/>}
                  onClick={()=>goBooking()}
                >
                  {t("common.book_now")}
                </Button>

                <Button 
                  effect="default"
                  variant="dark" 
                  size="lg" 
                  className="group max-sm:hidden text-xs sm:text-lg h-8 sm:h-10"
                  rightIcon={<ChevronRightIcon className="w-6 h-6 ml-2 duration-300"/>}
                  onClick={()=>goBooking()}
                >
                  {t("common.services")}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hidden lg:flex col-span-3 row-span-1 pb-6 px-4 w-full h-auto justify-start bg-transparent">
          <CarouselImages tents={tents} selectedTentId={selectedTent.id} handleSelect={handleSelectTent}/>
        </div>
        <div className="max-lg:absolute max-lg:bottom-[5%] w-full h-auto flex flex-row justify-center items-center lg:hidden z-[20] gap-x-4">
          {tents.map((tent,index)=>(
            <span key={"span_tent_selection"+index} onClick={()=>handleSelectTent(tent.id)} className={`${ selectedTent.id == tent.id ? "bg-secondary" : "bg-white" } duration-300 h-6 w-6 cursor-pointer rounded-full border-2 border-secondary`}></span>
          ))}
        </div>
    </div>
  );
}

export default VerticalCarousel;
