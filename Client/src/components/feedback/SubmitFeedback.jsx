import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import RatingStars from './RatingStars';
// ✅ Context API — replaces direct customFetch calls
import { useFeedback } from '../../context/FeedbackContext';

/**
 * SubmitFeedback
 *
 * A student submits a star rating + optional message for a tutor.
 *
 * Props:
 *   tutorId   — pre-select a specific tutor (e.g. from session card)
 *   tutorName — display name when tutorId is pre-selected
 *   sessionId — optional, links feedback to a session
 *   onSuccess — callback fired after successful submission
 *
 * When tutorId is NOT provided the component fetches all tutors from context,
 * allowing the student to pick from a list.
 */
export default function SubmitFeedback({ tutorId: initialTutorId, tutorName: initialTutorName, sessionId, onSuccess }) {
  // ✅ Context
  const { tutors, tutorsLoading, submitFeedback: ctxSubmit, fetchTutors } = useFeedback();

  // ── UI-only local state ────────────────────────────────────────────────────
  const [selectedTutorId,   setSelectedTutorId]   = useState(initialTutorId   || '');
  const [selectedTutorName, setSelectedTutorName] = useState(initialTutorName || '');
  const [rating,    setRating]    = useState(0);
  const [message,   setMessage]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [status,    setStatus]    = useState(null);   // { type: 'success'|'error', msg }
  const [submitted, setSubmitted] = useState(false);

  // Fetch tutor list only when no tutor is pre-selected
  useEffect(() => {
    if (!initialTutorId) fetchTutors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTutorId]);

  // Auto-clear success banner
  useEffect(() => {
    if (status?.type === 'success') {
      const t = setTimeout(() => setStatus(null), 3000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const handleSelectTutor = (tutor) => {
    setSelectedTutorId(tutor._id);
    setSelectedTutorName(tutor.fullName || tutor.name || tutor.email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedTutorId) {
      setStatus({ type: 'error', msg: 'Please select a tutor' });
      return;
    }
    if (rating === 0) {
      setStatus({ type: 'error', msg: 'Please select a rating (1–5 stars)' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // ✅ Delegated to FeedbackContext
      await ctxSubmit({ tutorId: selectedTutorId, rating, message, sessionId });

      setSubmitted(true);
      setStatus({ type: 'success', msg: 'Feedback submitted successfully! ✓' });

      // Reset after 1.5 s
      setTimeout(() => {
        setRating(0);
        setMessage('');
        setSelectedTutorId('');
        setSelectedTutorName('');
        setStatus(null);
        setSubmitted(false);
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to submit feedback' });
    } finally {
      setLoading(false);
    }
  };

  // ── Shared form body (rating + textarea + submit btn) ─────────────────────
  const feedbackForm = (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Rating */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <div onClick={(e) => e.stopPropagation()}>
          <RatingStars rating={rating} onRate={setRating} interactive={true} size="lg" />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Click to rate from 1 to 5 stars
        </p>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Your Feedback (Optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          placeholder="Share your experience with this tutor..."
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{message.length} / 2000 characters</p>
      </div>

      {/* Status */}
      {status && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          status.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }`}>
          {status.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm">{status.msg}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || rating === 0 || submitted}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
      >
        {loading   ? <><Loader className="w-5 h-5 animate-spin" /> Submitting...</>
        : submitted ? <><CheckCircle className="w-5 h-5" /> Submitted</>
        :             <><Send className="w-5 h-5" /> Submit Feedback</>}
      </button>
    </form>
  );

  // ── Pre-selected tutor mode (from session card) ───────────────────────────
  if (initialTutorId) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Rate Tutor: <span className="text-blue-600 dark:text-blue-400">{initialTutorName}</span>
        </h2>
        {feedbackForm}
      </div>
    );
  }

  // ── Tutor selector mode ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Tutor list — shown only when no tutor selected yet */}
      {!selectedTutorId && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Select a Tutor</h3>

          {tutorsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
          ) : tutors.length === 0 ? (
            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mb-2" />
              <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                No tutors available at the moment. Please try again later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tutors.map(tutor => (
                <button
                  key={tutor._id}
                  onClick={() => handleSelectTutor(tutor)}
                  className="p-4 border-2 rounded-lg transition-colors text-left border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {tutor.fullName || tutor.name || tutor.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{tutor.email}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feedback form — shown when tutor is selected */}
      {selectedTutorId && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Rate Tutor: <span className="text-blue-600 dark:text-blue-400">{selectedTutorName}</span>
            </h2>
            <button
              type="button"
              onClick={() => { setSelectedTutorId(''); setSelectedTutorName(''); setRating(0); setMessage(''); setStatus(null); }}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-semibold"
            >
              ← Change Tutor
            </button>
          </div>
          {feedbackForm}
        </div>
      )}
    </div>
  );
}
