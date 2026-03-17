const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
};

const Spinner = ({ size = 'md' }) => {
  return (
    <div className="flex justify-center">
      <div
        className={`${sizes[size]} rounded-full border-gray-300 border-t-blue-600 animate-spin`}
      />
    </div>
  );
};

export default Spinner;
