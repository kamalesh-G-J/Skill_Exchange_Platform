import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Avatar from './Avatar';
import SkillPill from './SkillPill';

const MatchCard = ({ match }) => {
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  const {
    _id,
    name,
    bio,
    rating = 0,
    totalReviews = 0,
    skillsOffered = [],
    skillsWanted = [],
    score = 0
  } = match;

  const handleRequest = async () => {
    setLoading(true);
    try {
      await api.post('/api/requests', {
        receiverId: _id,
        offeredSkill: skillsOffered.length > 0 ? skillsOffered[0] : '',
        wantedSkill: skillsWanted.length > 0 ? skillsWanted[0] : ''
      });
      setRequested(true);
      toast.success('Request sent successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (value) => {
    if (value > 60) return 'bg-green-500';
    if (value >= 30) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const scoreColor = getScoreColor(score);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200">
      <div className="p-5 flex-1">
        <div className="flex items-start space-x-4">
          <Avatar name={name} size="md" />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{name}</h3>
            
            <div className="flex items-center mt-1">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
              <span className="ml-1 text-xs text-gray-500">({totalReviews} reviews)</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-600 line-clamp-2 min-h-[40px]">
          {bio || 'No bio provided.'}
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Offers</span>
            <div className="flex flex-wrap gap-1.5">
              {skillsOffered.length > 0 ? (
                skillsOffered.map((skill, i) => <SkillPill key={i} skill={skill} color="green" />)
              ) : (
                <span className="text-xs text-gray-400 italic">None listed</span>
              )}
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Wants</span>
            <div className="flex flex-wrap gap-1.5">
              {skillsWanted.length > 0 ? (
                skillsWanted.map((skill, i) => <SkillPill key={i} skill={skill} color="purple" />)
              ) : (
                <span className="text-xs text-gray-400 italic">None listed</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 border-t border-gray-100 flex flex-col gap-3">
        <div className="w-full">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-gray-700">Match Compatibility</span>
            <span className="font-bold text-gray-900">{score}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`${scoreColor} h-2 rounded-full`} style={{ width: `${Math.min(100, Math.max(0, score))}%` }}></div>
          </div>
        </div>
        
        <button
          onClick={handleRequest}
          disabled={requested || loading}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            requested
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Sending...' : requested ? 'Request Sent' : 'Send Request'}
        </button>
      </div>
    </div>
  );
};

export default MatchCard;
