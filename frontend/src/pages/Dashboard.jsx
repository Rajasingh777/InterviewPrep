/**
 * Dashboard page - now with auth guard + toast notifications
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineTrash,
  HiOutlineStar,
  HiStar,
  HiSparkles,
} from "react-icons/hi";
import { API_PATHS } from "../utils/apiPaths";
import axiosInstance from "../utils/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({
    role: "",
    experience: "",
    topicsToFocus: "",
    company: "",
    interviewType: "technical",
    difficulty: "medium",
    questionCount: 5,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auth guard - check token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
  }, [navigate]);

  const fetchSessions = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      setSessions(res.data.sessions || res.data.data?.sessions || []);
    } catch (error) {
      console.error("Sessions error:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        toast.error("Failed to load sessions");
      }
    }
  };

  const createSession = async () => {
    if (!form.role.trim() || !form.experience.trim())
      return toast.error("Fill role & experience");

    setLoading(true);
    try {
      await axiosInstance.post(API_PATHS.SESSION.CREATE, {
        role: form.role.trim(),
        experience: form.experience.trim(),
        topicsToFocus: form.topicsToFocus.trim(),
        company: form.company.trim(),
        interviewType: form.interviewType,
        difficulty: form.difficulty,
        questionCount: Number(form.questionCount),
      });
      toast.success("Session created!");
      setForm({
        role: "",
        experience: "",
        topicsToFocus: "",
        company: "",
        interviewType: "technical",
        difficulty: "medium",
        questionCount: 5,
      });
      fetchSessions();
    } catch (error) {
      console.error("Create error:", error);
      toast.error(error.response?.data?.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (e, sessionId) => {
    e.stopPropagation();
    try {
      await axiosInstance.delete(`${API_PATHS.SESSION.DELETE}/${sessionId}`);
      toast.success("Session deleted");
      fetchSessions();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete session");
    }
  };

  const togglePin = async (e, sessionId) => {
    e.stopPropagation();
    try {
      const res = await axiosInstance.patch(
        `${API_PATHS.SESSION.TOGGLE_PIN}/${sessionId}`,
      );
      toast.success(res.data?.message || "Pin updated");
      fetchSessions();
    } catch (error) {
      console.error("Pin toggle error:", error);
      toast.error(error.response?.data?.message || "Failed to update pin");
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">Your interview prep sessions</p>
        </div>

        {/* Create form */}
        <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 rounded-2xl border border-orange-100 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-5">
            <HiSparkles className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Create Smart Session</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Role (e.g. Frontend Engineer)"
              value={form.role}
              onChange={(e) => updateForm("role", e.target.value)}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-orange-400"
              disabled={loading}
            />
            <input
              placeholder="Experience (e.g. 3 years)"
              value={form.experience}
              onChange={(e) => updateForm("experience", e.target.value)}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-orange-400"
              disabled={loading}
            />
            <input
              placeholder="Target Company (optional)"
              value={form.company}
              onChange={(e) => updateForm("company", e.target.value)}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-orange-400"
              disabled={loading}
            />
            <select
              value={form.interviewType}
              onChange={(e) => updateForm("interviewType", e.target.value)}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-orange-400 bg-white"
              disabled={loading}
            >
              <option value="technical">Technical Interview</option>
              <option value="behavioral">Behavioral Interview</option>
              <option value="mixed">Mixed Interview</option>
            </select>
            <select
              value={form.difficulty}
              onChange={(e) => updateForm("difficulty", e.target.value)}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-orange-400 bg-white"
              disabled={loading}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select
              value={form.questionCount}
              onChange={(e) => updateForm("questionCount", e.target.value)}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-orange-400 bg-white"
              disabled={loading}
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={8}>8 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={12}>12 Questions</option>
            </select>
            <textarea
              placeholder="Topics to focus on (React hooks, Node auth, system design basics...)"
              value={form.topicsToFocus}
              onChange={(e) => updateForm("topicsToFocus", e.target.value)}
              className="md:col-span-2 p-3 border rounded-lg focus:ring-2 focus:ring-orange-400 min-h-24"
              disabled={loading}
            />
          </div>

          <div className="mt-4">
            <button
              onClick={createSession}
              disabled={loading}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Session"}
            </button>
          </div>
        </div>

        {/* Sessions grid */}
        {sessions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-500">No sessions. Create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...sessions]
              .sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
              })
              .map((s) => (
              <div
                key={s._id}
                className={`group relative p-6 bg-white rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300 ${
                  s.isPinned
                    ? "border-amber-300 ring-1 ring-amber-200"
                    : "border-orange-100 hover:border-orange-400"
                }`}
                onClick={() => navigate(`/interview/${s._id}`)}
              >
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <button
                    onClick={(e) => togglePin(e, s._id)}
                    className={`p-1.5 rounded-md border transition ${
                      s.isPinned
                        ? "text-amber-600 border-amber-300 bg-amber-50"
                        : "text-gray-500 border-gray-200 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50"
                    }`}
                    title={s.isPinned ? "Unpin session" : "Pin session"}
                  >
                    {s.isPinned ? (
                      <HiStar className="w-4 h-4" />
                    ) : (
                      <HiOutlineStar className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => deleteSession(e, s._id)}
                    className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition"
                    title="Delete session"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-7">
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                    {s.role}
                  </h3>
                  <p className="text-gray-500 mt-1">{s.experience} years</p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                      {s.interviewType || "technical"}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {s.difficulty || "medium"}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {s.questionCount || 5} Qs
                    </span>
                    {s.company ? (
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {s.company}
                      </span>
                    ) : null}
                  </div>
                  {s.topicsToFocus ? (
                    <p className="text-xs text-gray-500 mt-3">
                      Focus: {s.topicsToFocus}
                    </p>
                  ) : null}
                </div>

                <div className="mt-5 pt-4 border-t border-orange-100 group-hover:border-orange-300 transition-colors duration-300">
                  <p className="text-sm font-medium text-orange-600">
                    Start Interview Preparation
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
