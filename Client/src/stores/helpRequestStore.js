/**
 * helpRequestStore.js — COMPATIBILITY SHIM
 *
 * This file previously used Zustand for state management.
 * It has been replaced by HelpRequestContext (Context API).
 *
 * This shim re-exports from the Context so any old imports
 * from this file continue to work during the migration.
 *
 * ⚠️  New code should import directly from:
 *      '../context/HelpRequestContext'
 */
export { useHelpRequest as useHelpRequestStore } from '../context/HelpRequestContext';

// Named export alias for the tutor variant (same context, different logical slice)
export { useHelpRequest as useTutorHelpRequestsStore } from '../context/HelpRequestContext';
