import React, { useEffect } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import RatingStats from './RatingStats';
// ✅ Context API — replaces direct customFetch call
import { useFeedback } from '../../context/FeedbackContext';

/**
 * TutorRatings
 *
 * Displays a tutor's aggregated rating statistics.
 * The tutorId prop is passed by the parent dashboard.
 * Data is sourced from FeedbackContext.
 */
export default function TutorRatings({ tutorId }) {
  const { tutorRatingStats: stats, loading, error, fetchTutorRatingStats } = useFeedback();

  useEffect(() => {
    if (tutorId) fetchTutorRatingStats(tutorId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
        <AlertCircle size={18} />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Rating</h2>
        <p className="text-gray-600 dark:text-gray-400">Overall performance and student feedback</p>
      </div>
      {stats && <RatingStats stats={stats} />}
    </div>
  );
}
