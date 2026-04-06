// Import React Router components for client-side routing
import { Routes, Route } from "react-router-dom";

// Import page components for different routes
import Navbar from "./components/Navbar"; // Navigation bar component
import LandingPage from "./pages/LandingPage"; // Marketing homepage
import SignUp from "./pages/SignUp"; // User registration page
import Login from "./pages/Login"; // User login page
import Dashboard from "./pages/Dashboard"; // User dashboard with sessions
import InterviewPrep from "./pages/InterviewPrep"; // Interview preparation interface

// Main App component - root component of the React application
const App = () => {
  // Check if user is logged in by checking for JWT token in localStorage
  // This determines which routes and features are available to the user
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    // Main container with minimum height and light background
    <div className="min-h-screen bg-slate-50">
      {/* Navigation bar - always visible at the top */}
      <Navbar />

      {/* Route definitions - maps URLs to page components */}
      <Routes>
        {/* Public routes - accessible without authentication */}
        <Route path="/" element={<LandingPage />} /> {/* Homepage */}
        <Route path="/signup" element={<SignUp />} /> {/* User registration */}
        <Route path="/login" element={<Login />} /> {/* User login */}
        {/* Protected routes - require authentication */}
        <Route path="/dashboard" element={<Dashboard />} />{" "}
        {/* Session management */}
        <Route path="/interview/:id" element={<InterviewPrep />} />{" "}
        {/* Interview prep with session ID */}
      </Routes>
    </div>
  );
};

// Export the App component as the default export
export default App;
