import {Dot, PhoneCall,Smartphone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import {LOGO_PRIMARY } from "../assets/images"

const FooterLink = ({children}:{children:string}) => {
  return (
    <a href="/" className="text-white text-sm hover:underline duration-300 flex flex-row">{children}</a>
  );
};

const Footer = () => {
  return (
    <footer className="relative w-full h-auto lg:h-[250px] bg-secondary grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 px-12 sm:px-24 lg:px-48 py-12 lg:pt-12 gap-y-6 lg:gap-x-12">

      <div className="col-span-1 flex flex-col gap-y-2">
        <a href="/" className="hover:scale-[1.05] transition-all duration-300 rounded-full bg-white top-8 w-[95px] h-[95px] flex items-center justify-center">
          <img src={LOGO_PRIMARY} alt="logo" className="w-[60px] h-[60px]"/>
        </a>
        <p className="text-white text-md">Bambucamp Glamping</p> 
        <p className="text-white text-xs">All rights reserved {new Date().getFullYear()}</p>

      </div>
      <div className="hidden sm:block max-sm:col-span-1 lg:hidden flex flex-col gap-y-2">

      </div>

      <div className="col-span-1 flex flex-col gap-y-2">
        <FooterLink>About Us</FooterLink>
        <FooterLink>Schedules</FooterLink>
        <FooterLink>Promotions</FooterLink>
        <FooterLink>Services</FooterLink>
        <FooterLink>Contact Us</FooterLink>
      </div>

      <div className="col-span-1 flex flex-col gap-y-2">
        <FooterLink>Tents</FooterLink>
        <FooterLink>Extras</FooterLink>
        <FooterLink>My Reservations</FooterLink>
      </div>

      <div className="col-span-1 flex flex-col gap-y-2">
        <FooterLink>Service Politics</FooterLink>
        <FooterLink>Privacy Politics</FooterLink>
        <FooterLink>Cookies Politics</FooterLink>
      </div>

      <div className="col-span-1 flex flex-col gap-y-3">
        <h2 className="font-primary text-white text-md">Contact us</h2>
        <div className="flex flex-row gap-x-4">
          <div className="flex flex-row gap-x-2 text-white">
            <PhoneCall className="h-4 w-4" />
            <p className="font-primary text-sm">+51 912-135-696</p>
          </div>
          <div className="flex flex-row gap-x-2 text-white">
            <Smartphone className="h-4 w-4"/>
            <p className="font-primary text-sm"> +01 566-1954</p>
          </div>
        </div>
        <a href="mailto:bambucamp@gmail.com" target="_blank" className="flex flex-row gap-x-2 text-white hover:text-primary duration-300">
          <Mail className="h-4 w-4"/>
          <p className="font-primary text-sm">bambucamp@gmail.com</p>
        </a>

        <div className="flex flex-row gap-x-2 text-white">
          <MapPin className="h-4 w-4"/>
          <p className="font-primary text-sm">Jita pasaje cuatro esquina, Lunahuaná 15727</p>
        </div>
        <div className="flex flex-row gap-x-6 text-white">
          <a href="/" target="_blank" className="font-primary text-sm hover:scale-[1.05] hover:text-primary duration-300">
            <Facebook/>
          </a>
          <a href="/" target="_blank" className="font-primary text-sm hover:scale-[1.05] hover:text-primary duration-300">
            <Instagram/>
          </a>
          <a href="/" target="_blank" className="font-primary text-sm hover:scale-[1.05] hover:text-primary duration-300">
            <Twitter/>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
