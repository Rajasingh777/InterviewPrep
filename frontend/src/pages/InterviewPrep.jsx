import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { HiArrowLeft, HiDownload } from "react-icons/hi";
import { jsPDF } from "jspdf";

import QAItem from "../components/QAItems";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import GenerateButton from "../components/GenerateButton";
import SkeletonCard from "../components/SkeletonCard";
import { API_PATHS } from "../utils/apiPaths";

import axios from "../utils/axiosInstance";

const parseError = (err) => {
  console.log(err);

  const retryAfterHeader = err?.response?.headers?.["retry-after"];
  const retryAfterBody = err?.response?.data?.retryAfterSeconds;
  const retryAfterSeconds = Number(retryAfterBody || retryAfterHeader || 0);

  if (
    err?.response?.status === 429 &&
    (err?.response?.data?.code === "AI_QUOTA_EXCEEDED" ||
      err?.response?.data?.message)
  ) {
    const attemptedModels = Array.isArray(err?.response?.data?.attemptedModels)
      ? err.response.data.attemptedModels.filter(Boolean).join(", ")
      : "";
    if (retryAfterSeconds > 0) {
      return attemptedModels
        ? `AI quota exceeded (${attemptedModels}). Please retry in ${retryAfterSeconds}s.`
        : `AI quota exceeded. Please retry in ${retryAfterSeconds}s.`;
    }
    return (
      (attemptedModels
        ? `AI quota exceeded on: ${attemptedModels}.`
        : err.response.data?.message) ||
      "AI quota exceeded. Please retry shortly or update billing/quota."
    );
  }

  if (err.response)
    return (
      err.response.data?.message ||
      err.response.data?.error ||
      `Server error: ${err.response.status}`
    );
  if (err.request) return "Cannot reach server. Check your connection.";
  return err.message || "Something went wrong.";
};

const InterviewPrep = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [sessionMeta, setSessionMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [quotaCooldown, setQuotaCooldown] = useState(0);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await axios.get(`${API_PATHS.SESSION.GET_ONE}/${id}`);
      const session = res.data.session || {};
      setSessionMeta(session);
      setQuestions(session.questions || []);
    } catch (err) {
      console.log(err.response);
      setFetchError(parseError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  const generateQuestions = async () => {
    if (quotaCooldown > 0) {
      toast.error(`Please wait ${quotaCooldown}s before retrying.`);
      return;
    }

    setGenerating(true);
    try {
      await axios.post(API_PATHS.AI.GENERATE_QUESTIONS, { sessionId: id });
      await fetchQuestions();
      toast.success("Questions generated!");
    } catch (err) {
      const retryAfterHeader = err?.response?.headers?.["retry-after"];
      const retryAfterBody = err?.response?.data?.retryAfterSeconds;
      const retryAfterSeconds = Number(retryAfterBody || retryAfterHeader || 0);
      if (err?.response?.status === 429 && retryAfterSeconds > 0) {
        setQuotaCooldown(retryAfterSeconds);
      }
      toast.error(parseError(err));
    } finally {
      setGenerating(false);
    }
  };

  const togglePin = async (questionId) => {
    try {
      await axios.patch(`${API_PATHS.AI.TOGGLE_PIN}/${questionId}`);
      await fetchQuestions(); // Refresh to get updated pin status
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  const downloadAllQuestions = () => {
    if (!questions.length) {
      toast.error("No questions available to download.");
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const safeRole = (sessionMeta?.role || "interview-session")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const maxWidth = pageWidth - margin * 2;
    let y = 48;

    const ensureSpace = (needed = 18) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const writeLines = (lines, fontSize = 11, lineHeight = 16) => {
      doc.setFontSize(fontSize);
      lines.forEach((line) => {
        ensureSpace(lineHeight);
        doc.text(line, margin, y);
        y += lineHeight;
      });
    };

    doc.setFont("helvetica", "bold");
    writeLines(["Interview Preparation Sheet"], 18, 24);

    doc.setFont("helvetica", "normal");
    writeLines(
      [
        `Role: ${sessionMeta?.role || "N/A"}`,
        `Experience: ${sessionMeta?.experience || "N/A"} years`,
        `Interview Type: ${sessionMeta?.interviewType || "technical"}`,
        `Difficulty: ${sessionMeta?.difficulty || "medium"}`,
        `Total Questions: ${questions.length}`,
      ],
      11,
      15,
    );

    y += 8;
    questions.forEach((q, idx) => {
      const cleanAnswer = (q.answer || "No answer available.")
        .replace(/\*\*/g, "")
        .replace(/`/g, "")
        .replace(/^- /gm, "• ");

      doc.setFont("helvetica", "bold");
      const qLines = doc.splitTextToSize(`${idx + 1}. ${q.question}`, maxWidth);
      writeLines(qLines, 12, 17);

      doc.setFont("helvetica", "normal");
      const aLines = doc.splitTextToSize(cleanAnswer, maxWidth);
      writeLines(aLines, 11, 15);
      y += 10;
    });

    doc.save(`${safeRole || "session"}-${timestamp}.pdf`);
    toast.success("Questions downloaded as PDF.");
  };

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    if (quotaCooldown <= 0) return;
    const timer = setInterval(() => {
      setQuotaCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [quotaCooldown]);

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <Toaster
        position="top-right"
        toastOptions={{ className: "!text-sm !font-medium" }}
      />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Back to Dashboard"
            >
              <HiArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mb-1">
                Session ID: {id?.slice(0, 8)}
              </p>
              <h1 className="text-2xl font-bold text-slate-800">
                Interview Questions
              </h1>
              {!loading && !fetchError && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {questions.length > 0
                    ? `${questions.length} question${questions.length !== 1 ? "s" : ""} ready`
                    : "No questions yet"}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadAllQuestions}
              disabled={loading || questions.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Download all questions as PDF"
            >
              <HiDownload className="w-4 h-4" />
              Download PDF
            </button>
            <GenerateButton
              onClick={generateQuestions}
              generating={generating}
              loading={loading}
              cooldown={quotaCooldown}
            />
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-slate-200 mb-8" />

        {/* ── Content ── */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : fetchError ? (
          <ErrorBanner message={fetchError} onRetry={fetchQuestions} />
        ) : questions.length === 0 ? (
          <EmptyState onGenerate={generateQuestions} generating={generating} />
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {questions
                .sort((a, b) => {
                  // Pinned questions first
                  if (a.isPinned && !b.isPinned) return -1;
                  if (!a.isPinned && b.isPinned) return 1;
                  return 0;
                })
                .map((q, i) => (
                  <motion.div
                    key={q._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                  >
                    <QAItem item={q} onPin={togglePin} />
                  </motion.div>
                ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;
