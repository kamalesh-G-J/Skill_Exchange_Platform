const SkillPill = ({ skill, category, color = 'gray' }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const selectedClass = colorClasses[color] || colorClasses.gray;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${selectedClass}`}>
      {skill} {category && <span className="opacity-60 ml-1 font-normal">· {category}</span>}
    </span>
  );
};

export default SkillPill;
