import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import customFetch from "../utils/customfetch";
import { Lock, Eye, EyeOff, BookOpen, CheckCircle, AlertCircle } from "lucide-react";
import DarkModeToggle from "../components/DarkModeToggle";

export default function ResetPasswordPage({ token, onBack, onNavigateToLogin }) {
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validate token exists
  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new reset link.");
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-400"];
  const strength = getStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await customFetch.post(`/auth/reset-password/${token}`, {
        password: formData.password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.msg || "Reset failed. The link may have expired.");
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
            Create a new<br />secure password.
          </h1>
          <p className="text-indigo-100/80 text-base leading-relaxed max-w-xs">
            Choose a strong password that you haven't used before to keep your account safe.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {["At least 6 characters long", "Mix letters, numbers & symbols", "Don't reuse old passwords"].map((text) => (
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
            {success ? (
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
                  Password Reset!
                </h2>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-8">
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onNavigateToLogin}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl text-sm"
                >
                  Go to Sign in
                </motion.button>
              </motion.div>
            ) : (
              /* ── Form state ── */
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  Set new password
                </h2>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-8">
                  Your new password must be at least 6 characters long.
                </p>

                {/* Invalid token error */}
                {!token && (
                  <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-700 dark:text-red-400 text-sm font-medium">Invalid reset link</p>
                      <p className="text-red-500 text-xs mt-0.5">Please request a new password reset link.</p>
                      <button
                        onClick={onBack}
                        className="text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:underline mt-1"
                      >
                        Request new link →
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="rp-password">
                      New password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="rp-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                        disabled={!token}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password strength bar */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                i <= strength ? strengthColor[strength] : "bg-slate-200 dark:bg-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Password strength: <span className="font-medium">{strengthLabel[strength]}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="rp-confirm">
                      Confirm new password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="rp-confirm"
                        name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all
                          ${formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? "border-red-400 bg-red-50 dark:bg-red-900/10 dark:border-red-700 text-red-700 dark:text-red-300 placeholder-red-300"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                          }`}
                        required
                        disabled={!token}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  {/* Error message */}
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
                    disabled={loading || !token}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Resetting password…
                      </>
                    ) : (
                      "Reset password"
                    )}
                  </motion.button>

                  <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={onNavigateToLogin}
                      className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
