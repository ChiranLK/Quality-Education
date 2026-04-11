/**
 * StudyMaterialContext.jsx
 *
 * Centralises ALL study-material state and API calls.
 * - Tutors/Admin: use `myMaterials` (their own uploads) + CRUD actions
 * - Students:     use `materials`  (public, grade-filtered browsing)
 *
 * Usage:
 *   const { materials, loading, fetchMaterials, uploadMaterial, ... } = useStudyMaterial();
 */
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import customFetch from '../utils/customfetch';

const StudyMaterialContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function StudyMaterialProvider({ children }) {
  // ── State ────────────────────────────────────────────────────────────────────
  /** Public / student-facing material list */
  const [materials, setMaterials] = useState([]);
  /** Tutor/admin owned-material list */
  const [myMaterials, setMyMaterials] = useState([]);
  /** Shared loading flag for any ongoing request */
  const [loading, setLoading] = useState(false);
  /** Error message, null when all is well */
  const [error, setError] = useState(null);
  /** Pagination for the public list */
  const [pagination, setPagination] = useState({ current: 1, total: 1, count: 0 });
  /** Pagination for the my-materials list */
  const [myPagination, setMyPagination] = useState({ current: 1, total: 1, count: 0 });

  // ── Private helpers ───────────────────────────────────────────────────────────
  /** Build URLSearchParams from a plain filter object, skipping empty strings */
  const buildParams = (filters = {}) => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== '' && v !== undefined && v !== null) p.set(k, v);
    });
    return p;
  };

  // ── Public: fetch all materials ───────────────────────────────────────────────
  /**
   * Fetch the public (student-facing) material list.
   * @param {object} filters  page, limit, keyword, subject, grade, sort, status
   */
  const fetchMaterials = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      // If role is 'admin' use /materials; tutors use /materials/my; students use /materials
      const { role, ...rest } = filters;
      const endpoint =
        role === 'admin' ? '/materials' :
        role === 'tutor' ? '/materials/my' :
        '/materials';
      const params = buildParams({ limit: 9, status: 'active', ...rest });
      const { data } = await customFetch.get(`${endpoint}?${params}`);
      setMaterials(data.data || []);
      setPagination({
        current: data.pagination?.current || 1,
        total:   data.pagination?.pages   || 1,
        count:   data.pagination?.total   || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load materials.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── My materials (tutor / admin) ──────────────────────────────────────────────
  /**
   * Fetch materials uploaded by the currently logged-in user.
   * Admins pass `isAdmin=true` to use the full /materials endpoint.
   * @param {object} filters
   * @param {boolean} isAdmin  true → fetch all materials (admin view)
   */
  const fetchMyMaterials = useCallback(async (filters = {}, isAdmin = false) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = isAdmin ? '/materials' : '/materials/my';
      const params   = buildParams({ limit: 9, ...filters });
      const { data } = await customFetch.get(`${endpoint}?${params}`);
      setMyMaterials(data.data || []);
      setMyPagination({
        current: data.pagination?.current || 1,
        total:   data.pagination?.pages   || 1,
        count:   data.pagination?.total   || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your materials.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Upload ────────────────────────────────────────────────────────────────────
  /**
   * Upload a new study material.
   * @param {FormData} formData  Must include the `file` field.
   * @returns {object} created material
   */
  const uploadMaterial = useCallback(async (formData) => {
    const { data } = await customFetch.post('/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  }, []);

  // ── Update ────────────────────────────────────────────────────────────────────
  /**
   * Update an existing material (file replacement is optional).
   * @param {string}   id
   * @param {FormData} formData
   */
  const updateMaterial = useCallback(async (id, formData) => {
    const { data } = await customFetch.patch(`/materials/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────────────
  /**
   * Delete a material by ID (uploader or admin only).
   * @param {string} id
   */
  const deleteMaterial = useCallback(async (id) => {
    await customFetch.delete(`/materials/${id}`);
    // Remove from both lists immediately
    setMaterials((prev)   => prev.filter((m) => m._id !== id));
    setMyMaterials((prev) => prev.filter((m) => m._id !== id));
  }, []);

  // ── Toggle Like ───────────────────────────────────────────────────────────────
  /**
   * Toggle like/unlike on a material and update metrics in local state.
   * @param {string} id
   */
  const toggleLike = useCallback(async (id) => {
    const { data } = await customFetch.post(`/materials/${id}/like`);
    const newLikes = data.data?.likes ?? data.likes;
    // Update whichever list contains this material
    const updater = (prev) =>
      prev.map((m) =>
        m._id === id ? { ...m, metrics: { ...m.metrics, likes: newLikes } } : m
      );
    setMaterials(updater);
    setMyMaterials(updater);
    return newLikes;
  }, []);

  // ── Record Download ───────────────────────────────────────────────────────────
  /**
   * Increment the download counter for a material.
   * @param {string} id
   */
  const recordDownload = useCallback(async (id) => {
    try {
      await customFetch.post(`/materials/${id}/download`);
      // Optimistically update download count in local state
      const updater = (prev) =>
        prev.map((m) =>
          m._id === id
            ? { ...m, metrics: { ...m.metrics, downloads: (m.metrics?.downloads || 0) + 1 } }
            : m
        );
      setMaterials(updater);
      setMyMaterials(updater);
    } catch {
      // Non-critical — silently ignore
    }
  }, []);

  // ── Toggle Status (publish / unpublish) ───────────────────────────────────────
  /**
   * Quick-toggle a material's status between 'active' and 'archived'.
   * @param {string} id             material ID
   * @param {string} currentStatus  'active' | 'archived'
   */
  const toggleStatus = useCallback(async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active';
    const fd = new FormData();
    fd.append('status', newStatus);
    const { data } = await customFetch.patch(`/materials/${id}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const updater = (prev) =>
      prev.map((m) => (m._id === id ? { ...m, status: newStatus } : m));
    setMaterials(updater);
    setMyMaterials(updater);
    return data.data;
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────────
  const value = {
    // State
    materials,
    myMaterials,
    loading,
    error,
    pagination,
    myPagination,
    // Actions
    fetchMaterials,
    fetchMyMaterials,
    uploadMaterial,
    updateMaterial,
    deleteMaterial,
    toggleLike,
    recordDownload,
    toggleStatus,
    // Helpers (for components that need to clear error)
    setError,
  };

  return (
    <StudyMaterialContext.Provider value={value}>
      {children}
    </StudyMaterialContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
/**
 * useStudyMaterial — access the StudyMaterialContext.
 * Must be called inside <StudyMaterialProvider>.
 */
export function useStudyMaterial() {
  const ctx = useContext(StudyMaterialContext);
  if (!ctx) {
    throw new Error('useStudyMaterial must be used within a StudyMaterialProvider');
  }
  return ctx;
}

export default StudyMaterialContext;
