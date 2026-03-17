import { useState, useEffect } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const tabs = ['Incoming', 'Outgoing'];

const Requests = () => {
  const [activeTab, setActiveTab] = useState('Incoming');
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [schedulingId, setSchedulingId] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      try {
        const endpoint =
          activeTab === 'Incoming' ? '/api/requests/incoming' : '/api/requests/outgoing';
        const { data } = await api.get(endpoint);
        if (activeTab === 'Incoming') setIncoming(data);
        else setOutgoing(data);
      } catch {
        setError('Failed to load requests.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [activeTab]);

  const handleAccept = async (id) => {
    try {
      await api.patch(`/api/requests/${id}/accept`);
      setIncoming((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: 'accepted' } : r))
      );
      setSchedulingId(id);
    } catch {
      setError('Failed to accept request.');
    }
  };

  const handleDecline = async (id) => {
    try {
      await api.patch(`/api/requests/${id}/decline`);
      setIncoming((prev) => prev.filter((r) => r._id !== id));
    } catch {
      setError('Failed to decline request.');
    }
  };

  const handleSchedule = async (id, scheduledAt) => {
    try {
      await api.patch(`/api/sessions/${id}/schedule`, { scheduledAt });
      setSchedulingId(null);
      setIncoming((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: 'scheduled', scheduledAt } : r))
      );
    } catch {
      setError('Failed to schedule session.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Requests</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      ) : activeTab === 'Incoming' ? (
        <IncomingList
          requests={incoming}
          schedulingId={schedulingId}
          onAccept={handleAccept}
          onDecline={handleDecline}
          onSchedule={handleSchedule}
          onEditSchedule={setSchedulingId}
          onCancelSchedule={() => setSchedulingId(null)}
        />
      ) : (
        <OutgoingList requests={outgoing} />
      )}
    </div>
  );
};

/* ── Incoming ─────────────────────────────────────────────── */

const ScheduleInput = ({ initialDate, onSave, onCancel }) => {
  const [date, setDate] = useState(initialDate || '');
  return (
    <div className="mt-3 flex gap-2 items-center flex-wrap">
      <input
        type="datetime-local"
        value={date}
        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => setDate(e.target.value)}
      />
      <button 
        onClick={() => onSave(date)} 
        disabled={!date}
        className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        Save
      </button>
      <button 
        onClick={onCancel}
        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300"
      >
        Cancel
      </button>
    </div>
  );
};

const IncomingList = ({ requests, schedulingId, onAccept, onDecline, onSchedule, onEditSchedule, onCancelSchedule }) => {
  if (requests.length === 0) {
    return <p className="text-gray-500 text-center py-12">No incoming requests yet.</p>;
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <div key={req._id} className="bg-white rounded-lg shadow p-4 flex items-start gap-4">
          <img
            src={req.from?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.from?.name || 'U')}&background=random`}
            alt={req.from?.name}
            className="w-10 h-10 rounded-full object-cover"
          />

          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900">{req.from?.name}</p>
            <p className="text-sm text-gray-600 mt-0.5">
              <span className="font-medium">Offers:</span> {req.skillOffered}{' · '}
              <span className="font-medium">Wants:</span> {req.skillWanted}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(req.createdAt).toLocaleDateString()}
            </p>

            {/* Schedule input appears after accepting */}
            {schedulingId === req._id && (
              <ScheduleInput
                initialDate={req.scheduledAt}
                onSave={(date) => onSchedule(req._id, date)}
                onCancel={onCancelSchedule}
              />
            )}

            {/* Display scheduled date if set */}
            {req.scheduledAt && schedulingId !== req._id && (
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Scheduled for:</span>{' '}
                {new Date(req.scheduledAt).toLocaleString()}
                <button
                  onClick={() => onEditSchedule(req._id)}
                  className="ml-3 text-blue-600 hover:text-blue-800 hover:underline text-xs"
                >
                  Edit Date
                </button>
              </p>
            )}
          </div>

          {req.status === 'pending' && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onAccept(req._id)}
                className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Accept
              </button>
              <button
                onClick={() => onDecline(req._id)}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Decline
              </button>
            </div>
          )}

          {req.status !== 'pending' && <StatusBadge status={req.status} />}
        </div>
      ))}
    </div>
  );
};

/* ── Outgoing ─────────────────────────────────────────────── */

const OutgoingList = ({ requests }) => {
  if (requests.length === 0) {
    return <p className="text-gray-500 text-center py-12">You haven't sent any requests yet.</p>;
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <div key={req._id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">{req.to?.name}</p>
            <p className="text-sm text-gray-600 mt-0.5">
              <span className="font-medium">Offers:</span> {req.skillOffered}{' · '}
              <span className="font-medium">Wants:</span> {req.skillWanted}
            </p>
          </div>
          <StatusBadge status={req.status} />
        </div>
      ))}
    </div>
  );
};

export default Requests;
