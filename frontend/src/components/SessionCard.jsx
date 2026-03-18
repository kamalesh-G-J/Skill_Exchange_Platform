import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import StatusBadge from './StatusBadge';
import ReviewModal from './ReviewModal';

const SessionCard = ({ session, onComplete, onReviewSubmitted }) => {
  const [loading, setLoading] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Safely extract data, depending on if user is the requestor or receiver
  // We'll simplify and assume the API sends back 'partner'
  const partnerName = session.partner?.name || 'Unknown User';
  const roleText = session.role === 'offerer' ? `Teaching: ${session.skillExchanged}` : `Learning: ${session.skillExchanged}`;

  const handleComplete = async () => {
    setLoading(true);
    try {
      await api.patch(`/api/sessions/${session._id}/complete`);
      onComplete(session._id, 'completed');
      toast.success('Session marked as completed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete session');
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async ({ rating, comment }) => {
    setLoading(true);
    try {
      await api.post('/api/reviews', {
        sessionId: session._id,
        revieweeId: session.partner._id,
        rating,
        comment
      });
      setReviewModalOpen(false);
      onReviewSubmitted(session._id);
      toast.success('Review submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleGoogleMeet = async () => {
    try {
      setLoading(true);
      // Calls your new backend route
      const response = await api.get(`/api/calendar/auth-url?sessionId=${session._id}`);
      // Redirects the user to the Google Consent Screen
      window.location.href = response.data.url;
    } catch (err) {
      toast.error('Failed to initiate Google Calendar link');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow border border-gray-100 p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{partnerName}</h3>
            <p className="text-sm font-medium text-blue-600 mt-1">{roleText}</p>
          </div>
          <StatusBadge status={session.status} />
        </div>

        <div className="mt-2 text-sm text-gray-600 flex-grow space-y-2">
          {/* Calendar Icon + Date */}
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {session.scheduledAt 
                ? new Date(session.scheduledAt).toLocaleString() 
                : 'TBD'}
            </span>
          </div>

          {/* Google Meet Link Display Area */}
          {session.status === 'scheduled' && (
            <div className="flex items-center mt-3 pt-2">
              {session.meetLink ? (
                <a
                  href={session.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 w-full justify-center transition"
                >
                  <svg className="-ml-0.5 mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                  </svg>
                  Join Google Meet
                </a>
              ) : (
                <button
                  onClick={handleScheduleGoogleMeet}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full justify-center transition disabled:opacity-50"
                >
                  <svg className="mr-2 h-4 w-4 text-blue-500" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M43.8213 19.8212H42V18H24V25.2H35.4525C34.5075 28.5288 31.4325 31.0062 27.6 31.0062C23.0112 31.0062 19.2887 27.2838 19.2887 22.695C19.2887 18.1062 23.0112 14.3838 27.6 14.3838C29.5687 14.3838 31.3687 15.07 32.7863 16.2175L37.9425 11.0612C35.2537 8.54125 31.6237 7 27.6 7C18.9413 7 11.9175 14.0238 11.9175 22.6825C11.9175 31.3412 18.9413 38.365 27.6 38.365C35.8425 38.365 42.6675 31.9725 43.8213 23.8325V19.8212Z" fill="#FFC107"/>
                    <path d="M43.8213 19.8212H42V18H24V25.2H35.4525C34.9082 27.1197 33.7258 28.7831 32.0838 29.9829L39.8163 35.9867C39.8163 35.9867 44.5912 30.65 43.8213 19.8212Z" fill="#FF3D00"/>
                    <path d="M27.6 38.365C31.5457 38.365 36.1432 36.8837 39.8163 35.9867L32.0838 29.9829C30.8252 30.8354 29.2891 31.3283 27.6 31.3283C23.0112 31.3283 19.2887 27.6058 19.2887 23.0171H11.9175C11.9175 31.6758 18.9413 38.365 27.6 38.365Z" fill="#4CAF50"/>
                    <path d="M27.6 7.00001C31.6429 7.00001 35.2678 8.5262 37.9425 11.0613L32.7863 16.2175C31.3713 15.068 29.5687 14.3838 27.6 14.3838C23.0112 14.3838 19.2887 18.1063 19.2887 22.695H11.9175C11.9175 14.0363 18.9413 7.00001 27.6 7.00001Z" fill="#1976D2"/>
                  </svg>
                  {loading ? 'Connecting...' : 'Generate Meet Link'}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
          {session.status === 'scheduled' && (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="py-1.5 px-3 bg-blue-50 text-blue-600 font-medium text-sm rounded-md hover:bg-blue-100 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Mark Complete'}
            </button>
          )}

          {session.status === 'completed' && !session.reviewed && (
            <button
              onClick={() => setReviewModalOpen(true)}
              className="py-1.5 px-3 bg-green-50 text-green-700 font-medium text-sm rounded-md hover:bg-green-100"
            >
              Leave Review
            </button>
          )}

          {session.reviewed && (
            <span className="text-sm text-gray-500 italic px-2 py-1.5">
              Reviewed
            </span>
          )}
        </div>
      </div>

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={submitReview}
        isSubmitting={loading}
      />
    </>
  );
};

export default SessionCard;
