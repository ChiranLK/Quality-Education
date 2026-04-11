/**
 * useAuth.js
 *
 * Convenience re-export of the AuthContext hook.
 * Import from here instead of importing directly from the context file.
 *
 * Usage:
 *   import { useAuth } from '../hooks/useAuth';
 *   const { user, login, logout, updateUser } = useAuth();
 */
export { useAuth } from '../context/AuthContext';
