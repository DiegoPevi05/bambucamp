import React, { useState } from "react"
import {GOOGLE_ICON} from "../assets/images"
import { Star  } from "lucide-react"
import ReviewIT from "../lib/interfaces"
import {reviewsData} from "../lib/constant"

interface CardReviewProps {
  data: ReviewIT
}

const CardReview = (props:CardReviewProps) => {
  const {data} = props

  return(
    <div className="w-[400px] h-[250px] flex justify-start items-center shadow-xl rounded-xl bg-white relative p-6">
      <div className="w-[100px] h-[100px] bg-white rounded-full absolute -top-[25px] -right-[25px] border-4 border-secondary"></div>

      <div className="w-[300px] h-[200px] flex flex-col gap-y-2 justify-center items-start">
        <div className="w-full h-auto flex flex-row justify-start items-center gap-x-2">
          <img src={GOOGLE_ICON} alt="tent" className="w-5 h-5 object-cover"/>
          <h5 className="text-secondary text-sm font-bold">{data.name}</h5>
        </div>
        <p className="text-secondary text-md">{data.title}</p>
        <p className="text-primary text-xs  italic">{' "'+data.review+'"'}</p>
        <div className="w-full h-auto flex flex-row justify-start items-center">
          { data.stars > 0 && Array(data.stars).fill(0).map((_,i) => (
            <Star key={i} className="text-tertiary h-4 w-4" fill="#eab485"/>
          ))}
        </div>

        <div className="w-full h-auto flex flex-row justify-start items-center">
          <p className="text-secondary text-xs">Fecha de estadia: {data.date}</p>
        </div>

      </div>
    </div>
  )


}

const Reviews = () => {
  const [reviews, setReviews] = useState<ReviewIT[]>(reviewsData)

  return (
    <div className="w-full h-[500px] overflow-x-scroll gap-x-12">
      <div className="w-100 h-full flex flex-row justify-start items-center bg-red-100 wrapper-reviews">
        {reviews.map((review,index) => (
          <CardReview key={review.id+"-"+index} data={review}/>
        ))}
      </div>
    </div>
  );
}

export default Reviews;
