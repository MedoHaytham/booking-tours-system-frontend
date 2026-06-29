'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import StarRating from './StarRating';
import { SquarePen, Trash2, Check, X } from 'lucide-react';

import { useUpdateReviewMutation, useDeleteReviewMutation } from '@/features/reviewSlice';

const STAR_PATH = 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z';

export default function ReviewCard({ review, hideUser, myReview, className = 'w-[336px] md:w-[600px] shrink-0' }) {
  const avatar = review.user?.photo?.startsWith('http')
    ? review.user.photo
    : `/img/users/${review.user?.photo}`;

  // ── overflow / scroll ──────────────────────────────────────────
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current)
        setIsOverflowing(textRef.current.scrollHeight > textRef.current.clientHeight);
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [review.review]);

  // ── edit state ─────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [editedReview, setEditedReview] = useState(review.review);
  const [editedRating, setEditedRating] = useState(review.rating);
  const [hoveredStar, setHoveredStar] = useState(0);

  // ── mutations ──────────────────────────────────────────────────
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const handleStartEdit = () => {
    setEditedReview(review.review);
    setEditedRating(review.rating);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedReview(review.review);
    setEditedRating(review.rating);
  };

  const handleUpdateReview = async () => {
    if (!editedReview.trim() || editedRating === 0) return;

    const result = await updateReview({
      id: review._id,
      review: { review: editedReview, rating: editedRating },
    });

    if (!result.error) setIsEditing(false);
  };

  const handleDeleteReview = async () => {
    await deleteReview(review._id);
  };

  const activeStars = hoveredStar || editedRating;

  return (
    <div className={`${className} p-4 md:p-6 bg-grey-100 rounded-sm shadow-card flex flex-col items-center scroll-snap-align-center`}>

      {/* Tour name + actions */}
      {review.tour && (
        <div className='w-full flex justify-between'>
          <Link
            href={`/tour/${review.tour.slug}`}
            className="max-w-[204px] lg:max-w-[235px] xl:max-w-[280px] truncate self-start mb-4 text-primary font-semibold text-[1.3rem] hover:underline transition-colors duration-200"
          >
            {review.tour.name}
          </Link>

          {myReview && !isEditing && (
            <div className='flex pt-2 gap-2'>
              <SquarePen
                size={18}
                className='text-primary hover:text-primary/70 hover:scale-90 transition-all duration-200 cursor-pointer'
                onClick={handleStartEdit}
              />
              <Trash2
                size={18}
                className='text-red-500 hover:text-red-400 hover:scale-90 transition-all duration-200 cursor-pointer'
                onClick={handleDeleteReview}
              />
            </div>
          )}

          {myReview && isEditing && (
            <div className='flex pt-2 gap-2'>
              <Check
                size={18}
                className='text-primary hover:text-primary/70 hover:scale-90 transition-all duration-200 cursor-pointer'
                onClick={handleUpdateReview}
              />
              <X
                size={18}
                className='text-red-500 hover:text-red-400 hover:scale-90 transition-all duration-200 cursor-pointer'
                onClick={handleCancelEdit}
              />
            </div>
          )}
        </div>
      )}

      {/* User avatar */}
      {!hideUser && (
        <div className="flex items-center mb-8 self-start">
          <Image
            src={avatar}
            alt={review.user?.name}
            width={45}
            height={45}
            className="rounded-full mr-4 object-cover h-18 w-18"
          />
          <h6 className="w-60 md:w-50 line-clamp-1 text-sm font-bold uppercase">{review.user?.name}</h6>
        </div>
      )}

      {/* Review text */}
      <div className="w-full mb-8 self-start flex flex-col">
        {isEditing ? (
          <div className="relative">
            <textarea
              value={editedReview}
              onChange={(e) => setEditedReview(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full bg-grey-200 border border-grey-300 rounded-xl px-4 py-3 text-sm text-grey-600 resize-none focus:outline-none focus:border-primary transition-colors"
            />
            <span className="absolute bottom-3 right-3 text-grey-400 text-xs">
              {editedReview.length}/500
            </span>
          </div>
        ) : (
          <>
            <p
              ref={textRef}
              className={`text-sm italic pr-1 text-grey-600 ${isScrollable ? 'h-22.5 overflow-y-auto' : 'h-16 overflow-hidden'}`}
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#55c57a transparent' }}
            >
              {review.review}
            </p>
            {isOverflowing && !isScrollable && (
              <span
                onClick={() => setIsScrollable(true)}
                className="text-[11px] text-primary font-bold self-end mt-1 tracking-wide animate-pulse hover:underline cursor-pointer"
              >
                more...
              </span>
            )}
          </>
        )}
      </div>

      {/* Rating */}
      <div className="mt-auto self-start">
        {isEditing ? (
          <div
            className="flex gap-1"
            onMouseLeave={() => setHoveredStar(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setEditedRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-7 h-7 transition-colors duration-150"
                  fill={star <= activeStars ? '#55c57a' : 'none'}
                  stroke={star <= activeStars ? '#55c57a' : '#ccc'}
                  strokeWidth="1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={STAR_PATH} />
                </svg>
              </button>
            ))}
          </div>
        ) : (
          <StarRating rating={review.rating} />
        )}
      </div>

      {/* Loading states */}
      {(isUpdating || isDeleting) && (
        <p className="text-xs text-primary mt-3 animate-pulse">
          {isUpdating ? 'Saving…' : 'Deleting…'}
        </p>
      )}
    </div>
  );
}
