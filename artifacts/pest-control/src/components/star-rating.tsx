import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
}

const SIZE_CLASSES = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export default function StarRating({ value, onChange, size = "md", readOnly = false }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1" role={readOnly ? undefined : "radiogroup"} aria-label="Rating">
      {stars.map((star) => {
        const filled = star <= Math.round(value);
        const Star = (
          <svg
            viewBox="0 0 20 20"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            className={cn(SIZE_CLASSES[size], filled ? "text-warning" : "text-muted-foreground/40")}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1 1 5.8L10 14.9l-5.21 2.62 1-5.8-4.21-4.1 5.82-.85L10 1.5z"
            />
          </svg>
        );
        if (readOnly || !onChange) {
          return (
            <span key={star} data-testid={`star-${star}`}>
              {Star}
            </span>
          );
        }
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
            data-testid={`button-star-${star}`}
            aria-label={`${star} star`}
          >
            {Star}
          </button>
        );
      })}
    </div>
  );
}
