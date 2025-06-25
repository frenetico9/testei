
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  color?: string;
  className?: string;
  readOnly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 20,
  color = "text-yellow-400", // Tailwind color class
  className = "",
  readOnly = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (index: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(index);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  return (
    <div className={`flex items-center ${className} ${readOnly ? '' : 'cursor-pointer'}`}>
      {[1, 2, 3, 4, 5].map((index) => {
        const fillClass = (hoverRating || rating) >= index ? color : "text-gray-500";
        return (
          <Star
            key={index}
            size={size}
            className={`${fillClass} transition-colors`}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            fill={(hoverRating || rating) >= index ? 'currentColor' : 'none'}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
    