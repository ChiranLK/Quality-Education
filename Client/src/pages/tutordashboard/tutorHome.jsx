import React, { useState, useEffect } from 'react';
import { 
  Calendar, TrendingUp, Star, MessageSquare, Users, 
  Loader, AlertCircle, Clock, BookOpen, HelpCircle 
} from 'lucide-react';
import customFetch from '../../utils/customfetch';
import { StatCard, QuickActionCard, SessionPreviewItem } from './components/DashboardComponents';

export default function TutorHome({ user, onNavigate }) {
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    studentsCount: 0,
    averageRating: 0,
    feedbacksCount: 0,
    nextSessions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?._id) return;
      
      try {
        setLoading(true);
        setError(null);

        // Fetch data in parallel for better performance and resilience
        const [sessionsRes, ratingsRes, feedbacksRes, allStudentsRes] = await Promise.allSettled([
          customFetch.get(`/tutoring-sessions/tutor/${user._id}`),
          customFetch.get(`/feedbacks/tutor/${user._id}/ratings`),
          customFetch.get(`/feedbacks/tutor/${user._id}`),
          customFetch.get(`/tutors/students/all`)
        ]);

        // 1. Process Sessions
        let allSessions = [];
        if (sessionsRes.status === 'fulfilled') {
          allSessions = sessionsRes.value.data.sessions || [];
        } else if (sessionsRes.reason?.response?.status !== 404) {
          console.error('Sessions fetch failed:', sessionsRes.reason);
        }

        const now = new Date();
        const upcomingSessionsList = allSessions
          .filter(s => new Date(s.schedule?.date || s.scheduledDate) > now)
          .sort((a, b) => new Date(a.schedule?.date || a.scheduledDate) - new Date(b.schedule?.date || b.scheduledDate));

        // 2. Process Ratings
        let avgRating = 0;
        if (ratingsRes.status === 'fulfilled') {
          avgRating = ratingsRes.value.data.avgRating || 0; // Fix: was averageRating incorrectly mapped
        } else if (ratingsRes.reason?.response?.status !== 404) {
          console.error('Ratings fetch failed:', ratingsRes.reason);
        }

        // 3. Process Feedbacks
        let feedbacksCount = 0;
        if (feedbacksRes.status === 'fulfilled') {
          feedbacksCount = feedbacksRes.value.data.feedbacks?.length || 0;
        } else if (feedbacksRes.reason?.response?.status !== 404) {
          console.error('Feedbacks fetch failed:', feedbacksRes.reason);
        }
        
        // Process total platform students
        let platformStudents = 0;
        if (allStudentsRes.status === 'fulfilled') {
          platformStudents = allStudentsRes.value.data.count || 0;
        } else if (allStudentsRes.reason?.response?.status !== 404) {
          console.error('All Students fetch failed:', allStudentsRes.reason);
        }

        setStats({
          upcomingSessions: upcomingSessionsList.length,
          studentsCount: platformStudents, // Force global total as requested by user
          averageRating: parseFloat(avgRating),
          feedbacksCount,
          nextSessions: upcomingSessionsList.slice(0, 2),
        });

      } catch (err) {
        console.error('Unexpected dashboard error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  // Define quick actions with consistent data structure
  const quickActions = [
    {
      key: 'sessions',
      label: 'My Sessions',
      icon: Calendar,
      description: 'View and manage your tutoring sessions',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      hoverBorder: 'hover:border-indigo-500',
      hoverIconBg: 'group-hover:bg-indigo-600'
    },
    {
      key: 'progress',
      label: 'Student Progress',
      icon: TrendingUp,
      description: 'Track and update progress',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      hoverBorder: 'hover:border-blue-500',
      hoverIconBg: 'group-hover:bg-blue-600'
    },
    {
      key: 'ratings',
      label: 'Your Ratings',
      icon: Star,
      description: 'View rating statistics',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      hoverBorder: 'hover:border-amber-500',
      hoverIconBg: 'group-hover:bg-amber-600'
    },
    {
      key: 'feedbacks',
      label: 'Feedbacks',
      icon: MessageSquare,
      description: 'Read feedback from students',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      hoverBorder: 'hover:border-purple-500',
      hoverIconBg: 'group-hover:bg-purple-600'
    },
    {
      key: 'study-materials',
      label: 'Study Materials',
      icon: BookOpen,
      description: 'Upload and manage learning resources',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      hoverBorder: 'hover:border-orange-500',
      hoverIconBg: 'group-hover:bg-orange-600'
    },
    {
      key: 'help-requests',
      label: 'Help Requests',
      icon: HelpCircle,
      description: 'Browse and respond to student questions',
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      hoverBorder: 'hover:border-cyan-500',
      hoverIconBg: 'group-hover:bg-cyan-600'
    }
  ];

  const handleNavigate = (actionKey) => {
    // Map action key to the appropriate view
    const viewMap = {
      sessions: 'My Sessions',
      progress: 'Student Progress',
      ratings: 'Your Ratings',
      feedbacks: 'Feedbacks',
      'study-materials': 'study-materials',
      'help-requests': 'Help Requests'
    };
    onNavigate?.(viewMap[actionKey]);
  };

  // Session preview with appropriate styling
  const sessionPreview = stats.upcomingSessions > 0 ? (
    <div>
      <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">Next Sessions</h4>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {stats.nextSessions.map((session, idx) => (
          <SessionPreviewItem key={idx} session={session} Clock={Clock} />
        ))}
      </div>
    </div>
  ) : (
    <p className="text-xs text-gray-500 dark:text-gray-400 italic">No upcoming sessions</p>
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Statistics Grid - 4 columns */}
      <section>
        <h2 className="sr-only">Dashboard Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Calendar}
            title="Upcoming Sessions"
            value={stats.upcomingSessions}
            subtitle="Scheduled sessions"
            preview={sessionPreview}
            iconColor="text-blue-600"
          />
          <StatCard
            icon={Users}
            title="My Students"
            value={stats.studentsCount}
            subtitle="Active students"
            iconColor="text-green-600"
          />
          <StatCard
            icon={Star}
            title="Average Rating"
            value={stats.averageRating.toFixed(1)}
            subtitle="Out of 5 stars"
            iconColor="text-amber-600"
          />
          <StatCard
            icon={MessageSquare}
            title="Feedbacks Received"
            value={stats.feedbacksCount}
            subtitle="From students"
            iconColor="text-purple-600"
          />
        </div>
      </section>

      {/* Quick Actions Grid - 4 columns on desktop, responsive on mobile */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.key}
              icon={action.icon}
              title={action.label}
              description={action.description}
              onClick={() => handleNavigate(action.key)}
              iconBg={action.iconBg}
              iconColor={action.iconColor}
              hoverBorder={action.hoverBorder}
              hoverIconBg={action.hoverIconBg}
            />
          ))}
        </div>
      </section>
    </div>
  );
}