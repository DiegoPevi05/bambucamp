import MessageSquare from "../assets/images/svg/message-square.svg?react";

const ChatComponent = () => {


  return (
    <div className="fixed bottom-0 right-0 z-[1000] duration-300 w-auto">

      <div className="flex relative right-6 sm:right-24 bottom-6 sm:bottom-12 hover:animate-bounce duration-300 transition-all bg-secondary flex items-center justify-center rounded-full h-14 w-14 border-2 border-white">
        <a href="https://wa.link/ioswo5" target="_blank" className="text-xl cursor-pointer"><MessageSquare className="text-white w-8 h-8" /></a>
      </div>
    </div>
  );
};

export default ChatComponent;
