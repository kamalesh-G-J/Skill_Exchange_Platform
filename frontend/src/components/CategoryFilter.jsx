const CategoryFilter = ({ selectedCategory, onSelectCategory }) => {
  const categories = [
    "All",
    "Tech",
    "Music",
    "Language",
    "Design",
    "Fitness",
    "Finance",
    "Arts",
    "Cooking",
    "Science",
    "Business"
  ];

  return (
    <div className="w-full overflow-x-auto pb-4 mb-2 scrollbar-hide">
      <div className="flex space-x-2 min-w-max px-1">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                isSelected
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
