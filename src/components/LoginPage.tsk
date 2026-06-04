import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Mail, Lock, Eye, EyeOff, Cake } from "lucide-react";

// ─────────────────────────────────────────────
// LoginPage — drop this into your src/components/ folder
// Props:
//   onLogin(session)  → called when user logs in successfully
//   onGoToSignUp()    → switch back to the registration form
// ─────────────────────────────────────────────

interface LoginSession {
  name: string;
  username: string;
  email: string;
  birthday: string;
  avatar: string;
  interests: string[];
  phone?: string;
  whatsapp?: string;
}

interface LoginPageProps {
  onLogin: (session: LoginSession) => void;
  onGoToSignUp: () => void;
  triggerToast: (title: string, message: string) => void;
}

export function LoginPage({ onLogin, onGoToSignUp, triggerToast }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      triggerToast("Missing Fields ⚠️", "Please enter your email and password.");
      return;
    }

    setIsLoading(true);

    // Simulate a short auth delay, then check localStorage for saved user
    setTimeout(() => {
      const saved = localStorage.getItem("birthday_authenticated_user");

      if (!saved) {
        triggerToast("No Account Found 🔍", "No account exists yet. Please create one first.");
        setIsLoading(false);
        return;
      }

      try {
        const parsed: LoginSession & { password?: string } = JSON.parse(saved);

        // Match by email (case-insensitive)
        if (parsed.email.toLowerCase() !== email.trim().toLowerCase()) {
          triggerToast("Wrong Email ❌", "That email doesn't match our records. Try again.");
          setIsLoading(false);
          return;
        }

        // If a password was saved during signup, check it; otherwise allow any password
        if (parsed.password && parsed.password !== password) {
          triggerToast("Wrong Password ❌", "Incorrect password. Please try again.");
          setIsLoading(false);
          return;
        }

        // Success
        onLogin(parsed);
        triggerToast("Welcome back! 🎉", `Good to see you again, ${parsed.name}!`);
      } catch {
        triggerToast("Error", "Something went wrong. Please sign up again.");
        setIsLoading(false);
      }
    }, 900);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-slate-100">
      {/* Ambient glow blobs */}
      <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-sm w-full z-10 space-y-6">

        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <span className="inline-flex w-14 h-14 bg-indigo-600 text-white rounded-2xl items-center justify-center text-3xl font-black shadow-xl shadow-indigo-600/35 mb-1">
            B
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            BloomBirth
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Never miss a friend's birthday. Welcome back!
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5"
        >
          <div>
            <h3 className="font-extrabold text-sm text-slate-100">Sign In</h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Log in to your BloomBirth account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl py-3 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Go to Sign Up */}
          <div className="text-center">
            <p className="text-[11px] text-slate-500">
              Don't have an account yet?{" "}
              <button
                type="button"
                onClick={onGoToSignUp}
                className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors underline underline-offset-2"
              >
                Create Account
              </button>
            </p>
          </div>
        </motion.div>

        {/* Feature hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 text-[10px] text-slate-600"
        >
          <Cake className="w-3 h-3" />
          <span>Track birthdays · AI gift ideas · Share wishlists</span>
        </motion.div>
      </div>
    </div>
  );
}
