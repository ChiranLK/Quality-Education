/**
 * FeedbackContext.jsx
 *
 * Centralises ALL feedback & rating state and API calls.
 *
 * Covers:
 *  - Students  : submit feedback, view their own feedbacks
 *  - Tutors    : view feedbacks received, view own rating stats
 *  - Admins    : view / create / edit / delete all feedbacks
 *
 * Usage:
 *   const { myFeedbacks, submitFeedback, tutorRatingStats, ... } = useFeedback();
 */

import { createContext, useContext, useState, useCallback } from 'react';
import customFetch from '../utils/customfetch';

const FeedbackContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function FeedbackProvider({ children }) {

  // ── State ────────────────────────────────────────────────────────────────────
  /** Feedbacks the logged-in student has submitted */
  const [myFeedbacks, setMyFeedbacks]           = useState([]);
  /** Feedbacks a specific tutor has received (tutor self-view) */
  const [tutorFeedbacks, setTutorFeedbacks]     = useState([]);
  /** Rating statistics for a tutor { average, count, distribution } */
  const [tutorRatingStats, setTutorRatingStats] = useState(null);
  /** All feedbacks — admin view */
  const [allFeedbacks, setAllFeedbacks]         = useState([]);
  /** List of tutors for the "select tutor" dropdown in feedback form */
  const [tutors, setTutors]                     = useState([]);

  const [loading, setLoading]         = useState(false);
  const [tutorsLoading, setTutorsLoading] = useState(false);
  const [error, setError]             = useState(null);

  // ── Helper ────────────────────────────────────────────────────────────────────
  const handleError = (err, fallback) =>
    setError(err?.response?.data?.message || err?.message || fallback);

  // ────────────────────────────────────────────────────────────────────────────
  // STUDENT: fetch own feedbacks
  // ────────────────────────────────────────────────────────────────────────────
  /**
   * Fetch feedbacks submitted by the currently authenticated student.
   */
  const fetchMyFeedbacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await customFetch.get('/feedbacks/me');
      setMyFeedbacks(data.feedbacks || data.data || []);
    } catch (err) {
      handleError(err, 'Failed to load your feedbacks.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // STUDENT: submit new feedback / rating
  // ────────────────────────────────────────────────────────────────────────────
  /**
   * Submit a feedback for a tutor.
   * @param {{ tutorId, rating, message, sessionId? }} payload
   * @returns the created feedback object
   */
  const submitFeedback = useCallback(async (payload) => {
    const { data } = await customFetch.post('/feedbacks', {
      tutorId:   payload.tutorId,
      rating:    payload.rating,
      message:   payload.message?.trim() || '',
      ...(payload.sessionId && { sessionId: payload.sessionId }),
    });
    const created = data.feedback || data.data;
    // Optimistically prepend to student's own list
    if (created) setMyFeedbacks((prev) => [created, ...prev]);
    return created;
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // TUTOR: fetch feedbacks received  +  rating stats
  // ────────────────────────────────────────────────────────────────────────────
  /**
   * Fetch feedbacks received for a specific tutor.
   * @param {string} tutorId
   */
  const fetchTutorFeedbacks = useCallback(async (tutorId) => {
    if (!tutorId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await customFetch.get(`/feedbacks/tutor/${tutorId}`);
      setTutorFeedbacks(data.feedbacks || data.data || []);
    } catch (err) {
      handleError(err, 'Failed to load tutor feedbacks.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a feedback (tutor can delete their own received feedback; admin can delete anything).
   * @param {string} feedbackId
   */
  const deleteTutorFeedback = useCallback(async (feedbackId) => {
    await customFetch.delete(`/feedbacks/${feedbackId}`);
    setTutorFeedbacks((prev) => prev.filter((f) => f._id !== feedbackId));
    setAllFeedbacks((prev)   => prev.filter((f) => f._id !== feedbackId));
    setMyFeedbacks((prev)    => prev.filter((f) => f._id !== feedbackId));
  }, []);

  /**
   * Fetch rating statistics for a tutor (avg, count, distribution).
   * Used in TutorRatings component and tutor dashboards.
   * @param {string} tutorId
   */
  const fetchTutorRatingStats = useCallback(async (tutorId) => {
    if (!tutorId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await customFetch.get(`/feedbacks/tutor/${tutorId}/ratings`);
      setTutorRatingStats(data);
    } catch (err) {
      handleError(err, 'Failed to load rating statistics.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // ADMIN: full feedback management
  // ────────────────────────────────────────────────────────────────────────────
  /**
   * Fetch all feedbacks (admin only).
   */
  const fetchAllFeedbacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await customFetch.get('/feedbacks');
      setAllFeedbacks(data.feedbacks || data.data || []);
    } catch (err) {
      handleError(err, 'Failed to load all feedbacks.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Admin: update (edit) a feedback.
   * @param {string} id
   * @param {{ rating, message }} payload
   */
  const updateFeedbackAdmin = useCallback(async (id, payload) => {
    const { data } = await customFetch.put(`/feedbacks/admin/${id}`, payload);
    const updated = data.feedback || data.data;
    if (updated) {
      setAllFeedbacks((prev) =>
        prev.map((f) => (f._id === id ? { ...f, ...updated } : f))
      );
    }
    return updated;
  }, []);

  /**
   * Admin: create a feedback on behalf of a user.
   * @param {{ userId, tutorId, rating, message }} payload
   */
  const createFeedbackAdmin = useCallback(async (payload) => {
    const { data } = await customFetch.post('/feedbacks/admin/create', payload);
    const created = data.feedback || data.data;
    if (created) setAllFeedbacks((prev) => [created, ...prev]);
    return created;
  }, []);

  /**
   * Delete a feedback (admin).
   * @param {string} feedbackId
   */
  const deleteFeedback = useCallback(async (feedbackId) => {
    await customFetch.delete(`/feedbacks/${feedbackId}`);
    setAllFeedbacks((prev)    => prev.filter((f) => f._id !== feedbackId));
    setTutorFeedbacks((prev)  => prev.filter((f) => f._id !== feedbackId));
    setMyFeedbacks((prev)     => prev.filter((f) => f._id !== feedbackId));
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // SHARED: fetch tutor list for dropdown
  // ────────────────────────────────────────────────────────────────────────────
  /**
   * Fetch the list of registered tutors for the feedback submission form.
   */
  const fetchTutors = useCallback(async () => {
    setTutorsLoading(true);
    try {
      const { data } = await customFetch.get('/tutors');
      setTutors(
        Array.isArray(data.tutors) ? data.tutors :
        Array.isArray(data)        ? data         : []
      );
    } catch {
      setTutors([]);
    } finally {
      setTutorsLoading(false);
    }
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────────
  const value = {
    // State
    myFeedbacks,
    tutorFeedbacks,
    tutorRatingStats,
    allFeedbacks,
    tutors,
    loading,
    tutorsLoading,
    error,
    setError,
    // Student actions
    fetchMyFeedbacks,
    submitFeedback,
    // Tutor actions
    fetchTutorFeedbacks,
    fetchTutorRatingStats,
    deleteTutorFeedback,
    // Admin actions
    fetchAllFeedbacks,
    updateFeedbackAdmin,
    createFeedbackAdmin,
    deleteFeedback,
    // Shared
    fetchTutors,
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
/**
 * useFeedback — access FeedbackContext.
 * Must be called inside <FeedbackProvider>.
 */
export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback must be used within a FeedbackProvider');
  return ctx;
}

export default FeedbackContext;
