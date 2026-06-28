import Image from 'next/image';
import Link from 'next/link';
import StarRating from './StarRating';

export default function ReviewCard({ review, hideUser }) {
  const avatar = review.user?.photo?.startsWith('http')
    ? review.user.photo
    : `/img/users/${review.user?.photo}`;

  return (
    <div className="w-fit shrink-0 p-10 bg-grey-100 rounded-sm shadow-card flex flex-col items-center scroll-snap-align-center">
      {review.tour && (
        <Link
          href={`/tour/${review.tour.slug}`}
          className="self-start mb-4 text-primary font-semibold text-[1.3rem] hover:underline transition-colors duration-200"
        >
          {review.tour.name}
        </Link>
      )}
      {!hideUser && (
        <div className="flex items-center mb-8 self-start">
          <Image
            src={avatar}
            alt={review.user?.name}
            width={45}
            height={45}
            className="rounded-full mr-4 object-cover h-18 w-18"
          />
          <h6 className="w-60 md:w-50 line-clamp-1 text-sm font-bold uppercase ">{review.user?.name}</h6>
        </div>
      )}
      <p className="text-sm italic mb-8 self-start">{review.review}</p>
      <div className="mt-auto self-start">
        <StarRating rating={review.rating} />
      </div>
    </div>
  );
}
