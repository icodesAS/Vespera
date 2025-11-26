"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { loginWithEmailPassword, registerWithEmailPassword, loginWithGoogle } =
    useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await registerWithEmailPassword(email, password);
      } else {
        await loginWithEmailPassword(email, password);
      }
      router.push("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Google sign-in failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-10">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-block mb-4">
              <span className="text-4xl">🏠</span>
            </div>
            <p className="text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              PropSwipe
            </p>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-sm text-gray-600 mt-3 font-medium">
              {isRegister
                ? "🎯 Start finding your perfect rental"
                : "✨ Sign in to continue"}
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                📧 Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border-2 border-gray-200 bg-white/50 px-5 py-3 text-gray-900 placeholder-gray-500 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none"
                placeholder="you@example.com"
              />
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                🔐 Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-2xl border-2 border-gray-200 bg-white/50 px-5 py-3 text-gray-900 placeholder-gray-500 transition-all duration-300 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 outline-none"
                placeholder="••••••••"
              />
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border-2 border-red-200 bg-red-50/80 backdrop-blur px-5 py-4 text-sm font-medium text-red-700 flex items-start gap-3"
              >
                <span className="text-lg flex-shrink-0">⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 text-sm font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙️</span>
                  {isRegister ? "Creating..." : "Signing in..."}
                </span>
              ) : isRegister ? (
                "✨ Create Account"
              ) : (
                "🚀 Sign In"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-600 font-medium">or</span>
            </div>
          </div>

          {/* Google Login */}
          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-2xl border-2 border-gray-300 bg-white hover:bg-gray-50 py-3 text-sm font-semibold text-gray-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="text-lg">🔵</span>
            Continue with Google
          </motion.button>

          {/* Toggle Register/Login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-7 text-center"
          >
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >
              {isRegister
                ? "Already have an account? "
                : "Don't have an account? "}
              <span className="font-bold text-blue-600 hover:text-purple-600">
                {isRegister ? "Sign in" : "Register"}
              </span>
            </button>
          </motion.div>
        </div>

        {/* Footer Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-gray-600 mt-6"
        >
          🔒 Your data is secure and encrypted
        </motion.p>
      </motion.div>
    </main>
  );
}