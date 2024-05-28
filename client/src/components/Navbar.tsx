import { styles } from "../lib/styles";
import Button from "./ui/Button";
import {LOGO_PRIMARY} from "../assets/images";
import {User} from "lucide-react";

const NavBarItem = ({children}:{children:string}) => {
  return (
    <div className="w-full h-[80px] flex flex-column justify-center items-center">
      <li className="text-secondary text-xl hover:scale-[1.05]  hover:text-white ease-in-out duration-300 transition-all cursor-pointer">{children}</li>
    </div>
  )
};

const Navbar = () => {
  return (
    <nav className={`${styles.paddingX} w-full flex flex-row justify-center items-center bg-black-to-transparent absolute top-0 z-[100] max-h-[80px]`}>
      <div className="w-[20%] flex justify-center items-center">
        <a href="/" className="relative hover:cursor-pointer hover:scale-[1.05] transition-all duration-300 rounded-full bg-white top-8 w-[125px] h-[125px] flex items-center justify-center">
          <img src={LOGO_PRIMARY} alt="logo" className="w-[90px] h-[90px]"/>
        </a>
      </div>
      <ul className="w-[60%] flex flex-row items-center justify-center gap-x-6">
        <NavBarItem>Nosotros</NavBarItem>
        <NavBarItem>Reservas</NavBarItem>
        <NavBarItem>Promociones</NavBarItem>
        <NavBarItem>Servicios</NavBarItem>
        <NavBarItem>Contactanos</NavBarItem>
      </ul>
      <div className="w-[20%] flex justify-center items-center">
        <Button className="gap-x-4">Log In <User/> </Button>
      </div>
    </nav>
  );
};

export default Navbar;
