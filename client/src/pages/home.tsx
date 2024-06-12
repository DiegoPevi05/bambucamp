import React, {useState} from "react"
import Navbar from "../components/Navbar"
import Banner from "../assets/video/Banner.mp4"
import {LOGO_THIRD,TENT_SECONDARY, TENT_SVG } from "../assets/images"
import {motion} from "framer-motion"
import {styles} from "../lib/styles"
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
import PromotionCard from "../components/CardPromotion"
import {promotionsData} from "../lib/constant"
import Collapsible from "../components/Collapsible"
import { Tent } from "lucide-react"

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
          whileInView='show'
          viewport={{ once: true }}
          variants={fadeIn("down","",0,2)}
          className="h-auto  sm:h-[20%] lg:h-[30%] w-[90%] sm:w-auto bg-transparent z-[100]">
          <img src={LOGO_THIRD} alt="logo_lg" className="w-full h-full object-cover"/>
        </motion.div>
        <SearchDatesBar/>
      </div>
      <div id="us" className="relative w-full h-auto bg-secondary flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-y-6 w-full max-w-7xl py-24 px-6 sm:px-12 lg:px-48">
          <motion.h2 
            initial="hidden"
            whileInView='show'
            viewport={{ once: true }}
            variants={fadeIn("down","",0.3,1)}
            className={`${styles.sectionHeadText} text-tertiary text-center`}>Welcome to Bambucamp Glamping</motion.h2>
          <motion.img 
            initial="hidden"
            whileInView='show'
            viewport={{ once: true }}
            variants={fadeOnly("",0.5,1)}
            className="w-[200px] h-[200px] object-cover rounded-full border-4 border-white"
            src={TENT_SECONDARY} alt="tent"/>
          <motion.p 
            initial="hidden"
            whileInView='show'
            viewport={{ once: true }}
            variants={fadeIn("down","",0.5,1)}
            className="font-secondary text-white text-center">At Bambucamp Glamping, we offer a unique camping experience that combines the best of both worlds. Our luxury tents are equipped with all the amenities you need for a comfortable stay, while still allowing you to enjoy the great outdoors. Whether you're looking for a romantic getaway or a fun family vacation, we have the perfect accommodations for you. Book your stay with us today and experience the beauty of nature in style.</motion.p>
          <motion.div 
            initial="hidden"
            whileInView='show'
            viewport={{ once: true }}
            variants={fadeIn("down","",0.8,1)}
            className="flex flex-row max-sm:flex-wrap justify-center items-center max-sm:gap-4 sm:gap-x-4">
            <Button variant="dark">Book now</Button>
            <Button variant="default">See our Tents</Button>
            <Button variant="dark">See our Services</Button>
            <Button variant="ghost">Learn more</Button>
          </motion.div>
        </div>
      </div>

      <div id="reviews" className="relative w-[100vw] h-auto overflow-hidden">
        <Reviews/>
      </div>

      <div id="promotions" className="relative w-full h-auto lg:h-[100vh] py-24 px-6 sm:px-12 lg:px-48 flex flex-col justify-start items-start gap-y-6">
        <motion.h2 
          initial="hidden"
          whileInView='show'
          viewport={{ once: true }}
          variants={fadeIn("down","",0,1)}
          className="font-primary text-secondary  text-4xl sm:text-7xl">Promotions</motion.h2>
        <div class="flex flex-row flex-wrap gap-x-2">
          <motion.h3 
          initial="hidden"
          whileInView='show'
          viewport={{ once: true }}
          variants={fadeIn("left","",0.5,1.5)}
          className="font-tertiary text-secondary text-lg sm:text-4xl">Check out our latest promotions and offers all our offerst
          </motion.h3>
          <motion.p 
          initial="hidden"
          whileInView='show'
          viewport={{ once: true }}
          variants={fadeIn("left","",0.5,1.5)}
          className="font-tertiary text-white bg-secondary text-lg sm:text-4xl">are over 50%</motion.p>
        </div>

        <div className="w-full h-auto sm:h-full mx-auto flex flex-row sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-lg:mt-12 max-sm:overflow-auto">
          {promotionsData.length > 1 && (
            promotionsData.map((promotion,index) => (
              <PromotionCard promotion={promotion} index={index}/>
            ))
          )}
        </div>
      </div>

      <div id="services" className="relative w-full h-[100vh] flex flex-col justify-center items-start">
        <VerticalCarousel/>
      </div>
      <div id="FAQ" className="relative w-full h-auto lg:h-[100vh] grid grid-cols-1 lg:grid-cols-2 overflow-hidden px-12 sm:px-36 lg:px-48 py-24 bg-secondary text-white max-lg:gap-y-4">
        <div className="lg:flex w-full h-full col-span-1 flex-col justify-center items-start gap-y-6">
          <motion.h2 
            initial="hidden"
            whileInView='show'
            viewport={{ once: true }}
            variants={fadeIn("up","",0,1.5)}
            className={`${styles.sectionHeadText} flex items-center gap-x-2 pb-2`}><Tent className="h-8 w-8"/>FAQ</motion.h2>
          <motion.h3 
            initial="hidden"
            whileInView='show'
            viewport={{ once: true }}
            variants={fadeIn("up","",0.5,1.5)}
            className={`${styles.sectionSubText} text-white`}>Here are some of the most frequently asked questions that we get from our customers</motion.h3>
          <motion.img 
            initial="hidden"
            whileInView='show'
            viewport={{ once: true }}
            variants={fadeIn("up","",0.5,1.5)}
            src={TENT_SVG} alt="tent" className="w-full lg:w-[80%] h-auto object-cover"/>
        </div>
        <motion.div 
          initial="hidden"
          whileInView='show'
          viewport={{ once: true }}
          variants={fadeIn("left","tween",0.8,1.5)}
          className="block w-full h-full col-span-1 flex flex-col justify-start items-center lg:px-24">
          <Collapsible title="What is the best time to visit the camp?" content="The best time to visit the camp is during the summer months, when the weather is warm and the days are long. The camp is open from May to September, and the best time to visit is during the peak season, which is from June to August. During this time, the camp is at its busiest, with lots of activities and events taking place. If you prefer a quieter experience, you may want to visit in May or September, when the camp is less crowded."/>

          <Collapsible title="What is the best time to visit the camp?" content="The best time to visit the camp is during the summer months, when the weather is warm and the days are long. The camp is open from May to September, and the best time to visit is during the peak season, which is from June to August. During this time, the camp is at its busiest, with lots of activities and events taking place. If you prefer a quieter experience, you may want to visit in May or September, when the camp is less crowded."/>

          <Collapsible title="What is the best time to visit the camp?" content="The best time to visit the camp is during the summer months, when the weather is warm and the days are long. The camp is open from May to September, and the best time to visit is during the peak season, which is from June to August. During this time, the camp is at its busiest, with lots of activities and events taking place. If you prefer a quieter experience, you may want to visit in May or September, when the camp is less crowded."/>

          <Collapsible title="What is the best time to visit the camp?" content="The best time to visit the camp is during the summer months, when the weather is warm and the days are long. The camp is open from May to September, and the best time to visit is during the peak season, which is from June to August. During this time, the camp is at its busiest, with lots of activities and events taking place. If you prefer a quieter experience, you may want to visit in May or September, when the camp is less crowded."/>
        </motion.div>
      </div>



      <div id="contact"  className="relative w-full h-auto lg:h-[100vh] grid grid-cols-2 overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView='show'
          viewport={{ once: true }}
          variants={fadeIn("up","",0,2)}
          className="w-full h-full col-span-2 lg:col-span-1 bg-white flex flex-col justify-center items-start px-12 sm:px-24 lg:px-36 2xl:px-48 py-24 lg:pt-12 gap-y-6">
          <h2 className="font-primary text-secondary text-3xl sm:text-5xl">Contact us</h2>
          <h3 className="font-primary text-secondary text-sm sm:text-md">Send us a message with a specific proposal that you might have for us or any addiontal information you could not found</h3>

          <form className="w-full h-full flex flex-col justify-start items-start" onSubmit={handleSubmit(onSubmit)}>

            <div className="flex flex-col justify-start items-start w-full h-auto sm:min-h-28 overflow-hidden gap-y-4">
              <label htmlFor="name" className="font-tertiary text-sm sm:text-md h-3 sm:h-6">Name</label>
              <input {...register("name")} className="w-full h-8 sm:h-12 max-sm:text-xs font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder="Name" />
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

            <div className="flex flex-col justify-start items-start w-full h-auto sm:min-h-28 overflow-hidden gap-y-4">
              <label htmlFor="email" className="font-tertiary text-sm sm:text-md h-3 sm:h-6">Email</label>
              <input {...register("email")} className="w-full h-8 sm:h-12 max-sm:text-xs font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder="Email" />
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

            <div className="flex flex-col justify-start items-start w-full h-auto sm:min-h-28 overflow-hidden gap-y-4">
              <label htmlFor="title" className="font-tertiary text-sm sm:text-md h-3 sm:h-6">Title</label>
              <input {...register("title")} className="w-full h-8 sm:h-12 max-sm:text-xs font-tertiary px-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder="Header" />
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

            <div className="flex flex-col justify-start items-start w-full h-auto sm:min-h-28 overflow-hidden gap-y-4">
              <label htmlFor="message" className="font-tertiary text-sm sm:text-md h-3 sm:h-6">Message</label>
              <textarea {...register("message")} className="w-full h-full max-sm:text-xs font-tertiary p-2 border-b-2 border-secondary focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder="Message" />
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

        <div className="hidden lg:block w-full h-full col-span-1">
          <img src={TENT_SECONDARY} alt="tent" className="w-full h-full object-cover opacity-[60%]"/>
        </div>

      </div>
      <Footer/>
    </div>
  )
}

export default Home
