import { useState } from "react";
import {
  BookOpen, Users, ShieldCheck, LogOut, User, BarChart2,
  Bell, Search, TrendingUp, Calendar, MessageSquare,
  CheckCircle, AlertCircle, Clock, Settings, ChevronRight,
  Activity, FileText, Star, Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DarkModeToggle from "../../components/DarkModeToggle";

/* ─── animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: "easeOut" },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: (i = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.4, delay: i * 0.07, ease: "easeOut" },
  }),
};

/* ─── static mock data ─── */
const STATS = [
  { label: "Total Users",    value: "1,284", delta: "+12%", icon: Users,     color: "rose" },
  { label: "Active Tutors",  value: "86",    delta: "+5%",  icon: BookOpen,  color: "orange" },
  { label: "Sessions Today", value: "34",    delta: "+8%",  icon: Calendar,  color: "yellow" },
  { label: "Avg. Rating",    value: "4.8",   delta: "+0.2", icon: Star,      color: "green" },
];

const ACTIVITY = [
  { id: 1, type: "user",    text: "New user registered: Kamal Perera",         time: "2 min ago",  status: "success" },
  { id: 2, type: "report",  text: "Tutor flagged for review: S. Fernando",      time: "15 min ago", status: "warning" },
  { id: 3, type: "session", text: "Session #204 completed successfully",        time: "32 min ago", status: "success" },
  { id: 4, type: "message", text: "New support message from a student",         time: "1 hr ago",   status: "info" },
  { id: 5, type: "report",  text: "Monthly report generated and ready to view", time: "2 hr ago",   status: "success" },
];

const QUICK_ACTIONS = [
  { label: "Add New Tutor",      icon: BookOpen,  color: "rose" },
  { label: "Generate Report",    icon: FileText,  color: "orange" },
  { label: "View Analytics",     icon: Activity,  color: "yellow" },
  { label: "Platform Settings",  icon: Settings,  color: "violet" },
];

const COLOR_MAP = {
  rose:   { bg: "bg-rose-50   dark:bg-rose-900/40",   icon: "text-rose-600   dark:text-rose-400",   badge: "bg-rose-100   dark:bg-rose-900   text-rose-700   dark:text-rose-300"   },
  orange: { bg: "bg-orange-50 dark:bg-orange-900/40", icon: "text-orange-600 dark:text-orange-400", badge: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300" },
  yellow: { bg: "bg-yellow-50 dark:bg-yellow-900/40", icon: "text-yellow-600 dark:text-yellow-400", badge: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300" },
  green:  { bg: "bg-green-50  dark:bg-green-900/40",  icon: "text-green-600  dark:text-green-400",  badge: "bg-green-100  dark:bg-green-900  text-green-700  dark:text-green-300"  },
  violet: { bg: "bg-violet-50 dark:bg-violet-900/40", icon: "text-violet-600 dark:text-violet-400", badge: "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300" },
};

const STATUS_ICON = {
  success: <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />,
  warning: <AlertCircle  className="w-4 h-4 text-yellow-500 shrink-0" />,
  info:    <Clock        className="w-4 h-4 text-blue-400 shrink-0" />,
};

/* ─── component ─── */
export default function AdminDashboard({ user, onLogout }) {
  const [search, setSearch]           = useState("");
  const [notifOpen, setNotifOpen]     = useState(false);
  const [activeTab, setActiveTab]     = useState("overview");

  const tabs = ["overview", "users", "tutors", "reports"];

  return (
    <motion.div
      variants={fadeIn} initial="hidden" animate="show"
      className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      {/* ── Navbar ── */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="bg-rose-600 p-2 rounded-lg"
          >
            <ShieldCheck className="w-5 h-5 text-white" />
          </motion.div>
          <span className="text-lg font-bold text-gray-800 dark:text-gray-100">TutorConnect</span>
          <span className="ml-2 text-xs bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 font-semibold px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>

        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 w-64">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users, tutors…"
            className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-4">
          <DarkModeToggle />

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={() => setNotifOpen((p) => !p)}
              className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </motion.button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-30"
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Notifications</span>
                    <span className="text-xs text-rose-600 dark:text-rose-400 font-medium cursor-pointer">Mark all read</span>
                  </div>
                  {ACTIVITY.slice(0, 4).map((a) => (
                    <div key={a.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                      {STATUS_ICON[a.status]}
                      <div>
                        <p className="text-xs text-gray-700 dark:text-gray-300">{a.text}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center">
              <User className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
              {user?.name ?? "Admin"}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* Welcome */}
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Welcome back, {user?.name ?? "Admin"} 🛡️
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Here's what's happening on your platform today.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show"
          className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${
                activeTab === tab
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {activeTab === tab && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </motion.div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s, i) => {
            const c = COLOR_MAP[s.color];
            return (
              <motion.div
                key={s.label}
                variants={scaleIn} custom={i} initial="hidden" animate="show"
                whileHover={{ y: -4, boxShadow: "0 12px 28px rgba(0,0,0,0.08)" }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 cursor-default"
              >
                <div className={`${c.bg} w-9 h-9 rounded-xl flex items-center justify-center mb-3`}>
                  <s.icon className={`w-4 h-4 ${c.icon}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3" /> {s.delta}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Management cards + Activity feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Management cards */}
          <div className="lg:col-span-2 space-y-4">
            <motion.h2 variants={fadeUp} custom={5} initial="hidden" animate="show"
              className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
            >
              Management
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Manage Users",   sub: "View, edit and remove users.",          icon: Users,    color: "rose",   stat: "1,284 users"   },
                { label: "Manage Tutors",  sub: "Verify and oversee tutor accounts.",     icon: BookOpen, color: "orange", stat: "86 active"     },
                { label: "Reports",        sub: "View platform analytics and stats.",     icon: BarChart2,color: "yellow", stat: "View all →"    },
              ].map((card, i) => {
                const c = COLOR_MAP[card.color];
                return (
                  <motion.div
                    key={card.label}
                    variants={fadeUp} custom={i + 6} initial="hidden" animate="show"
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer group"
                  >
                    <div className={`${c.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <card.icon className={`w-5 h-5 ${c.icon}`} />
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{card.label}</h3>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mb-3">{card.sub}</p>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.badge}`}>{card.stat}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <motion.div variants={fadeUp} custom={9} initial="hidden" animate="show"
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" /> Quick Actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {QUICK_ACTIONS.map((qa, i) => {
                  const c = COLOR_MAP[qa.color];
                  return (
                    <motion.button
                      key={qa.label}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      custom={i}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl ${c.bg} transition-colors cursor-pointer`}
                    >
                      <qa.icon className={`w-5 h-5 ${c.icon}`} />
                      <span className={`text-[11px] font-semibold ${c.icon} text-center leading-tight`}>{qa.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div variants={fadeUp} custom={10} initial="hidden" animate="show"
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Bell className="w-4 h-4 text-rose-500" /> Recent Activity
              </h3>
              <button className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <ul className="space-y-3 flex-1">
              {ACTIVITY.map((a, i) => (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.07, duration: 0.35 }}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  {STATUS_ICON[a.status]}
                  <div className="min-w-0">
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug">{a.text}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Footer row */}
        <motion.div variants={fadeUp} custom={11} initial="hidden" animate="show"
          className="flex flex-col sm:flex-row gap-4"
        >
          {/* Platform Status */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-rose-500" /> Platform Status
            </h3>
            <div className="space-y-3">
              {[
                { label: "API Server",      ok: true  },
                { label: "Database",        ok: true  },
                { label: "Email Service",   ok: true  },
                { label: "Storage",         ok: false },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{s.label}</span>
                  <span className={`flex items-center gap-1 text-xs font-semibold ${s.ok ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                    <span className={`w-2 h-2 rounded-full ${s.ok ? "bg-green-500" : "bg-yellow-500"}`} />
                    {s.ok ? "Operational" : "Degraded"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-rose-500" /> Pending Messages
            </h3>
            <div className="space-y-2">
              {[
                { from: "Student: Nuwan S.",  msg: "Issue with session booking",  time: "5m" },
                { from: "Tutor: D. Perera",   msg: "Request to update profile",   time: "20m" },
                { from: "Student: A. Silva",  msg: "Payment not reflecting",       time: "1h" },
              ].map((m, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{m.from}</p>
                    <p className="text-[11px] text-gray-400 truncate max-w-[180px]">{m.msg}</p>
                  </div>
                  <span className="text-[11px] text-gray-400 shrink-0">{m.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

      </main>
    </motion.div>
  );
}
