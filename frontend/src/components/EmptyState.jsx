const EmptyState = ({ icon, title, subtitle, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <span className="text-5xl mb-4">{icon}</span>}
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-gray-500 max-w-xs">{subtitle}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
