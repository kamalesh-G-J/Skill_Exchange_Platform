import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import api from "../api/axios";
import SessionCard from "../components/SessionCard";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Sessions = () => {
  const { user: currentUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // 'list' | 'calendar'

  // Modal logic for calendar clicks
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await api.get("/api/sessions/mine");
        const userId = currentUser?._id;
        const transformed = (data.sessions || []).map((s) => {
          const isHost = s.hostId?._id === userId;
          return {
            ...s,
            partner: isHost ? s.guestId : s.hostId,
            role: isHost ? "offerer" : "learner",
            skillExchanged: s.exchangeId?.offeredSkill || "",
            reviewed: isHost ? s.reviewedByHost : s.reviewedByGuest,
          };
        });
        setSessions(transformed);

        // Check if we just returned from Google OAuth success
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('meetCreated') === 'true') {
          toast.success('Google Meet link successfully generated!');
          // Remove the query parameter without reloading the page
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        toast.error("Failed to load sessions.");
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [currentUser]);

  const handleComplete = (sessionId) => {
    setSessions((prev) =>
      prev.map((s) =>
        s._id === sessionId ? { ...s, status: "completed" } : s,
      ),
    );
  };

  const handleReviewSubmitted = (sessionId) => {
    setSessions((prev) =>
      prev.map((s) => (s._id === sessionId ? { ...s, reviewed: true } : s)),
    );
  };

  const events = sessions
    .filter((s) => s.scheduledAt)
    .map((s) => ({
      id: s._id,
      title: `Session with ${s.partner?.name || "Unknown"}`,
      date: new Date(s.scheduledAt).toISOString().split("T")[0],
      extendedProps: { ...s },
    }));

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <svg
          className="animate-spin h-8 w-8 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b pb-4 border-gray-100 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            My Sessions
          </h2>
          <p className="mt-1 text-gray-600">
            Track and manage your upcoming skill exchanges.
          </p>
        </div>

        <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              view === "list"
                ? "bg-white shadow text-blue-600"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              view === "calendar"
                ? "bg-white shadow text-blue-600"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No sessions scheduled yet.</p>
        </div>
      ) : view === "list" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <SessionCard
              key={session._id}
              session={session}
              onComplete={handleComplete}
              onReviewSubmitted={handleReviewSubmitted}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative">
          <style>{`
            .fc-event { cursor: pointer; border: none; background: #ebf5ff; color: #1e40af; padding: 2px 4px; border-radius: 4px; font-size: 0.8rem; }
            .fc-daygrid-day-number { color: #374151; font-weight: 500; }
            .fc-col-header-cell-cushion { color: #111827; font-weight: 600; }
          `}</style>

          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            eventClick={handleEventClick}
            height="auto"
            headerToolbar={{
              left: "title",
              center: "",
              right: "prev,next today",
            }}
          />

          {/* Event Popover */}
          {selectedEvent && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-black bg-opacity-30"
              onClick={() => setSelectedEvent(null)}
            >
              <div
                className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setSelectedEvent(null)}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <h3 className="text-lg font-bold mb-1">Session</h3>
                <p className="font-medium text-gray-900 mb-2">
                  Partner: {selectedEvent.partner?.name}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Skill Exchanged:</strong>{" "}
                  {selectedEvent.skillExchanged}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Status:</strong> {selectedEvent.status}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong>{" "}
                  {new Date(selectedEvent.scheduledAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sessions;
