/**
 * HelpRequestContext.jsx
 *
 * Replaces the Zustand-based helpRequestStore.js with Context API.
 * State shape is identical so all existing consumers work unchanged
 * after updating their imports.
 *
 * Usage:
 *   const { form, updateFormField, submitHelpRequest, ... } = useHelpRequest();
 */
import { createContext, useContext, useState, useCallback } from 'react';
import customFetch from '../utils/customfetch';

const HelpRequestContext = createContext(null);

// ── Initial form state ────────────────────────────────────────────────────────
const INITIAL_FORM = {
  title:    '',
  message:  '',
  category: '',
  language: '',
};

// ── Provider ──────────────────────────────────────────────────────────────────
export function HelpRequestProvider({ children }) {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm]                     = useState(INITIAL_FORM);
  const [errors, setErrors]                 = useState({});
  const [loading, setLoading]               = useState(false);
  const [submitted, setSubmitted]           = useState(false);

  // ── Editing / modal state ───────────────────────────────────────────────────
  const [editingMessage, setEditingMessage] = useState(null);
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  // ── UI preferences ──────────────────────────────────────────────────────────
  const [formUILanguage, setFormUILanguage] = useState('English');

  // ── Refresh trigger (incremented to tell consumers to re-fetch) ─────────────
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ── Form helpers ─────────────────────────────────────────────────────────────
  const updateFormField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear the field's error when the user starts typing
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setErrors({});
    setSubmitted(false);
  }, []);

  const clearErrors       = useCallback(() => setErrors({}), []);
  const clearEditingMessage = useCallback(() => setEditingMessage(null), []);
  const triggerRefresh    = useCallback(() => setRefreshTrigger((n) => n + 1), []);

  // ── Validate form ─────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!form.title.trim())    newErrors.title    = 'Title is required';
    if (!form.message.trim())  newErrors.message  = 'Message is required';
    if (!form.category.trim()) newErrors.category = 'Category is required';
    if (!form.language.trim()) newErrors.language = 'Language is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit (create new message) ───────────────────────────────────────────────
  /**
   * Posts a new help-request message to POST /api/messages.
   * @returns {boolean} true on success
   */
  const submitHelpRequest = useCallback(async () => {
    if (!validate()) return false;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title',    form.title.trim());
      fd.append('message',  form.message.trim());
      fd.append('category', form.category.trim());
      fd.append('language', form.language.trim());

      await customFetch.post('/messages', fd);
      setSubmitted(true);
      resetForm();
      triggerRefresh();
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit. Please try again.';
      setErrors((prev) => ({ ...prev, _global: msg }));
      return false;
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  // ── Update an existing message ────────────────────────────────────────────────
  /**
   * @param {string} id      Message _id
   * @param {object} updates { title, message, category, language }
   */
  const updateHelpRequest = useCallback(async (id, updates) => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(updates).forEach(([k, v]) => fd.append(k, v));
      await customFetch.patch(`/messages/${id}`, fd);
      clearEditingMessage();
      triggerRefresh();
      return true;
    } catch (err) {
      setErrors({ _global: err.response?.data?.message || 'Update failed.' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [clearEditingMessage, triggerRefresh]);

  // ── Delete a message ──────────────────────────────────────────────────────────
  /**
   * @param {string} id  Message _id
   */
  const deleteHelpRequest = useCallback(async (id) => {
    setLoading(true);
    try {
      await customFetch.delete(`/messages/${id}`);
      triggerRefresh();
      return true;
    } catch (err) {
      setErrors({ _global: err.response?.data?.message || 'Delete failed.' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [triggerRefresh]);

  // ── Context value ─────────────────────────────────────────────────────────────
  const value = {
    // Form
    form,
    setForm,
    updateFormField,
    resetForm,
    // Errors
    errors,
    setErrors,
    clearErrors,
    // Loading / submission
    loading,
    setLoading,
    submitted,
    setSubmitted,
    // Editing
    editingMessage,
    setEditingMessage,
    clearEditingMessage,
    // Modal
    showMessagesModal,
    setShowMessagesModal,
    // Language
    formUILanguage,
    setFormUILanguage,
    // Refresh
    refreshTrigger,
    triggerRefresh,
    // Actions
    submitHelpRequest,
    updateHelpRequest,
    deleteHelpRequest,
  };

  return (
    <HelpRequestContext.Provider value={value}>
      {children}
    </HelpRequestContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
/**
 * useHelpRequest — access HelpRequestContext.
 * Must be called inside <HelpRequestProvider>.
 */
export function useHelpRequest() {
  const ctx = useContext(HelpRequestContext);
  if (!ctx) throw new Error('useHelpRequest must be used within a HelpRequestProvider');
  return ctx;
}

export default HelpRequestContext;
