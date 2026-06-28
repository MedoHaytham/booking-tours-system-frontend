'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import StarRating from './StarRating';

export default function ReviewCard({ review, hideUser, className = 'w-[336px] md:w-[600px] shrink-0' }) {
  const avatar = review.user?.photo?.startsWith('http')
    ? review.user.photo
    : `/img/users/${review.user?.photo}`;

  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        setIsOverflowing(textRef.current.scrollHeight > textRef.current.clientHeight);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [review.review]);

  return (
    <div className={`${className} p-10 bg-grey-100 rounded-sm shadow-card flex flex-col items-center scroll-snap-align-center`}>
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
      <div className="w-full mb-8 self-start flex flex-col">
        <p
          ref={textRef}
          className={`text-sm italic pr-1 text-grey-600 ${isScrollable ? 'h-22.5 overflow-y-auto' : 'h-16 overflow-hidden'}`}
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#55c57a transparent' }}
        >
          { review.review }
        </p>
        {isOverflowing && !isScrollable && (
          <span
            onClick={() => setIsScrollable(true)}
            className="text-[11px] text-primary font-bold self-end mt-1 tracking-wide animate-pulse hover:underline focus:outline-none cursor-pointer"
          >
            more...
          </span>
        )}
      </div>
      <div className="mt-auto self-start">
        <StarRating rating={review.rating} />
      </div>
    </div>
  );
}
