import React from 'react';

/**
 * StatCard Component
 * Displays a stat metric with icon, title, and value
 * Supports optional preview content
 */
export function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  preview = null,
  iconColor = 'text-gray-600'
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold">{title}</h3>
          <Icon className={`w-5 h-5 ${iconColor} dark:opacity-80`} />
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
      </div>

      {preview && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700/30">
          {preview}
        </div>
      )}
    </div>
  );
}

/**
 * QuickActionCard Component
 * Clickable card for dashboard navigation
 * Displays icon with hover color transition
 */
export function QuickActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  iconBg = 'bg-indigo-50',
  iconColor = 'text-indigo-600',
  hoverBorder = 'hover:border-indigo-500',
  hoverIconBg = 'group-hover:bg-indigo-600'
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 cursor-pointer ${hoverBorder} hover:shadow-lg transition-all group shadow-sm`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 ${iconBg} dark:bg-opacity-20 rounded-lg ${hoverIconBg} group-hover:text-white transition-colors ${iconColor} dark:${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <svg className="w-4 h-4 text-gray-300 group-hover:text-inherit transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-left">{description}</p>
    </div>
  );
}

/**
 * SessionPreviewItem Component
 * Displays a single session in the preview list
 */
export function SessionPreviewItem({ session, Clock }) {
  const sessionDate = new Date(session.schedule?.date || session.scheduledDate);
  const dateStr = sessionDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const sessionTitle = (session.title && String(session.title).trim()) ||
    session.subject ||
    'Tutoring Session';

  return (
    <div className="flex items-start gap-2 p-2 rounded bg-white dark:bg-gray-800">
      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{sessionTitle}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{dateStr}</p>
      </div>
    </div>
  );
}
