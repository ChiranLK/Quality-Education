/**
 * ProgressContext.jsx
 *
 * Centralises all student-progress state and API calls.
 * - Students:  view their own progress (`myProgress`)
 * - Tutors:    manage progress records for their students (`tutorProgress`)
 * - Admins:    view all progress records (`allProgress`)
 *
 * Usage:
 *   const { myProgress, tutorProgress, loading, fetchMyProgress, upsertProgress } = useProgress();
 */
import { createContext, useContext, useState, useCallback } from 'react';
import customFetch from '../utils/customfetch';

const ProgressContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function ProgressProvider({ children }) {
  // ── State ─────────────────────────────────────────────────────────────────
  /** Student's own progress records */
  const [myProgress, setMyProgress]       = useState([]);
  /** Tutor's records for their students */
  const [tutorProgress, setTutorProgress] = useState([]);
  /** Admin: all records */
  const [allProgress, setAllProgress]     = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // ── Fetch: student's own progress ────────────────────────────────────────
  const fetchMyProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await customFetch.get('/progress/me');
      setMyProgress(data.progress || data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your progress.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch: tutor's student progress ──────────────────────────────────────
  /**
   * @param {string} tutorId  The logged-in tutor's _id
   */
  const fetchProgressByTutor = useCallback(async (tutorId) => {
    if (!tutorId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await customFetch.get(`/progress/tutor/${tutorId}`);
      setTutorProgress(data.progress || data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load progress records.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch: all progress (admin) ───────────────────────────────────────────
  const fetchAllProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await customFetch.get('/progress/admin/all');
      setAllProgress(data.progress || data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load all progress.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Create or update a progress record ───────────────────────────────────
  /**
   * The backend uses an upsert POST /api/progress.
   * @param {object} progressData  { studentId, tutorId, topic, completionPercent, notes, _id? }
   * @returns {object} The saved progress record
   */
  const upsertProgress = useCallback(async (progressData) => {
    const { data } = await customFetch.post('/progress', progressData);
    const saved = data.progress || data.data;

    // Update tutorProgress list
    setTutorProgress((prev) => {
      const exists = prev.find((p) => p._id === saved._id);
      if (exists) return prev.map((p) => (p._id === saved._id ? saved : p));
      return [saved, ...prev];
    });

    return saved;
  }, []);

  // ── Delete a progress record ──────────────────────────────────────────────
  /**
   * @param {string} id  Progress record _id
   */
  const deleteProgress = useCallback(async (id) => {
    await customFetch.delete(`/progress/${id}`);
    setTutorProgress((prev) => prev.filter((p) => p._id !== id));
    setAllProgress((prev)   => prev.filter((p) => p._id !== id));
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────
  const value = {
    myProgress,
    tutorProgress,
    allProgress,
    loading,
    error,
    setError,
    fetchMyProgress,
    fetchProgressByTutor,
    fetchAllProgress,
    upsertProgress,
    deleteProgress,
    // Expose setters so components may optimistically update
    setTutorProgress,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
/**
 * useProgress — access ProgressContext.
 * Must be used inside <ProgressProvider>.
 */
export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider');
  return ctx;
}

export default ProgressContext;
