/**
 * AuthContext.jsx
 * 
 * Provides global authentication state for the entire app.
 * Replaces manual prop-drilling of `user`, `onLogout`, `onUpdateUser`.
 *
 * Usage:
 *   const { user, login, logout, updateUser, loading } = useAuth();
 */
import { createContext, useContext, useState, useCallback } from 'react';

// ── Create the context ─────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Helpers: read/write storage ───────────────────────────────────────────────
/** Read the stored user object from sessionStorage or localStorage */
function readStoredUser() {
  // Check URL params first (Google OAuth callback)
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  const urlUser  = params.get('user');

  if (urlToken && urlUser) {
    try {
      const user = JSON.parse(urlUser);
      sessionStorage.setItem('token', urlToken);
      sessionStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', urlToken);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch {
      // ignore parse errors
    }
  }

  // sessionStorage first (tab-specific)
  const sessionUser = sessionStorage.getItem('user');
  if (sessionUser) return JSON.parse(sessionUser);

  // then localStorage (remember-me)
  const localUser  = localStorage.getItem('user');
  if (localUser) {
    const user  = JSON.parse(localUser);
    const token = localStorage.getItem('token');
    if (token) sessionStorage.setItem('token', token);
    return user;
  }

  return null;
}

/** Determine which view the app should start on */
function getInitialView(user) {
  const path = window.location.pathname;
  if (path.includes('auth-success')) return 'auth-success';
  if (path.includes('auth-error'))   return 'auth-error';
  if (user)                          return 'dashboard';
  return 'splash';
}

// ── Provider ──────────────────────────────────────────────────────────────────
/**
 * AuthProvider
 * Wrap this around <App /> (or the subtree that needs auth state).
 */
export function AuthProvider({ children }) {
  const initialUser = readStoredUser();

  const [user, setUser]               = useState(initialUser);
  const [currentView, setCurrentView] = useState(() => getInitialView(initialUser));

  /**
   * login — called after a successful API login/register response.
   * @param {{ user: object, token?: string }} data
   */
  const login = useCallback((data) => {
    setUser(data.user);
    setCurrentView('dashboard');
  }, []);

  /**
   * logout — clears all stored auth data and returns to home.
   */
  const logout = useCallback(() => {
    setUser(null);
    setCurrentView('home');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  /**
   * updateUser — merge partial updates into the current user object.
   * Also keeps storage in sync so page refreshes still work.
   * @param {object} updatedFields
   */
  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      // Keep storage in sync
      if (sessionStorage.getItem('user')) {
        sessionStorage.setItem('user', JSON.stringify(merged));
      }
      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(merged));
      }
      return merged;
    });
  }, []);

  const value = {
    user,
    currentView,
    setCurrentView,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
/**
 * useAuth — access the AuthContext from any functional component.
 * Must be used inside <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;
