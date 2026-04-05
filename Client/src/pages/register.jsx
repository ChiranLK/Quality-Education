import { useState } from "react";
import { motion } from "framer-motion";
import customFetch from "../utils/customfetch";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, BookOpen, ArrowRight, GraduationCap, Users } from "lucide-react";
import DarkModeToggle from "../components/DarkModeToggle";

export default function RegisterPage({ onLogin, onBack, onNavigateToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    location: "",
    role: "user",
    subjects: ""
  });

  const validateForm = () => {
    const { fullName, email, phoneNumber, location, password, confirmPassword, role, subjects } = formData;

    if (!fullName.trim() || !email.trim() || !phoneNumber.trim() || !location.trim() || !password || !confirmPassword) {
      return "All fields are required.";
    }
    if (!/^[a-zA-Z\s]+$/.test(fullName)) return "Full Name can only contain letters.";
    if (fullName.trim().length < 3) return "Full Name must be at least 3 characters long.";
    if (!email.includes("@")) return "Please enter a valid email address with '@'.";
    if (!/^[0-9]+$/.test(phoneNumber)) return "Phone number can only contain numbers.";
    if (phoneNumber.length !== 10) return "Phone number must be exactly 10 digits.";
    if (password.length < 6) return "Password must be at least 6 characters long.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (role === "tutor" && !subjects.trim()) return "Subjects are required for tutor registration.";
    return null;
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(""); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Front-end validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Prepare data for backend
      const { confirmPassword, ...submitData } = formData;
      if (formData.role === "tutor") {
        submitData.subjects = formData.subjects.split(",").map(s => s.trim()).filter(s => s !== "");
      } else {
        delete submitData.subjects;
      }

      await customFetch.post("/auth/register", submitData);
      
      setSuccess("Account Created Successfully! Signing you in...");
      
      // Briefly show success before login/redirect
      setTimeout(async () => {
        try {
          const { data: loginData } = await customFetch.post("/auth/login", {
            email: formData.email,
            password: formData.password
          });

          sessionStorage.setItem("token", loginData.token);
          sessionStorage.setItem("user", JSON.stringify(loginData.user));
          
          if (onLogin) onLogin(loginData);
        } catch (loginErr) {
          setError("Account created, but login failed. Please sign in manually.");
          setLoading(false);
        }
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.msg || "Registration failed. Please check your details.");
      setLoading(false);
    }
  };


  return (
    <div className="auth-bg min-h-screen flex relative transition-colors duration-500">
      {/* Dark mode toggle — top-right corner */}
      <div className="absolute top-4 right-4 z-20">
        <DarkModeToggle />
      </div>

      {/* Left decorative panel (Hidden on small screens) */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="brand-panel hidden lg:flex flex-col justify-between w-[40%] px-14 py-16 text-white"
      >
        <div className="relative z-10 font-sans">
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
            Join our growing community.
          </h1>
          <p className="text-indigo-100/80 text-base leading-relaxed max-w-xs">
            Start your journey today. Whether you're a student looking to learn or a tutor ready to share, TutorConnect is your home.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {["Collaborative learning", "Verified experts", "Mobile access anytime"].map((text) => (
            <div key={text} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl text-sm">
              <div className="w-2 h-2 bg-indigo-300 rounded-full flex-shrink-0 shadow-sm shadow-indigo-400" />
              {text}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="glass-card w-full max-w-xl px-8 py-10 dark:ring-2 dark:ring-indigo-600/50 my-8"
        >
          {/* Mobile logo */}
          <div 
            className="flex items-center gap-2 mb-8 lg:hidden cursor-pointer group"
            onClick={onBack}
          >
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors transition-all">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800 dark:text-white">TutorConnect</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Create Account</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
            Already have an account?{" "}
            <button onClick={onNavigateToLogin} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Sign in
            </button>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: "user" }))}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                  formData.role === "user" 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none" 
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: "tutor" }))}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                  formData.role === "tutor" 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none" 
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Tutor</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter Your Full Name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter Your Email Address"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    name="phoneNumber"
                    type="tel"
                    required
                    maxLength="10"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter Your Phone Number"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    name="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter Your Location"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>


            {/* Subjects (If Tutor) */}
            {formData.role === "tutor" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="pt-2"
              >
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subjects You Teach</label>
                <input
                  name="subjects"
                  type="text"
                  required
                  value={formData.subjects}
                  onChange={handleChange}
                  placeholder="Mathematics, Physics, Computer Science (comma separated)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </motion.div>
            )}

            {/* Message Center */}
            <div className="space-y-3">
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg py-2.5 px-3"
                >
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-emerald-500 text-sm text-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg py-2.5 px-3"
                >
                  {success}
                </motion.p>
              )}
            </div>


            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-white font-semibold py-4 rounded-xl text-sm mt-4 disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Free Account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </form>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
            Protecting your privacy is our priority. By signing up, you agree to our 
            <a href="#" className="underline ml-1 hover:text-indigo-600">Terms</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
