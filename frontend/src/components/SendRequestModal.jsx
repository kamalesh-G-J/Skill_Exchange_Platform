import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Avatar from './Avatar';
import SkillPill from './SkillPill';

const SendRequestModal = ({ partner, onClose, onSent }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const charCount = message.length;
  const maxChars = 300;
  
  const offeredSkill = partner.skillsOffered.length > 0 ? partner.skillsOffered[0] : '';
  const wantedSkill = partner.skillsWanted.length > 0 ? partner.skillsWanted[0] : '';

  const handleSend = async () => {
    if (charCount > maxChars) {
      setError(`Message exceeds maximum length of ${maxChars} characters.`);
      return;
    }

    setSending(true);
    setError(null);

    try {
      await api.post('/api/requests', {
        receiverId: partner._id,
        offeredSkill,
        wantedSkill,
        message: message.trim()
      });
      
      toast.success('Request sent successfully!');
      onSent();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request');
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background Overlay */}
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal Panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 border-b pb-2">
                  Send Exchange Request
                </h3>
                
                {/* Partner Info Row */}
                <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md mb-4 border border-gray-100">
                  <Avatar name={partner.name} size="sm" availabilityStatus={partner.availabilityStatus || 'available'} />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold text-gray-900 truncate">{partner.name}</span>
                    <div className="flex flex-wrap items-center mt-1 gap-1 text-xs text-gray-500">
                      <span>Needs:</span>
                      <SkillPill skill={wantedSkill || 'Any'} color="purple" />
                      <span className="mx-1">•</span>
                      <span>Offers:</span>
                      <SkillPill skill={offeredSkill || 'Any'} color="green" />
                    </div>
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="mt-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Custom Message <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className={`mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border ${charCount > maxChars ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                    placeholder={`Hi! I can teach you ${offeredSkill || 'that skill'} and would love to learn ${wantedSkill || 'your skill'} from you.`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <div className={`mt-1 flex justify-between text-xs ${charCount > maxChars ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                    <span>{error && <span className="text-red-600">{error}</span>}</span>
                    <span>{charCount} / {maxChars}</span>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-row-reverse gap-2 border-t border-gray-200">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSend}
              disabled={sending || charCount > maxChars}
            >
              {sending ? 'Sending...' : 'Send Request'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
              disabled={sending}
            >
              Cancel
            </button>
          </div>
        
        </div>
      </div>
    </div>
  );
};

export default SendRequestModal;
