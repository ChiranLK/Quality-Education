import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import customFetch from "../utils/customfetch";
import { Mail, BookOpen, ArrowLeft, CheckCircle, Send } from "lucide-react";
import DarkModeToggle from "../components/DarkModeToggle";

export default function ForgotPasswordPage({ onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await customFetch.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.msg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg min-h-screen flex relative transition-colors duration-500">
      {/* Dark mode toggle */}
      <div className="absolute top-4 right-4 z-20">
        <DarkModeToggle />
      </div>

      {/* Left decorative panel */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="brand-panel hidden lg:flex flex-col justify-between w-[45%] px-14 py-16 text-white"
      >
        <div className="relative z-10">
          <div
            className="flex items-center gap-3 mb-16 cursor-pointer group"
            onClick={onBack}
          >
            <div className="bg-white/20 p-2.5 rounded-xl group-hover:bg-white/30 transition-colors">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-wide">TutorConnect</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight mb-6">
            Reset your<br />password securely.
          </h1>
          <p className="text-indigo-100/80 text-base leading-relaxed max-w-xs">
            Enter your email and we'll send you a secure link to reset your password in seconds.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {["Secure token-based reset", "Link expires in 15 minutes", "Confirmation email on success"].map((text) => (
            <div key={text} className="flex items-center gap-3 bg-white/15 backdrop-blur-sm px-4 py-3 rounded-xl text-sm">
              <div className="w-2 h-2 bg-green-300 rounded-full flex-shrink-0" />
              {text}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="glass-card w-full max-w-md px-8 py-10 dark:ring-2 dark:ring-indigo-600/50"
        >
          {/* Mobile logo */}
          <div
            className="flex items-center gap-2 mb-10 lg:hidden cursor-pointer group"
            onClick={onBack}
          >
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800 dark:text-white">TutorConnect</span>
          </div>

          <AnimatePresence mode="wait">
            {sent ? (
              /* ── Success state ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="flex justify-center mb-6">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full">
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Check your inbox!
                </h2>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-2">
                  If <strong>{email}</strong> is registered, a password reset link has been sent.
                </p>
                <p className="text-gray-400 dark:text-slate-500 text-xs mb-8">
                  The link expires in <strong>15 minutes</strong>. Check your spam folder if you don't see it.
                </p>
                <button
                  onClick={onBack}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign in
                </button>
              </motion.div>
            ) : (
              /* ── Form state ── */
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button
                  onClick={onBack}
                  className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign in
                </button>

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  Forgot password?
                </h2>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-8">
                  No worries — enter your email and we'll send you a reset link.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="fp-email">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="fp-email"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        placeholder="Enter your email address"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg py-2.5 px-3"
                    >
                      {error}
                    </motion.p>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Sending reset link…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send reset link
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
