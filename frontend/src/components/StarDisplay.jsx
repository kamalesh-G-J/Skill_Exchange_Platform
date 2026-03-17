const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
};

const StarIcon = ({ fill, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    className={className}
  >
    <defs>
      <linearGradient id={`half-${fill}`}>
        <stop offset="50%" stopColor="#fbbf24" />
        <stop offset="50%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke={fill === 'empty' ? '#d1d5db' : '#fbbf24'}
      fill={
        fill === 'full'
          ? '#fbbf24'
          : fill === 'half'
            ? `url(#half-${fill})`
            : 'none'
      }
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
    />
  </svg>
);

const StarDisplay = ({ rating = 0, size = 'md' }) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const diff = rating - i;
    if (diff >= 1) return 'full';
    if (diff >= 0.5) return 'half';
    return 'empty';
  });

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((fill, i) => (
        <StarIcon key={i} fill={fill} className={sizeClasses[size]} />
      ))}
      <span className={`ml-1 font-medium text-gray-700 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

export default StarDisplay;
