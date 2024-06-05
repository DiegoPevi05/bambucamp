import React, { useState } from 'react';

interface CollapsibleProps {
  title: string
  content: string
}

const Collapsible = (props:CollapsibleProps) => {
  const { title, content } = props;
  const [openCard, setOpenCard] = useState<boolean>(false);

  const toggleCard = () => {
    setOpenCard(!openCard);
  }
  return (
    <div onClick={toggleCard} className="h-auto w-full flex flex-col justify-start items-start px-4 py-6 border-b-2 transition-all duration-300 cursor-pointer">
        <div className="w-full h-auto flex flex-row justify-between items-start ">
          <h3 className="font-primary text-xs sm:text-sm md:text-md lg:text-lg xl:text-xl pr-6 uppercase w-[90%]">
              { title }
            </h3>
    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="w-[10%] icon icon-tabler icons-tabler-filled icon-tabler-caret-up hidden text-black"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.293 7.293a1 1 0 0 1 1.32 -.083l.094 .083l6 6l.083 .094l.054 .077l.054 .096l.017 .036l.027 .067l.032 .108l.01 .053l.01 .06l.004 .057l.002 .059l-.002 .059l-.005 .058l-.009 .06l-.01 .052l-.032 .108l-.027 .067l-.07 .132l-.065 .09l-.073 .081l-.094 .083l-.077 .054l-.096 .054l-.036 .017l-.067 .027l-.108 .032l-.053 .01l-.06 .01l-.057 .004l-.059 .002h-12c-.852 0 -1.297 -.986 -.783 -1.623l.076 -.084l6 -6z" /></svg>

    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="w-[10%] icon icon-tabler icons-tabler-filled icon-tabler-caret-down text-faq"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 9c.852 0 1.297 .986 .783 1.623l-.076 .084l-6 6a1 1 0 0 1 -1.32 .083l-.094 -.083l-6 -6l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057v-.118l.005 -.058l.009 -.06l.01 -.052l.032 -.108l.027 -.067l.07 -.132l.065 -.09l.073 -.081l.094 -.083l.077 -.054l.096 -.054l.036 -.017l.067 -.027l.108 -.032l.053 -.01l.06 -.01l.057 -.004l12.059 -.002z" /></svg>
        </div>
        <div className={`${ openCard ? "h-[60px] mt-6" : "h-[0px]" } duration-700 w-full overflow-y-scroll  no-scroll-bar`}>
          <p className="text-dark-200 w-full lg:w-full transition-all transition-opacity duration-300 ease-in-out no-scroll-bar text-xs sm:text-sm">
              { content }
            </p>
        </div>
    </div>
  )
}

export default Collapsible;
