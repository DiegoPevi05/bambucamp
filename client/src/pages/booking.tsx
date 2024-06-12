import Navbar from "../components/Navbar"
import SearchDatesBar from "../components/SearchBar"
import Button from "../components/ui/Button";

const Booking = () => {
  return (
    <div>
      <div id="hero" className="relative w-full h-[40vh] flex flex-col justify-center items-center z-[20]">
        <img src={LOGO_THIRD} alt="logo_lg" className="w-full h-full object-cover"/>
        <SearchDatesBar/>
      </div>
    </div>
  )
}

export default Booking;
