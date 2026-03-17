import { useState } from 'react';

const StarRating = ({ value = 0, onChange, max = 5 }) => {
  const [hovered, setHovered] = useState(0);

  const display = hovered || value;

  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHovered(0)}>
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1;
        const filled = star <= display;

        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              className={`w-7 h-7 transition-colors ${
                filled
                  ? 'fill-amber-400 stroke-amber-400'
                  : 'fill-none stroke-gray-300'
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
