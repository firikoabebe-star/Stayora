"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: { data?: { error?: string; message?: string } };
      }
    ).response;

    return response?.data?.error || response?.data?.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return undefined;
};

export default function LoginPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await authAPI.login({
        email: email.trim(),
        password,
      });

      const loggedInUser = response.data?.data?.user;

      if (!loggedInUser) {
        throw new Error("The server returned an invalid login response.");
      }

      setUser(loggedInUser);
      toast.success("Welcome back!");
      router.replace("/");
      router.refresh();
    } catch (loginError) {
      const message =
        getErrorMessage(loginError) ||
        "Unable to sign in. Please check your details and try again.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <section className="relative hidden flex-1 flex-col justify-between overflow-hidden p-12 text-white lg:flex">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />

          <Link
            href="/"
            className="relative z-10 flex items-center space-x-2 text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-lg font-bold">
              S
            </span>
            <span className="text-2xl font-bold">Stayora</span>
          </Link>

          <div className="relative z-10 max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Find your next unforgettable stay
              </div>

              <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
                Welcome back to your home away from home.
              </h1>
              <p className="mt-6 text-lg text-slate-300">
                Sign in to manage bookings, save your favourite properties, and
                discover handpicked stays around the world.
              </p>

              <div className="mt-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <p className="text-sm text-slate-300">
                  Your account is protected with secure, HTTP-only session
                  cookies.
                </p>
              </div>
            </motion.div>
          </div>

          <p className="relative z-10 text-sm text-slate-400">
            © {new Date().getFullYear()} Stayora. All rights reserved.
          </p>
        </section>

        <section className="flex flex-1 items-center justify-center bg-white px-4 py-12 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <Link
              href="/"
              className="mb-10 flex items-center space-x-2 lg:hidden"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold">
                S
              </span>
              <span className="text-xl font-bold text-gray-900">Stayora</span>
            </Link>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Log in</h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your credentials to access your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-12 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Create one
              </Link>
            </p>

            <p className="mt-10 text-center text-xs text-gray-400">
              By continuing, you agree to Stayora&apos;s Terms of Service and
              Privacy Policy.
            </p>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
