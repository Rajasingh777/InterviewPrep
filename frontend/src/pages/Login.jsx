/**
 * Login page component for user authentication.
 * Submits email/password to backend API, stores JWT token, redirects to dashboard.
 */
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance"; // Fixed: Import axiosInstance for API calls
import { API_PATHS } from "../utils/apiPaths";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();

  // Helper to update form state
  const handleForm = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.LOGIN, form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: res.data.name || "",
          email: res.data.email || form.email,
        }),
      );
      toast.success("Login successful!");
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (error) {
      // Improved error handling
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-yellow-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        {/* Heading */}
        <h2 className="text-2xl font-bold text-center mb-2">Welcome Back 👋</h2>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Login to continue your interview preparation
        </p>

        {/* Email Input */}
        <input
          type="email"
          name="email" // Fixed: Added name attribute
          placeholder="Enter your email"
          value={form.email}
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
          onChange={handleForm}
          disabled={loading}
        />

        {/* Password Input */}
        <input
          type="password"
          name="password" // Fixed: Added name attribute
          placeholder="Enter your password"
          value={form.password}
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
          onChange={handleForm}
          disabled={loading}
        />

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition duration-200 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-[1px] bg-gray-200"></div>
          <p className="px-3 text-gray-400 text-sm">OR</p>
          <div className="flex-1 h-[1px] bg-gray-200"></div>
        </div>

        {/* Signup Link */}
        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-orange-500 font-medium hover:underline"
          >
            Sign Up
          </Link>
        </p>
        </div>
      </div>
    </>
  );
};

export default Login;
