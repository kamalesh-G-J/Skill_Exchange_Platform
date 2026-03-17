import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import MatchCard from "../components/MatchCard";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const { data } = await api.get("/api/matches");
        setMatches(data.matches || []);
      } catch (err) {
        console.error("Failed to fetch matches", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

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

  if (matches.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-8 text-center mt-12">
        <div className="bg-white p-10 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
          <svg
            className="w-16 h-16 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Matches Found
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Add more skills to your profile to find users who match your
            learning and teaching goals.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Update Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Skill Matches
        </h2>
        <p className="mt-2 text-gray-600">
          We found {matches.length} user{matches.length !== 1 ? "s" : ""} with
          compatible skills. Connect and start exchanging knowledge!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match) => (
          <MatchCard key={match._id} match={match} />
        ))}
      </div>
    </div>
  );
};

export default Matches;
