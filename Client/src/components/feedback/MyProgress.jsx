import React, { useEffect, useState } from 'react';
import {
  Loader, AlertCircle, TrendingUp,
  ChevronDown, ChevronUp, Save, CheckCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useProgress } from '../../context/ProgressContext';

// ── Colour helpers ────────────────────────────────────────────────────────────
const getBarColor = (pct) => {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 60) return 'bg-blue-500';
  if (pct >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};
const getStatusLabel = (pct) => {
  if (pct >= 80) return 'Excellent Progress';
  if (pct >= 60) return 'Good Progress';
  if (pct >= 40) return 'On Track';
  return 'Needs Attention';
};

// ── Single editable progress card ─────────────────────────────────────────────
function EditableProgressCard({ prog, onSave }) {
  const [expanded, setExpanded] = useState(false);
  const [pct, setPct]           = useState(prog.completionPercent ?? 0);
  const [notes, setNotes]       = useState(prog.notes ?? '');
  const [saving, setSaving]     = useState(false);
  const [savedOk, setSavedOk]   = useState(false);

  // Keep local state in sync when parent refreshes data
  useEffect(() => {
    setPct(prog.completionPercent ?? 0);
    setNotes(prog.notes ?? '');
  }, [prog.completionPercent, prog.notes]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(prog, pct, notes);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2500);
      setExpanded(false);
    } catch {
      // error is shown by parent
    } finally {
      setSaving(false);
    }
  };

  const tutorName = prog.tutor?.fullName ?? 'Your tutor';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-shadow hover:shadow-md">

      {/* ── Card header ── */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {prog.topic || 'General Progress'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tutor: {tutorName}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Updated {formatDistanceToNow(new Date(prog.updatedAt), { addSuffix: true })}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {savedOk && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                <CheckCircle size={13} /> Saved!
              </span>
            )}
            <button
              onClick={() => setExpanded((v) => !v)}
              title={expanded ? 'Close editor' : 'Update my progress'}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {expanded ? 'Close' : 'Update'}
            </button>
          </div>
        </div>

        {/* Read-only progress bar (always visible) */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            {getStatusLabel(prog.completionPercent ?? 0)}
          </span>
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            {prog.completionPercent ?? 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <div
            className={`${getBarColor(prog.completionPercent ?? 0)} h-full transition-all duration-500`}
            style={{ width: `${prog.completionPercent ?? 0}%` }}
          />
        </div>

        {/* Notes preview (collapsed only) */}
        {prog.notes && !expanded && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-1 italic">
            "{prog.notes}"
          </p>
        )}
      </div>

      {/* ── Inline editor (expanded) ── */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-indigo-50/40 dark:bg-indigo-900/10 px-4 py-4 space-y-4">

          {/* Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                My Completion
              </label>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{pct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={pct}
              onChange={(e) => setPct(Number(e.target.value))}
              className="w-full h-2 accent-indigo-600 cursor-pointer"
            />
            {/* Live preview bar */}
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`${getBarColor(pct)} h-full transition-all duration-200`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you work on? Any challenges?"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Email notice */}
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            📧 Your tutor will receive an email notification when you save.
          </p>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setExpanded(false)}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-60"
            >
              {saving
                ? <Loader size={13} className="animate-spin" />
                : <Save size={13} />}
              {saving ? 'Saving…' : 'Save Progress'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main MyProgress component ─────────────────────────────────────────────────
export default function MyProgress() {
  const {
    myProgress: progress,
    loading,
    error,
    setError,
    fetchMyProgress,
    upsertMyProgress,
  } = useProgress();

  const [filter, setFilter] = useState('all');
  const [toast, setToast]   = useState(null);

  useEffect(() => {
    fetchMyProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getFiltered = () => {
    switch (filter) {
      case 'high':   return progress.filter((p) => p.completionPercent >= 80);
      case 'medium': return progress.filter((p) => p.completionPercent >= 40 && p.completionPercent < 80);
      case 'low':    return progress.filter((p) => p.completionPercent < 40);
      default:       return progress;
    }
  };

  const filtered      = getFiltered();
  const avgCompletion =
    progress.length > 0
      ? Math.round(progress.reduce((sum, p) => sum + p.completionPercent, 0) / progress.length)
      : 0;

  // ── Student saves an update ──────────────────────────────────────────────
  const handleSave = async (prog, completionPercent, notes) => {
    setError(null);
    try {
      await upsertMyProgress({
        studentId:         prog.student?._id ?? prog.student,
        tutorId:           prog.tutor?._id   ?? prog.tutor,
        topic:             prog.topic,
        completionPercent,
        notes,
        sessionId:         prog.session || undefined,
      });
      setToast('Progress updated! Your tutor has been notified by email.');
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save progress');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Progress</h2>
          <p className="text-gray-600 dark:text-gray-400">Track your learning progress</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg px-4 py-2">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
            Avg: {avgCompletion}%
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800 text-sm">
          <CheckCircle size={16} />
          {toast}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      {progress.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: 'all',    label: 'All' },
            { id: 'high',   label: 'On Track (80–100%)' },
            { id: 'medium', label: 'In Progress (40–79%)' },
            { id: 'low',    label: 'Needs Attention (<40%)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Progress Items */}
      {progress.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No progress records yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your tutors will start tracking your progress
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">No progress records in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((prog) => (
            <EditableProgressCard key={prog._id} prog={prog} onSave={handleSave} />
          ))}
        </div>
      )}
    </div>
  );
}
