import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

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
        throw new Error(
          "Authentication token could not be stored."
        );
      }

      navigate("/inventory/dashboard", {
        replace: true,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden bg-[#f5f6f8]">

      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute -right-40 top-1/4 h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="absolute -bottom-48 left-1/3 h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      {/* ================================================= */}
      {/* MAIN VIEWPORT */}
      {/* ================================================= */}

      <div className="relative flex h-screen items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">

        {/* ================================================= */}
        {/* MAIN CARD */}
        {/* ================================================= */}

        <div className="grid max-h-[calc(100vh-48px)] w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.12)] lg:grid-cols-[0.95fr_1.05fr]">

          {/* ================================================= */}
          {/* LEFT BRAND PANEL */}
          {/* ================================================= */}

          <div className="relative hidden overflow-hidden bg-slate-950 p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">

            {/* Background glow */}

            <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-indigo-500/15 blur-3xl" />

            {/* Grid */}

            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />

            {/* Brand content */}

            <div className="relative">

              {/* Logo */}

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-2xl shadow-black/20">
                <img
                  src="/gat-logo.png"
                  alt="Global Academy of Technology"
                  className="h-11 w-11 object-contain"
                />
              </div>

              {/* Heading */}

              <div className="mt-7 max-w-md">

                <div className="mb-3 flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    GAT Digital Infrastructure
                  </span>

                </div>

                <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white xl:text-5xl">
                  Everything your
                  <br />
                  inventory needs.
                </h1>

                <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                  A centralized platform for
                  inventory, procurement, approvals,
                  vendors and asset management.
                </p>

              </div>

            </div>

            {/* Feature cards */}

            <div className="relative mt-6 space-y-2.5">

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <p className="text-xs font-bold text-white">
                    Secure Access
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Role-based system access
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <Sparkles size={17} />
                </div>

                <div>
                  <p className="text-xs font-bold text-white">
                    Centralized Management
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    One place for college operations
                  </p>
                </div>

              </div>

            </div>

            {/* Footer */}

            <div className="relative mt-5 flex items-center justify-between border-t border-white/10 pt-4">

              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Global Academy of Technology
              </p>

              <p className="text-[10px] text-slate-700">
                Inventory System
              </p>

            </div>

          </div>

          {/* ================================================= */}
          {/* RIGHT LOGIN PANEL */}
          {/* ================================================= */}

          <div className="relative overflow-hidden bg-white px-6 py-6 sm:px-10 sm:py-7 lg:px-12 xl:px-14">

            {/* Mobile logo */}

            <div className="mb-5 flex items-center gap-3 lg:hidden">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">

                <img
                  src="/gat-logo.png"
                  alt="Global Academy of Technology"
                  className="h-9 w-9 object-contain"
                />

              </div>

              <div>

                <p className="text-sm font-extrabold text-slate-950">
                  Global Academy of Technology
                </p>

                <p className="text-[11px] font-medium text-slate-400">
                  College Inventory System
                </p>

              </div>

            </div>

            {/* Login content */}

            <div className="mx-auto max-w-md">

              {/* Header */}

              <div className="mb-6">

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/10">
                  <LockKeyhole
                    size={20}
                    strokeWidth={2}
                  />
                </div>

                <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-blue-600">
                  Secure Portal
                </p>

                <h2 className="text-3xl font-black tracking-tight text-slate-950">
                  Welcome back.
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  Sign in to access your inventory
                  management workspace.
                </p>

              </div>

              {/* ================================================= */}
              {/* LOGIN FORM */}
              {/* ================================================= */}

              <form onSubmit={handleLogin}>

                {/* Email */}

                <div className="mb-4">

                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Username or Email
                  </label>

                  <div className="group relative">

                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                    />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="Enter your email"
                      required
                      autoComplete="email"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                </div>

                {/* Password */}

                <div className="mb-4">

                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Password
                  </label>

                  <div className="group relative">

                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                    />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-5 text-red-600">
                    {error}
                  </div>
                )}

                {/* Sign in button */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-slate-950 px-5 text-sm font-extrabold text-white shadow-xl shadow-slate-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <span className="relative z-10">
                    {loading
                      ? "Signing in..."
                      : "Sign In"}
                  </span>

                  {!loading && (
                    <ArrowRight
                      size={17}
                      className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                    />
                  )}

                  {!loading && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  )}

                </button>

                {/* ================================================= */}
                {/* DEMO ACCOUNT */}
                {/* ================================================= */}

                <div className="my-5 flex items-center gap-3">

                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    or
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />

                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                      🎮
                    </div>

                    <div className="min-w-0">

                      <p className="text-sm font-extrabold text-slate-900">
                        Explore the system
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-slate-500">
                        Try the demo environment with
                        sample inventory and procurement
                        data.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={handleDemoAccount}
                    className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white text-sm font-bold text-blue-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Continue with Demo Account
                    <ArrowRight size={15} />
                  </button>

                </div>

                {/* Footer links */}

                <div className="mt-4 flex items-center justify-between text-xs">

                  <button
                    type="button"
                    onClick={() =>
                      setError(
                        "Password reset is not available yet."
                      )
                    }
                    className="font-semibold text-slate-400 transition hover:text-blue-600"
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
                    className="font-semibold text-slate-400 transition hover:text-blue-600"
                  >
                    Sign Up
                  </button>

                </div>

              </form>

              {/* Bottom footer */}

              <div className="mt-5 border-t border-slate-100 pt-4 text-center">

                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Secure Inventory & Procurement
                  Management
                </p>

                <p className="mt-1 text-[10px] font-medium text-slate-300">
                  Global Academy of Technology
                </p>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}