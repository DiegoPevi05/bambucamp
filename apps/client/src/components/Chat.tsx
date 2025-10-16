import  { useState, useEffect, useRef, useCallback, ChangeEvent, KeyboardEvent } from "react";
import MessageSquare from "../assets/images/svg/message-square.svg?react";
import Tent from "../assets/images/svg/tent.svg?react";
import SendHorizonal from "../assets/images/svg/chevron-right.svg?react";
import X from "../assets/images/svg/x.svg?react";
import User from "../assets/images/svg/user.svg?react";

import { motion } from "framer-motion";
import { NO_CHAT } from "../assets/images";
import {useTranslation} from "react-i18next";
import io, { Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import Button from "./ui/Button";
import {toast} from "sonner";
import { setCookie, getCookie } from '../lib/cookies';
import {formatTime} from "../lib/utils";

interface ChatMessage {
  user: string;
  message: string;
  user_type:string;
  userName:string;
  timestamp: string;
}

const ChatComponent = () => {

  const {t} = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [startConversation,setStartConversation] = useState<boolean>(false);

  // Ref for the messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const socketRef = useRef<Socket | null>(null);
  const sessionIdRef = useRef<string>(uuidv4());
  const [errorShown, setErrorShown] = useState(false);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

// Initialize the socket connection if conversation is started
  const initializeSocket = useCallback((channelId: string) => {
    if (socketRef.current) return; // Prevent re-initialization

    // Initialize WebSocket connection
    socketRef.current = io(`${import.meta.env.VITE_BACKEND_URL}`);

    // Listen for connection errors
    const handleConnectionError = (_: any) => {
      if (!errorShown) {
        toast.error(t("Error trying to connect to the server"));
        setErrorShown(true); // Ensure the toast is only shown once
      }
    };

    socketRef.current.on('connect_error', handleConnectionError);

    socketRef.current.emit('joinChannel', channelId);

    // Listen for incoming messages
    socketRef.current.on('receiveMessage', (message: ChatMessage) => {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, message];

        // Store updated messages in cookies with a 1-hour expiration
        setCookie('chatMessages', JSON.stringify(updatedMessages), 3600000);

        return updatedMessages;
      });
    });
  }, [errorShown, t]);


  useEffect(() => {
    const storedChannelId = getCookie('channelId');
    const storedMessages = getCookie('chatMessages');

    if (storedChannelId && storedMessages) {
      setMessages(JSON.parse(storedMessages));
      setStartConversation(true);
      sessionIdRef.current = storedChannelId;
      initializeSocket(storedChannelId);
    }
  }, [initializeSocket]);

  useEffect(() => {
    if (startConversation) {
      const channelId = sessionIdRef.current.toString();
      initializeSocket(channelId);

      // Store channelId in cookies with a 1-hour expiration
      setCookie('channelId', channelId, 3600000);
    }
    
    return () => {
      socketRef.current?.disconnect();
      setErrorShown(false);
    };
  }, [startConversation, initializeSocket]);


  const [input, setInput] = useState<string>("");

  const toggleChat = (): void => setIsOpen(!isOpen);

  const handleSendMessage = (): void => {
    if (input.trim()) {
      // Emit the message through WebSocket
      socketRef.current?.emit('sendMessage', input);

      setInput("");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed -bottom-1 sm:right-0 right-1/2 sm:mr-4 sm:transform-none transform translate-x-1/2 z-50 duration-300 w-80">

      {isOpen ?
        <div onClick={toggleChat}  className="flex sm:hidden justify-between px-4 py-2 bg-secondary text-white p-4 rounded-t-lg cursor-pointer">
        
          <h2 className="text-sm font-primary flex flex-row items-center gap-x-2"><Tent/> {t("Talk with us")}</h2>
            <span className="text-xl cursor-pointer"><X/></span>
        </div>
      :
        <div onClick={toggleChat} className="flex sm:hidden absolute right-2 bottom-4 bg-secondary flex items-center justify-center rounded-full h-14 w-14">
            <span className="text-xl cursor-pointer"><MessageSquare className="text-white w-8 h-8"/></span>
        </div>
      }

      <div onClick={toggleChat}  className="hidden sm:flex justify-between px-4 py-2 bg-secondary text-white p-4 rounded-t-lg cursor-pointer">
      
        <h2 className="text-sm font-primary flex flex-row items-center gap-x-2"><Tent/>{t("Talk with us")}</h2>
        {!isOpen ?
          <span className="text-xl cursor-pointer"><MessageSquare/></span>
        :
          <span className="text-xl cursor-pointer"><X/></span>
        }
      </div>

      <div
          className={`w-full transition-all duration-300 ease-in-out overflow-hidden bg-white border border-secondary shadow-lg ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
        {!startConversation ?
          <div className="w-full flex items-center justify-center flex-col gap-y-2 h-80">
            <img src={NO_CHAT} alt="no_chat" className="h-32 w-auto"/>
            <Button onClick={()=>setStartConversation(true)} variant="ghostLight" effect="default" isRound={true}>{t("Start a conversation")}</Button>
            <span className="text-xs text-center font-secondary text-secondary w-[70%]">{t("Send to us a message, and we will answer soon")}</span>
          </div>

        :
        <>
            <div className="py-4 px-2 h-64 overflow-y-auto no-scroll-bar flex flex-col">
              {messages.length === 0 ? 
                <div className="w-full h-full flex items-center justify-center flex-col gap-y-2">
                  <img src={NO_CHAT} alt="no_chat" className="h-32 w-auto"/>
                  <span className="text-xs text-center font-secondary text-secondary w-[70%]">{t("Send to us a message, and we will answer soon")}</span>
                </div>
              :
              <>
                {messages.map((msg, index) => (
                  <div className={`flex w-full ${ msg.user_type === "external" ? "flex-row-reverse justify-start" : "flex-row justify-start" } gap-x-2`}>
                    <div className={`${ msg.user_type === "external" ? "bg-secondary " : "bg-white border-2 border-secondary" } w-8 h-8 rounded-full flex items-center justify-center mt-auto`}>
                      {msg.user_type !== "external" ?
                        <Tent className="text-secondary h-5 w-5"/>
                      :
                        <User className="text-white h-6 w-6"/>
                      }
                    </div>
                    <motion.div
                      initial={{
                          scale: 0,
                          originX: msg.user_type === "external" ? 1 : 0, // Right bottom for user, left bottom for bot
                          originY: 1, // Bottom scale
                        }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      key={index}
                      className={`mb-2 py-2 text-xs w-auto max-w-[70%] flex h-auto bg-secondary text-white ${
                        msg.user_type === "external"
                          ? "text-left rounded-l-lg rounded-tr-lg flex-row-reverse"
                          : "text-right rounded-r-lg rounded-tl-lg flex-row-reverse"
                      }`}
                    >
                      <span className="w-10 text-[10px] mt-auto ml-auto">{formatTime(msg.timestamp)}</span>
                      <p className="px-2 w-auto">{msg.message}</p>
                    </motion.div>
                  </div>
                ))}

                <div ref={messagesEndRef}></div>
              </>
            }
            </div>

            <div className="flex p-2 border-t">
              <input
                type="text"
                className="flex-grow border border-gray-300 p-2 rounded-l-lg text-sm font-secondary text-secondary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                placeholder={t("Type a message...")}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
              />
              <button
                className="bg-secondary text-white p-2 rounded-r-lg active:scale-95 duration-300 "
                onClick={handleSendMessage}
              >
                <SendHorizonal  className="h-5 w-5"/>
              </button>
            </div>
        </>
        }

      </div>




    </div>
  );
};

export default ChatComponent;
