import Navbar from "../components/Navbar"
import Banner from "../assets/video/Banner.mp4"
import {LOGO_THIRD} from "../assets/images"
import {motion} from "framer-motion"
import { fadeIn } from "../lib/motions"
import SearchDatesBar from "../components/SearchBar";

const Home = () => {
  return (
    <div>
      <Navbar/>
      <div className="relative w-full h-[100vh] flex flex-col justify-center items-center z-[20]">
        <video src={Banner} autoPlay loop  muted className="absolute top-0 left-0 w-full h-full object-cover"/>
        <motion.div 
          initial="hidden"
          animate="show"
          variants={fadeIn("down","",0,2)}
          className="h-[30%] w-auto bg-transparent z-[100]">
          <img src={LOGO_THIRD} alt="logo_lg" className="w-full h-full object-cover"/>
        </motion.div>
        <SearchDatesBar/>
      </div>
    </div>
  )
}

export default Home
