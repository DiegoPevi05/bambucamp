export interface PromotionIT {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
  discount: number;
  remaining: number;
}

export interface TentIT {
  id: number;
  header: string;
  title: string;
  description: string;
  images: string[];
  services: {
    wifi: boolean;
    parking: boolean;
    pool: boolean;
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    spa: boolean;
    bar: boolean;
    hotwater: boolean;
    airconditioning: boolean;
    grill: boolean;
  }
}

export interface ReviewIT {
  id: number;
  name: string;
  title: string;
  review: string;
  stars: number;
  date: string;
  images: string[];
  profile_image: string;
}
