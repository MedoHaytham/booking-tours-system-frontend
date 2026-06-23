import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, size = 20 }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={rating >= star ? 'fill-primary text-primary' : 'fill-grey-400 text-grey-400'}
        />
      ))}
    </div>
  );
}
