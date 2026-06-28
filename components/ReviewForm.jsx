'use client';

import { useState } from 'react';
import { useAddReviewMutation } from '@/features/reviewSlice';

export default function ReviewForm({ tourId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState('');
  const [error, setError] = useState(null);

  const [addReview, { isLoading: loading }] = useAddReviewMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return setError('Please select a rating.');
    if (!review.trim()) return setError('Please write a review.');

    setError(null);

    const result = await addReview({ tourId, review: { rating, review } });

    if (result.error) {
      return setError(result.error.data?.message || 'Failed to submit review.');
    }

    setRating(0);
    setReview('');
    onSuccess?.();
  };

  const activeRating = hovered || rating;

  return (
    <div className="max-w-lg mx-auto">
      {/* Title */}
      <h2 className="text-white uppercase font-bold text-2xl tracking-wide text-center mb-2">
        Share your experience
      </h2>
      <p className="text-white/60 text-center text-sm mb-10">
        Your review helps other travellers choose the right adventure.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex gap-2"
            onMouseLeave={() => setHovered(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                className="transition-transform hover:scale-110 focus:outline-none"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-10 h-10 transition-colors duration-150"
                  fill={star <= activeRating ? '#fff' : 'none'}
                  stroke={star <= activeRating ? '#fff' : 'rgba(255,255,255,0.4)'}
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              </button>
            ))}
          </div>
          <span className="text-white/70 text-sm h-5">
            {activeRating === 1 && 'Poor'}
            {activeRating === 2 && 'Fair'}
            {activeRating === 3 && 'Good'}
            {activeRating === 4 && 'Very good'}
            {activeRating === 5 && 'Excellent'}
          </span>
        </div>

        {/* Textarea */}
        <div className="flex flex-col items-center gap-5">
          <div className='w-full flex flex-col items-center'>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              maxLength={500}
              rows={5}
              placeholder="Tell us about your experience on this tour…"
              className="w-[90%] bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-gray-500 placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-white/60 transition-colors"
            />
            <span className="w-[90%] mr-[5%] mt-1 flex justify-end text-gray-500 text-xs">
              {review.length} / 500
            </span>
          </div>
        {/* Error */}
        {error && (
          <div className='flex justify-center bg-red-300 text-white p-2 rounded-2xl w-[90%]'>
            <p className="text-sm text-center">{error}</p>
          </div>
        )}
        </div>

        {/* Submit */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading || rating === 0 || !review.trim()}
            className="bg-white text-primary uppercase font-bold text-sm tracking-widest rounded-full px-12 py-4 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? 'Submitting…' : 'Submit review'}
          </button>
        </div>
      </form>
    </div>
  );
}
