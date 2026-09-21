import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDemoAccount = () => {
    setEmail("demo@college.com");
    setPassword("Demo@123456");
    setError("");
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.token) {
        throw new Error(
          "Login succeeded, but no authentication token was received."
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const savedToken = localStorage.getItem("token");

      if (!savedToken) {
        throw new Error("Authentication token could not be stored.");
      }

      navigate("/inventory/dashboard", { replace: true });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main content */}
      <div className="relative min-h-screen flex items-center justify-center px-5 py-10">

        <div className="w-full max-w-5xl">

          {/* Branding */}
          <div className="text-center mb-8">

            <div className="inline-flex items-center justify-center mb-5">
              <div className="relative">

                <div className="absolute inset-0 rounded-3xl bg-blue-500/30 blur-xl" />

                <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-2xl">
                  <img
                    src="/gat-logo.png"
                    alt="Global Academy of Technology"
                    className="h-20 w-20 object-contain"
                  />
                </div>

              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Global Academy of Technology
            </h1>

            <p className="mt-2 text-sm sm:text-base text-slate-400">
              College Inventory Management System
            </p>

          </div>

          {/* Login card */}
          <div className="mx-auto max-w-xl">

            <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-[1px] shadow-2xl backdrop-blur-xl">

              <div className="rounded-3xl bg-slate-900/90 px-6 py-8 sm:px-10 sm:py-10">

                {/* Card heading */}
                <div className="mb-8">

                  <div className="flex items-center gap-3 mb-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <ShieldCheck size={22} />
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Welcome back
                      </h2>

                      <p className="text-sm text-slate-400">
                        Sign in to continue
                      </p>
                    </div>

                  </div>

                </div>

                <form onSubmit={handleLogin}>

                  {/* Email */}
                  <div className="mb-5">

                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Username or Email
                    </label>

                    <div className="relative">

                      <Mail
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        autoComplete="email"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />

                    </div>

                  </div>

                  {/* Password */}
                  <div className="mb-5">

                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Password
                    </label>

                    <div className="relative">

                      <LockKeyhole
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        autoComplete="current-password"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-3.5 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  {/* Sign in */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-800"
                  >

                    <span className="relative z-10">
                      {loading ? "Signing in..." : "Sign In"}
                    </span>

                    {!loading && (
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    )}

                  </button>

                  {/* Demo account */}
                  <div className="relative my-7">

                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-800" />
                    </div>

                    <div className="relative flex justify-center">
                      <span className="bg-slate-900 px-3 text-xs text-slate-600">
                        OR
                      </span>
                    </div>

                  </div>

                  <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        🎮
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="text-sm font-semibold text-white">
                          Explore the system
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Try the demo environment with sample inventory
                          and procurement data.
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={handleDemoAccount}
                      className="mt-4 w-full rounded-xl border border-blue-500/40 bg-blue-500/5 py-3 text-sm font-semibold text-blue-400 transition hover:border-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                    >
                      Continue with Demo Account
                    </button>

                  </div>

                  {/* Footer links */}
                  <div className="mt-6 flex items-center justify-between text-xs">

                    <button
                      type="button"
                      onClick={() =>
                        setError(
                          "Password reset is not available yet."
                        )
                      }
                      className="text-slate-500 transition hover:text-blue-400"
                    >
                      Forgot Password?
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setError(
                          "Registration is not available from this page yet."
                        )
                      }
                      className="text-slate-500 transition hover:text-blue-400"
                    >
                      Sign Up
                    </button>

                  </div>

                </form>

              </div>

            </div>

          </div>

          {/* Bottom text */}
          <div className="mt-8 text-center">

            <p className="text-xs text-slate-600">
              Secure Inventory & Procurement Management
            </p>

            <p className="mt-1 text-[11px] text-slate-700">
              Global Academy of Technology
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}