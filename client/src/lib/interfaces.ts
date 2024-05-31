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
