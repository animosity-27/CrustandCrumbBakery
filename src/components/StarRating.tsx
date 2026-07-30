import { Star } from 'lucide-react';

type StarRatingProps = {
  value: number;
  size?: number;
  className?: string;
};

export function StarRating({ value, size = 16, className = '' }: StarRatingProps) {
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={n <= Math.round(value) ? 'fill-mustard-500 text-mustard-500' : 'fill-kraft-300 text-kraft-300'}
        />
      ))}
    </div>
  );
}
