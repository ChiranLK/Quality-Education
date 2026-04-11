/**
 * useSessions.js
 *
 * Public API-compatible hook for tutoring sessions.
 * Now delegates to SessionContext instead of the old broken sessionService.
 *
 * Usage (tutor):
 *   const { mySessions, loading, createSession, updateSession, deleteSession } = useSessions(user._id);
 *
 * Usage (student browse):
 *   const { sessions, pagination, fetchSessions, joinSession } = useSessions();
 */
import { useEffect } from 'react';
import { useSession } from '../context/SessionContext';

/**
 * @param {string} [tutorId]  When provided, auto-fetches the tutor's sessions on mount.
 */
export const useSessions = (tutorId) => {
  const ctx = useSession();

  // Auto-fetch tutor's sessions when tutorId is provided
  useEffect(() => {
    if (tutorId) {
      ctx.fetchMySessions(tutorId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorId]);

  return {
    // For tutor views
    sessions:         tutorId ? ctx.mySessions : ctx.sessions,
    mySessions:       ctx.mySessions,
    enrolledSessions: ctx.enrolledSessions,
    loading:          ctx.loading,
    error:            ctx.error,
    pagination:       ctx.pagination,

    // Actions
    fetchSessions:         ctx.fetchSessions,
    fetchMySessions:       ctx.fetchMySessions,
    fetchEnrolledSessions: ctx.fetchEnrolledSessions,
    createSession:         ctx.createSession,
    updateSession:         ctx.updateSession,
    deleteSession:         ctx.deleteSession,
    joinSession:           ctx.joinSession,
    leaveSession:          ctx.leaveSession,
  };
};