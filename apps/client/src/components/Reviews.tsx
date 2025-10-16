import { GOOGLE_ICON } from "../assets/images"
import ExternalLink from "../assets/images/svg/external-link.svg?react";
import Star from "../assets/images/svg/star.svg?react";
import { Review, } from "../lib/interfaces"
import { useTranslation } from "react-i18next"
import { capitalizeNames, getInitials, getTimeAgo } from "../lib/utils"

interface CardReviewProps {
  data: Review
}

const CardReview = (props: CardReviewProps) => {
  const { t, i18n } = useTranslation();
  const { data } = props;
  const isMobile = window.innerWidth < 1026;

  return (
    <div className="reviews-slide-card min-w-[250px] lg:min-w-[350px] h-auto lg:h-[250px] flex justify-start items-center shadow-xl rounded-xl bg-white relative p-4 lg:p-6 mx-[80px] hover:-translate-y-[20px] duration-300">
      <div className="w-[80px] h-[80px] bg-white rounded-full absolute -top-[40px] -right-[25px] border-2 lg:border-4 border-secondary flex items-center justify-center">
        {data.profile_image_url.length == null || data.profile_image_url.length == 0 ?
          <span className="w-auto h-auto text-2xl text-tertiary">{getInitials(data.name)}</span>
          :
          <img src={data.profile_image_url} alt="profile" className="w-full h-full object-cover rounded-full" />
        }
      </div>

      <div className="w-[300px] h-auto flex flex-col gap-y-2 justify-center items-start">
        <div className="w-full h-auto flex flex-row justify-start items-start gap-x-2">
          <img src={GOOGLE_ICON} alt="tent" className="w-5 h-5 object-cover" />
          <h5 className="text-secondary text-sm font-bold">{capitalizeNames(data.name)}</h5>
          {data.href != null && data.href.length > 0 && (
            <a href={data.href} className="text-secondary w-3 h-3" target="_blank"><ExternalLink /></a>
          )}
        </div>
        <p className="hidden lg:block text-tertiary text-md">{data.title}</p>
        <p className="text-primary text-xs italic">{`${isMobile ? '"' + data.review.slice(0, 100) + '..."' : '"' + (data.review.length > 220 ? data.review.slice(0, 220) + "..." : data.review) + '"'}`}</p>
        <div className="w-full h-auto flex flex-row justify-start items-center">
          {data.stars > 0 && Array(data.stars).fill(0).map((_, i) => (
            <Star key={i} className="text-tertiary h-4 w-4" fill="#eab485" />
          ))}
        </div>

        <div className="w-full h-auto flex flex-row justify-start items-center">
          <p className="text-secondary text-xs">{getTimeAgo(data.day, t, i18n.language)}</p>
        </div>

      </div>
    </div>
  )


}

interface ReviewProps {
  reviews: Review[]
}

const Reviews = (props: ReviewProps) => {
  const { reviews } = props

  return (
    <div className="w-full h-[300px] lg:h-[500px] reviews">
      <div className={`h-full flex flex-row justify-start items-center reviews-slide p-0`}>
        {reviews.map((review, index) => (
          <CardReview key={review.id + "-" + index} data={review} />
        ))}
      </div>
      <div className={`h-full flex flex-row justify-start items-center reviews-slide p-0`}>
        {reviews.map((review, index) => (
          <CardReview key={review.id + "-" + index} data={review} />
        ))}
      </div>
    </div>
  );
}

export default Reviews;
