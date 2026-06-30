import { useState, useEffect, useRef } from 'react';

export default function ReviewTextCell({ review, isExpanded, toggleExpand }) {
  const [hasOverflow, setHasOverflow] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const checkOverflow = () => {
      const el = textRef.current;
      if (el) {
        setHasOverflow(el.scrollHeight > el.clientHeight);
      }
    };

    // Run measurement check
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [review, isExpanded]);

  return (
    <div className="flex flex-col items-start gap-1">
      <p
        ref={textRef}
        className={`w-70 xl:w-105 ${
          isExpanded ? 'max-h-24 overflow-y-auto pr-1' : 'line-clamp-2'
        } leading-relaxed`}
        title={review}
      >
        {review}
      </p>
      {(hasOverflow || isExpanded) && (
        <button
          onClick={toggleExpand}
          className="text-xs text-primary font-semibold hover:underline cursor-pointer focus:outline-none"
        >
          {isExpanded ? 'less' : 'more'}
        </button>
      )}
    </div>
  );
}