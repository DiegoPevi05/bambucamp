import  { useState, useRef, useEffect } from "react";
import { MapPin, CalendarDays, User, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "../lib/motions";
import { SearchReservation } from "../db/actions";


const generateCalendar = (currentDate:Date, handleSelectedDate: (date: Date) => void ) => {
  const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const startDayOfWeek = startOfCurrentMonth.getDay();
  const totalDaysInMonth = endOfCurrentMonth.getDate();

  const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
  const totalDaysInPrevMonth = prevMonth.getDate();

  const today = new Date();

  let calendarDays = [];

  // Add days from the previous month
  for (let i = startDayOfWeek; i > 0; i--) {
    calendarDays.push(
      <span key={`prev-${i}`} className="bg-gray-100 flex items-center justify-center h-10 text-gray-400 rounded-xl">
        {totalDaysInPrevMonth - i + 1}
      </span>
    );
  }

  // Add days from the current month
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const currentIterationDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    if(currentIterationDate < today){
      calendarDays.push(
        <span key={`past-${i}`} className="bg-gray-100 flex items-center justify-center h-10 text-gray-400 rounded-xl">
          {i}
        </span>
      );
    }else{
      calendarDays.push(
        <span key={`current-${i}`} 
          onClick={()=>handleSelectedDate(currentIterationDate)}
          className={`cursor-pointer bg-white text-secondary flex items-center justify-center h-10 hover:bg-secondary hover:text-white duration-300 rounded-xl 
          ${currentDate.getDate() === i  && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear() ? "border-2 border-slate-400": "" }`}>
          {i}
        </span>
      );
    } 
  }

  // Add days from the next month
  const remainingDays = 42 - calendarDays.length; // 42 = 6 weeks * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push(
      <span key={`next-${i}`} className="bg-gray-100 flex items-center justify-center h-10 text-gray-400 rounded-xl">
        {i}
      </span>
    );
  }

  return calendarDays;
};

const Calendar = ({ show, handleSelectedDate, containerDimensions }:{show:boolean, handleSelectedDate: (date: Date) => void, containerDimensions: { height: number, width: number, left: number } }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  }

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  }

  const calendarDays = generateCalendar(currentDate, handleSelectedDate);

  const calendarWidth = 400;
  const isCalendarOverflowing = containerDimensions.left + calendarWidth > window.innerWidth;

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
        initial="hidden"
        animate="show"
        exit="hidden"
        variants={fadeIn("left","",0,0.5)}
        className="absolute h-auto w-[350px] w-[400px] bg-white duration-800 transition-all transition-opacity rounded-b-xl" 
        style={{
          top: `${containerDimensions.height}px`,
          left: isCalendarOverflowing ? 'auto' : '0',
          right: isCalendarOverflowing ? '0' : 'auto'
        }}
        >
          <div className="flex flex-row justify-between items-center mb-4 px-4">
            <button className="text-secondary hover:text-primary duration-300" onClick={handlePreviousMonth}>Previous</button>
            <h1 className="text-slate-700">{currentDate.getMonth()+1 +"/"+ currentDate.getFullYear()}</h1>
            <button className="text-secondary hover:text-primary duration-300" onClick={handleNextMonth}>Next</button>
          </div>
          <div className="grid grid-cols-7 gap-2 p-2">
            {calendarDays}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const DatePicker = ({ date, setDate, openBar, type, toggleBar }:{date:Date, setDate:React.Dispatch<React.SetStateAction<Date>>,openBar:boolean, type:"startDate" | "endDate" | "guests", toggleBar: (type: "startDate" | "endDate" | "guests")=>void}) => {
  const [selectedDate, setSelectedDate] = useState(date);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ height:0, width:0, left: 0 })

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerDimensions({
        height: rect.height,
        width: rect.width,
        left: rect.left
      });
    }
  }, []);

  const handleDateChange = (pickedDate:Date) => {
    setSelectedDate(pickedDate);
    setDate(pickedDate);
    toggleBar(type)
  };

  const toggleDatePicker = () => {
    toggleBar(type)
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div className={`${openBar ? "after:absolute after:top-0 after:left-0 after:content-[''] after:w-full after:h-2 after:bg-secondary":""} text-secondary h-full w-full gap-x-4 flex flex-row justify-center items-center cursor-pointer`} onClick={toggleDatePicker}> 
        <CalendarDays />
        {selectedDate.toISOString().split("T")[0]}
      </div>
      <Calendar show={openBar} handleSelectedDate={handleDateChange} containerDimensions={containerDimensions}/>
    </div>
  );
};


const InputGuestBar = ({guests, type,handleCount }: {guests:{adults:number, kids:number, babys:number}, type: "adults" | "kids" | "babys", handleCount: (type: "adults" | "kids" | "babys", count: number) => void } ) => {

  const [currentCount,setCurrentCount] = useState<number>(guests[type]);

  useEffect(()=>{
    handleCount(type,currentCount);
  },[currentCount])

  const IncrementConter = () => {
    setCurrentCount((prevCount) => prevCount + 1);
  }
  const DecreaseCounter = () =>{
    setCurrentCount((prevCount) => prevCount > 0 ? prevCount - 1 : prevCount);
  }

  return(
    <div className="span-1 w-full h-full bg-white flex flex-row w-full h-full border-l-[1px] border-slate-200">
      <div className="w-[80%] h-full flex flex-row justify-center items-center gap-x-4 text-secondary">
        <User/>
        <span>{currentCount}</span>
        <span>{type}</span>
      </div>
      <div className="w-[20%] h-full flex flex-col border-l-[1px] border-slate-200 divide-y">
        <button className="w-full h-[50%] bg-white text-secondary hover:bg-secondary hover:text-white duration-300" onClick={IncrementConter}>+</button>
        <button className="w-full h-[50%] bg-white text-secondary hover:bg-secondary hover:text-white duration-300" onClick={DecreaseCounter}>-</button>
      </div>
    </div>

  )
}

const GuestPicker = ({openBar, containerRef, toggleBar, guests, setGuests}:
                     {openBar:boolean, containerRef: React.RefObject<HTMLDivElement>, toggleBar: (type: "startDate" | "endDate" | "guests")=>void, guests:{adults:number, kids:number, babys:number}, setGuests: React.Dispatch<React.SetStateAction<{adults:number, kids:number, babys:number}>> }
  ) => {

  const [containerDimensions, setContainerDimensions] = useState<{height:number, width:number}>({ height:0, width:0 })
  const [leftPosition,setLeftPosition] = useState<number>(0);

  const getTotalGuest = () =>{
    return guests.adults + guests.kids + guests.babys
  }

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerDimensions({
        height: rect.height,
        width: rect.width,
      });
      setLeftPosition( rect.width/5  * -3 );
    }
  }, [containerRef]);

  const updateGuest = (type: "adults" | "kids" | "babys", count: number) => {
    setGuests((prevGuests) => ({ ...prevGuests, [type]: count }));
  };

  const toggleOpenGuestPicker = () => {
    toggleBar("guests");
  }

  return (
    <div className="relative w-full h-full">
      <div className={`${openBar ? "after:absolute after:top-0 after:left-0 after:content-[''] after:w-full after:h-2 after:bg-secondary":""} h-full w-full gap-x-4 flex flex-row justify-center items-center cursor-pointer`} onClick={toggleOpenGuestPicker}> 
        <User/>
        {getTotalGuest()}
      </div>
      <AnimatePresence>
      {openBar && (
          <motion.div 
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={fadeIn("left","",0,0.5)}
            className={`absolute z-[1000] bg-slate-50 grid grid-cols-3 `}
              style={{
                top: `${containerDimensions.height}px`,
                left: `${leftPosition}px`,
                height:`${containerDimensions.height}px`,
                width: `${containerDimensions.width}px`,
              }}
          >
            <InputGuestBar guests={guests} type="adults" handleCount={updateGuest}/>
            <InputGuestBar guests={guests} type="kids" handleCount={updateGuest}/>
            <InputGuestBar guests={guests} type="babys" handleCount={updateGuest}/>
          </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

const SearchDatesBar = () => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [guests, setGuests] = useState<{adults:number, kids:number, babys:number}>({ adults:1, kids:0, babys:0 });
  const [openBar, setOpenBar] = useState<{startDate:boolean, endDate: boolean, guests: boolean }>({ startDate: false, endDate: false, guests: false });

  const toggleBar = (type: "startDate" | "endDate" | "guests" | null) => {
    //change all values to false and the selected value to true
    if(type === null){
      setOpenBar({ startDate: false, endDate: false, guests: false });
    }else{
      setOpenBar((prevOpenBar) => ({ startDate: false, endDate: false, guests: false, [type]: !prevOpenBar[type] }));
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);


  const handleSearchReservation = () => {
    toggleBar(null);
    const searchValues = { startDate, endDate, guests };
    SearchReservation(searchValues);
  };



  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={fadeIn("up","",0.5,1)}
      ref={containerRef} 
      className="relative  mt-24 w-[100%] sm:w-[80%] h-[120px] sm:h-[180px] lg:h-[60px] bg-white z-[50] grid grid-cols-2 lg:grid-cols-5">
      <div className="max-sm:hidden relative flex flex-col w-full justify-center items-center after:absolute after:content-[''] after:top-0 after:left-0 after:w-full after:h-2 after:bg-secondary">
        <span className="text-slate-700 flex flex-row gap-x-4"><MapPin /> Bambucamp</span>
      </div>
      <DatePicker openBar={ openBar['startDate']} type="startDate" toggleBar={toggleBar} date={startDate} setDate={setStartDate} />
      <DatePicker openBar={ openBar['endDate']} type="endDate" toggleBar={toggleBar} date={endDate} setDate={setEndDate} />
      <GuestPicker openBar={ openBar['guests']} toggleBar={toggleBar} guests={guests} setGuests={setGuests} containerRef={containerRef}/>
      <button className="bg-tertiary text-white w-full col-span-1 sm:col-span-2 lg:col-span-1 hover:bg-primary hover:text-white flex flex-row justify-center items-center gap-x-2 duration-300" onClick={handleSearchReservation}><Search/>Book</button>
    </motion.div>

  );
};

export default SearchDatesBar;
