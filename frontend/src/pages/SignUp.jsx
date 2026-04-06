/**
 * SignUp page component for new user registration.
 * Submits name/email/password to backend, redirects to login on success.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { API_PATHS } from "../utils/apiPaths";
import axiosInstance from "../utils/axiosInstance"; // Import for API calls

const SignUp = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Unified form handler
  const handleForm = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(API_PATHS.AUTH.SIGNUP, form);
      toast.success("Account created! Please login.");
      setTimeout(() => navigate("/login"), 700);
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.message || "Signup failed");
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
        <h2 className="text-2xl font-bold text-center mb-2">
          Create Account 🚀
        </h2>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Start your AI-powered interview preparation
        </p>

        {/* Name Input */}
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          value={form.name}
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
          onChange={handleForm}
          disabled={loading}
        />

        {/* Email Input */}
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
          onChange={handleForm}
          disabled={loading}
        />

        {/* Password Input */}
        <input
          type="password"
          name="password"
          placeholder="Create a password"
          value={form.password}
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
          onChange={handleForm}
          disabled={loading}
        />

        {/* Signup Button */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition duration-200 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-[1px] bg-gray-200"></div>
          <p className="px-3 text-gray-400 text-sm">OR</p>
          <div className="flex-1 h-[1px] bg-gray-200"></div>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-orange-500 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
        </div>
      </div>
    </>
  );
};

export default SignUp;
