import Image from 'next/image';
import StarRating from './StarRating';

export default function ReviewCard({ review }) {
  const avatar = review.user?.photo?.startsWith('http')
    ? review.user.photo
    : `/img/users/${review.user?.photo}`;

  return (
    <div className="w-[20rem] md:w-120 shrink-0 p-10 bg-grey-100 rounded-sm shadow-card flex flex-col items-center scroll-snap-align-center">
      <div className="flex items-center mb-8 self-start">
        <Image
          src={avatar}
          alt={review.user?.name}
          width={45}
          height={45}
          className="rounded-full mr-4 object-cover h-18 w-18"
        />
        <h6 className="text-sm font-bold uppercase">{review.user?.name}</h6>
      </div>
      <p className="text-sm italic mb-8 self-start">{review.review}</p>
      <div className="mt-auto self-start">
        <StarRating rating={review.rating} />
      </div>
    </div>
  );
}
