"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/");
    }
  };

  const handleGoogle = async () => {
    setGLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
            Jowel Store
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl dark:shadow-stone-950/50 border border-stone-100 dark:border-stone-800 p-8">

          {/* Google button */}
          <motion.button
            type="button"
            onClick={handleGoogle}
            disabled={gLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {gLoading ? (
              <Spinner color="muted" />
            ) : (
              <GoogleIcon />
            )}
            {gLoading ? "Connecting..." : "Continue with Google"}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
            <span className="text-xs text-stone-400 dark:text-stone-500">or sign in with email</span>
            <div className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Email address
              </label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Password
                </label>
                <a href="/forgot-password" className="text-xs font-medium text-green-700 dark:text-green-500 hover:text-green-800 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15 transition-all duration-200"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
                >
                  {showPass ? <EyeOffIcon /> : <EyeOnIcon />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl text-sm font-semibold text-white bg-green-700 hover:bg-green-800 shadow-lg shadow-green-700/25 disabled:opacity-65 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <><Spinner color="white" /> Signing in...</>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
          Don&apos;t have an account?{" "}
          <a href="/register" className="font-semibold text-green-700 dark:text-green-500 hover:text-green-800 transition-colors">
            Create one free
          </a>
        </p>
      </motion.div>
    </div>
  );
}

/* ── Small reusable pieces inside this file only ─── */

function Spinner({ color }: { color: "white" | "muted" }) {
  const cls = color === "white"
    ? "border-white/30 border-t-white"
    : "border-stone-300 border-t-stone-500 dark:border-stone-600 dark:border-t-stone-300";
  return (
    <span className={`inline-block w-4 h-4 rounded-full border-2 animate-spin ${cls}`} />
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function EyeOnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}