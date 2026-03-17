import { useState } from 'react';

const SkillTagInput = ({ label, tags = [], onChange, type = 'offered' }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && tags.length < 10 && !tags.includes(val)) {
        onChange([...tags, val]);
        setInputValue('');
      } else if (val && tags.includes(val)) {
        setInputValue(''); // Reset if duplicate
      }
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const isOffered = type === 'offered';
  const tagColorClass = isOffered
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-purple-100 text-purple-800 border-purple-200';
  
  const tagRemoveBtnClass = isOffered
    ? 'text-green-600 hover:text-green-900 focus:bg-green-200 focus:text-green-900'
    : 'text-purple-600 hover:text-purple-900 focus:bg-purple-200 focus:text-purple-900';

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between mb-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-500">{tags.length} / 10 max</span>
      </div>
      
      <div className="p-2 border border-gray-300 rounded-md bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-shadow">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={`inline-flex items-center px-2 py-1 rounded-md text-sm border ${tagColorClass}`}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className={`ml-1 flex-shrink-0 w-4 h-4 rounded-full inline-flex items-center justify-center focus:outline-none ${tagRemoveBtnClass}`}
              >
                <span className="sr-only">Remove {tag} tag</span>
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          ))}
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={tags.length >= 10}
            className="flex-1 outline-none min-w-[120px] bg-transparent text-sm placeholder-gray-400 py-1"
            placeholder={tags.length >= 10 ? "Max skills reached" : "Type a skill and press Enter..."}
          />
        </div>
      </div>
    </div>
  );
};

export default SkillTagInput;
