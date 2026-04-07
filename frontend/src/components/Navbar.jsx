import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  HiMenu as Menu,
  HiX as X,
  HiLogout as LogOut,
  HiChevronDown,
  HiUserCircle,
} from "react-icons/hi";
import { AiFillHome as Home } from "react-icons/ai";
import { BiBookOpen as BookOpen } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Main top navigation used across the app.
 * Handles auth-aware links, desktop/mobile menus, and user profile dropdown.
 */
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const isLoggedIn = !!localStorage.getItem("token");

  // Read persisted user details saved at login and provide safe fallbacks.
  const user = useMemo(() => {
    try {
      const parsedUser = JSON.parse(localStorage.getItem("user") || "{}");
      return {
        name: parsedUser?.name || "Interview Learner",
        email: parsedUser?.email || "",
      };
    } catch {
      return {
        name: "Interview Learner",
        email: "",
      };
    }
  }, [location.pathname]);

  const userInitials = useMemo(() => {
    const baseText = user.name || user.email || "U";
    const words = baseText.trim().split(/\s+/).filter(Boolean);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return baseText.slice(0, 2).toUpperCase();
  }, [user.name, user.email]);

  useEffect(() => {
    // Add subtle navbar style change once page is scrolled.
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Close transient menus when route changes.
    setIsOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Close profile dropdown when clicking anywhere outside it.
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear session data and return to landing page.
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    setIsOpen(false);
    setIsProfileMenuOpen(false);
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home, requiresAuth: false },
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: BookOpen,
      requiresAuth: true,
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.requiresAuth || isLoggedIn,
  );

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200/50"
          : "bg-white shadow-sm border-b border-slate-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/"
              className="flex items-center gap-3 text-xl font-bold text-slate-800 hover:text-orange-600 transition-all duration-300"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-orange-600 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <span className="hidden sm:block bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                InterviewPrep
              </span>
              <span className="sm:hidden">IP</span>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center gap-2">
            {/* Primary desktop navigation links */}
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </motion.div>
              );
            })}

            {isLoggedIn ? (
              // Logged-in desktop profile block and actions menu.
              <div
                ref={profileMenuRef}
                className="relative flex items-center gap-3 ml-6 pl-6 border-l border-slate-200"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {userInitials}
                  </div>
                  <div className="text-left leading-tight max-w-[140px]">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user.email || "Signed in"}
                    </p>
                  </div>
                  <HiChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                      isProfileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    // Profile dropdown with quick actions.
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-3 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50"
                    >
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {userInitials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {user.email || "No email available"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-col gap-2">
                        <Link
                          to="/dashboard"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          <HiUserCircle className="w-4 h-4" />
                          Open Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            ) : (
              // Guest actions for desktop.
              <div className="flex items-center gap-3 ml-6 pl-6 border-l border-slate-200">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/signup"
                    className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.div>
          </motion.button>
        </div>

        <AnimatePresence>
          {isOpen && (
            // Collapsible mobile navigation panel.
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-slate-200 overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {filteredNavItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}

                {isLoggedIn ? (
                  // Logged-in mobile account card + actions.
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="border-t border-slate-200 pt-4 mt-4 space-y-2"
                  >
                    <div className="mx-1 flex items-center gap-3 px-4 py-3 text-sm text-slate-600 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {userInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.email || "Signed in"}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                    >
                      <HiUserCircle className="w-5 h-5" />
                      Open Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-200 w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </motion.div>
                ) : (
                  // Guest actions for mobile.
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="border-t border-slate-200 pt-4 mt-4 space-y-2"
                  >
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-center justify-center shadow-lg"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
