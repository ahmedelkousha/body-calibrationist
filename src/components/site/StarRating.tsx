export default function StarRating({ rating = 5, className }: { rating?: number; className?: string }) {
  return (
    <div className={className ?? "flex items-center gap-1"} aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          viewBox="0 0 20 20"
          className={index < rating ? "h-3.5 w-3.5 fill-gold" : "h-3.5 w-3.5 fill-sand"}
          aria-hidden
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}
