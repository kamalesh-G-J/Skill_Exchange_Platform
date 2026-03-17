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

        <div className="mt-2 text-sm text-gray-600 flex-grow">
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
