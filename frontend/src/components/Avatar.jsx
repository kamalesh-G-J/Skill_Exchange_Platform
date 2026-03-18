const Avatar = ({ name = '', size = 'md', availabilityStatus }) => {
  const getInitials = (str) => {
    if (!str) return '?';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getBgColor = (str) => {
    if (!str) return 'bg-gray-400';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500',
      'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl'
  };

  const dimensions = sizeClasses[size] || sizeClasses.md;
  const initials = getInitials(name);
  const bgColor = getBgColor(name);

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'bg-[#1D9E75]';
      case 'busy': return 'bg-[#BA7517]';
      case 'on_leave': return 'bg-[#888780]';
      default: return null;
    }
  };

  const statusColor = getStatusColor(availabilityStatus);

  return (
    <div className="relative inline-block">
      <div
        className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold ${bgColor} ${dimensions}`}
      >
        {initials}
      </div>
      {statusColor && (
        <span 
          className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full ring-2 ring-white ${statusColor}`} 
        />
      )}
    </div>
  );
};

export default Avatar;
