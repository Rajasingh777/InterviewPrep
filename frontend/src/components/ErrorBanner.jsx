import { MdRefresh } from "react-icons/md";
import { TbAlertTriangle } from "react-icons/tb";
import { motion } from "framer-motion";

// Standard error UI for question-loading failures, with optional retry action.
const ErrorBanner = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
    className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start justify-between gap-4 shadow-sm"
  >
    <div className="flex items-start gap-3">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <TbAlertTriangle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
      </motion.div>
      <div>
        <p className="text-red-700 text-sm font-semibold">
          Failed to load questions
        </p>
        <p className="text-red-500 text-xs mt-0.5">{message}</p>
      </div>
    </div>
    {onRetry && (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRetry}
        className="shrink-0 inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-lg px-3 py-1.5 transition-all duration-200 font-medium bg-white shadow-sm hover:shadow-md"
      >
        <MdRefresh className="w-4 h-4" /> Retry
      </motion.button>
    )}
  </motion.div>
);

export default ErrorBanner;
