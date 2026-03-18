import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Avatar from './Avatar';
import SkillPill from './SkillPill';
import { useAuth } from '../context/AuthContext';
import SendRequestModal from './SendRequestModal';

const MatchCard = ({ match }) => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Initialize dynamic endorsements state
  const [endorsementsData, setEndorsementsData] = useState(match?.endorsements || []);

  const {
    _id,
    name,
    bio,
    rating = 0,
    totalReviews = 0,
    skillsOffered = [],
    skillsWanted = [],
    score = 0,
    matchPercent = 0,
    availabilityStatus = 'available',
    skillCategories = []
  } = match;

  const getBadgeColors = (percent) => {
    if (percent >= 70) return { bg: '#E1F5EE', text: '#085041', stroke: '#085041' };
    if (percent >= 40) return { bg: '#FAEEDA', text: '#633806', stroke: '#633806' };
    return { bg: '#FCEBEB', text: '#A32D2D', stroke: '#A32D2D' };
  };

  const badgeColors = getBadgeColors(matchPercent);
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (matchPercent / 100) * circumference;

  const handleEndorseToggle = async (skill) => {
    try {
      // Optimistic update
      let newlyEndorsed = false;
      const newEndorsementsData = [...endorsementsData];
      let endorsementRecord = newEndorsementsData.find(e => e.skill === skill);
      
      if (!endorsementRecord) {
        endorsementRecord = { skill, endorsedBy: [] };
        newEndorsementsData.push(endorsementRecord);
      }

      const hasEndorsed = endorsementRecord.endorsedBy.some(e => e.userId === currentUser._id);

      if (hasEndorsed) {
        // Un-endorse
        endorsementRecord.endorsedBy = endorsementRecord.endorsedBy.filter(e => e.userId !== currentUser._id);
      } else {
        // Endorse
        newlyEndorsed = true;
        endorsementRecord.endorsedBy.push({ userId: currentUser._id, endorsedAt: new Date() });
      }

      setEndorsementsData(newEndorsementsData);

      // API Call
      if (newlyEndorsed) {
        await api.post('/api/endorsements', { targetUserId: _id, skill });
      } else {
        await api.delete('/api/endorsements', { data: { targetUserId: _id, skill } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update endorsement');
      // Revert is complex without specific previous state, but we could refetch or just ignore on failure since it's an optimistic update.
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSent = () => {
    setRequested(true);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white relative rounded-lg shadow-md border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200">
      
      {/* Match Percentage Badge */}
      <div className="absolute top-3 right-3 flex items-center justify-center pointer-events-none" style={{ width: '60px', height: '60px' }}>
        {/* SVG Ring */}
        <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
          <circle
            cx="30"
            cy="30"
            r="26"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-gray-100"
          />
          <circle
            cx="30"
            cy="30"
            r="26"
            stroke={badgeColors.stroke}
            strokeWidth="3"
            fill={badgeColors.bg}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Badge Content */}
        <div className="relative flex flex-col items-center justify-center z-10" style={{ color: badgeColors.text }}>
          <span className="text-sm font-bold leading-none">{matchPercent}%</span>
          <span className="text-[10px] font-medium uppercase tracking-wider mt-0.5">Match</span>
        </div>
      </div>

      <div className="p-5 flex-1 mt-2">
        <div className="flex items-start space-x-4 pr-16">
          <Avatar name={name} size="md" availabilityStatus={availabilityStatus} />
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
            <div className="flex flex-wrap gap-2 text-sm">
              {skillsOffered.length > 0 ? (
                skillsOffered.map((skill, i) => {
                  const endorsementRecord = endorsementsData.find(e => e.skill === skill);
                  const count = endorsementRecord?.endorsedBy?.length || 0;
                  const hasEndorsed = endorsementRecord?.endorsedBy?.some(e => e.userId === currentUser?._id) || false;

                  return (
                    <div key={i} className="inline-flex items-center border border-gray-200 bg-gray-50 rounded-full pr-1 pl-3 py-1 shadow-sm transition-all hover:bg-gray-100">
                      <span className="text-gray-800 font-medium mr-2">{skill}</span>
                      
                      {/* Endorsement count text visible if > 0 */}
                      {count > 0 && (
                        <span className="text-gray-500 text-xs font-bold mr-1">{count}</span>
                      )}

                      <button
                        onClick={() => handleEndorseToggle(skill)}
                        className={`p-1 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
                          hasEndorsed ? 'text-blue-600 bg-blue-100 hover:bg-blue-200' : 'text-gray-400 hover:text-blue-500 hover:bg-gray-200'
                        }`}
                        title={hasEndorsed ? "Remove Endorsement" : "Endorse Skill"}
                      >
                         {/* Thumb Up Icon (Filled if endorsed, Outline if not) */}
                         <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill={hasEndorsed ? "currentColor" : "none"} stroke="currentColor" strokeWidth={hasEndorsed ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                         </svg>
                      </button>
                    </div>
                  );
                })
              ) : (
                <span className="text-xs text-gray-400 italic">None listed</span>
              )}
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Wants</span>
            <div className="flex flex-wrap gap-1.5">
              {skillsWanted.length > 0 ? (
                skillsWanted.map((skill, i) => (
                  <SkillPill 
                    key={i} 
                    skill={skill} 
                    category={skillCategories.length > 0 ? skillCategories[0] : null}
                    color="purple" 
                  />
                ))
              ) : (
                <span className="text-xs text-gray-400 italic">None listed</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 border-t border-gray-100 flex flex-col gap-3">
        <button
          onClick={handleOpenModal}
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

      {isModalOpen && (
        <SendRequestModal 
          partner={match} 
          onClose={handleCloseModal} 
          onSent={handleSent} 
        />
      )}
    </div>
  );
};

export default MatchCard;
