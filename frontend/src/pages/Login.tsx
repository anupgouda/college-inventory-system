import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      navigate("/inventory/dashboard");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-5 py-10">

      {/* Login Card */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl px-8 py-12 sm:px-14 sm:py-14">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/gat-logo.png"
            alt="Global Academy of Technology"
            className="w-32 h-32 object-contain"
          />
        </div>

        {/* College Name */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold text-slate-800 tracking-tight">
            Global Academy of Technology
          </h1>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="max-w-3xl mx-auto"
        >

          {/* Email */}
          <div className="mb-7">
            <label
              htmlFor="email"
              className="block text-xl font-medium text-slate-700 mb-3"
            >
              Username or Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
              className="
                w-full
                px-5
                py-4
                text-lg
                text-slate-800
                bg-white
                border
                border-slate-300
                rounded-xl
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-100
              "
            />
          </div>

          {/* Password */}
          <div className="mb-7">
            <label
              htmlFor="password"
              className="block text-xl font-medium text-slate-700 mb-3"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="
                w-full
                px-5
                py-4
                text-lg
                text-slate-800
                bg-white
                border
                border-slate-300
                rounded-xl
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-100
              "
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Sign In */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              py-4
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              active:bg-blue-800
              disabled:bg-blue-400
              text-white
              text-xl
              font-semibold
              transition
              shadow-sm
            "
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Bottom Links */}
          <div className="flex items-center justify-between mt-8 text-lg">

            <button
              type="button"
              onClick={() => {
                setError("Password reset is not available yet.");
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Forgot Password?
            </button>

            <button
              type="button"
              onClick={() => {
                setError("Registration is not available from this page yet.");
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign Up
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}