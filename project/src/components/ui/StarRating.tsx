import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarDisplayProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StarDisplay({ rating, size = 'sm' }: StarDisplayProps) {
  const sizeClass = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4.5 w-4.5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${star <= rating ? 'fill-warning-400 text-warning-400' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
    </div>
  );
}

interface StarInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: 'md' | 'lg';
}

export function StarInput({ value, onChange, size = 'lg' }: StarInputProps) {
  const [hover, setHover] = useState(0);
  const sizeClass = size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
          aria-label={`Rate ${star} stars`}
        >
          <Star
            className={`${sizeClass} ${(hover || value) >= star ? 'fill-warning-400 text-warning-400' : 'fill-gray-200 text-gray-200'}`}
          />
        </button>
      ))}
    </div>
  );
}

export default StarDisplay;
