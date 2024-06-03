import { 
	GOLD_KULLAQ_1,
	GOLD_KULLAQ_2,
	GOLD_KULLAQ_3,
	GOLD_KULLAQ_4,
	GOLD_KULLAQ_5,
	GOLD_KULLAQ_6,
	GOLD_SUMAQ_1,
	GOLD_SUMAQ_2,
	GOLD_SUMAQ_3,
	GOLD_SUMAQ_4,
	GOLD_SUMAQ_5,
	GOLD_SUMAQ_6,
	GOLD_LLURAK_1,
	GOLD_LLURAK_2,
	GOLD_LLURAK_3,
	GOLD_LLURAK_4,
	GOLD_LLURAK_5,
	GOLD_LLURAK_6,
} from "../assets/images"

import { TentIT, ReviewIT } from "./interfaces"

export const tentsData:TentIT[] = [
  {
    id: 1,
    header: "Tent 1",
    title: "Gold Kullaq",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh. Etiam non.",
    images:[
      GOLD_KULLAQ_2,
      GOLD_KULLAQ_3,
      GOLD_KULLAQ_4,
      GOLD_KULLAQ_5,
      GOLD_KULLAQ_6,
    ],
    services: {
      wifi: true,
      parking: true,
      pool: true,
      breakfast: true,
      lunch: true,
      dinner: true,
      spa: true,
      bar: true,
      hotwater: true,
      airconditioning: true,
      grill:true,
    }
  },
  {
    id: 2,
    header: "Tent 1",
    title: "Gold Sumaq",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh. Etiam non.",
    images:[
      GOLD_SUMAQ_2,
      GOLD_SUMAQ_3,
      GOLD_SUMAQ_4,
      GOLD_SUMAQ_5,
      GOLD_SUMAQ_6,
    ],
    services: {
      wifi: true,
      parking: true,
      pool: true,
      breakfast: true,
      lunch: false,
      dinner: true,
      spa: true,
      bar: false,
      hotwater: false,
      airconditioning: true,
      grill:false,
    }
  },
  {
    id: 3,
    header: "Tent 1",
    title: "Suite Llurak",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh. Etiam non.",
    images:[
      GOLD_LLURAK_2,
      GOLD_LLURAK_3,
      GOLD_LLURAK_4,
      GOLD_LLURAK_5,
      GOLD_LLURAK_6,
    ],
    services: {
      wifi: true,
      parking: true,
      pool: true,
      breakfast: true,
      lunch: true,
      dinner: true,
      spa: true,
      bar: true,
      hotwater: true,
      airconditioning: true,
      grill:false,
    }
  },
  {
    id: 4,
    header: "Tent 1",
    title: "Suite Sallary",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh. Etiam non.",
    images:[
      GOLD_SUMAQ_2,
      GOLD_SUMAQ_3,
      GOLD_SUMAQ_4,
      GOLD_SUMAQ_5,
      GOLD_SUMAQ_6,
    ],
    services: {
      wifi: true,
      parking: true,
      pool: true,
      breakfast: true,
      lunch: true,
      dinner: true,
      spa: true,
      bar: true,
      hotwater: true,
      airconditioning: true,
      grill:false,
    }
  },
  {
    id: 5,
    header: "Tent 1",
    title: "Suite Wayra",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh. Etiam non.",
    images:[
      GOLD_KULLAQ_2,
      GOLD_KULLAQ_3,
      GOLD_KULLAQ_4,
      GOLD_KULLAQ_5,
      GOLD_KULLAQ_6,
    ],
    services: {
      wifi: true,
      parking: true,
      pool: true,
      breakfast: true,
      lunch: true,
      dinner: true,
      spa: true,
      bar: true,
      hotwater: true,
      airconditioning: true,
      grill:false,
    }
  },
  {
    id: 6,
    header: "Tent 1",
    title: "Suite Yana",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh. Etiam non.",
    images:[
      GOLD_KULLAQ_2,
      GOLD_KULLAQ_3,
      GOLD_KULLAQ_4,
      GOLD_KULLAQ_5,
      GOLD_KULLAQ_6,
    ],
    services: {
      wifi: true,
      parking: true,
      pool: true,
      breakfast: true,
      lunch: true,
      dinner: true,
      spa: true,
      bar: false,
      hotwater: false,
      airconditioning: false,
      grill:false,
    }
  },
]


export const reviewsData:ReviewIT[] = [
  {
    id:1,
    name: "Marco Antonio Venturo Cosme",
    title: "Excelente experiencia",
    review: "Un lugar muy bonito, tranquilo y relajante, excelente atención, tiene todas las comodidades, es un campamento de lujo, tiene piscina, puedes comprar bebidas, comida y snack, una experiencia muy bonita. Recomendado.",
    stars: 4,
    date: "01-03-2024",
    images: [GOLD_KULLAQ_1,GOLD_KULLAQ_2,GOLD_KULLAQ_3]
  },
  {
    id:1,
    name: "Marco Antonio Venturo Cosme",
    title: "Excelente experiencia",
    review: "Un lugar muy bonito, tranquilo y relajante, excelente atención, tiene todas las comodidades, es un campamento de lujo, tiene piscina, puedes comprar bebidas, comida y snack, una experiencia muy bonita. Recomendado.",
    stars: 4,
    date: "01-03-2024",
    images: [GOLD_KULLAQ_1,GOLD_KULLAQ_2,GOLD_KULLAQ_3]
  },
  {
    id:2,
    name: "Marco Antonio Venturo Cosme",
    title: "Excelente experiencia",
    review: "Un lugar muy bonito, tranquilo y relajante, excelente atención, tiene todas las comodidades, es un campamento de lujo, tiene piscina, puedes comprar bebidas, comida y snack, una experiencia muy bonita. Recomendado.",
    stars: 4,
    date: "01-03-2024",
    images: [GOLD_KULLAQ_1,GOLD_KULLAQ_2,GOLD_KULLAQ_3]
  },
  {
    id:3,
    name: "Marco Antonio Venturo Cosme",
    title: "Excelente experiencia",
    review: "Un lugar muy bonito, tranquilo y relajante, excelente atención, tiene todas las comodidades, es un campamento de lujo, tiene piscina, puedes comprar bebidas, comida y snack, una experiencia muy bonita. Recomendado.",
    stars: 4,
    date: "01-03-2024",
    images: [GOLD_KULLAQ_1,GOLD_KULLAQ_2,GOLD_KULLAQ_3]
  },
  {
    id:4,
    name: "Marco Antonio Venturo Cosme",
    title: "Excelente experiencia",
    review: "Un lugar muy bonito, tranquilo y relajante, excelente atención, tiene todas las comodidades, es un campamento de lujo, tiene piscina, puedes comprar bebidas, comida y snack, una experiencia muy bonita. Recomendado.",
    stars: 4,
    date: "01-03-2024",
    images: [GOLD_KULLAQ_1,GOLD_KULLAQ_2,GOLD_KULLAQ_3]
  },
  {
    id:5,
    name: "Marco Antonio Venturo Cosme",
    title: "Excelente experiencia",
    review: "Un lugar muy bonito, tranquilo y relajante, excelente atención, tiene todas las comodidades, es un campamento de lujo, tiene piscina, puedes comprar bebidas, comida y snack, una experiencia muy bonita. Recomendado.",
    stars: 4,
    date: "01-03-2024",
    images: [GOLD_KULLAQ_1,GOLD_KULLAQ_2,GOLD_KULLAQ_3]
  },
  {
    id:6,
    name: "Marco Antonio Venturo Cosme",
    title: "Excelente experiencia",
    review: "Un lugar muy bonito, tranquilo y relajante, excelente atención, tiene todas las comodidades, es un campamento de lujo, tiene piscina, puedes comprar bebidas, comida y snack, una experiencia muy bonita. Recomendado.",
    stars: 4,
    date: "01-03-2024",
    images: [GOLD_KULLAQ_1,GOLD_KULLAQ_2,GOLD_KULLAQ_3]
  },
  {
    id:7,
    name: "Marco Antonio Venturo Cosme",
    title: "Excelente experiencia",
    review: "Un lugar muy bonito, tranquilo y relajante, excelente atención, tiene todas las comodidades, es un campamento de lujo, tiene piscina, puedes comprar bebidas, comida y snack, una experiencia muy bonita. Recomendado.",
    stars: 4,
    date: "01-03-2024",
    images: [GOLD_KULLAQ_1,GOLD_KULLAQ_2,GOLD_KULLAQ_3]
  },
]

