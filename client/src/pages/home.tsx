import React, {useState} from "react"
import Navbar from "../components/Navbar"
import Banner from "../assets/video/Banner.mp4"
import {LOGO_THIRD,TENT_SECONDARY } from "../assets/images"
import {motion} from "framer-motion"
import { fadeIn, fadeOnly } from "../lib/motions"
import SearchDatesBar from "../components/SearchBar"
import VerticalCarousel from "../components/VerticalCarousel"
import Reviews from "../components/Reviews"
import Footer from "../components/Footer"
import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from "../components/ui/Button"
import { formHomeSchema } from "../db/schemas.ts"

const Home = () => {

  const [loadingForm, setLoadingForm] = useState<boolean>(false);
  type FormValues = z.infer<typeof formHomeSchema>;
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formHomeSchema),
  });

  const onSubmit = (data: FormValues) => {
    setLoadingForm(true);
    console.log(data);
    setTimeout(() => {
      setLoadingForm(false);
    }, 2000);
  };

  return (
    <div className="overflow-hidden">
      <Navbar/>
      <div id="hero" className="relative w-full h-[100vh] flex flex-col justify-center items-center z-[20]">
        <video src={Banner} autoPlay loop  muted className="absolute top-0 left-0 w-full h-full object-cover"/>
        <motion.div 
          initial="hidden"
          animate="show"
          variants={fadeIn("down","",0,2)}
          className="h-auto  sm:h-[20%] lg:h-[30%] w-[90%] sm:w-auto bg-transparent z-[100]">
          <img src={LOGO_THIRD} alt="logo_lg" className="w-full h-full object-cover"/>
        </motion.div>
        <SearchDatesBar/>
      </div>

      <div id="reviews" className="relative w-full h-auto flex flex-col justify-center items-start">
        <Reviews/>
      </div>

      <div id="services" className="relative w-full h-[100vh] flex flex-col justify-center items-start">
        <VerticalCarousel/>
      </div>

      <div id="contact"  className="relative w-full h-[100vh] grid grid-cols-2 overflow-hidden">
        <motion.div 
          initial="hidden"
          animate="show"
          variants={fadeIn("up","",0,2)}
          className="w-full h-full col-span-1 bg-white flex flex-col justify-center items-start px-48 pt-12 gap-y-6">
          <h2 className="font-primary text-secondary text-5xl">Contact us</h2>
          <h3 className="font-primary text-secondary text-md">Send us a message with a specific proposal that you might have for us or any addiontal information you could not found</h3>

          <form className="w-full h-full flex flex-col justify-start items-start" onSubmit={handleSubmit(onSubmit)}>

            <div className="flex flex-col justify-start items-start w-full min-h-28 overflow-hidden gap-y-4">
              <label htmlFor="name" className="font-tertiary text-md h-6">Name</label>
              <input {...register("name")} className="w-full h-12 font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder="Name" />
              <div className="w-full h-6">
                {errors?.name && 
                  <motion.p 
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    variants={fadeIn("up","", 0, 1)}
                    className="h-6 text-xs text-tertiary font-tertiary">{errors.name.message}
                  </motion.p>
                }
              </div>
            </div>

            <div className="flex flex-col justify-start items-start w-full min-h-28 overflow-hidden gap-y-4">
              <label htmlFor="email" className="font-tertiary text-md h-6">Email</label>
              <input {...register("email")} className="w-full h-12 font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder="Email" />
              <div className="w-full h-6">
                {errors?.email && 
                  <motion.p 
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    variants={fadeIn("up","", 0, 1)}
                    className="h-6 text-xs text-tertiary font-tertiary">{errors.email.message}
                  </motion.p>
                }
              </div>
            </div>

            <div className="flex flex-col justify-start items-start w-full min-h-28 overflow-hidden gap-y-4">
              <label htmlFor="title" className="font-tertiary text-md h-6">Title</label>
              <input {...register("title")} className="w-full h-12 font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder="Header" />
              <div className="w-full h-6">
                {errors?.title && 
                  <motion.p 
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    variants={fadeIn("up","", 0, 1)}
                    className="h-6 text-xs  text-tertiary font-tertiary">{errors.title.message}
                  </motion.p>
                }
              </div>
            </div>

            <div className="flex flex-col justify-start items-start w-full min-h-28 overflow-hidden gap-y-4">
              <label htmlFor="message" className="font-tertiary text-md h-6">Message</label>
              <textarea {...register("message")} className="w-full h-full font-tertiary p-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder="Message" />
              <div className="w-full h-6">
                {errors?.message && 
                  <motion.p 
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    variants={fadeIn("up","", 0, 1)}
                    className="h-6 text-xs text-tertiary font-tertiary">{errors.message.message}
                  </motion.p>
                }
              </div>
            </div>
            <div className="flex flex-row justify-start items-start w-full min-h-12 overflow-hidden gap-x-4">
              <input {...register("saveinfo")} className="w-4 h-4 font-tertiary px-2 border-0" type="checkbox" />
              <label htmlFor="saveinfo" className="font-tertiary text-xs">Save info for marketing purposes</label>
            </div>
            <Button variant="dark" className="w-full" isLoading={loadingForm} type="submit">Submit</Button>
          </form>
        </motion.div>

        <div className="w-full h-full col-span-1">
          <img src={TENT_SECONDARY} alt="tent" className="w-full h-full object-cover opacity-[60%]"/>
        </div>

      </div>
      <Footer/>
    </div>
  )
}

export default Home
