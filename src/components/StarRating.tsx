import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const starSize = sizeMap[size];

  const handleClick = (rating: number) => {
    if (readonly || !onChange) return;
    onChange(rating);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={readonly}
          className={`${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } transition-transform`}
        >
          <Star
            size={starSize}
            className={`${
              star <= value
                ? "text-warning-500 fill-warning-500"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
